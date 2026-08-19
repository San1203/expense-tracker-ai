"use client";

import { useEffect } from "react";
import { AlertCircle, CheckCircle2, Download, Loader2, X } from "lucide-react";
import { Expense } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useExpenseExport } from "@/hooks/useExpenseExport";
import ExportFormatPicker from "./ExportFormatPicker";
import ExportCategoryPicker from "./ExportCategoryPicker";
import ExportPreviewTable from "./ExportPreviewTable";

interface ExportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
}

export default function ExportDrawer({ isOpen, onClose, expenses }: ExportDrawerProps) {
  const {
    options,
    stage,
    error,
    lastResult,
    previewRows,
    totalAmount,
    setFormat,
    setStartDate,
    setEndDate,
    setFilename,
    toggleCategory,
    clearCategories,
    clearDateRange,
    execute,
    reset,
  } = useExpenseExport(expenses);

  const isBusy = stage === "preparing" || stage === "generating";

  useEffect(() => {
    if (!isOpen) return;
    reset();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasDateFilter = options.startDate !== "" || options.endDate !== "";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="animate-fade-in absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-drawer-title"
        className="animate-drawer-in relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 id="export-drawer-title" className="text-lg font-semibold text-slate-900">
              Export data
            </h2>
            <p className="text-xs text-slate-500">Choose a format, filter records, and download.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Format</h3>
            <ExportFormatPicker value={options.format} onChange={setFormat} />
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date range</h3>
              {hasDateFilter && (
                <button onClick={clearDateRange} className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700">
                  Clear
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={options.startDate}
                onChange={(e) => setStartDate(e.target.value)}
                aria-label="Start date"
                className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              <span className="text-sm text-slate-400">to</span>
              <input
                type="date"
                value={options.endDate}
                onChange={(e) => setEndDate(e.target.value)}
                aria-label="End date"
                className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Categories</h3>
            <ExportCategoryPicker selected={options.categories} onToggle={toggleCategory} onClear={clearCategories} />
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Filename</h3>
            <div className="flex items-center overflow-hidden rounded-lg border border-slate-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/30">
              <input
                type="text"
                value={options.filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="expense-report"
                className="w-full min-w-0 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <span className="whitespace-nowrap bg-slate-50 px-2.5 py-2 text-xs text-slate-400">.{options.format}</span>
            </div>
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preview</h3>
              <span className="text-[11px] text-slate-400">
                {previewRows.length} record{previewRows.length === 1 ? "" : "s"} · {formatCurrency(totalAmount)}
              </span>
            </div>
            <ExportPreviewTable rows={previewRows} />
          </section>

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {stage === "done" && lastResult && (
            <div className="flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-xs text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Downloaded {lastResult.recordCount} record{lastResult.recordCount === 1 ? "" : "s"} as{" "}
                {lastResult.format.toUpperCase()}.
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
          <p className="text-xs text-slate-400">
            {previewRows.length === 0
              ? "Nothing to export"
              : `Ready to export ${previewRows.length} record${previewRows.length === 1 ? "" : "s"}`}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={execute}
              disabled={previewRows.length === 0 || isBusy}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isBusy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {stage === "preparing" ? "Preparing..." : "Generating..."}
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
