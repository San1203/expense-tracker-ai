"use client";

import { FileSpreadsheet, FileJson, FileText, type LucideIcon } from "lucide-react";
import { ExportFormat } from "@/lib/export/types";
import { EXPORT_FORMATS } from "@/lib/export/formats";

const FORMAT_ICONS: Record<ExportFormat, LucideIcon> = {
  csv: FileSpreadsheet,
  json: FileJson,
  pdf: FileText,
};

interface ExportFormatPickerProps {
  value: ExportFormat;
  onChange: (format: ExportFormat) => void;
}

export default function ExportFormatPicker({ value, onChange }: ExportFormatPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {EXPORT_FORMATS.map((format) => {
        const Icon = FORMAT_ICONS[format.id];
        const active = format.id === value;
        return (
          <button
            key={format.id}
            type="button"
            onClick={() => onChange(format.id)}
            aria-pressed={active}
            className={`flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition ${
              active
                ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                active ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className={`text-sm font-semibold ${active ? "text-indigo-700" : "text-slate-800"}`}>{format.label}</p>
              <p className="mt-0.5 text-[11px] leading-tight text-slate-500">{format.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
