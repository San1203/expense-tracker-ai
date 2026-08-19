import { Expense } from "@/lib/types";
import { ExportOptions } from "./types";
import { formatMeta } from "./formats";
import { filterExpensesForExport } from "./filterExpenses";
import { buildCsv } from "./writers/csvWriter";
import { buildJson } from "./writers/jsonWriter";
import { buildPdf } from "./writers/pdfWriter";

function sanitizeFilename(name: string): string {
  const trimmed = name.trim().replace(/[\\/:*?"<>|]+/g, "-");
  return trimmed || "expenses";
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

export async function runExport(
  allExpenses: Expense[],
  options: ExportOptions,
  onStageChange?: (stage: "preparing" | "generating") => void
): Promise<{ recordCount: number }> {
  onStageChange?.("preparing");
  await nextFrame(); // let the UI paint the "preparing" state before the (possibly heavy) build work

  const filtered = filterExpensesForExport(allExpenses, options);

  onStageChange?.("generating");
  await nextFrame();

  const meta = formatMeta(options.format);
  const blob =
    options.format === "csv"
      ? buildCsv(filtered)
      : options.format === "json"
        ? buildJson(filtered, options)
        : buildPdf(filtered, options);

  const filename = `${sanitizeFilename(options.filename)}.${meta.extension}`;
  triggerDownload(blob, filename);

  return { recordCount: filtered.length };
}
