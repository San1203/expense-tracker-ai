import { Expense } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { TemplateId } from "./types";

export interface TemplateOutput {
  filename: string;
  content: string;
  mimeType: string;
  recordCount: number;
}

function escapeCsvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function csvRow(cells: string[]): string {
  return cells.map(escapeCsvCell).join(",");
}

function buildTaxReport(expenses: Expense[], year: string): TemplateOutput {
  const rows = expenses.filter((e) => e.date.startsWith(year));
  const byCategory = new Map<string, number>();
  for (const e of rows) byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount);
  const total = rows.reduce((sum, e) => sum + e.amount, 0);

  const lines = [
    csvRow(["Date", "Category", "Description", "Amount"]),
    ...rows.map((e) => csvRow([e.date, e.category, e.description, e.amount.toFixed(2)])),
    "",
    csvRow(["Category Totals", ""]),
    ...Array.from(byCategory.entries()).map(([category, sum]) => csvRow([category, sum.toFixed(2)])),
    csvRow(["Grand Total", total.toFixed(2)]),
  ];

  return {
    filename: `tax-report-${year}`,
    content: lines.join("\n"),
    mimeType: "text/csv;charset=utf-8;",
    recordCount: rows.length,
  };
}

function buildMonthlySummary(expenses: Expense[]): TemplateOutput {
  const byMonth = new Map<string, { total: number; count: number }>();
  for (const e of expenses) {
    const month = e.date.slice(0, 7);
    const entry = byMonth.get(month) ?? { total: 0, count: 0 };
    entry.total += e.amount;
    entry.count += 1;
    byMonth.set(month, entry);
  }
  const months = Array.from(byMonth.entries()).sort((a, b) => b[0].localeCompare(a[0]));

  const lines = [
    csvRow(["Month", "Total", "Transactions"]),
    ...months.map(([month, { total, count }]) => csvRow([month, total.toFixed(2), String(count)])),
  ];

  return {
    filename: "monthly-summary",
    content: lines.join("\n"),
    mimeType: "text/csv;charset=utf-8;",
    recordCount: expenses.length,
  };
}

function buildCategoryAnalysis(expenses: Expense[]): TemplateOutput {
  const grandTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const byCategory = new Map<string, { total: number; count: number }>();
  for (const e of expenses) {
    const entry = byCategory.get(e.category) ?? { total: 0, count: 0 };
    entry.total += e.amount;
    entry.count += 1;
    byCategory.set(e.category, entry);
  }
  const categories = Array.from(byCategory.entries()).sort((a, b) => b[1].total - a[1].total);

  const lines = [
    csvRow(["Category", "Total", "Share", "Transactions"]),
    ...categories.map(([category, { total, count }]) => {
      const share = grandTotal > 0 ? `${((total / grandTotal) * 100).toFixed(1)}%` : "0%";
      return csvRow([category, total.toFixed(2), share, String(count)]);
    }),
  ];

  return {
    filename: "category-analysis",
    content: lines.join("\n"),
    mimeType: "text/csv;charset=utf-8;",
    recordCount: expenses.length,
  };
}

function buildCustom(expenses: Expense[]): TemplateOutput {
  const lines = [
    csvRow(["Date", "Category", "Description", "Amount"]),
    ...expenses.map((e) => csvRow([e.date, e.category, e.description, e.amount.toFixed(2)])),
  ];

  return {
    filename: "expenses-custom",
    content: lines.join("\n"),
    mimeType: "text/csv;charset=utf-8;",
    recordCount: expenses.length,
  };
}

export function buildTemplate(templateId: TemplateId, expenses: Expense[], taxYear: string): TemplateOutput {
  switch (templateId) {
    case "tax-report":
      return buildTaxReport(expenses, taxYear);
    case "monthly-summary":
      return buildMonthlySummary(expenses);
    case "category-analysis":
      return buildCategoryAnalysis(expenses);
    case "custom":
      return buildCustom(expenses);
  }
}

export function estimateRecordCount(templateId: TemplateId, expenses: Expense[], taxYear: string): number {
  if (templateId === "tax-report") return expenses.filter((e) => e.date.startsWith(taxYear)).length;
  return expenses.length;
}

export function totalAmountLabel(expenses: Expense[]): string {
  return formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0));
}
