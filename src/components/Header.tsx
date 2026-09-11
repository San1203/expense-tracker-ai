"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, Plus } from "lucide-react";

interface HeaderProps {
  onAddExpense?: () => void;
}

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/categories", label: "Top Categories" },
];

export default function Header({ onAddExpense }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-2 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900 sm:text-lg">Expense Tracker</h1>
            <p className="hidden text-xs text-slate-500 sm:block">Track spending, stay on budget</p>
          </div>
        </div>

        <nav className="order-3 flex w-full items-center justify-center gap-1 sm:order-none sm:w-auto sm:justify-start">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {onAddExpense && (
          <button
            onClick={onAddExpense}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 sm:px-4"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Expense</span>
            <span className="sm:hidden">Add</span>
          </button>
        )}
      </div>
    </header>
  );
}
