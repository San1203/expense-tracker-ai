"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle, Info, X, type LucideIcon } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

const ICONS: Record<ToastType, LucideIcon> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const STYLES: Record<ToastType, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
};

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const Icon = ICONS[toast.type];

  return (
    <div
      role="status"
      className={`animate-slide-in pointer-events-auto flex items-start gap-2.5 rounded-lg border px-4 py-3 shadow-lg ${STYLES[toast.type]}`}
    >
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button onClick={() => onDismiss(toast.id)} className="text-current/60 hover:text-current" aria-label="Dismiss">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
