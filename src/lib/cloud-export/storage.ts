import { DestinationId, ExportHistoryEntry, IntegrationConnection, ScheduledExport, ShareLink } from "./types";
import { EXPORT_DESTINATIONS } from "./destinationMeta";

const HISTORY_KEY = "expense-tracker:cloud-export:history:v1";
const SCHEDULES_KEY = "expense-tracker:cloud-export:schedules:v1";
const CONNECTIONS_KEY = "expense-tracker:cloud-export:connections:v1";
const SHARE_LINKS_KEY = "expense-tracker:cloud-export:share-links:v1";

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage unavailable — fail silently
  }
}

function defaultConnections(): Record<DestinationId, IntegrationConnection> {
  const entries = EXPORT_DESTINATIONS.map((d) => [d.id, { id: d.id, status: "not_connected", connectedAt: null }] as const);
  return Object.fromEntries(entries) as Record<DestinationId, IntegrationConnection>;
}

export function loadHistory(): ExportHistoryEntry[] {
  return loadJson(HISTORY_KEY, []);
}

export function saveHistory(history: ExportHistoryEntry[]): void {
  saveJson(HISTORY_KEY, history);
}

export function loadSchedules(): ScheduledExport[] {
  return loadJson(SCHEDULES_KEY, []);
}

export function saveSchedules(schedules: ScheduledExport[]): void {
  saveJson(SCHEDULES_KEY, schedules);
}

export function loadConnections(): Record<DestinationId, IntegrationConnection> {
  const stored = loadJson<Partial<Record<DestinationId, IntegrationConnection>>>(CONNECTIONS_KEY, {});
  return { ...defaultConnections(), ...stored };
}

export function saveConnections(connections: Record<DestinationId, IntegrationConnection>): void {
  saveJson(CONNECTIONS_KEY, connections);
}

export function loadShareLinks(): ShareLink[] {
  return loadJson(SHARE_LINKS_KEY, []);
}

export function saveShareLinks(links: ShareLink[]): void {
  saveJson(SHARE_LINKS_KEY, links);
}
