"use client";

import { Rocket, Clock, Share2, History, type LucideIcon } from "lucide-react";
import { StudioTab } from "@/hooks/useCloudExport";

interface NavItem {
  id: StudioTab;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { id: "export", label: "New Export", icon: Rocket },
  { id: "schedule", label: "Automations", icon: Clock },
  { id: "share", label: "Share", icon: Share2 },
  { id: "history", label: "History", icon: History },
];

interface StudioSidebarProps {
  active: StudioTab;
  onChange: (tab: StudioTab) => void;
  badges: Partial<Record<StudioTab, number>>;
}

export default function StudioSidebar({ active, onChange, badges }: StudioSidebarProps) {
  return (
    <nav className="flex shrink-0 flex-row gap-1 border-b border-slate-100 p-2 sm:w-52 sm:flex-col sm:border-b-0 sm:border-r sm:p-3">
      {NAV_ITEMS.map((item) => {
        const isActive = item.id === active;
        const badge = badges[item.id];
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition sm:flex-none ${
              isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">{item.label}</span>
            {badge ? (
              <span className="ml-auto hidden rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 sm:inline">
                {badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
