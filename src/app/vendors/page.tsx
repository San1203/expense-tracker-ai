"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Inbox } from "lucide-react";
import Header from "@/components/Header";
import { useExpenses } from "@/hooks/useExpenses";
import { getVendorSummaries } from "@/lib/vendors";
import { CATEGORY_META } from "@/lib/categories";
import { formatCurrency } from "@/lib/utils";

export default function VendorsPage() {
  const { expenses, isLoaded } = useExpenses();
  const router = useRouter();

  const vendors = useMemo(() => getVendorSummaries(expenses), [expenses]);
  const maxTotal = vendors.length > 0 ? vendors[0].total : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onAddExpense={() => router.push("/")} />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Top Vendors</h2>
          <p className="mt-1 text-sm text-slate-500">
            Your vendors and merchants ranked by total amount spent.
          </p>
        </div>

        {!isLoaded ? (
          <LoadingState />
        ) : vendors.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {vendors.map((vendor, index) => {
              const meta = vendor.topCategory ? CATEGORY_META[vendor.topCategory] : null;
              const widthPct = maxTotal > 0 ? Math.max(4, (vendor.total / maxTotal) * 100) : 0;

              return (
                <div
                  key={vendor.vendor}
                  className="flex items-start gap-3 border-b border-slate-100 px-4 py-4 last:border-b-0 sm:gap-4 sm:px-5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate font-medium text-slate-800">{vendor.vendor}</p>
                      <p className="shrink-0 font-semibold text-slate-900">{formatCurrency(vendor.total)}</p>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      {meta && (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${meta.badgeClass}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
                          {vendor.topCategory}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        {vendor.count} transaction{vendor.count === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0">
          <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-slate-100" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100" />
            <div className="h-2 w-full animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <Inbox className="h-6 w-6 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-700">No vendors yet</p>
      <p className="mt-1 text-sm text-slate-400">Add an expense to see your top vendors here.</p>
    </div>
  );
}
