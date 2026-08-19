# Expense Tracker

A personal expense tracker built with Next.js and TypeScript. Log expenses, browse them with search/filter/date-range controls, see spending trends on charts, and export your data — all running entirely client-side, with no backend or database.

## Features

- **Expense CRUD** — add, edit, and delete expenses with date, amount, category, and description
- **Search & filters** — filter the expense list by description, category, and date range
- **Dashboard summary** — total spending, this month's spending, top category, and average expense per transaction
- **Spending charts** — category breakdown (donut chart) and a 6-month spending trend (bar chart), via Recharts
- **Local persistence** — expenses are saved to the browser's `localStorage`, so data survives refreshes and restarts (per-browser, no sync across devices)
- **Toast notifications & confirm dialogs** for add/edit/delete actions
- **Cloud-Integrated Export Studio** — a workspace-style modal for getting expense data out of the app:
  - **Templates**: Tax Report (year-filtered ledger with category subtotals), Monthly Summary, Category Analysis (totals + % share), and a raw Custom export
  - **Destinations**: direct file Download, Email, Google Sheets, Dropbox, and OneDrive — the three cloud destinations go through a connect flow before they're usable
  - **Automations**: schedule a template + destination combo to repeat weekly or monthly, with pause/resume/delete controls
  - **Sharing**: generate a share link with a configurable expiry, rendered alongside a real QR code
  - **History**: a running log of every export that's been run, with timestamp, record count, and status

  > All cloud integrations (Email, Google Sheets, Dropbox, OneDrive, sharing) are **simulated** for demo purposes — connecting, uploading, and sending are staged local animations. No real OAuth flow runs, no network request is made to any third-party service, and no email is ever sent. Only the direct "Download" destination produces a real file. This is called out in-app as well.

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **UI**: React 18, [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [lucide-react](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **QR codes**: [qrcode](https://www.npmjs.com/package/qrcode)
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
  app/                    # Next.js App Router entry (layout, page, global styles)
  components/             # UI components
    cloud-export/         # Export Studio: templates, destinations, schedule, share, history panels
  hooks/                  # useExpenses (CRUD + persistence), useCloudExport (studio state)
  lib/
    cloud-export/         # Template builders, integration/destination metadata, simulated
                           # connect/upload flow, schedule math, share-link + QR generation, storage
    categories.ts          # Category definitions, icons, colors
    storage.ts              # localStorage read/write for expenses
    types.ts                 # Shared Expense/Category types
    utils.ts                  # Formatting & id helpers
```

## Notes

This project has no server or database — all state (expenses, export history, schedules, share links, connection status) lives in the browser's `localStorage`, scoped to the current browser/device.
