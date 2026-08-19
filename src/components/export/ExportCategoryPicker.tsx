"use client";

import { CATEGORIES, CATEGORY_META } from "@/lib/categories";
import { Category } from "@/lib/types";

interface ExportCategoryPickerProps {
  selected: Category[];
  onToggle: (category: Category) => void;
  onClear: () => void;
}

export default function ExportCategoryPicker({ selected, onToggle, onClear }: ExportCategoryPickerProps) {
  const allSelected = selected.length === 0;

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={onClear}
          aria-pressed={allSelected}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition ${
            allSelected
              ? "bg-slate-800 text-white ring-slate-800"
              : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
          }`}
        >
          All categories
        </button>
        {CATEGORIES.map((category) => {
          const meta = CATEGORY_META[category];
          const active = selected.includes(category);
          return (
            <button
              key={category}
              type="button"
              onClick={() => onToggle(category)}
              aria-pressed={active}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition ${
                active ? meta.badgeClass + " ring-2" : "bg-white text-slate-500 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
              {category}
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 text-[11px] text-slate-400">
        {allSelected ? "Every category will be included." : `${selected.length} of ${CATEGORIES.length} categories selected.`}
      </p>
    </div>
  );
}
