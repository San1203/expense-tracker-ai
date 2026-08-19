import { Expense } from "@/lib/types";
import { ExportOptions } from "./types";

export function filterExpensesForExport(expenses: Expense[], options: Pick<ExportOptions, "startDate" | "endDate" | "categories">): Expense[] {
  const { startDate, endDate, categories } = options;
  return expenses
    .filter((e) => {
      if (startDate && e.date < startDate) return false;
      if (endDate && e.date > endDate) return false;
      if (categories.length > 0 && !categories.includes(e.category)) return false;
      return true;
    })
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt.localeCompare(a.createdAt)));
}
