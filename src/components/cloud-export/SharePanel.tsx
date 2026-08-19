"use client";

import { useState } from "react";
import { Check, Copy, Link2, QrCode, Share2, Trash2 } from "lucide-react";
import { EXPORT_TEMPLATES, templateMeta } from "@/lib/cloud-export/templateMeta";
import { buildShareUrl, generateQrCodeDataUrl } from "@/lib/cloud-export/shareLink";
import { formatShortDate } from "@/lib/cloud-export/format";
import { TemplateId } from "@/lib/cloud-export/types";
import { UseCloudExportReturn } from "@/hooks/useCloudExport";

type SharePanelProps = Pick<UseCloudExportReturn, "shareLinks" | "generateShareLink" | "revokeShareLink">;

const EXPIRY_OPTIONS: { label: string; days: number | null }[] = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "Never", days: null },
];

export default function SharePanel({ shareLinks, generateShareLink, revokeShareLink }: SharePanelProps) {
  const [templateId, setTemplateId] = useState<TemplateId>("category-analysis");
  const [expiryDays, setExpiryDays] = useState<number | null>(7);
  const [qrByLinkId, setQrByLinkId] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleGenerate() {
    const { link } = generateShareLink(templateId, expiryDays);
    const dataUrl = await generateQrCodeDataUrl(buildShareUrl(link.token));
    setQrByLinkId((prev) => ({ ...prev, [link.id]: dataUrl }));
  }

  async function handleToggleQr(linkId: string, token: string) {
    if (qrByLinkId[linkId]) {
      setQrByLinkId((prev) => {
        const next = { ...prev };
        delete next[linkId];
        return next;
      });
      return;
    }
    const dataUrl = await generateQrCodeDataUrl(buildShareUrl(token));
    setQrByLinkId((prev) => ({ ...prev, [linkId]: dataUrl }));
  }

  async function handleCopy(id: string, url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1500);
    } catch {
      // clipboard unavailable — ignore
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2 rounded-lg bg-indigo-50 px-3 py-2.5 text-xs text-indigo-700">
        <Share2 className="mt-0.5 h-4 w-4 shrink-0" />
        <span>Simulated sharing — links are generated locally for demo purposes and aren&apos;t reachable from other devices.</span>
      </div>

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Create a share link</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value as TemplateId)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            {EXPORT_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            value={String(expiryDays)}
            onChange={(e) => setExpiryDays(e.target.value === "null" ? null : Number(e.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            {EXPIRY_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.days === null ? "null" : opt.days}>
                Expires: {opt.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleGenerate}
          className="mt-3 flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500"
        >
          <Link2 className="h-4 w-4" />
          Generate link
        </button>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Your links</h3>
        {shareLinks.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="space-y-2">
            {shareLinks.map((link) => {
              const url = buildShareUrl(link.token);
              const qr = qrByLinkId[link.id];
              return (
                <li key={link.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-700">{templateMeta(link.templateId).name}</p>
                      <code className="block truncate text-[11px] text-slate-500">{url}</code>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        Created {formatShortDate(link.createdAt)} &middot;{" "}
                        {link.expiresAt ? `Expires ${formatShortDate(link.expiresAt)}` : "Never expires"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(link.id, url)}
                      className="shrink-0 rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-50"
                      aria-label="Copy link"
                    >
                      {copiedId === link.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => handleToggleQr(link.id, link.token)}
                      className="shrink-0 rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-50"
                      aria-label="Toggle QR code"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => revokeShareLink(link.id)}
                      className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      aria-label="Revoke link"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {qr && (
                    <div className="mt-3 flex justify-center border-t border-slate-100 pt-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qr} alt={`QR code for ${url}`} className="h-32 w-32 rounded-lg border border-slate-100" />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-8 text-center">
      <Link2 className="mb-2 h-5 w-5 text-slate-400" />
      <p className="text-xs font-medium text-slate-500">No share links yet</p>
      <p className="text-[11px] text-slate-400">Generate one above to share a report view.</p>
    </div>
  );
}
