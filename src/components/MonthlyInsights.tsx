"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Flame } from "lucide-react";
import { Expense, Category } from "@/lib/types";
import { CATEGORY_META } from "@/lib/categories";
import { formatCurrency } from "@/lib/utils";

interface MonthlyInsightsProps {
  expenses: Expense[];
  /** Daily spending ceiling used to compute the budget streak. */
  dailyBudget?: number;
}

const STREAK_GOAL_DAYS = 30;
const DEFAULT_DAILY_BUDGET = 50;

export default function MonthlyInsights({ expenses, dailyBudget = DEFAULT_DAILY_BUDGET }: MonthlyInsightsProps) {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(now);

  const monthExpenses = useMemo(
    () => expenses.filter((e) => e.date.startsWith(monthKey)),
    [expenses, monthKey]
  );

  const categoryData = useMemo(() => {
    const totals = new Map<Category, number>();
    for (const e of monthExpenses) {
      totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
    }
    return Array.from(totals.entries())
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value);
  }, [monthExpenses]);

  const monthTotal = useMemo(() => categoryData.reduce((sum, c) => sum + c.value, 0), [categoryData]);

  const topCategories = categoryData.slice(0, 3);

  const budgetStreak = useMemo(() => computeBudgetStreak(expenses, dailyBudget), [expenses, dailyBudget]);
  const streakProgress = Math.min(budgetStreak / STREAK_GOAL_DAYS, 1);

  const hasData = monthExpenses.length > 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="border-b border-dashed border-slate-300 pb-4">
        <h2 className="text-xl font-bold text-slate-900">Monthly Insights</h2>
        <p className="text-sm text-slate-500">{monthLabel}</p>
      </div>

      <div className="mt-6 flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center">
        <div className="relative h-56 w-56 shrink-0">
          {hasData ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="category"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={2}
                    stroke="#0f172a"
                    strokeWidth={1}
                  >
                    {categoryData.map((entry) => (
                      <Cell key={entry.category} fill={CATEGORY_META[entry.category].color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="rounded-lg bg-white px-3 py-1.5 text-center shadow-sm ring-1 ring-slate-200">
                  <p className="text-xs font-semibold text-slate-700">Spending</p>
                  <p className="text-sm font-bold text-slate-900">{formatCurrency(monthTotal)}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-dashed border-slate-200 text-center text-sm text-slate-400">
              No spending
              <br />
              this month yet
            </div>
          )}
        </div>

        <div className="w-full max-w-xs space-y-3">
          {topCategories.length > 0 ? (
            topCategories.map(({ category, value }) => {
              const meta = CATEGORY_META[category];
              const Icon = meta.icon;
              return (
                <div key={category} className="flex items-center gap-3">
                  <span className="h-8 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: meta.color }} />
                  <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                  <span className="flex-1 text-sm text-slate-700">{category}</span>
                  <span className="text-sm font-semibold text-slate-900">{formatCurrency(value)}</span>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-400">Add an expense this month to see your top categories.</p>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-5">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium text-slate-500">Budget Streak</p>
            <p className="mt-1 text-3xl font-bold text-emerald-600">
              {budgetStreak}
              <span className="ml-1.5 text-base font-semibold text-slate-500">
                day{budgetStreak === 1 ? "" : "s"}!
              </span>
            </p>
          </div>

          <div className="flex w-full items-center gap-2 sm:w-40">
            <Flame className="h-5 w-5 shrink-0 text-amber-500" />
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${streakProgress * 100}%` }}
              />
            </div>
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-slate-400 sm:text-right">
          {budgetStreak >= STREAK_GOAL_DAYS
            ? `Goal reached! Staying under ${formatCurrency(dailyBudget)}/day.`
            : `${STREAK_GOAL_DAYS - budgetStreak} more day${STREAK_GOAL_DAYS - budgetStreak === 1 ? "" : "s"} under ${formatCurrency(dailyBudget)}/day to hit your ${STREAK_GOAL_DAYS}-day goal.`}
        </p>
      </div>
    </div>
  );
}

// A streak only counts days that fall on or after the first recorded expense,
// so a fresh account with no history shows 0 instead of a misleading full year.
function computeBudgetStreak(expenses: Expense[], dailyBudget: number): number {
  if (expenses.length === 0) return 0;

  const dailyTotals = new Map<string, number>();
  let earliestDate = expenses[0].date;
  for (const e of expenses) {
    dailyTotals.set(e.date, (dailyTotals.get(e.date) ?? 0) + e.amount);
    if (e.date < earliestDate) earliestDate = e.date;
  }

  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 365; i++) {
    const key = toISODate(cursor);
    if (key < earliestDate) break;
    const total = dailyTotals.get(key) ?? 0;
    if (total > dailyBudget) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function toISODate(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}
