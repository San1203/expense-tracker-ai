"use client";

import { useCallback, useEffect, useState } from "react";
import { Expense } from "@/lib/types";
import { loadExpenses, saveExpenses } from "@/lib/storage";

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setExpenses(loadExpenses());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) saveExpenses(expenses);
  }, [expenses, isLoaded]);

  const addExpense = useCallback((expense: Expense) => {
    setExpenses((prev) => [expense, ...prev]);
  }, []);

  const updateExpense = useCallback((id: string, updates: Partial<Expense>) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return { expenses, isLoaded, addExpense, updateExpense, deleteExpense };
}
