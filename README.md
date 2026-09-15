# Expense Tracker

A personal expense tracker built with Next.js and TypeScript. Log expenses, browse them with search/filter/date-range controls, see spending trends on charts, and export your data to CSV — all running entirely client-side, with no backend or database.

## Features

- **Expense CRUD** — add, edit, and delete expenses with date, amount, category, and description
- **Search & filters** — filter the expense list by description, category, and date range
- **Dashboard summary** — total spending, this month's spending, top category, and average expense per transaction
- **Spending charts** — category breakdown (donut chart) and a 6-month spending trend (bar chart), via Recharts
- **Monthly Insights dashboard** — a dedicated view (toggle via the Dashboard / Monthly Insights tabs) with a donut chart of the current month's spending by category, a top-3 category legend, and a budget streak tracker showing consecutive days spent under a daily budget threshold
- **CSV export** — export the currently filtered expense list to a CSV file
- **Local persistence** — expenses are saved to the browser's `localStorage`, so data survives refreshes and restarts (per-browser, no sync across devices)
- **Toast notifications & confirm dialogs** for add/edit/delete actions

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **UI**: React 18, [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [lucide-react](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Persistence**: browser `localStorage` — no backend, no database
- **Linting**: ESLint (`eslint-config-next`)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Monthly Insights dashboard

The **Monthly Insights** tab gives a focused, single-month view of your spending, separate from the main dashboard:

- **Spending donut chart** — a breakdown of the current month's expenses by category, with the month's total shown in the center
- **Top 3 categories** — a legend listing the three highest-spending categories for the month with their totals
- **Budget streak tracker** — the number of consecutive days (ending today) where daily spending stayed under a budget threshold (defaults to $50/day), with a progress bar toward a 30-day streak goal

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
  app/          # Next.js App Router entry (layout, page, global styles)
  components/    # UI components (header, filters, list, modal, charts, summary cards, toasts, monthly insights)
  hooks/          # useExpenses — expense CRUD + localStorage persistence
  lib/
    categories.ts # Category definitions, icons, colors
    storage.ts      # localStorage read/write for expenses
    types.ts          # Shared Expense/Category types
    utils.ts            # Formatting, id generation, CSV export helper
```

## Notes

This project has no server or database — all state lives in the browser's `localStorage`, scoped to the current browser/device.
