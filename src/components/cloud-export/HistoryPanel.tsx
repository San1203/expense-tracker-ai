"use client";

import { CheckCircle2, History, XCircle } from "lucide-react";
import { templateMeta } from "@/lib/cloud-export/templateMeta";
import { destinationMeta } from "@/lib/cloud-export/destinationMeta";
import { formatDateTime } from "@/lib/cloud-export/format";
import { UseCloudExportReturn } from "@/hooks/useCloudExport";

type HistoryPanelProps = Pick<UseCloudExportReturn, "history">;

export default function HistoryPanel({ history }: HistoryPanelProps) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center">
        <History className="mb-2 h-5 w-5 text-slate-400" />
        <p className="text-xs font-medium text-slate-500">No exports yet</p>
        <p className="text-[11px] text-slate-400">Run an export and it will show up here.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {history.map((entry) => {
        const template = templateMeta(entry.templateId);
        const dest = destinationMeta(entry.destinationId);
        return (
          <li key={entry.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${dest.accentClass}`}>
              <dest.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">
                {template.name} <span className="font-normal text-slate-400">&rarr; {dest.name}</span>
              </p>
              <p className="truncate text-[11px] text-slate-500">
                {entry.detail} &middot; {entry.recordCount} record{entry.recordCount === 1 ? "" : "s"}
              </p>
              <p className="text-[10px] text-slate-400">{formatDateTime(entry.createdAt)}</p>
            </div>
            <span
              className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                entry.status === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              }`}
            >
              {entry.status === "completed" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              {entry.status === "completed" ? "Completed" : "Failed"}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
