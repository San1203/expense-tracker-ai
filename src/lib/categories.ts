import {
  UtensilsCrossed,
  Car,
  Clapperboard,
  ShoppingBag,
  Receipt,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import { Category } from "./types";

export const CATEGORIES: Category[] = [
  "Food",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Bills",
  "Other",
];

interface CategoryMeta {
  icon: LucideIcon;
  color: string; // hex, used for chart fills
  badgeClass: string;
  dotClass: string;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  Food: {
    icon: UtensilsCrossed,
    color: "#f59e0b",
    badgeClass: "bg-amber-50 text-amber-700 ring-amber-600/20",
    dotClass: "bg-amber-500",
  },
  Transportation: {
    icon: Car,
    color: "#3b82f6",
    badgeClass: "bg-blue-50 text-blue-700 ring-blue-600/20",
    dotClass: "bg-blue-500",
  },
  Entertainment: {
    icon: Clapperboard,
    color: "#a855f7",
    badgeClass: "bg-purple-50 text-purple-700 ring-purple-600/20",
    dotClass: "bg-purple-500",
  },
  Shopping: {
    icon: ShoppingBag,
    color: "#ec4899",
    badgeClass: "bg-pink-50 text-pink-700 ring-pink-600/20",
    dotClass: "bg-pink-500",
  },
  Bills: {
    icon: Receipt,
    color: "#ef4444",
    badgeClass: "bg-red-50 text-red-700 ring-red-600/20",
    dotClass: "bg-red-500",
  },
  Other: {
    icon: MoreHorizontal,
    color: "#64748b",
    badgeClass: "bg-slate-100 text-slate-700 ring-slate-600/20",
    dotClass: "bg-slate-500",
  },
};
