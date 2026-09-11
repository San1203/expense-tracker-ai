import { Category, Expense } from "./types";

export interface VendorSummary {
  /** Display name for the vendor/merchant (trimmed, original casing of first occurrence). */
  vendor: string;
  /** Total amount spent with this vendor across all expenses. */
  total: number;
  /** Number of transactions recorded for this vendor. */
  count: number;
  /** The category this vendor was spent in the most (by amount). Null if it can't be determined. */
  topCategory: Category | null;
}

const UNKNOWN_VENDOR_LABEL = "(No description)";

/**
 * Groups expenses into per-vendor totals, ranked by total amount spent (descending).
 *
 * NOTE: `Expense` has no dedicated `vendor`/`merchant` field, so each expense's free-text
 * `description` is used as a stand-in vendor name. Grouping is case-insensitive and
 * whitespace-trimmed (e.g. "Starbucks", "starbucks ", and " STARBUCKS" are one vendor),
 * so the same real-world merchant with inconsistent capitalization/spacing still gets
 * grouped together. The first non-empty description encountered for a group is used as
 * its display label. Expenses with a blank/whitespace-only description are grouped under
 * "(No description)" rather than dropped, so totals still reconcile with the full data set.
 */
export function getVendorSummaries(expenses: Expense[]): VendorSummary[] {
  interface VendorAccumulator {
    vendor: string;
    total: number;
    count: number;
    categoryTotals: Map<Category, number>;
  }

  const groups = new Map<string, VendorAccumulator>();

  for (const expense of expenses) {
    const trimmed = expense.description.trim();
    const key = trimmed.toLowerCase();
    const displayName = trimmed || UNKNOWN_VENDOR_LABEL;

    let group = groups.get(key);
    if (!group) {
      group = { vendor: displayName, total: 0, count: 0, categoryTotals: new Map() };
      groups.set(key, group);
    }

    group.total += expense.amount;
    group.count += 1;
    group.categoryTotals.set(
      expense.category,
      (group.categoryTotals.get(expense.category) ?? 0) + expense.amount
    );
  }

  return Array.from(groups.values())
    .map((group) => ({
      vendor: group.vendor,
      total: group.total,
      count: group.count,
      topCategory: getTopCategory(group.categoryTotals),
    }))
    .sort((a, b) => b.total - a.total || a.vendor.localeCompare(b.vendor));
}

function getTopCategory(categoryTotals: Map<Category, number>): Category | null {
  let topCategory: Category | null = null;
  let topAmount = 0;
  Array.from(categoryTotals.entries()).forEach(([category, amount]) => {
    if (topCategory === null || amount > topAmount) {
      topCategory = category;
      topAmount = amount;
    }
  });
  return topCategory;
}
