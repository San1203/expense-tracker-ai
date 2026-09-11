import { Category, Expense } from "./types";

export interface CategoryStat {
  category: Category;
  total: number;
  /** Share of overall spend, 0-100. 0 when there is no spend at all. */
  percentage: number;
}

/**
 * Aggregates expenses into per-category totals and their percentage share
 * of overall spend, sorted by total amount descending.
 */
export function getCategoryStats(expenses: Expense[]): CategoryStat[] {
  const totals = new Map<Category, number>();
  let grandTotal = 0;

  for (const e of expenses) {
    totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
    grandTotal += e.amount;
  }

  return Array.from(totals.entries())
    .map(([category, total]) => ({
      category,
      total,
      percentage: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}
