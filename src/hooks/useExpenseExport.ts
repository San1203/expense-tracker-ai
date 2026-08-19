"use client";

import { useCallback, useMemo, useState } from "react";
import { Category, Expense } from "@/lib/types";
import { todayISO } from "@/lib/utils";
import { ExportFormat, ExportOptions, ExportStage } from "@/lib/export/types";
import { filterExpensesForExport } from "@/lib/export/filterExpenses";
import { runExport } from "@/lib/export/runExport";

function defaultOptions(): ExportOptions {
  return {
    format: "csv",
    startDate: "",
    endDate: "",
    categories: [],
    filename: `expense-report-${todayISO()}`,
  };
}

export function useExpenseExport(expenses: Expense[]) {
  const [options, setOptions] = useState<ExportOptions>(defaultOptions);
  const [stage, setStage] = useState<ExportStage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{ recordCount: number; format: ExportFormat } | null>(null);

  const previewRows = useMemo(() => filterExpensesForExport(expenses, options), [expenses, options]);

  const totalAmount = useMemo(() => previewRows.reduce((sum, e) => sum + e.amount, 0), [previewRows]);

  const setFormat = useCallback((format: ExportFormat) => {
    setOptions((prev) => ({ ...prev, format }));
  }, []);

  const setStartDate = useCallback((startDate: string) => {
    setOptions((prev) => ({ ...prev, startDate }));
  }, []);

  const setEndDate = useCallback((endDate: string) => {
    setOptions((prev) => ({ ...prev, endDate }));
  }, []);

  const setFilename = useCallback((filename: string) => {
    setOptions((prev) => ({ ...prev, filename }));
  }, []);

  const toggleCategory = useCallback((category: Category) => {
    setOptions((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  }, []);

  const clearCategories = useCallback(() => {
    setOptions((prev) => ({ ...prev, categories: [] }));
  }, []);

  const clearDateRange = useCallback(() => {
    setOptions((prev) => ({ ...prev, startDate: "", endDate: "" }));
  }, []);

  const reset = useCallback(() => {
    setOptions(defaultOptions());
    setStage("idle");
    setError(null);
    setLastResult(null);
  }, []);

  const execute = useCallback(async () => {
    setError(null);
    try {
      const { recordCount } = await runExport(expenses, options, setStage);
      setLastResult({ recordCount, format: options.format });
      setStage("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while generating the export.");
      setStage("error");
    }
  }, [expenses, options]);

  return {
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
  };
}

export type UseExpenseExportReturn = ReturnType<typeof useExpenseExport>;
