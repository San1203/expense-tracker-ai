export type TemplateId = "tax-report" | "monthly-summary" | "category-analysis" | "custom";

export type DestinationId = "download" | "email" | "google-sheets" | "dropbox" | "onedrive";

export type ConnectionStatus = "not_connected" | "connecting" | "connected";

export interface IntegrationConnection {
  id: DestinationId;
  status: ConnectionStatus;
  connectedAt: string | null;
}

export type ScheduleFrequency = "weekly" | "monthly";

export interface ScheduledExport {
  id: string;
  templateId: TemplateId;
  destinationId: DestinationId;
  frequency: ScheduleFrequency;
  createdAt: string;
  nextRunAt: string;
  active: boolean;
}

export type ExportStatus = "completed" | "failed";

export interface ExportHistoryEntry {
  id: string;
  templateId: TemplateId;
  destinationId: DestinationId;
  recordCount: number;
  createdAt: string;
  status: ExportStatus;
  detail: string;
}

export interface ShareLink {
  id: string;
  token: string;
  templateId: TemplateId;
  createdAt: string;
  expiresAt: string | null;
}

export interface CloudExportState {
  connections: Record<DestinationId, IntegrationConnection>;
  history: ExportHistoryEntry[];
  schedules: ScheduledExport[];
  shareLinks: ShareLink[];
}
