"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { Expense, Category } from "@/lib/types";
import { CATEGORY_META } from "@/lib/categories";
import { formatCurrency } from "@/lib/utils";

interface SpendingChartsProps {
  expenses: Expense[];
}

export default function SpendingCharts({ expenses }: SpendingChartsProps) {
  const categoryData = useMemo(() => {
    const totals = new Map<Category, number>();
    for (const e of expenses) {
      totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
    }
    return Array.from(totals.entries())
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const monthlyData = useMemo(() => {
    const totals = new Map<string, number>();
    for (const e of expenses) {
      const key = e.date.slice(0, 7); // YYYY-MM
      totals.set(key, (totals.get(key) ?? 0) + e.amount);
    }
    const lastSix = Array.from(totals.keys()).sort().slice(-6);
    return lastSix.map((key) => {
      const [year, month] = key.split("-").map(Number);
      const label = new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(year, month - 1, 1));
      return { month: label, total: totals.get(key) ?? 0 };
    });
  }, [expenses]);

  const hasData = expenses.length > 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">Spending by Category</h3>
        {hasData ? (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="category" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {categoryData.map((entry) => (
                  <Cell key={entry.category} fill={CATEGORY_META[entry.category].color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart />
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">Monthly Trend</h3>
        {hasData ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                width={48}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} cursor={{ fill: "#f1f5f9" }} />
              <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart />
        )}
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[240px] items-center justify-center text-sm text-slate-400">
      Add expenses to see your spending patterns.
    </div>
  );
}
