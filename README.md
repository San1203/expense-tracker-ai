# Expense Tracker

A personal expense tracker built with Next.js and TypeScript. Log expenses, browse them with search/filter/date-range controls, see spending trends on charts, and export your data — all running entirely client-side, with no backend or database.

## Features

- **Expense CRUD** — add, edit, and delete expenses with date, amount, category, and description
- **Search & filters** — filter the expense list by description, category, and date range
- **Dashboard summary** — total spending, this month's spending, top category, and average expense per transaction
- **Spending charts** — category breakdown (donut chart) and a 6-month spending trend (bar chart), via Recharts
- **Local persistence** — expenses are saved to the browser's `localStorage`, so data survives refreshes and restarts (per-browser, no sync across devices)
- **Toast notifications & confirm dialogs** for add/edit/delete actions
- **Advanced export drawer** — a right-side panel for getting expense data out of the app:
  - **Formats**: CSV, JSON, or a formatted PDF report (branded header, table, page numbers)
  - **Filters**: independent date range and multi-select category filters, scoped to the export only (doesn't affect the main list)
  - **Live preview**: a sample of the rows that will be exported, plus a running record count and total
  - **Custom filename**, with the extension kept in sync with the selected format
  - **Staged loading state**: preparing → generating, with a progress spinner on the export button

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **UI**: React 18, [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [lucide-react](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **PDF generation**: [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **Persistence**: browser `localStorage` — no backend, no database
- **Linting**: ESLint (`eslint-config-next`)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the dev server with hot reload |
| `npm run build` | Production build                     |
| `npm run start` | Serve the production build           |
| `npm run lint`  | Run ESLint                           |

## Project Structure

```
src/
  app/                 # Next.js App Router entry (layout, page, global styles)
  components/           # UI components
    export/              # Export drawer: format picker, category picker, preview table
  hooks/                  # useExpenses (CRUD + persistence), useExpenseExport (drawer state)
  lib/
    export/                # Export engine: format metadata, filtering, CSV/JSON/PDF writers, orchestrator
    categories.ts           # Category definitions, icons, colors
    storage.ts                # localStorage read/write for expenses
    types.ts                   # Shared Expense/Category types
    utils.ts                    # Formatting & id helpers
```

## Notes

This project has no server or database — all state lives in the browser's `localStorage`, scoped to the current browser/device.
