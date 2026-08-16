import { Wallet, CalendarDays, TrendingUp, Receipt } from "lucide-react";
import { Expense } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface SummaryCardsProps {
  expenses: Expense[];
}

export default function SummaryCards({ expenses }: SummaryCardsProps) {
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonthKey));
  const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const average = expenses.length ? total / expenses.length : 0;

  const categoryTotals = new Map<string, number>();
  for (const e of monthExpenses) {
    categoryTotals.set(e.category, (categoryTotals.get(e.category) ?? 0) + e.amount);
  }
  let topCategory: string | null = null;
  let topCategoryAmount = 0;
  Array.from(categoryTotals.entries()).forEach(([cat, amt]) => {
    if (amt > topCategoryAmount) {
      topCategory = cat;
      topCategoryAmount = amt;
    }
  });

  const cards = [
    {
      label: "Total Spending",
      value: formatCurrency(total),
      icon: Wallet,
      accent: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "This Month",
      value: formatCurrency(monthTotal),
      icon: CalendarDays,
      accent: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Top Category",
      value: topCategory ?? "—",
      sub: topCategory ? `${formatCurrency(topCategoryAmount)} this month` : "No expenses yet",
      icon: TrendingUp,
      accent: "bg-amber-50 text-amber-600",
    },
    {
      label: "Average Expense",
      value: formatCurrency(average),
      icon: Receipt,
      accent: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.accent}`}>
              <card.icon className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 truncate text-2xl font-semibold text-slate-900">{card.value}</p>
          {card.sub && <p className="mt-1 text-xs text-slate-400">{card.sub}</p>}
        </div>
      ))}
    </div>
  );
}
