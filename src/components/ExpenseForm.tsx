"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Category, Expense, ExpenseInput } from "@/lib/types";
import { CATEGORIES, CATEGORY_META } from "@/lib/categories";
import { todayISO } from "@/lib/utils";

interface ExpenseFormProps {
  initialValues?: Expense;
  onSubmit: (input: ExpenseInput) => Promise<void> | void;
  onCancel: () => void;
}

interface FormErrors {
  date?: string;
  amount?: string;
  description?: string;
}

export default function ExpenseForm({ initialValues, onSubmit, onCancel }: ExpenseFormProps) {
  const [date, setDate] = useState(initialValues?.date ?? todayISO());
  const [amount, setAmount] = useState(initialValues ? String(initialValues.amount) : "");
  const [category, setCategory] = useState<Category>(initialValues?.category ?? "Food");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const next: FormErrors = {};

    if (!date) {
      next.date = "Date is required.";
    } else if (date > todayISO()) {
      next.date = "Date can't be in the future.";
    }

    const numericAmount = Number(amount);
    if (!amount) {
      next.amount = "Amount is required.";
    } else if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      next.amount = "Enter an amount greater than 0.";
    } else if (numericAmount > 1_000_000) {
      next.amount = "That amount looks too large.";
    }

    if (!description.trim()) {
      next.description = "Description is required.";
    } else if (description.trim().length > 120) {
      next.description = "Keep it under 120 characters.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        date,
        amount: Math.round(Number(amount) * 100) / 100,
        category,
        description: description.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-700">
          Description
        </label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Grocery shopping at Whole Foods"
          className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
            errors.description ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-indigo-400"
          }`}
        />
        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="mb-1.5 block text-sm font-medium text-slate-700">
            Amount
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              $
            </span>
            <input
              id="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={`w-full rounded-lg border py-2 pl-7 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                errors.amount ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-indigo-400"
              }`}
            />
          </div>
          {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
        </div>

        <div>
          <label htmlFor="date" className="mb-1.5 block text-sm font-medium text-slate-700">
            Date
          </label>
          <input
            id="date"
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
              errors.date ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-indigo-400"
            }`}
          />
          {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Category</label>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            const Icon = meta.icon;
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-2.5 text-xs font-medium transition ${
                  isSelected
                    ? "border-indigo-400 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-400"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {initialValues ? "Save changes" : "Add expense"}
        </button>
      </div>
    </form>
  );
}
