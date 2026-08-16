export type Category =
  | "Food"
  | "Transportation"
  | "Entertainment"
  | "Shopping"
  | "Bills"
  | "Other";

export interface Expense {
  id: string;
  date: string; // ISO yyyy-mm-dd
  amount: number;
  category: Category;
  description: string;
  createdAt: string; // ISO timestamp, used as a stable tie-breaker when sorting same-day expenses
}

export interface ExpenseInput {
  date: string;
  amount: number;
  category: Category;
  description: string;
}
