import { ExportFormatMeta } from "./types";

export const EXPORT_FORMATS: ExportFormatMeta[] = [
  {
    id: "csv",
    label: "CSV",
    extension: "csv",
    mimeType: "text/csv;charset=utf-8;",
    description: "Spreadsheet-ready, opens in Excel or Sheets",
  },
  {
    id: "json",
    label: "JSON",
    extension: "json",
    mimeType: "application/json;charset=utf-8;",
    description: "Structured data for developers & integrations",
  },
  {
    id: "pdf",
    label: "PDF",
    extension: "pdf",
    mimeType: "application/pdf",
    description: "Formatted report, ready to print or share",
  },
];

export function formatMeta(id: string): ExportFormatMeta {
  const meta = EXPORT_FORMATS.find((f) => f.id === id);
  if (!meta) throw new Error(`Unknown export format: ${id}`);
  return meta;
}
