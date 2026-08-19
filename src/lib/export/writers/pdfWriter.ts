import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Expense } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ExportOptions } from "../types";

const BRAND_INDIGO: [number, number, number] = [79, 70, 229];
const SLATE_500: [number, number, number] = [100, 116, 139];
const SLATE_900: [number, number, number] = [15, 23, 42];

function describeRange(startDate: string, endDate: string): string {
  if (startDate && endDate) return `${formatDate(startDate)} – ${formatDate(endDate)}`;
  if (startDate) return `From ${formatDate(startDate)}`;
  if (endDate) return `Through ${formatDate(endDate)}`;
  return "All time";
}

export function buildPdf(expenses: Expense[], options: Pick<ExportOptions, "startDate" | "endDate" | "categories">): Blob {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...SLATE_900);
  doc.text("Expense Report", margin, 50);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...SLATE_500);
  doc.text(`Generated ${new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date())}`, margin, 68);
  doc.text(`Period: ${describeRange(options.startDate, options.endDate)}`, margin, 82);
  const categoryLine = options.categories.length > 0 ? options.categories.join(", ") : "All categories";
  doc.text(`Categories: ${categoryLine}`, margin, 96);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND_INDIGO);
  doc.text(`${expenses.length} record${expenses.length === 1 ? "" : "s"}  ·  Total: ${formatCurrency(total)}`, margin, 116);

  autoTable(doc, {
    startY: 132,
    head: [["Date", "Description", "Category", "Amount"]],
    body: expenses.map((e) => [formatDate(e.date), e.description, e.category, formatCurrency(e.amount)]),
    margin: { left: margin, right: margin },
    headStyles: { fillColor: BRAND_INDIGO, textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 9, cellPadding: 6, textColor: SLATE_900 },
    columnStyles: { 3: { halign: "right" } },
    didDrawPage: () => {
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(...SLATE_500);
      doc.text(`Page ${pageCount}`, pageWidth - margin - 30, doc.internal.pageSize.getHeight() - 20);
    },
  });

  return doc.output("blob");
}
