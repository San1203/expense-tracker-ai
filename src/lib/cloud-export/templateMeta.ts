import { Landmark, CalendarRange, PieChart, SlidersHorizontal, type LucideIcon } from "lucide-react";
import { TemplateId } from "./types";

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
  icon: LucideIcon;
}

export const EXPORT_TEMPLATES: TemplateMeta[] = [
  {
    id: "tax-report",
    name: "Tax Report",
    description: "Full ledger for a chosen year with category subtotals",
    icon: Landmark,
  },
  {
    id: "monthly-summary",
    name: "Monthly Summary",
    description: "Spending totals grouped by month",
    icon: CalendarRange,
  },
  {
    id: "category-analysis",
    name: "Category Analysis",
    description: "Totals and share of spend per category",
    icon: PieChart,
  },
  {
    id: "custom",
    name: "Custom",
    description: "Raw transaction list, unfiltered",
    icon: SlidersHorizontal,
  },
];

export function templateMeta(id: TemplateId): TemplateMeta {
  const meta = EXPORT_TEMPLATES.find((t) => t.id === id);
  if (!meta) throw new Error(`Unknown template: ${id}`);
  return meta;
}
