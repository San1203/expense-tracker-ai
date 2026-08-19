import { Category } from "@/lib/types";

export type ExportFormat = "csv" | "json" | "pdf";

export interface ExportFormatMeta {
  id: ExportFormat;
  label: string;
  extension: string;
  mimeType: string;
  description: string;
}

export interface ExportOptions {
  format: ExportFormat;
  startDate: string; // "" = unbounded
  endDate: string; // "" = unbounded
  categories: Category[]; // empty = all categories
  filename: string; // without extension
}

export type ExportStage = "idle" | "preparing" | "generating" | "done" | "error";
