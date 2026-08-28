# CSV Export screenshots

These PNGs are referenced by [`../../user/csv-export-guide.md`](../../user/csv-export-guide.md).

| File | Shows |
|------|-------|
| `step-1.png` | App home page — summary cards, charts, the filter bar with the "Export CSV" button, and the full expense list. |
| `step-2.png` | Filter bar with the **Food** category and an August date range applied; list showing only the matching rows. |
| `step-3.png` | Close-up of the filter bar with the "Export CSV" button. |
| `step-4.png` | The "Exported 3 expenses to CSV." confirmation toast. |
| `step-5.png` | The downloaded CSV opened in a spreadsheet (Date, Category, Description, Amount columns). |

Captured against the dev server (`npm run dev`) with a seeded set of sample
expenses. `step-5.png` shows the exported file rendered in a spreadsheet-style
view. To regenerate, reseed sample data, repeat the steps in the user guide, and
overwrite these files at the same names.
