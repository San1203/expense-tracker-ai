import { Expense } from "@/lib/types";

function escapeCsvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function buildCsv(expenses: Expense[]): Blob {
  const header = ["Date", "Category", "Description", "Amount"];
  const rows = expenses.map((e) => [e.date, e.category, escapeCsvCell(e.description), e.amount.toFixed(2)]);
  const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
  return new Blob([csv], { type: "text/csv;charset=utf-8;" });
}
