import { Expense } from "@/lib/types";
import { ExportOptions } from "../types";

export function buildJson(expenses: Expense[], options: Pick<ExportOptions, "startDate" | "endDate" | "categories">): Blob {
  const payload = {
    exportedAt: new Date().toISOString(),
    filters: {
      startDate: options.startDate || null,
      endDate: options.endDate || null,
      categories: options.categories.length > 0 ? options.categories : "All",
    },
    recordCount: expenses.length,
    totalAmount: Number(expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)),
    expenses,
  };
  return new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8;" });
}
