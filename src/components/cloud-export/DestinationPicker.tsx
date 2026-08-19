"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { EXPORT_DESTINATIONS } from "@/lib/cloud-export/destinationMeta";
import { DestinationId, IntegrationConnection } from "@/lib/cloud-export/types";

interface DestinationPickerProps {
  value: DestinationId;
  onChange: (id: DestinationId) => void;
  connections: Record<DestinationId, IntegrationConnection>;
  connectingId: DestinationId | null;
  onConnect: (id: DestinationId) => void;
  emailRecipient: string;
  onEmailRecipientChange: (value: string) => void;
}

export default function DestinationPicker({
  value,
  onChange,
  connections,
  connectingId,
  onConnect,
  emailRecipient,
  onEmailRecipientChange,
}: DestinationPickerProps) {
  return (
    <div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {EXPORT_DESTINATIONS.map((dest) => {
          const active = dest.id === value;
          const connection = connections[dest.id];
          const isConnecting = connectingId === dest.id;
          const isConnected = connection?.status === "connected";

          return (
            <div
              key={dest.id}
              onClick={() => onChange(dest.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onChange(dest.id)}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                active ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${dest.accentClass}`}>
                <dest.icon className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold ${active ? "text-indigo-700" : "text-slate-800"}`}>{dest.name}</p>
                <p className="truncate text-[11px] text-slate-500">{dest.description}</p>
              </div>
              {dest.requiresConnection ? (
                isConnected ? (
                  <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Connected
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onConnect(dest.id);
                    }}
                    disabled={isConnecting}
                    className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    {isConnecting ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Connecting
                      </span>
                    ) : (
                      "Connect"
                    )}
                  </button>
                )
              ) : null}
            </div>
          );
        })}
      </div>

      {value === "email" && (
        <div className="mt-3">
          <label htmlFor="email-recipient" className="mb-1 block text-xs font-medium text-slate-500">
            Send to
          </label>
          <input
            id="email-recipient"
            type="email"
            value={emailRecipient}
            onChange={(e) => onEmailRecipientChange(e.target.value)}
            placeholder="name@example.com"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
      )}
    </div>
  );
}
