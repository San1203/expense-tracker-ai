import { Download, Mail, Table2, Cloud, HardDrive, type LucideIcon } from "lucide-react";
import { DestinationId } from "./types";

export interface DestinationMeta {
  id: DestinationId;
  name: string;
  description: string;
  icon: LucideIcon;
  requiresConnection: boolean;
  accentClass: string; // icon chip background/text
}

export const EXPORT_DESTINATIONS: DestinationMeta[] = [
  {
    id: "download",
    name: "Download",
    description: "Save a file to this device",
    icon: Download,
    requiresConnection: false,
    accentClass: "bg-slate-100 text-slate-600",
  },
  {
    id: "email",
    name: "Email",
    description: "Send a copy to an inbox",
    icon: Mail,
    requiresConnection: false,
    accentClass: "bg-sky-100 text-sky-600",
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    description: "Sync into a live spreadsheet",
    icon: Table2,
    requiresConnection: true,
    accentClass: "bg-emerald-100 text-emerald-600",
  },
  {
    id: "dropbox",
    name: "Dropbox",
    description: "Save to a connected Dropbox folder",
    icon: Cloud,
    requiresConnection: true,
    accentClass: "bg-blue-100 text-blue-600",
  },
  {
    id: "onedrive",
    name: "OneDrive",
    description: "Save to a connected OneDrive folder",
    icon: HardDrive,
    requiresConnection: true,
    accentClass: "bg-indigo-100 text-indigo-600",
  },
];

export function destinationMeta(id: DestinationId): DestinationMeta {
  const meta = EXPORT_DESTINATIONS.find((d) => d.id === id);
  if (!meta) throw new Error(`Unknown destination: ${id}`);
  return meta;
}
