# Data Export Implementation Analysis

Comparative technical analysis of three data-export implementations in the expense tracker application, examined across three branches: `master`, `feature-data-export-v2`, and `feature-data-export-v3`.

Findings only — no recommendation is included in this document.

---

## Version 1 — `master` (Simple CSV Export)

### Files created/modified
Single-function implementation, no dedicated export module:
- `src/lib/utils.ts` — contains `exportExpensesToCSV(expenses)`, the entire export implementation (lines 33–51)
- `src/components/ExpenseFilters.tsx` — renders the "Export CSV" button, disabled when `resultCount === 0`
- `src/app/page.tsx` — `handleExport()` handler wires the button to `exportExpensesToCSV(filteredExpenses)` and pushes a toast

### Code architecture overview
No architecture to speak of — this is a single, self-contained function co-located with unrelated utility helpers (`formatCurrency`, `formatDate`, `todayISO`, `generateId`) in a general-purpose `utils.ts`. Export is not filtered by any options; it always exports whatever is currently visible in the main list (respecting the page's active search/category/date filters, since `filteredExpenses` is passed in from `page.tsx`).

### Key components and responsibilities
- `exportExpensesToCSV()` — builds a CSV string, wraps it in a `Blob`, and triggers a browser download via a temporary `<a download>` element
- `ExpenseFilters` — owns the single "Export CSV" button (`Download` icon, disabled when no results)
- `page.tsx::handleExport` — thin glue: guards on empty result set, calls the export function, shows a success toast

### Libraries and dependencies used
None beyond native browser APIs: `Blob`, `URL.createObjectURL`/`revokeObjectURL`, DOM `<a>` element. No new npm dependencies.

### Implementation patterns and approaches
Procedural, imperative, single-pass function. No state machine, no async — everything happens synchronously in one call. CSV rows are built via manual string concatenation and `Array.join(",")`.

### Code complexity assessment
Trivial. ~19 lines of actual export logic. Single function, no branching beyond the row-mapping loop. Zero abstractions.

### Error handling approach
Minimal. `page.tsx` guards against an empty array (`if (filteredExpenses.length === 0) return`). No try/catch anywhere — if `Blob` construction or the download trigger fails, the error is unhandled and surfaces as an uncaught exception. No validation of expense data shape.

### Security considerations
**CSV/formula injection unaddressed**: `escapeCsvCell`-equivalent logic only escapes embedded double quotes (`"` → `""`) via `e.description.replace(/"/g, '""')`. It does not neutralize leading `=`, `+`, `-`, or `@` characters, so a malicious expense description like `=HYPERLINK("http://evil.com")` would be written verbatim into the CSV and could execute as a formula when opened in Excel/Sheets. This is the root of a vulnerability that both later branches inherit without fixing. No XSS surface (no HTML rendering of export content). Fully client-side — no network transmission risk.

### Performance implications
Negligible for realistic dataset sizes — a single string-join and `Blob` construction. No chunking needed since there's no heavy computation (no PDF rendering, no aggregation).

### Extensibility and maintainability factors
Poor extensibility by design (it isn't designed for extension) — adding a second format would require restructuring this function entirely; there is no format abstraction, no options object, no separation between "what to export" and "how to serialize it." Easy to read and maintain precisely because it does one thing.

---

## Version 2 — `feature-data-export-v2` (Advanced Multi-Format Export)

### Files created/modified
**New (12 files):**
- `src/lib/export/types.ts` — shared types (`ExportFormat`, `ExportOptions`, `ExportStage`)
- `src/lib/export/formats.ts` — static metadata registry for the 3 supported formats
- `src/lib/export/filterExpenses.ts` — pure filter/sort function scoped to the export drawer's own filters
- `src/lib/export/runExport.ts` — orchestrator: filter → build blob → trigger download
- `src/lib/export/writers/csvWriter.ts`, `jsonWriter.ts`, `pdfWriter.ts` — one Blob-builder per format
- `src/hooks/useExpenseExport.ts` — stateful hook owning all drawer UI state
- `src/components/export/ExportDrawer.tsx` — slide-over dialog, main UI surface
- `src/components/export/ExportFormatPicker.tsx`, `ExportCategoryPicker.tsx`, `ExportPreviewTable.tsx` — drawer sub-widgets

**Modified (6 files):**
- `src/app/page.tsx` — replaces inline CSV call with `<ExportDrawer>` open/close state
- `src/components/Header.tsx` — adds a standalone "Export" button
- `src/components/ExpenseFilters.tsx` — old export button **removed** (export decoupled from the list filter bar)
- `src/lib/utils.ts` — `exportExpensesToCSV` deleted
- `package.json` — adds `jspdf@^4.2.1`, `jspdf-autotable@^5.0.8`
- `src/app/globals.css` — drawer fade/slide keyframes

### Code architecture overview
Clean layered separation:
1. **Types layer** (`export/types.ts`) — contracts only
2. **Data layer** (`filterExpenses.ts`, `formats.ts`) — pure functions
3. **Format layer** (`writers/*.ts`) — one file per format, each a `build*(expenses, options) => Blob` function — a de facto **strategy pattern**
4. **Orchestration layer** (`runExport.ts`) — sequences filter → stage transitions → build → download; framework-agnostic, no React
5. **State layer** (`useExpenseExport.ts`) — custom hook owning options/stage/error/result
6. **UI layer** (`ExportDrawer` + 3 subcomponents) — pure presentation, delegates all logic to the hook

A meaningful architectural jump over master's single function — business logic is fully decoupled from React and independently testable.

### Key components and their responsibilities
- **`ExportDrawer`** — slide-over dialog (`role="dialog"`, `aria-modal`, Escape-to-close, body-scroll-lock); owns no state itself
- **`ExportFormatPicker`** — 3-way icon toggle over `EXPORT_FORMATS` metadata
- **`ExportCategoryPicker`** — multi-select pill toggles; empty selection means "all categories"
- **`ExportPreviewTable`** — live preview capped at 6 rows plus a "+N more" footer, with an empty state
- **`useExpenseExport`** — state machine (`idle → preparing → generating → done|error`), memoized preview rows/total

### Libraries and dependencies used
- `jspdf` + `jspdf-autotable` — real, non-trivial client-side PDF document generation (not a stub)
- Browser APIs: `Blob`, `URL.createObjectURL`/`revokeObjectURL`, `requestAnimationFrame` (used to yield a frame so the "preparing"/"generating" UI actually paints before the synchronous PDF build blocks the main thread)

### Implementation patterns and approaches
- **State**: single `useState<ExportOptions>` updated via spread-updater callbacks; no reducer despite a multi-stage state machine (a `useReducer` would fit better, but is workable at this scale)
- **Filtering**: the export drawer has its **own** date/category filters, entirely separate from the main page's `ExpenseFilters` — exporting no longer respects what's currently shown in the list, a deliberate scope change from master that could surprise users expecting "Export" to export the visible/filtered view
- **Format dispatch**: nested ternary in `runExport.ts` rather than a `Record<ExportFormat, WriterFn>` lookup map — functional at 3 formats, doesn't scale cleanly to a 4th
- **Filename**: user-editable, sanitized via regex stripping `\/:*?"<>|` before use

### Code complexity assessment
~840 net new lines across 15 files. Each file is small and single-purpose (12–130 LOC); no file exceeds ~130 lines. Low cyclomatic complexity per function — the most complex is `runExport` (linear sequence, one 3-way branch). Complexity comes from file-count/indirection (1 function → 15 files), not from any individual unit.

### Error handling approach
- `execute()` wraps `runExport` in try/catch and surfaces `err.message` in the UI — the only exercised error path
- `formatMeta()` throws on an unknown format id, but this is unreachable in practice since the UI only ever sets valid union values (defensive but dead code)
- **No validation** that `startDate <= endDate` — a reversed range silently yields zero matching rows with no explanation
- No specific handling around jsPDF internals — any internal exception is caught only by the generic outer try/catch, producing an unactionable generic error string
- No handling for a download being blocked by a popup/download blocker — same silent-failure gap as master

### Security considerations
- **CSV formula injection unaddressed** — `escapeCsvCell` only escapes embedded quotes, not leading `=`, `+`, `-`, `@`; unfixed carry-over from master. JSON export is safe (`JSON.stringify` escapes), PDF export is safe (jsPDF renders text, doesn't execute it) — so the exploitable surface is specifically the CSV writer
- No sanitization of control characters in `description` for any format
- Filename sanitization is present and reasonable
- No `dangerouslySetInnerHTML`/`innerHTML` use — no XSS surface found
- Fully client-side, no network calls, no transmission-layer risk

### Performance implications
- **PDF generation is fully synchronous** — for large expense lists (thousands of rows), `buildPdf` (jsPDF + autotable) will block the main thread noticeably; the `requestAnimationFrame` yield happens only *before* the build starts, not during it, so the UI shows a spinner but the tab is still frozen mid-generation
- CSV/JSON builders are cheap string concatenation, a non-issue below tens of thousands of rows
- `Blob`/`URL.createObjectURL`/`revokeObjectURL` lifecycle is correctly paired — no memory leak
- Preview values are memoized on `[expenses, options]`

### Extensibility and maintainability factors
- Adding a 4th format requires touching the `ExportFormat` union, `EXPORT_FORMATS`, a new writer file, and one more ternary branch in `runExport.ts` — the ternary is the one part that should become a lookup map before scaling further
- `filterExpensesForExport` is decoupled, pure, and trivially unit-testable
- Hook and drawer are cleanly separable — the hook could back a modal, a full page, or a non-UI consumer without modification
- Conventional Next.js/React patterns throughout; low ramp-up cost for a new maintainer

---

## Version 3 — `feature-data-export-v3` (Cloud Integration & Sharing)

**Key finding up front: this branch is 100% client-side simulation.** No `fetch`, `XMLHttpRequest`, or any network call exists anywhere in the new code. "Google Sheets sync," "Dropbox/OneDrive upload," "email sending," and "sharing" are all `setTimeout`-staged animations plus `localStorage` bookkeeping. The UI is explicit about this in-copy: SharePanel states "*Simulated sharing — links are generated locally for demo purposes and aren't reachable from other devices*," and SchedulePanel states "*Automations run on a simulated schedule for this demo — no background job actually executes them.*"

### Files created/modified
- `src/components/cloud-export/CloudExportStudio.tsx` — modal shell/orchestrator, tab routing, Esc-to-close, body-scroll lock
- `src/components/cloud-export/StudioSidebar.tsx` — tab nav (Export/Automations/Share/History) with count badges
- `src/components/cloud-export/ExportPanel.tsx` — one-shot export tab: template + destination pickers, run button, progress bar
- `src/components/cloud-export/TemplatePicker.tsx` — 4-card template selector (tax-report/monthly-summary/category-analysis/custom)
- `src/components/cloud-export/DestinationPicker.tsx` — 5-card destination selector with per-destination "Connect" flow
- `src/components/cloud-export/SchedulePanel.tsx` — CRUD UI for recurring automations (fake scheduler)
- `src/components/cloud-export/SharePanel.tsx` — share-link generator + QR code + copy/revoke
- `src/components/cloud-export/HistoryPanel.tsx` — read-only list of past export runs
- `src/hooks/useCloudExport.ts` — single stateful controller for all of the above (243 lines)
- `src/lib/cloud-export/types.ts` — domain types (Destination/Template/Schedule/ShareLink/History/Connection)
- `src/lib/cloud-export/buildTemplate.ts` — the actual report/CSV generators (4 templates), with correct CSV cell escaping
- `src/lib/cloud-export/destinationMeta.ts` / `templateMeta.ts` — static UI metadata
- `src/lib/cloud-export/simulate.ts` — generic staged-delay simulator (`runStages`, `wait(ms)`)
- `src/lib/cloud-export/storage.ts` — localStorage read/write wrappers per entity, try/catch-guarded
- `src/lib/cloud-export/shareLink.ts` — fake share URL builder, `Math.random()` token generation, QR code via the `qrcode` package
- `src/lib/cloud-export/schedule.ts` — next-run-date math (+7 days / +1 month)
- `src/lib/cloud-export/downloadFile.ts` — Blob + `<a download>` trigger (same mechanism as master's original function)
- `src/lib/cloud-export/format.ts` — two `Intl.DateTimeFormat` helpers
- `src/lib/utils.ts` — `exportExpensesToCSV()` deleted
- `src/app/page.tsx`, `Header.tsx`, `ExpenseFilters.tsx` — old "Export CSV" button replaced with an "Export Studio" trigger; **`ExpenseFilters` loses its `onExport`/`resultCount` props entirely**
- `package.json` — adds `qrcode` + `@types/qrcode`
- `src/app/globals.css` — one new modal-entrance keyframe

### Code architecture overview
Three-layer split mirroring v2's pattern:
- **`lib/cloud-export/`** — pure/near-pure logic: types, template builders, storage, simulation, formatting; no React
- **`hooks/useCloudExport.ts`** — a single "mega-hook" owning all state for the entire 4-tab studio (connections, exports, schedules, share links, processing status all interleaved), exposing one large typed return object
- **`components/cloud-export/`** — presentational; each panel receives a `Pick<UseCloudExportReturn, ...>` slice as props; `CloudExportStudio` is the only component calling the hook, everything else is prop-drilled

### Key components and their responsibilities
Listed in the file table above. Notable: `destinationMeta(id)`/`templateMeta(id)` **throw** on an unknown id rather than returning `undefined` — safe today because ids are constrained by the TS union type, but a runtime footgun if `localStorage` ever holds a stale id from a prior schema version, since these are called synchronously during render (see Error Handling).

### Libraries and dependencies used
- `qrcode` (+ `@types/qrcode`) — real, actively used for QR code data-URL generation in the Share tab
- Everything else reuses existing deps (`lucide-react`, native `Intl`, existing `generateId()`)
- Browser APIs: `localStorage`, `Blob`/`URL.createObjectURL` (only for the "download" destination), `navigator.clipboard.writeText`

### Implementation patterns and approaches
- **State**: `useState` + `useCallback` throughout, no reducer, despite the state shape (connections/history/schedules/shareLinks/processing) being reducer-shaped. Every mutator follows an identical `setState(prev => {const next = ...; saveX(next); return next})` pattern, persisting to localStorage on every write with no batching/debounce
- **Simulation**: `runStages()` awaits `wait(550ms)` per stage label while invoking a progress callback — this constitutes the entire "backend integration"
- **Destinations/templates as static metadata arrays** with lookup-by-id helpers — easy to extend by appending an entry, but destination-specific *behavior* (stage lists, connection requirement) lives separately in a `switch` in `simulate.ts` plus a `requiresConnection` boolean, i.e. two sources of truth that must be kept in sync
- **"Connections" are fake auth state** — once connected, `status: "connected"` persists forever in localStorage; no real OAuth, no token, no expiry, no way to actually fail a connection attempt (100% success after ~1.65s of staged messages)

### Code complexity assessment
~1,500 lines of new production code (components ~823 LOC, hook 243 LOC, lib ~433 LOC). Low cyclomatic complexity per function — most are short and single-purpose. The complexity here is architectural/surface-area (4 tabs × 5 destinations × 4 templates × schedule/share sub-flows), not algorithmic. `useCloudExport.ts` is the single largest and most multi-responsibility unit.

### Error handling approach
**Handled:**
- Empty template result blocked with an explicit message before running
- Destination requiring a connection but not connected → blocked with inline error
- Email destination requires a valid-looking email (regex) before running
- `localStorage` read/write wrapped in try/catch, falls back to empty state silently
- Clipboard write wrapped in try/catch, silently ignored on failure

**Not handled / gaps:**
- **No simulated failure path exists at all** — `runStages` always resolves, `connectIntegration` always succeeds. `ExportHistoryEntry.status: "failed"` exists in the type and is rendered by `HistoryPanel` (red "Failed" badge), but nothing in the codebase ever produces a `"failed"` entry — an unreachable/unfinished code path
- `destinationMeta(id)`/`templateMeta(id)` throw synchronously with no caller try/catch — a future schema change leaving a stale id in localStorage would crash the panel rendering that history/schedule/share item
- No cleanup/`AbortController` on `runStages` — closing the modal mid-run doesn't unmount the hook (`useCloudExport` is called unconditionally before the `isOpen` early return), so an abandoned run can still resolve and set state after the fact; not a crash, but a minor state-leak/stale-UI risk
- Rapid double-click on "Run export" isn't guarded until `processing.active` flips on the next render — a fast double-invoke could start `runStages` twice (low severity, since it's simulated)

### Security considerations
- **No real security surface** — nothing is transmitted anywhere; localStorage only holds template/destination ids, timestamps, and fake tokens, not sensitive data beyond what the app already stores
- **CSV formula injection**: `escapeCsvCell` correctly quotes cells and escapes internal `"`, but does not neutralize leading `=`, `+`, `-`, `@` — same class of gap as master and v2, not a regression, not fixed
- **Fake share links look deceptively real**: `https://expense-tracker.demo/shared/{token}` is a plausible HTTPS URL; the in-UI disclaimer mitigates this, but a user who copies and pastes the link elsewhere without reading the disclaimer would share a dead link believing it's live — this is a UX/trust risk rather than a technical vulnerability, and QR codes make unread distribution easier
- No XSS surface identified — no `dangerouslySetInnerHTML`; all user data flows only into CSV text or auto-escaped React text nodes

### Performance implications
- `buildTemplate()` runs synchronously, O(n) single-pass aggregation via `Map` — fine even at thousands of rows since it's just string concatenation, no DOM work
- Every state mutation (connect, schedule, share, history) synchronously JSON-stringifies to localStorage; `history` is capped at 50 entries, but `schedules`/`shareLinks`/`connections` are unbounded (realistically small since they're user-created, not data-driven)
- **The simulated delay is a real, imposed UX cost**: every export takes 550ms × stage-count (e.g., Google Sheets ≈ 1.65s) purely for show — even the trivial "download" destination incurs a "Preparing file" stage before the otherwise-instant Blob download fires
- QR generation is cheap, client-side, no perf concern at this scale

### Extensibility and maintainability factors
- **Destinations**: swapping `simulate.ts`'s stage-runner for real API calls is architecturally straightforward — `runExport()` in the hook is the single choke point where a real upload call would go per destination; `connectIntegration` would need to become a real OAuth redirect/popup flow instead of a timed animation
- **Sharing**: needs an actual backend (storage + auth + expiry enforcement) to serve a real URL — a non-trivial addition, unlike destinations which mostly need API wiring
- **Scheduling**: currently zero actual execution exists; a real implementation needs a server-side cron/queue system entirely absent from this codebase — the single largest gap between what the UI promises and what exists
- Overall the UI/state layer is a solid scaffold for a real cloud-export feature, but roughly 3 of its 4 tabs (Automations, Share, and the non-"download" destinations in Export) are currently facades with no backend counterpart

---

## Technical Deep Dive

### How does the export functionality work technically?

**v1 (master)**: Synchronous, single-shot. Click → build CSV string → `Blob` → temporary `<a download>` → click → cleanup. No intermediate state, no async.

**v2**: Drawer opens → hook resets to defaults → user adjusts format/date-range/category/filename with a live preview (memoized against the current `options`) → on submit, `runExport()` runs a small async pipeline: `setStage("preparing")` → `requestAnimationFrame` yield → filter → `setStage("generating")` → another yield → dispatch to the matching writer (`buildCsv`/`buildJson`/`buildPdf`, each synchronous) → sanitize filename → `Blob` + `<a download>` trigger, identical download mechanism to v1, just factored into `runExport.ts`.

**v3**: Modal opens with a 4-tab studio → user picks a template (aggregation logic in `buildTemplate.ts`) and a destination (may require a fake "Connect" step) → `runExport()` in the hook validates (empty result / missing connection / invalid email), computes a per-destination stage list, and runs `runStages()`, which is `await wait(550ms)` per stage while updating a progress bar. **Only the "download" destination actually produces a file** (via `downloadFile.ts`, same Blob/`<a download>` mechanism as v1); every other "destination" just writes a history entry claiming success with no real upload/send.

### What file generation approach is used?

- **v1**: manual string building only (CSV).
- **v2**: manual string building for CSV and JSON (`JSON.stringify` of a metadata-wrapped payload including `exportedAt`, active filters, `recordCount`, `totalAmount`, and the raw expenses); real document generation via the `jspdf` + `jspdf-autotable` libraries for PDF (fonts, headers/footers, page numbers, tabular layout).
- **v3**: manual string building only, CSV in all cases — despite being called "Export Studio," there is no JSON or PDF output. Four template variants (tax-report with category subtotals/grand total, monthly-summary and category-analysis as aggregation-only outputs with no raw rows, and a raw "custom" ledger).

### How is user interaction handled?

- **v1**: one button, no intermediate UI state, immediate action.
- **v2**: a slide-over drawer (`role="dialog"`, `aria-modal`, Escape-to-close, body-scroll-lock) with three sub-widgets (format picker, category picker, live preview table) feeding a single options object; a footer button triggers the async export pipeline with stage-based UI feedback (preparing/generating/done/error).
- **v3**: a larger 4-tab modal (Export/Automations/Share/History) with per-tab forms; the Export tab alone involves two nested pickers (template, then destination) plus conditional sub-forms (tax year, connect flow, email input) before a run button becomes available; progress is shown via a stage-driven progress bar identical in spirit to v2's stage machine but with real (albeit fake) network-simulating delays.

### What state management patterns are used?

All three avoid `useReducer` in favor of `useState`, even where a state-machine or multi-entity shape would arguably fit a reducer better:
- **v1**: no persistent state — a single stateless function call.
- **v2**: one `useState<ExportOptions>` plus a separate stage `useState`, both local to `useExpenseExport`; spread-updater callbacks; values memoized via `useMemo` for the preview.
- **v3**: a much larger surface — `useCloudExport` owns five distinct pieces of state (connections, history, schedules, shareLinks, processing), each independently persisted to `localStorage` on every write via an identical `setState(prev => {...; saveX(next); return next})` pattern, with no batching. This is a "mega-hook" backing an entire multi-tab modal, versus v2's more narrowly-scoped single-purpose hook.

### How are edge cases handled?

| Edge case | v1 (master) | v2 | v3 |
|---|---|---|---|
| Empty dataset | Button disabled (`resultCount === 0`) | Dedicated empty-state UI, export button disabled | Explicit blocking error message before running |
| CSV formula injection (`=`, `+`, `-`, `@`) | **Not handled** | **Not handled** (inherited) | **Not handled** (inherited) |
| Embedded quotes/commas in text fields | Handled (quote escaping) | Handled | Handled (correct full quoting) |
| Reversed date range | N/A (no date filter) | Not handled — silently yields empty results, no explicit message | N/A (template-level year filter only, no explicit range) |
| Large datasets | Trivial cost | PDF generation blocks the main thread synchronously; no chunking/worker offload | O(n) synchronous aggregation, no chunking, but cheap since it's string-only |
| Download blocked by browser | Not handled (silent failure) | Not handled (silent failure, same gap) | Only applicable to the "download" destination; same gap |
| Simulated/real failure path | N/A | Generic try/catch surfaces `err.message` | **No failure path is reachable at all** — `"failed"` history status exists in the type system and is rendered by the UI but is never produced by any code path |
| Concurrent/duplicate submissions | Not explicitly guarded | Export button disabled while `isBusy` | Guarded only after the next render tick — a fast double-click could start two simulated runs |

---

## Comparative Recommendation

### Scoring against the criteria examined above

| Criterion | v1 (master) | v2 | v3 |
|---|---|---|---|
| Delivers what it claims | Yes — plain CSV, nothing more promised | Yes — CSV/JSON/PDF, all real | **No** — "cloud sync," "sharing," "scheduling" are simulated; only the "download" destination produces a real file |
| Architecture quality | N/A (too small to assess) | Strong — layered, framework-agnostic core logic, testable | Reasonable scaffold, but a single 243-line "mega-hook" carries too much unrelated responsibility |
| User-facing value today | Low (one format, no options) | High (three real formats, filtering, preview) | Low-to-misleading (most surface area does nothing real yet) |
| Effort to reach "production ready" | Already there, for what it does | Small (fix known gaps below) | Large (needs a real backend for OAuth, storage, share-link hosting, and a job scheduler) |
| Regression vs. master | None | Export no longer respects the main list's active filters (has its own filter UI instead — a deliberate but unflagged behavior change) | Export uses the *entire unfiltered* dataset — a silent functional regression |
| Shared unresolved issue | CSV formula injection (`=`, `+`, `-`, `@` not escaped) | Same | Same |

### Recommendation: adopt v2 as the base; do not ship v3 as-is

**Adopt `feature-data-export-v2`'s architecture and feature set as the foundation.** It is the only branch that is both a genuine improvement over master and fully backed by real functionality — three working export formats, a decoupled and testable core (`lib/export/*`), and a UI that doesn't promise anything it can't deliver. The layering (types → pure data/filter functions → format writers → orchestrator → hook → presentation) is a good long-term shape for this feature and is worth keeping even if individual pieces are revised.

**Do not merge `feature-data-export-v3` in its current form.** Its "cloud integration" tabs (Automations, Share, and every destination other than "download") are UI facades wired to `setTimeout` and `localStorage`, not real integrations — no OAuth, no network calls, no server-side scheduler, no reachable share links. Even though the UI discloses this in small print, shipping a feature that visually presents Dropbox/OneDrive/Google Sheets sync, scheduled reports, and shareable links as available options is a product-honesty risk, and the `HistoryPanel`'s "Failed" status being permanently unreachable is a sign the simulated paths were never load-tested against a real failure mode. Its state-management pattern (one large hook owning five independent entities, persisted to `localStorage` on every keystroke) would also need to be split up before it could safely support real async, fallible network operations (which need retry, timeout, and error states this hook doesn't model).

**What's still worth salvaging from v3, later, if real cloud sync becomes an actual product goal:**
- The tab/panel UI structure (Export / Automations / Share / History) and the template concept (tax-report, monthly-summary, category-analysis) are reasonable product ideas and could be layered on top of v2's writer architecture once real backend endpoints exist.
- `shareLink.ts` and the QR-code flow are a fine UI pattern to reuse once a server can actually issue and host a signed share URL.
- Treat this as a design reference, not code to merge as-is — the simulation scaffolding (`simulate.ts`, the fake `connections` state) should not be carried into a real implementation.

### Required fixes before adopting v2, regardless of the above

1. **Fix CSV formula injection** in `csvWriter.ts` (and anywhere else CSV is produced): prefix cell values starting with `=`, `+`, `-`, or `@` with a leading `'` or space before quoting, per the standard OWASP CSV-injection mitigation. This is unresolved in all three branches and is the one concrete security defect in the whole comparison.
2. **Decide deliberately, and document, whether export should respect the main list's active filters** (master's behavior) or use its own independent filter UI (v2's current behavior) — right now it's a silent, undocumented behavior change that could confuse users who expect "Export" to export what they're currently looking at.
3. **Replace the format-dispatch ternary in `runExport.ts`** with a `Record<ExportFormat, WriterFn>` lookup map before adding any further format, to keep `runExport` from growing an unreadable branch chain.
4. **Consider moving PDF generation off the main thread** (e.g., behind a `Promise`/microtask boundary or a Web Worker) if expense datasets are expected to grow large — currently `buildPdf` blocks synchronously with no chunking.
