"use client";

import { useEffect } from "react";
import { Sparkles, X } from "lucide-react";
import { Expense } from "@/lib/types";
import { useCloudExport } from "@/hooks/useCloudExport";
import StudioSidebar from "./StudioSidebar";
import ExportPanel from "./ExportPanel";
import SchedulePanel from "./SchedulePanel";
import SharePanel from "./SharePanel";
import HistoryPanel from "./HistoryPanel";

interface CloudExportStudioProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
}

export default function CloudExportStudio({ isOpen, onClose, expenses }: CloudExportStudioProps) {
  const cloudExport = useCloudExport(expenses);
  const { activeTab, setActiveTab, schedules, shareLinks, history } = cloudExport;

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="animate-fade-in absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cloud-export-title"
        className="animate-studio-in relative flex h-full max-h-[42rem] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 id="cloud-export-title" className="text-base font-semibold">
                Export Studio
              </h2>
              <p className="text-xs text-white/80">Templates, integrations, automations &amp; sharing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
          <StudioSidebar
            active={activeTab}
            onChange={setActiveTab}
            badges={{ schedule: schedules.length, share: shareLinks.length, history: history.length }}
          />

          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            {activeTab === "export" && (
              <ExportPanel
                selectedTemplate={cloudExport.selectedTemplate}
                setSelectedTemplate={cloudExport.setSelectedTemplate}
                taxYear={cloudExport.taxYear}
                setTaxYear={cloudExport.setTaxYear}
                availableYears={cloudExport.availableYears}
                selectedDestination={cloudExport.selectedDestination}
                setSelectedDestination={cloudExport.setSelectedDestination}
                connections={cloudExport.connections}
                connectingId={cloudExport.connectingId}
                connectIntegration={cloudExport.connectIntegration}
                emailRecipient={cloudExport.emailRecipient}
                setEmailRecipient={cloudExport.setEmailRecipient}
                isDestinationReady={cloudExport.isDestinationReady}
                recordCount={cloudExport.recordCount}
                processing={cloudExport.processing}
                runError={cloudExport.runError}
                lastRunResult={cloudExport.lastRunResult}
                runExport={cloudExport.runExport}
              />
            )}

            {activeTab === "schedule" && (
              <SchedulePanel
                schedules={cloudExport.schedules}
                createSchedule={cloudExport.createSchedule}
                toggleSchedule={cloudExport.toggleSchedule}
                deleteSchedule={cloudExport.deleteSchedule}
              />
            )}

            {activeTab === "share" && (
              <SharePanel
                shareLinks={cloudExport.shareLinks}
                generateShareLink={cloudExport.generateShareLink}
                revokeShareLink={cloudExport.revokeShareLink}
              />
            )}

            {activeTab === "history" && <HistoryPanel history={cloudExport.history} />}
          </div>
        </div>
      </div>
    </div>
  );
}
