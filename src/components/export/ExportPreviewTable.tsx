"use client";

import { Inbox } from "lucide-react";
import { Expense } from "@/lib/types";
import { CATEGORY_META } from "@/lib/categories";
import { formatCurrency, formatDate } from "@/lib/utils";

const MAX_VISIBLE_ROWS = 6;

interface ExportPreviewTableProps {
  rows: Expense[];
}

export default function ExportPreviewTable({ rows }: ExportPreviewTableProps) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-8 text-center">
        <Inbox className="mb-2 h-5 w-5 text-slate-400" />
        <p className="text-xs font-medium text-slate-500">No expenses match these filters</p>
        <p className="text-[11px] text-slate-400">Adjust the date range or categories above.</p>
      </div>
    );
  }

  const visible = rows.slice(0, MAX_VISIBLE_ROWS);
  const remaining = rows.length - visible.length;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-3 py-2 font-medium">Date</th>
            <th className="px-3 py-2 font-medium">Description</th>
            <th className="px-3 py-2 font-medium">Category</th>
            <th className="px-3 py-2 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {visible.map((expense) => {
            const meta = CATEGORY_META[expense.category];
            return (
              <tr key={expense.id}>
                <td className="whitespace-nowrap px-3 py-2 text-slate-500">{formatDate(expense.date)}</td>
                <td className="max-w-[140px] truncate px-3 py-2 font-medium text-slate-800">{expense.description}</td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-1 text-slate-600">
                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
                    {expense.category}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-right font-semibold text-slate-900">
                  {formatCurrency(expense.amount)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {remaining > 0 && (
        <div className="border-t border-slate-100 bg-slate-50 px-3 py-1.5 text-center text-[11px] text-slate-500">
          + {remaining} more row{remaining === 1 ? "" : "s"} in the full export
        </div>
      )}
    </div>
  );
}
