"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import SummaryCards from "@/components/SummaryCards";
import SpendingCharts from "@/components/SpendingCharts";
import ExpenseFilters, { Filters } from "@/components/ExpenseFilters";
import ExpenseList from "@/components/ExpenseList";
import ExpenseModal from "@/components/ExpenseModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import ToastContainer, { ToastItem, ToastType } from "@/components/ToastContainer";
import CloudExportStudio from "@/components/cloud-export/CloudExportStudio";
import { useExpenses } from "@/hooks/useExpenses";
import { Expense, ExpenseInput } from "@/lib/types";
import { generateId } from "@/lib/utils";

const EMPTY_FILTERS: Filters = { search: "", category: "All", startDate: "", endDate: "" };

export default function Home() {
  const { expenses, isLoaded, addExpense, updateExpense, deleteExpense } = useExpenses();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [isExportStudioOpen, setIsExportStudioOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  function pushToast(type: ToastType, message: string) {
    setToasts((prev) => [...prev, { id: generateId(), type, message }]);
  }

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((e) => {
        if (filters.category !== "All" && e.category !== filters.category) return false;
        if (filters.startDate && e.date < filters.startDate) return false;
        if (filters.endDate && e.date > filters.endDate) return false;
        if (filters.search && !e.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt.localeCompare(a.createdAt)));
  }, [expenses, filters]);

  function handleAddClick() {
    setEditingExpense(null);
    setIsModalOpen(true);
  }

  function handleEditClick(expense: Expense) {
    setEditingExpense(expense);
    setIsModalOpen(true);
  }

  function handleFormSubmit(input: ExpenseInput) {
    if (editingExpense) {
      updateExpense(editingExpense.id, input);
      pushToast("success", "Expense updated.");
    } else {
      addExpense({ id: generateId(), createdAt: new Date().toISOString(), ...input });
      pushToast("success", "Expense added.");
    }
    setIsModalOpen(false);
    setEditingExpense(null);
  }

  function handleConfirmDelete() {
    if (!deletingExpense) return;
    deleteExpense(deletingExpense.id);
    pushToast("success", "Expense deleted.");
    setDeletingExpense(null);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onAddExpense={handleAddClick} onOpenExportStudio={() => setIsExportStudioOpen(true)} />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {!isLoaded ? (
          <LoadingState />
        ) : (
          <>
            <SummaryCards expenses={expenses} />
            <SpendingCharts expenses={expenses} />
            <ExpenseFilters filters={filters} onChange={setFilters} />
            <ExpenseList
              expenses={filteredExpenses}
              totalCount={expenses.length}
              onEdit={handleEditClick}
              onDelete={setDeletingExpense}
            />
          </>
        )}
      </main>

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExpense(null);
        }}
        editingExpense={editingExpense}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        isOpen={deletingExpense !== null}
        title="Delete expense"
        message={deletingExpense ? `Delete "${deletingExpense.description}"? This can't be undone.` : ""}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingExpense(null)}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <CloudExportStudio isOpen={isExportStudioOpen} onClose={() => setIsExportStudioOpen(false)} expenses={expenses} />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      </div>
      <div className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white" />
    </div>
  );
}
