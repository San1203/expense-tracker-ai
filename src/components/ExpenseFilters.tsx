"use client";

import { Search, Download, X } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { Category } from "@/lib/types";

export interface Filters {
  search: string;
  category: Category | "All";
  startDate: string;
  endDate: string;
}

interface ExpenseFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onExport: () => void;
  resultCount: number;
}

export default function ExpenseFilters({ filters, onChange, onExport, resultCount }: ExpenseFiltersProps) {
  const hasActiveFilters =
    filters.search !== "" || filters.category !== "All" || filters.startDate !== "" || filters.endDate !== "";

  function reset() {
    onChange({ search: "", category: "All", startDate: "", endDate: "" });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search descriptions..."
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <select
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value as Category | "All" })}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
            className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
          <span className="text-sm text-slate-400">to</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
            className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={reset}
              className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
          <button
            onClick={onExport}
            disabled={resultCount === 0}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
