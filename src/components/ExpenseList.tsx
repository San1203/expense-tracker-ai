"use client";

import { Pencil, Trash2, Inbox } from "lucide-react";
import { Expense } from "@/lib/types";
import { CATEGORY_META } from "@/lib/categories";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ExpenseListProps {
  expenses: Expense[];
  totalCount: number;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export default function ExpenseList({ expenses, totalCount, onEdit, onDelete }: ExpenseListProps) {
  if (totalCount === 0) {
    return (
      <EmptyState
        title="No expenses yet"
        message="Add your first expense to start tracking your spending."
      />
    );
  }

  if (expenses.length === 0) {
    return (
      <EmptyState
        title="No matching expenses"
        message="Try adjusting your filters or search terms."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="hidden w-full text-left text-sm sm:table">
        <thead className="border-b border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3 font-medium">Date</th>
            <th className="px-5 py-3 font-medium">Description</th>
            <th className="px-5 py-3 font-medium">Category</th>
            <th className="px-5 py-3 text-right font-medium">Amount</th>
            <th className="px-5 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {expenses.map((expense) => {
            const meta = CATEGORY_META[expense.category];
            return (
              <tr key={expense.id} className="transition hover:bg-slate-50/70">
                <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">{formatDate(expense.date)}</td>
                <td className="px-5 py-3.5 font-medium text-slate-800">{expense.description}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${meta.badgeClass}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
                    {expense.category}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-right font-semibold text-slate-900">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => onEdit(expense)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                      aria-label={`Edit ${expense.description}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(expense)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      aria-label={`Delete ${expense.description}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="divide-y divide-slate-100 sm:hidden">
        {expenses.map((expense) => {
          const meta = CATEGORY_META[expense.category];
          return (
            <div key={expense.id} className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-800">{expense.description}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${meta.badgeClass}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
                    {expense.category}
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(expense.date)}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <p className="font-semibold text-slate-900">{formatCurrency(expense.amount)}</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => onEdit(expense)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                    aria-label={`Edit ${expense.description}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(expense)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    aria-label={`Delete ${expense.description}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <Inbox className="h-6 w-6 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      <p className="mt-1 text-sm text-slate-400">{message}</p>
    </div>
  );
}
