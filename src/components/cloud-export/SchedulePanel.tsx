"use client";

import { useState } from "react";
import { Clock, Pause, Play, Plus, Trash2 } from "lucide-react";
import { EXPORT_TEMPLATES, templateMeta } from "@/lib/cloud-export/templateMeta";
import { EXPORT_DESTINATIONS, destinationMeta } from "@/lib/cloud-export/destinationMeta";
import { formatFrequency } from "@/lib/cloud-export/schedule";
import { formatShortDate } from "@/lib/cloud-export/format";
import { DestinationId, ScheduleFrequency, TemplateId } from "@/lib/cloud-export/types";
import { UseCloudExportReturn } from "@/hooks/useCloudExport";

type SchedulePanelProps = Pick<UseCloudExportReturn, "schedules" | "createSchedule" | "toggleSchedule" | "deleteSchedule">;

export default function SchedulePanel({ schedules, createSchedule, toggleSchedule, deleteSchedule }: SchedulePanelProps) {
  const [templateId, setTemplateId] = useState<TemplateId>("monthly-summary");
  const [destinationId, setDestinationId] = useState<DestinationId>("email");
  const [frequency, setFrequency] = useState<ScheduleFrequency>("monthly");

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">New automation</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value as TemplateId)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            {EXPORT_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            value={destinationId}
            onChange={(e) => setDestinationId(e.target.value as DestinationId)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            {EXPORT_DESTINATIONS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as ScheduleFrequency)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <button
          onClick={() => createSchedule(templateId, destinationId, frequency)}
          className="mt-3 flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500"
        >
          <Plus className="h-4 w-4" />
          Add automation
        </button>
        <p className="mt-2 text-[11px] text-slate-400">
          Automations run on a simulated schedule for this demo — no background job actually executes them.
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Active automations</h3>
        {schedules.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="space-y-2">
            {schedules.map((schedule) => {
              const template = templateMeta(schedule.templateId);
              const dest = destinationMeta(schedule.destinationId);
              return (
                <li
                  key={schedule.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${dest.accentClass}`}>
                    <dest.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {template.name} <span className="font-normal text-slate-400">&rarr; {dest.name}</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {formatFrequency(schedule.frequency)} &middot; next run {formatShortDate(schedule.nextRunAt)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      schedule.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {schedule.active ? "Active" : "Paused"}
                  </span>
                  <button
                    onClick={() => toggleSchedule(schedule.id)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    aria-label={schedule.active ? "Pause automation" : "Resume automation"}
                  >
                    {schedule.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => deleteSchedule(schedule.id)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete automation"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-8 text-center">
      <Clock className="mb-2 h-5 w-5 text-slate-400" />
      <p className="text-xs font-medium text-slate-500">No automations yet</p>
      <p className="text-[11px] text-slate-400">Set one up above to export on a recurring schedule.</p>
    </div>
  );
}
