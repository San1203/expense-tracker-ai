"use client";

import { Wallet, Plus } from "lucide-react";

interface HeaderProps {
  onAddExpense: () => void;
}

export default function Header({ onAddExpense }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900 sm:text-lg">Expense Tracker</h1>
            <p className="hidden text-xs text-slate-500 sm:block">Track spending, stay on budget</p>
          </div>
        </div>
        <button
          onClick={onAddExpense}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 sm:px-4"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Expense</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
    </header>
  );
}
