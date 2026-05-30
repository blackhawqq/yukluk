"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, X, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useRentals } from "@/hooks/useRentals";
import { formatPrice, formatDate, RENTAL_STATUS_LABELS, RENTAL_STATUS_COLORS } from "@/lib/utils";
import type { RentalWithDetails } from "@/types";
import type { RentalStatus } from "@/lib/supabase/types";
import { ShoppingBag } from "lucide-react";

type TabType = "active" | "pending" | "completed" | "cancelled";

const tabs: { key: TabType; label: string; statuses: RentalStatus[] }[] = [
  { key: "pending", label: "Bekleyen", statuses: ["pending"] },
  { key: "active", label: "Aktif", statuses: ["confirmed", "active"] },
  { key: "completed", label: "Tamamlanan", statuses: ["completed"] },
  { key: "cancelled", label: "İptal", statuses: ["cancelled", "disputed"] },
];

export default function KiralamalarimPage() {
  const { user } = useAuth();
  const { getMyRentals, updateRentalStatus, loading } = useRentals();
  const [rentals, setRentals] = useState<RentalWithDetails[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("pending");

  useEffect(() => {
    if (!user) return;
    getMyRentals(user.id, "renter").then(({ data }) => {
      setRentals(data || []);
    });
  }, [user]);

  const filteredRentals = rentals.filter((r) =>
    tabs.find((t) => t.key === activeTab)?.statuses.includes(r.status)
  );

  const handleCancel = async (id: string) => {
    if (!confirm("Kiralamayı iptal etmek istediğinize emin misiniz?")) return;
    await updateRentalStatus(id, "cancelled");
    setRentals((prev) => prev.map((r) => r.id === id ? { ...r, status: "cancelled" } : r));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="font-playfair text-2xl font-bold text-dark mb-6">Kiralamalarım</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-cream-dark rounded-xl p-1 mb-6 overflow-x-auto">
        {tabs.map((tab) => {
          const count = rentals.filter((r) => tab.statuses.includes(r.status)).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key ? "bg-white text-dark shadow-sm" : "text-stone hover:text-dark"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key ? "bg-forest text-cream" : "bg-cream text-stone"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-20 text-stone">Yükleniyor...</div>
      ) : filteredRentals.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-cream-dark">
          <ShoppingBag className="w-12 h-12 text-stone/30 mx-auto mb-3" />
          <p className="font-semibold text-dark mb-1">Bu kategoride kiralaman yok</p>
          <p className="text-stone text-sm mb-4">Hemen ekipman keşfet!</p>
          <Link href="/ekipmanlar">
            <Button size="sm">Ekipman Bul</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRentals.map((rental) => (
            <div key={rental.id} className="bg-white rounded-2xl border border-cream-dark p-5">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-cream-dark flex-shrink-0">
                  {rental.equipment?.images?.[0] ? (
                    <img src={rental.equipment.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🎒</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-playfair font-bold text-dark truncate">{rental.equipment?.title}</h3>
                      <p className="text-stone text-sm mt-0.5">
                        {formatDate(rental.start_date)} → {formatDate(rental.end_date)} · {rental.total_days} gün
                      </p>
                    </div>
                    <span className={`flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${RENTAL_STATUS_COLORS[rental.status]}`}>
                      {RENTAL_STATUS_LABELS[rental.status]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="font-bold text-dark">{formatPrice(rental.rental_amount)}</p>
                    <div className="flex gap-2">
                      {(rental.status === "confirmed" || rental.status === "active") && (
                        <Link href={`/panel/mesajlar?rental=${rental.id}`}>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-3.5 h-3.5" /> Mesaj
                          </Button>
                        </Link>
                      )}
                      {rental.status === "pending" && (
                        <Button size="sm" variant="danger" onClick={() => handleCancel(rental.id)}>
                          <X className="w-3.5 h-3.5" /> İptal
                        </Button>
                      )}
                      {rental.status === "completed" && (
                        <Button size="sm" variant="outline">
                          <Star className="w-3.5 h-3.5" /> Değerlendir
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
