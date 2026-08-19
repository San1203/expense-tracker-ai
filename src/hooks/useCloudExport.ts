"use client";

import { useCallback, useMemo, useState } from "react";
import { Expense } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { DestinationId, ExportHistoryEntry, ScheduleFrequency, ScheduledExport, ShareLink, TemplateId } from "@/lib/cloud-export/types";
import { destinationMeta } from "@/lib/cloud-export/destinationMeta";
import { buildTemplate, estimateRecordCount } from "@/lib/cloud-export/buildTemplate";
import { connectionStages, destinationStages, runStages } from "@/lib/cloud-export/simulate";
import { computeNextRun } from "@/lib/cloud-export/schedule";
import { buildShareUrl, computeExpiry, generateToken } from "@/lib/cloud-export/shareLink";
import { downloadTextFile } from "@/lib/cloud-export/downloadFile";
import {
  loadConnections,
  loadHistory,
  loadSchedules,
  loadShareLinks,
  saveConnections,
  saveHistory,
  saveSchedules,
  saveShareLinks,
} from "@/lib/cloud-export/storage";

export type StudioTab = "export" | "schedule" | "share" | "history";

interface ProcessingState {
  active: boolean;
  label: string | null;
  stepIndex: number;
  stepTotal: number;
}

const IDLE_PROCESSING: ProcessingState = { active: false, label: null, stepIndex: 0, stepTotal: 0 };

export function useCloudExport(expenses: Expense[]) {
  const [activeTab, setActiveTab] = useState<StudioTab>("export");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("custom");
  const [taxYear, setTaxYear] = useState<string>(String(new Date().getFullYear()));
  const [selectedDestination, setSelectedDestination] = useState<DestinationId>("download");
  const [emailRecipient, setEmailRecipient] = useState("");

  const [connections, setConnections] = useState(loadConnections);
  const [history, setHistory] = useState<ExportHistoryEntry[]>(loadHistory);
  const [schedules, setSchedules] = useState<ScheduledExport[]>(loadSchedules);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>(loadShareLinks);

  const [processing, setProcessing] = useState<ProcessingState>(IDLE_PROCESSING);
  const [connectingId, setConnectingId] = useState<DestinationId | null>(null);
  const [lastRunResult, setLastRunResult] = useState<{ destinationId: DestinationId; recordCount: number } | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  const recordCount = useMemo(
    () => estimateRecordCount(selectedTemplate, expenses, taxYear),
    [selectedTemplate, expenses, taxYear]
  );

  const availableYears = useMemo(() => {
    const years = new Set(expenses.map((e) => e.date.slice(0, 4)));
    years.add(String(new Date().getFullYear()));
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [expenses]);

  const destination = destinationMeta(selectedDestination);
  const isDestinationReady =
    !destination.requiresConnection ||
    connections[selectedDestination]?.status === "connected";

  const connectIntegration = useCallback(async (id: DestinationId) => {
    const meta = destinationMeta(id);
    setConnectingId(id);
    setConnections((prev) => {
      const next = { ...prev, [id]: { id, status: "connecting" as const, connectedAt: null } };
      saveConnections(next);
      return next;
    });
    await runStages(connectionStages(meta.name), () => {});
    setConnections((prev) => {
      const next = { ...prev, [id]: { id, status: "connected" as const, connectedAt: new Date().toISOString() } };
      saveConnections(next);
      return next;
    });
    setConnectingId(null);
  }, []);

  const disconnectIntegration = useCallback((id: DestinationId) => {
    setConnections((prev) => {
      const next = { ...prev, [id]: { id, status: "not_connected" as const, connectedAt: null } };
      saveConnections(next);
      return next;
    });
  }, []);

  const addHistoryEntry = useCallback((entry: Omit<ExportHistoryEntry, "id" | "createdAt">) => {
    setHistory((prev) => {
      const next = [{ ...entry, id: generateId(), createdAt: new Date().toISOString() }, ...prev].slice(0, 50);
      saveHistory(next);
      return next;
    });
  }, []);

  const runExport = useCallback(async () => {
    setRunError(null);
    const output = buildTemplate(selectedTemplate, expenses, taxYear);

    if (output.recordCount === 0) {
      setRunError("No expenses match this template — nothing to export.");
      return;
    }

    if (destination.requiresConnection && connections[selectedDestination]?.status !== "connected") {
      setRunError(`Connect ${destination.name} before running this export.`);
      return;
    }

    if (selectedDestination === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRecipient)) {
      setRunError("Enter a valid email address first.");
      return;
    }

    const stages = destinationStages(selectedDestination, selectedDestination === "email" ? emailRecipient : undefined);
    setProcessing({ active: true, label: stages[0], stepIndex: 0, stepTotal: stages.length });

    await runStages(stages, (stage, index, total) => {
      setProcessing({ active: true, label: stage, stepIndex: index, stepTotal: total });
    });

    if (selectedDestination === "download") {
      downloadTextFile(output.content, `${output.filename}.csv`, output.mimeType);
    }

    const detail =
      selectedDestination === "download"
        ? `${output.filename}.csv`
        : selectedDestination === "email"
          ? `Sent to ${emailRecipient}`
          : `Synced via ${destination.name}`;

    addHistoryEntry({
      templateId: selectedTemplate,
      destinationId: selectedDestination,
      recordCount: output.recordCount,
      status: "completed",
      detail,
    });

    setLastRunResult({ destinationId: selectedDestination, recordCount: output.recordCount });
    setProcessing(IDLE_PROCESSING);
  }, [selectedTemplate, taxYear, expenses, destination, connections, selectedDestination, emailRecipient, addHistoryEntry]);

  const createSchedule = useCallback((templateId: TemplateId, destinationId: DestinationId, frequency: ScheduleFrequency) => {
    setSchedules((prev) => {
      const next = [
        {
          id: generateId(),
          templateId,
          destinationId,
          frequency,
          createdAt: new Date().toISOString(),
          nextRunAt: computeNextRun(frequency),
          active: true,
        },
        ...prev,
      ];
      saveSchedules(next);
      return next;
    });
  }, []);

  const toggleSchedule = useCallback((id: string) => {
    setSchedules((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s));
      saveSchedules(next);
      return next;
    });
  }, []);

  const deleteSchedule = useCallback((id: string) => {
    setSchedules((prev) => {
      const next = prev.filter((s) => s.id !== id);
      saveSchedules(next);
      return next;
    });
  }, []);

  const generateShareLink = useCallback((templateId: TemplateId, expiresInDays: number | null) => {
    const token = generateToken();
    const link: ShareLink = {
      id: generateId(),
      token,
      templateId,
      createdAt: new Date().toISOString(),
      expiresAt: computeExpiry(expiresInDays),
    };
    setShareLinks((prev) => {
      const next = [link, ...prev];
      saveShareLinks(next);
      return next;
    });
    return { link, url: buildShareUrl(token) };
  }, []);

  const revokeShareLink = useCallback((id: string) => {
    setShareLinks((prev) => {
      const next = prev.filter((l) => l.id !== id);
      saveShareLinks(next);
      return next;
    });
  }, []);

  return {
    activeTab,
    setActiveTab,
    selectedTemplate,
    setSelectedTemplate,
    taxYear,
    setTaxYear,
    availableYears,
    selectedDestination,
    setSelectedDestination,
    emailRecipient,
    setEmailRecipient,
    connections,
    connectingId,
    connectIntegration,
    disconnectIntegration,
    isDestinationReady,
    recordCount,
    processing,
    runError,
    lastRunResult,
    runExport,
    history,
    schedules,
    createSchedule,
    toggleSchedule,
    deleteSchedule,
    shareLinks,
    generateShareLink,
    revokeShareLink,
  };
}

export type UseCloudExportReturn = ReturnType<typeof useCloudExport>;
