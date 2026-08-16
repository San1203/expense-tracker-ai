"use client";

import Modal from "./Modal";
import ExpenseForm from "./ExpenseForm";
import { Expense, ExpenseInput } from "@/lib/types";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingExpense: Expense | null;
  onSubmit: (input: ExpenseInput) => void;
}

export default function ExpenseModal({ isOpen, onClose, editingExpense, onSubmit }: ExpenseModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingExpense ? "Edit expense" : "Add expense"}>
      <ExpenseForm
        key={editingExpense?.id ?? "new"}
        initialValues={editingExpense ?? undefined}
        onSubmit={async (input) => {
          // brief pause so the loading state on the submit button is perceptible
          await new Promise((resolve) => setTimeout(resolve, 250));
          onSubmit(input);
        }}
        onCancel={onClose}
      />
    </Modal>
  );
}
