import { ScheduleFrequency } from "./types";

export function computeNextRun(frequency: ScheduleFrequency, from: Date = new Date()): string {
  const next = new Date(from);
  if (frequency === "weekly") {
    next.setDate(next.getDate() + 7);
  } else {
    next.setMonth(next.getMonth() + 1);
  }
  return next.toISOString();
}

export function formatFrequency(frequency: ScheduleFrequency): string {
  return frequency === "weekly" ? "Every week" : "Every month";
}
