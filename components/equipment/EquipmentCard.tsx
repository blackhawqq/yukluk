"use client";

import Link from "next/link";
import { MapPin, Heart, Star } from "lucide-react";
import { useState } from "react";
import { cn, CATEGORY_LABELS, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { EquipmentWithOwner } from "@/types";

interface EquipmentCardProps {
  equipment: EquipmentWithOwner;
  onFavorite?: () => void;
}

export function EquipmentCard({ equipment, onFavorite }: EquipmentCardProps) {
  const [imgError, setImgError] = useState(false);
  const mainImage = equipment.images?.[0];

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-cream-dark hover:shadow-lg hover:border-forest/20 transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-cream-dark overflow-hidden">
        {mainImage && !imgError ? (
          <img
            src={mainImage}
            alt={equipment.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone/30">
            <span className="text-5xl">🎒</span>
          </div>
        )}
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="forest" className="text-xs">
            {CATEGORY_LABELS[equipment.category]}
          </Badge>
        </div>
        {/* Favorite */}
        {onFavorite && (
          <button
            onClick={(e) => { e.preventDefault(); onFavorite(); }}
            className={cn(
              "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all",
              "bg-white/90 backdrop-blur-sm shadow-sm",
              "opacity-0 group-hover:opacity-100",
              equipment.is_favorited ? "opacity-100 text-red-500" : "text-stone hover:text-red-500"
            )}
          >
            <Heart className={cn("w-4 h-4", equipment.is_favorited && "fill-current")} />
          </button>
        )}
        {/* Unavailable overlay */}
        {!equipment.is_available && (
          <div className="absolute inset-0 bg-dark/50 flex items-center justify-center">
            <span className="bg-white/90 px-3 py-1 rounded-full text-xs font-medium text-dark">
              Müsait Değil
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {equipment.brand && (
          <p className="text-xs text-stone uppercase tracking-wider font-medium mb-1">
            {equipment.brand}
          </p>
        )}
        <h3 className="font-playfair font-bold text-dark text-base mb-2 line-clamp-2 leading-snug">
          {equipment.title}
        </h3>

        <div className="flex items-center gap-3 mb-3">
          {equipment.rating > 0 ? (
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-orange text-orange" />
              <span className="text-xs font-medium text-dark">{equipment.rating.toFixed(1)}</span>
              <span className="text-xs text-stone">({equipment.rating_count})</span>
            </div>
          ) : (
            <span className="text-xs text-stone">Henüz değerlendirme yok</span>
          )}
        </div>

        <div className="flex items-center gap-1 text-stone text-xs mb-4">
          <MapPin className="w-3 h-3" />
          <span>
            {equipment.location_district
              ? `${equipment.location_district}, ${equipment.location_city}`
              : equipment.location_city}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-lg text-dark">
              {formatPrice(equipment.daily_price)}
            </span>
            <span className="text-stone text-xs ml-1">/gün</span>
          </div>
          <Link href={`/ekipmanlar/${equipment.id}`}>
            <Button size="sm" variant="primary">
              Kirala
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
