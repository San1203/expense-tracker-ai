# CLAUDE.md

This file is context for Claude Code working in this repository. It is not user-facing documentation — see `README.md` for that.

## 1. Project Overview

**What it is:** A personal, single-user expense tracker. Log expenses (date, amount, category, description), browse/search/filter them, see spending charts, export to CSV. Built as a portfolio/demo-style app — no auth, no multi-user concept.

**Tech stack:**
- Next.js 14 (App Router), TypeScript, React 18
- Tailwind CSS for styling
- Recharts for charts (donut/pie and bar)
- lucide-react for icons
- ESLint (`eslint-config-next`) for linting

**Data persistence:** Entirely client-side. There is no backend, no API routes (beyond the Next.js scaffold), and no database. All expense data lives in the browser's `localStorage` under the key `expense-tracker:expenses:v1` (see `src/lib/storage.ts`). Data is per-browser/per-device — nothing syncs. `loadExpenses`/`saveExpenses` fail silently on `localStorage` errors (private browsing, quota exceeded) rather than throwing.

## 2. Architecture

### Folders

```
src/
  app/          Next.js App Router entry: layout.tsx, page.tsx (the main/only screen on master), globals.css
  components/    Flat list of UI components, one component per file, no subfolders (on master / this branch)
  hooks/          useExpenses.ts — the one hook: owns expense state + localStorage sync
  lib/
    types.ts       Category union type, Expense, ExpenseInput
    categories.ts   CATEGORIES list + CATEGORY_META registry (icon, color, badgeClass, dotClass per category)
    storage.ts        localStorage read/write, JSON parse guarded with try/catch
    utils.ts            formatCurrency, formatDate, todayISO, generateId, exportExpensesToCSV
```

Note: some unmerged feature branches add their own top-level structure not present on master — e.g. `src/app/categories/`, `src/app/vendors/`, `src/components/export/`, `src/components/cloud-export/`, `src/lib/export/`, `src/lib/cloud-export/`. See Section 3 for what lives where.

### Data flow

- `src/app/page.tsx` is the single source of truth. It calls `useExpenses()` once and passes `expenses` down as props to every consumer (`SummaryCards`, `SpendingCharts`, `MonthlyInsights`, `ExpenseFilters` + `ExpenseList`).
- `useExpenses()` loads from `localStorage` on mount, then persists back to `localStorage` on every change via a `useEffect` keyed on `[expenses, isLoaded]`. It exposes `addExpense`, `updateExpense`, `deleteExpense`.
- All mutation flows through callbacks passed down from `page.tsx` (e.g. `onEdit`, `onDelete`, `onSubmit`) — no context, no global store, no prop-drilling abstraction beyond plain props.
- Filtering (`ExpenseFilters`) and derived aggregates (category totals, monthly trends, top categories) are computed locally with `useMemo` in whichever component needs them — there's no shared selector layer.
- No routing/URL state on master. On this branch (`feature/monthly-insights-dashboard`), switching between the dashboard and Monthly Insights is a plain `useState<"dashboard" | "insights">` tab toggle in `page.tsx`, not a route.

### Conventions

- Every component/hook file starts with `"use client"` — nothing here is a server component except the root `layout.tsx`.
- **Category styling always goes through `CATEGORY_META`** (`src/lib/categories.ts`) — icon component, hex color (for chart fills), Tailwind badge classes, dot classes. Don't hardcode a category's color or icon in a component; look it up from `CATEGORY_META[category]`. `MonthlyInsights.tsx` follows this pattern for its donut chart and legend.
- **Card shell convention:** top-level panels use `rounded-2xl border border-slate-200 bg-white p-5 shadow-sm` (or `p-6` for larger panels like `MonthlyInsights`). Keep new panels visually consistent with this.
- Formatting is centralized in `lib/utils.ts` (`formatCurrency`, `formatDate`) — don't reimplement `Intl.NumberFormat`/`Intl.DateTimeFormat` calls inline.
- Props are plain, explicit `interface FooProps` per component. No context providers, no state-management library.
- Loading and empty states are hand-styled per component (pulse/skeleton blocks in `page.tsx`'s `LoadingState`, dashed-border empty-state cards elsewhere) rather than a shared component — but keep the same visual language (dashed border, muted `slate-400` text) when adding new ones.
- Dates are stored/compared as `YYYY-MM-DD` strings (ISO date, no time), not `Date` objects, throughout `lib/` and components — see `Expense.date` in `types.ts`.

## 3. Existing Features

### On `master` (shipped, stable)

- **Expense CRUD** — `ExpenseForm` / `ExpenseModal` / `ConfirmDialog`
- **Search & filters** — `ExpenseFilters`: description search, category, date range
- **Dashboard summary cards** — `SummaryCards`: total spending, this month's spending, top category, average expense
- **Spending charts** — `SpendingCharts`: category breakdown donut + 6-month trend bar chart (Recharts)
- **CSV export** — `utils.exportExpensesToCSV`: single format, exports whatever is currently filtered/visible. Has a known security gap — see Section 6.
- **Toasts & confirm dialogs** — `ToastContainer`, `ConfirmDialog`

### Only on `feature/monthly-insights-dashboard` (this branch, unmerged)

- **Monthly Insights dashboard** (`src/components/MonthlyInsights.tsx`) — a second screen reached via a Dashboard / Monthly Insights tab toggle in `page.tsx`. Shows: a donut chart of the *current month's* spending by category with the month's total centered in the hole, a top-3 category legend, and a "Budget Streak" tracker (consecutive days ending today under a daily budget threshold, default $50/day, with a progress bar toward a 30-day goal). See Section 6 for the hardcoded-budget caveat.

### Only on `feature/top-expense-categories` (unmerged)

- New route `/categories` (`src/app/categories/page.tsx` + `src/lib/categoryStats.ts`) — all-time spend ranked by category, with proportional bars and percentage-of-total, reusing `CATEGORY_META` for icons/colors.

### Only on `feature/top-vendors` (unmerged)

- New route `/vendors` (`src/app/vendors/page.tsx` + `src/lib/vendors.ts`) — vendors/merchants (grouped by expense description) ranked by total spend, with transaction count and a dominant-category badge.

### Only on `feature-data-export-v2` (unmerged, experimental)

- A multi-format export drawer (CSV/JSON/PDF) with its own filter UI and live preview table (`src/components/export/*`, `src/lib/export/*`, `useExpenseExport`). Per `code-analysis.md`, all three formats are genuinely functional (no fake/simulated behavior), and this branch is the one `code-analysis.md` recommends adopting as the foundation for export work going forward — subject to the fixes listed in Section 6.

### Only on `feature-data-export-v3` (unmerged, experimental — do not use as a merge candidate as-is)

- A "Cloud Export Studio" (`src/components/cloud-export/*`, `src/lib/cloud-export/*`, `useCloudExport`) with Export/Automations/Share/History tabs. Per `code-analysis.md`, most of the "cloud" surface (Dropbox/OneDrive/Google Sheets sync, scheduled reports, share links) is simulated via `setTimeout`/`localStorage`, not real integrations — see Section 6.

## 4. Branching Strategy

This project uses feature branches for parallel/exploratory development. `master` is the stable branch; feature branches are merged in deliberately after review, not automatically. Known branches as of this writing:

| Branch | Status |
|---|---|
| `master` | Stable baseline |
| `feature/monthly-insights-dashboard` | Active (this branch) — Monthly Insights screen |
| `feature/top-expense-categories` | Unmerged — `/categories` ranked-spend page |
| `feature/top-vendors` | Unmerged — `/vendors` ranked-vendor page |
| `feature-data-export-v2` | Unmerged, experimental — advanced multi-format export (recommended direction per `code-analysis.md`) |
| `feature-data-export-v3` | Unmerged, experimental — cloud export studio (not recommended to merge as-is per `code-analysis.md`) |

Note the naming inconsistency already present in the repo: most feature branches use `feature/<name>` (with a slash), but the two export-comparison branches use `feature-data-export-v2`/`v3` (hyphenated, no slash). Follow whichever convention the branch you're extending already uses; use `feature/<name>` for new branches.

The two data-export branches were created specifically to compare three different implementation strategies for the same feature (see `code-analysis.md` for the full comparison and recommendation) — they are not meant to both ship; one will be chosen and the other abandoned or archived.

## 5. Coding Conventions

- Reuse `CATEGORY_META` (`src/lib/categories.ts`) for any category-associated icon/color/badge instead of introducing a second source of truth.
- Match existing component structure: a single default-exported component per file, `"use client"` at the top, a local `interface <Name>Props`, `useMemo` for derived data computed from `expenses`.
- Reuse `lib/utils.ts` formatting helpers (`formatCurrency`, `formatDate`, `todayISO`, `generateId`) rather than duplicating `Intl` calls or ID generation.
- Match the existing Tailwind visual language: `slate` for neutral text/borders/backgrounds, `indigo-600` as the primary accent, `rounded-2xl`/`rounded-xl` card shells with `border-slate-200` and `shadow-sm`.
- There is no test suite in this repo (no Jest/Vitest/Testing Library, no `*.test.*`/`*.spec.*` files) — verification for this project relies on:
  - `npx tsc --noEmit` — type-check
  - `npm run build` (runs `next build`, which also lints and type-checks) — the standard "does this actually work" gate
  - `npm run lint` — ESLint on its own
  - Manual verification in a running `npm run dev` instance (via browser or browser automation) for anything UI-visible, since there's no automated UI test coverage

## 6. Known Issues / Technical Debt

- **CSV formula injection (unfixed, master and all export branches).** `exportExpensesToCSV` (`src/lib/utils.ts`) only escapes embedded double quotes (`"` → `""`) on the description field. It does not neutralize a leading `=`, `+`, `-`, or `@`, so a description like `=HYPERLINK("http://evil.com")` is written verbatim and can execute as a formula when the CSV is opened in Excel/Sheets. Confirmed present in `master`, `feature-data-export-v2`, and `feature-data-export-v3` alike (`code-analysis.md`, lines 38, 108, 195, 247, 268, 283). Fix: prefix any cell value starting with `=`, `+`, `-`, or `@` with a leading `'` (or space) before quoting — the standard OWASP CSV-injection mitigation. Not yet fixed anywhere in the repo.
- **"Budget Streak" uses a hardcoded default budget, not a real budgeting system.** `MonthlyInsights.tsx` defaults `dailyBudget` to `$50`/day because the app has no concept of user-configurable budgets anywhere in `lib/types.ts` or storage. The prop exists specifically so a real budgeting feature can supply a real value later without changing the component's logic — but today the number shown is arbitrary and not something a user has ever set.
- **`feature-data-export-v3`'s cloud features are UI facades, not working integrations.** Per `code-analysis.md`'s full comparison, the Automations/Share/most-of-History tabs simulate network activity via `setTimeout` and `localStorage`; no OAuth, no real network calls, no server-side scheduler, no reachable share links. The `"failed"` history status is modeled in the types and rendered by the UI but no code path ever produces it (dead state). Do not treat this branch as production-ready, and don't copy its cloud-integration pattern without rebuilding the backend-dependent parts for real.
- **Export branches silently changed what "Export" exports.** `master`'s CSV export always respects the main list's active search/category/date filters. `feature-data-export-v2` has its own independent filter UI inside the export drawer instead (an undocumented behavior change). `feature-data-export-v3` exports the *entire unfiltered* dataset regardless of what's on screen (a functional regression, not just a behavior change). Whichever export implementation is eventually adopted, this needs a deliberate decision, not another silent carry-over.
- **No automated tests anywhere in the repo.** No test runner is configured and no `*.test.*`/`*.spec.*` files exist. All verification is type-checking, `next build`, lint, and manual/browser-automation checks (see Section 5).
- **A stray nested git repo exists at `expense-tracker-ai/` inside the project root** (i.e. `expense-tracker-ai/expense-tracker-ai/.git`), containing only a bare `.git` directory. It appears to be leftover from a worktree or accidental clone rather than intentional project structure — be aware of it if traversing the root directory, but there's nothing to act on unless the user asks.

## 7. Custom Commands Available

### `/generate-docs <feature-name>`

Defined in `.claude/commands/generate-docs.md`. Generates a paired technical spec (`docs/technical/{feature-name}-spec.md`) and user guide (`docs/user/{feature-name}-guide.md`) for a named feature, plus real screenshots saved to `docs/screenshots/{feature-name}/`.

- Classifies the feature as Frontend / Backend / Full-stack before writing.
- **Requires the Playwright MCP server** to be connected (`claude mcp add playwright npx @playwright/mcp@latest`) — it drives a locally running instance of the app (assumes `npm run dev` on `localhost:3000`) to capture real screenshots at each documented step.
- Searches existing `/docs` content first and links related docs both ways (technical ↔ user guide) rather than writing in isolation.
- Will ask before overwriting an existing doc file, and will ask for clarification rather than guess if no code matches the given feature name.
- Existing docs following this convention: `docs/technical/csv-export-spec.md` and `docs/user/csv-export-guide.md` (with screenshots in `docs/screenshots/csv-export/`) — use these as the style reference if generating new docs and no more specific existing doc applies.
- Use this command when a feature is complete and needs both audiences documented (a developer-facing spec and an end-user walkthrough) with real, current screenshots — not for quick internal notes.

## 8. Development Workflow Notes

- Run the dev server with `npm run dev` (defaults to `http://localhost:3000`; Next.js will auto-increment to `3001`, etc. if the port is already taken — check the terminal output for the actual port in use).
- For visual verification, browser automation may be available via **Claude in Chrome** (`mcp__claude-in-chrome__*` tools — requires the Chrome extension installed and connected) or, for `/generate-docs` specifically, the **Playwright MCP server**. Check which is actually connected before assuming either is available; neither is guaranteed to be connected in a given session.
- **Always stop the dev server once done testing** — don't leave background `npm run dev` processes running across turns. Check for stray processes on ports 3000/3001+ if a prior session may have left one running.
- `npx tsc --noEmit` and `npm run build` are the fastest way to catch a broken change before involving the browser at all — run these before reaching for browser automation, not instead of it, for anything UI-visible.
