"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Package, ToggleLeft, ToggleRight, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CATEGORY_LABELS, formatPrice, REVENUE } from "@/lib/utils";
import type { Equipment } from "@/types";
import toast from "react-hot-toast";

interface EquipmentWithFeatured extends Equipment {
  is_featured?: boolean;
  featured_until?: string;
}

export default function IlanlarimPage() {
  const [equipment, setEquipment] = useState<EquipmentWithFeatured[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuringId, setFeaturingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/equipment/my")
      .then(r => r.json())
      .then(({ equipment }) => { setEquipment(equipment || []); setLoading(false); });
  }, []);

  const handleToggle = async (eq: EquipmentWithFeatured) => {
    const res = await fetch("/api/equipment/my", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ equipmentId: eq.id, is_available: !eq.is_available }),
    });
    if (res.ok) {
      setEquipment(prev => prev.map(e => e.id === eq.id ? { ...e, is_available: !e.is_available } : e));
      toast.success(eq.is_available ? "İlan pasife alındı" : "İlan aktif edildi");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu ilanı silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/equipment/my?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setEquipment(prev => prev.filter(e => e.id !== id));
      toast.success("İlan silindi");
    }
  };

  const handleFeature = async (eq: EquipmentWithFeatured) => {
    setFeaturingId(eq.id);
    const res = await fetch("/api/monetization/featured", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ equipmentId: eq.id, weeks: 1 }),
    });
    const data = await res.json();
    setFeaturingId(null);
    if (res.ok) {
      setEquipment(prev => prev.map(e => e.id === eq.id ? { ...e, is_featured: true, featured_until: data.featuredUntil } : e));
      toast.success(`✨ İlan öne çıkarıldı! ${data.cost} TL IBAN'a gönder: ${process.env.NEXT_PUBLIC_ADMIN_IBAN || "Profil sayfasında görebilirsiniz"}`);
    } else {
      toast.error("Öne çıkarılamadı.");
    }
  };

  const isFeaturedActive = (eq: EquipmentWithFeatured) => {
    if (!eq.is_featured || !eq.featured_until) return false;
    return new Date(eq.featured_until) > new Date();
  };

  const featuredUntilText = (eq: EquipmentWithFeatured) => {
    if (!eq.featured_until) return "";
    const d = new Date(eq.featured_until);
    return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-playfair text-2xl font-bold text-dark">İlanlarım</h1>
        <Link href="/panel/ilan-ekle">
          <Button size="sm"><Plus className="w-4 h-4" /> Yeni İlan</Button>
        </Link>
      </div>

      {/* Pro üyelik banner */}
      <div className="bg-gradient-to-r from-forest to-forest-light rounded-2xl p-5 mb-6 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-orange" />
            <span className="font-bold text-cream">Pro Hesap</span>
            <span className="bg-orange text-white text-xs px-2 py-0.5 rounded-full">{REVENUE.PRO_PRICE_MONTHLY} TL/ay</span>
          </div>
          <p className="text-cream/70 text-xs">Sınırsız ilan + otomatik öne çıkar + Pro rozeti + öncelikli destek</p>
        </div>
        <Button size="sm" variant="primary" onClick={async () => {
          const res = await fetch("/api/monetization/pro", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ months: 1 }) });
          const data = await res.json();
          if (res.ok) toast.success(`Pro hesap aktif! ${data.cost} TL IBAN'a gönder.`);
        }}>
          Pro Ol
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-stone">Yükleniyor...</div>
      ) : equipment.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-cream-dark">
          <Package className="w-12 h-12 text-stone/30 mx-auto mb-3" />
          <p className="font-semibold text-dark mb-1">Henüz ilanın yok</p>
          <p className="text-stone text-sm mb-4">İlk ilanını ekle!</p>
          <Link href="/panel/ilan-ekle"><Button size="sm"><Plus className="w-4 h-4" /> İlan Ekle</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {equipment.map(eq => (
            <div key={eq.id} className={`bg-white rounded-2xl border p-5 transition-all ${isFeaturedActive(eq) ? "border-orange shadow-sm shadow-orange/20" : "border-cream-dark"}`}>
              {isFeaturedActive(eq) && (
                <div className="flex items-center gap-1.5 mb-3 text-orange text-xs font-medium">
                  <Zap className="w-3.5 h-3.5 fill-orange" />
                  Öne Çıkan — {featuredUntilText(eq)}'e kadar
                </div>
              )}
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-cream-dark flex-shrink-0">
                  {eq.images?.[0] ? (
                    <img src={eq.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : <div className="w-full h-full flex items-center justify-center text-3xl">🎒</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0">
                      <h3 className="font-playfair font-bold text-dark truncate">{eq.title}</h3>
                      <p className="text-stone text-xs uppercase tracking-wider">{CATEGORY_LABELS[eq.category]}</p>
                    </div>
                    <Badge variant={eq.is_available ? "green" : "gray"}>
                      {eq.is_available ? "Aktif" : "Pasif"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <p className="font-bold text-dark">{formatPrice(eq.daily_price)}<span className="text-stone text-xs font-normal ml-1">/gün</span></p>
                      <p className="text-stone text-xs">{eq.total_rentals} kiralama</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {!isFeaturedActive(eq) && (
                        <button
                          onClick={() => handleFeature(eq)}
                          disabled={featuringId === eq.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-orange text-orange text-xs font-medium hover:bg-orange hover:text-white transition-all disabled:opacity-50"
                          title={`Öne Çıkar — ${REVENUE.FEATURED_PRICE_WEEKLY} TL/hafta`}
                        >
                          <Zap className="w-3 h-3" /> Öne Çıkar
                        </button>
                      )}
                      <button onClick={() => handleToggle(eq)} className="p-2 rounded-lg hover:bg-cream-dark transition-colors text-stone hover:text-forest">
                        {eq.is_available ? <ToggleRight className="w-5 h-5 text-forest" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                      <Link href={`/panel/ilan-duzenle/${eq.id}`}>
                        <button className="p-2 rounded-lg hover:bg-cream-dark transition-colors text-stone hover:text-forest">
                          <Pencil className="w-4 h-4" />
                        </button>
                      </Link>
                      <button onClick={() => handleDelete(eq.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors text-stone hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
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
