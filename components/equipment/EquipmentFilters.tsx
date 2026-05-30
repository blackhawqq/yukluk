"use client";

import { CATEGORY_LABELS, CONDITION_LABELS } from "@/lib/utils";
import type { EquipmentFilters } from "@/types";
import type { EquipmentCategory, EquipmentCondition } from "@/lib/supabase/types";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface EquipmentFiltersProps {
  filters: EquipmentFilters;
  onChange: (filters: EquipmentFilters) => void;
}

const categories = Object.entries(CATEGORY_LABELS) as [EquipmentCategory, string][];
const conditions = Object.entries(CONDITION_LABELS) as [EquipmentCondition, string][];

export function EquipmentFilters({ filters, onChange }: EquipmentFiltersProps) {
  const update = (partial: Partial<EquipmentFilters>) => onChange({ ...filters, ...partial, page: 1 });

  const clearAll = () => onChange({ page: 1 });

  const hasFilters = filters.category || filters.condition || filters.minRating || filters.onlyAvailable;

  return (
    <div className="bg-white rounded-2xl border border-cream-dark p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-dark text-sm">Filtreler</h3>
        {hasFilters && (
          <button onClick={clearAll} className="flex items-center gap-1 text-xs text-stone hover:text-red-500 transition-colors">
            <X className="w-3 h-3" /> Temizle
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <p className="text-xs font-semibold text-stone uppercase tracking-wider mb-3">Kategori</p>
        <div className="space-y-2">
          {categories.map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.category === key}
                onChange={(e) => update({ category: e.target.checked ? key : "" })}
                className="w-4 h-4 accent-forest rounded"
              />
              <span className="text-sm text-dark group-hover:text-forest transition-colors">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-cream-dark" />

      {/* Price range */}
      <div>
        <p className="text-xs font-semibold text-stone uppercase tracking-wider mb-3">
          Fiyat Aralığı (TL/gün)
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ""}
            onChange={(e) => update({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full border border-cream-dark rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-forest"
            min={0}
          />
          <span className="text-stone text-xs">—</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ""}
            onChange={(e) => update({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full border border-cream-dark rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-forest"
            min={0}
          />
        </div>
      </div>

      <hr className="border-cream-dark" />

      {/* Condition */}
      <div>
        <p className="text-xs font-semibold text-stone uppercase tracking-wider mb-3">Durum</p>
        <div className="space-y-2">
          {conditions.map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.condition === key}
                onChange={(e) => update({ condition: e.target.checked ? key : "" })}
                className="w-4 h-4 accent-forest rounded"
              />
              <span className="text-sm text-dark group-hover:text-forest transition-colors">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-cream-dark" />

      {/* Min rating */}
      <div>
        <p className="text-xs font-semibold text-stone uppercase tracking-wider mb-3">Minimum Puan</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((r) => (
            <button
              key={r}
              onClick={() => update({ minRating: filters.minRating === r ? undefined : r })}
              className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                filters.minRating === r
                  ? "bg-orange text-white"
                  : "bg-cream-dark text-stone hover:bg-orange/20"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-cream-dark" />

      {/* Only available */}
      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-sm font-medium text-dark">Sadece Müsait</span>
        <div
          onClick={() => update({ onlyAvailable: !filters.onlyAvailable })}
          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
            filters.onlyAvailable ? "bg-forest" : "bg-cream-dark"
          }`}
        >
          <div
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              filters.onlyAvailable ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </div>
      </label>
    </div>
  );
}
