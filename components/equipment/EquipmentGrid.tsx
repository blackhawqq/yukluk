"use client";

import { EquipmentCard } from "./EquipmentCard";
import type { EquipmentWithOwner } from "@/types";
import { Package } from "lucide-react";

interface EquipmentGridProps {
  equipment: EquipmentWithOwner[];
  onFavorite?: (id: string) => void;
}

export function EquipmentGrid({ equipment, onFavorite }: EquipmentGridProps) {
  if (equipment.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Package className="w-16 h-16 text-stone/30 mb-4" />
        <h3 className="font-playfair text-xl font-bold text-dark mb-2">
          Ekipman bulunamadı
        </h3>
        <p className="text-stone text-sm max-w-xs">
          Arama kriterlerinizi değiştirerek tekrar deneyin.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {equipment.map((eq) => (
        <EquipmentCard
          key={eq.id}
          equipment={eq}
          onFavorite={onFavorite ? () => onFavorite(eq.id) : undefined}
        />
      ))}
    </div>
  );
}
