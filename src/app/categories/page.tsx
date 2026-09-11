"use client";

import { useMemo } from "react";
import { PieChart } from "lucide-react";
import Header from "@/components/Header";
import { useExpenses } from "@/hooks/useExpenses";
import { getCategoryStats } from "@/lib/categoryStats";
import { CATEGORY_META } from "@/lib/categories";
import { formatCurrency } from "@/lib/utils";

export default function CategoriesPage() {
  const { expenses, isLoaded } = useExpenses();

  const stats = useMemo(() => getCategoryStats(expenses), [expenses]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Top Spending Categories</h2>
          <p className="text-sm text-slate-500">
            Every category you&apos;ve spent in, ranked by total amount spent.
          </p>
        </div>

        {!isLoaded ? (
          <LoadingState />
        ) : stats.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <ul className="divide-y divide-slate-100">
              {stats.map((stat, index) => {
                const meta = CATEGORY_META[stat.category];
                const Icon = meta.icon;
                return (
                  <li key={stat.category} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span className="w-5 shrink-0 text-center text-xs font-semibold text-slate-300">
                        {index + 1}
                      </span>
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.badgeClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="truncate text-sm font-medium text-slate-900">{stat.category}</p>
                          <p className="shrink-0 text-sm font-semibold text-slate-900">
                            {formatCurrency(stat.total)}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${stat.percentage}%`, backgroundColor: meta.color }}
                            />
                          </div>
                          <span className="w-12 shrink-0 text-right text-xs text-slate-400">
                            {stat.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <PieChart className="h-6 w-6 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-700">No expenses yet</p>
      <p className="mt-1 text-sm text-slate-400">Add an expense to see your top spending categories.</p>
    </div>
  );
}
