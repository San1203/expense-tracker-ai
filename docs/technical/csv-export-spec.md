# CSV Export - Technical Specification

## Overview
CSV Export lets a user download their expenses as a `.csv` file directly from the
browser. The export always reflects the **currently filtered view** of the expense
list (active search term, category, and date range), so the file contains exactly
the rows the user sees on screen. No data leaves the browser — the file is
generated client-side and saved via a synthetic download link.

## Classification
**Type:** Frontend

Rationale: the feature is implemented entirely with a client-side utility
(`exportExpensesToCSV`) and a UI button in a `"use client"` component. There is no
API route, server action, or database involvement. Expense data originates from
`localStorage` (see `src/lib/storage.ts`).

## Architecture

### Data flow
```
useExpenses() ──► expenses[]  (loaded from localStorage)
        │
        ▼
page.tsx: filteredExpenses = useMemo(...)   ← applies search / category / date filters + sort
        │
        ▼
ExpenseFilters  ── onExport() ──►  page.tsx: handleExport()
        │                                   │
        │                                   ├─ guard: filteredExpenses.length === 0 → return
        │                                   ├─ exportExpensesToCSV(filteredExpenses)
        │                                   └─ pushToast("info", "Exported N expenses to CSV.")
        ▼
lib/utils.ts: exportExpensesToCSV(expenses)
        ├─ build header + rows (Date, Category, Description, Amount)
        ├─ join into CSV string
        ├─ new Blob([...], { type: "text/csv;charset=utf-8;" })
        ├─ URL.createObjectURL(blob)
        ├─ create <a download="expenses-YYYY-MM-DD.csv">, click(), remove()
        └─ URL.revokeObjectURL(url)
```

### Components involved
| File | Role |
|------|------|
| `src/lib/utils.ts` | `exportExpensesToCSV(expenses)` — the entire export implementation (build CSV, Blob, trigger download). Also provides `todayISO()` used for the filename. |
| `src/components/ExpenseFilters.tsx` | Renders the **Export CSV** button (`Download` icon). Button is `disabled` when `resultCount === 0`. Calls the `onExport` prop. |
| `src/app/page.tsx` | `handleExport()` glue: empty-guard, calls `exportExpensesToCSV(filteredExpenses)`, shows an info toast. Owns `filteredExpenses` (the filtered + sorted list passed to the exporter). |
| `src/lib/types.ts` | `Expense` shape consumed by the exporter. |
| `src/components/ToastContainer.tsx` | Renders the "Exported N expenses to CSV." confirmation toast. |

## API Details
Not applicable — frontend-only feature. No network requests are made.

## Implementation Notes

### CSV format
- **Header row:** `Date,Category,Description,Amount`
- **Row fields:**
  - `Date` — raw ISO `yyyy-mm-dd` string from `expense.date`
  - `Category` — raw category label (`Food`, `Transportation`, …)
  - `Description` — wrapped in double quotes; embedded `"` characters are escaped by doubling (`"` → `""`)
  - `Amount` — `expense.amount.toFixed(2)` (always two decimal places, no currency symbol)
- Rows are joined with `\n`; fields are joined with `,`.

### Filename
`expenses-${todayISO()}.csv`, e.g. `expenses-2026-08-27.csv`. `todayISO()`
(`src/lib/utils.ts`) computes the local date, correcting for timezone offset so the
date matches the user's wall clock rather than UTC.

### Download mechanism
Uses the classic Blob + object URL + synthetic anchor pattern:
`URL.createObjectURL` → temporary `<a download>` appended to `document.body` →
`link.click()` → element removed → `URL.revokeObjectURL` to release memory. The
create/revoke pair is correctly balanced, so there is no object-URL leak.

### What gets exported
`filteredExpenses` from `page.tsx` — the list **after** the page's active
search/category/date filters and the date-descending sort are applied. Exporting
therefore mirrors the visible list, not the full dataset.

### Edge cases & known limitations
- **Empty result set:** the button is disabled (`resultCount === 0`), and
  `handleExport()` also early-returns as a second guard. No file is produced.
- **No error handling:** if `Blob` construction or the download trigger throws, the
  error is unhandled (no `try/catch`). Browsers that block programmatic downloads
  fail silently.
- **CSV / formula injection:** description values are quote-escaped but leading
  `=`, `+`, `-`, `@` are **not** neutralized, so a crafted description such as
  `=HYPERLINK("http://evil.com")` is written verbatim and may execute as a formula
  when the file is opened in Excel or Google Sheets. This is a known gap (see
  `code-analysis.md`).
- **Delimiters in fields:** only `Description` is quoted. `Category` values are
  known-safe (fixed enum, no commas). `Date`/`Amount` are numeric/ISO and safe.

## Related Documentation
- [User Guide](../user/csv-export-guide.md)
- See also: [`code-analysis.md`](../../code-analysis.md) — comparative analysis of
  this export implementation against the `feature-data-export-v2` and
  `feature-data-export-v3` branches, including the CSV-injection issue and
  recommended fixes.
