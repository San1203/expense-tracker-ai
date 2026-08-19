"use client";

import { EXPORT_TEMPLATES } from "@/lib/cloud-export/templateMeta";
import { TemplateId } from "@/lib/cloud-export/types";

interface TemplatePickerProps {
  value: TemplateId;
  onChange: (id: TemplateId) => void;
  taxYear: string;
  onTaxYearChange: (year: string) => void;
  availableYears: string[];
}

export default function TemplatePicker({ value, onChange, taxYear, onTaxYearChange, availableYears }: TemplatePickerProps) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {EXPORT_TEMPLATES.map((template) => {
          const active = template.id === value;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onChange(template.id)}
              aria-pressed={active}
              className={`flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition ${
                active
                  ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${active ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                <template.icon className="h-4 w-4" />
              </div>
              <div>
                <p className={`text-sm font-semibold ${active ? "text-indigo-700" : "text-slate-800"}`}>{template.name}</p>
                <p className="mt-0.5 text-[11px] leading-tight text-slate-500">{template.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {value === "tax-report" && (
        <div className="mt-3 flex items-center gap-2">
          <label htmlFor="tax-year" className="text-xs font-medium text-slate-500">
            Tax year
          </label>
          <select
            id="tax-year"
            value={taxYear}
            onChange={(e) => onTaxYearChange(e.target.value)}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
