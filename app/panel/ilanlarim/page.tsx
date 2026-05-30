"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Package, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/hooks/useAuth";
import { useEquipment } from "@/hooks/useEquipment";
import { CATEGORY_LABELS, formatPrice } from "@/lib/utils";
import type { Equipment } from "@/types";
import toast from "react-hot-toast";

export default function IlanlarimPage() {
  const { user } = useAuth();
  const { getOwnerEquipment, updateEquipment, deleteEquipment, loading } = useEquipment();
  const [equipment, setEquipment] = useState<Equipment[]>([]);

  useEffect(() => {
    if (!user) return;
    getOwnerEquipment(user.id).then(({ data }) => setEquipment(data || []));
  }, [user]);

  const handleToggle = async (eq: Equipment) => {
    await updateEquipment(eq.id, { is_available: !eq.is_available });
    setEquipment((prev) => prev.map((e) => e.id === eq.id ? { ...e, is_available: !e.is_available } : e));
    toast.success(eq.is_available ? "İlan pasife alındı" : "İlan aktif edildi");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu ilanı silmek istediğinize emin misiniz?")) return;
    const { error } = await deleteEquipment(id);
    if (!error) {
      setEquipment((prev) => prev.filter((e) => e.id !== id));
      toast.success("İlan silindi");
    } else {
      toast.error("İlan silinemedi");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-playfair text-2xl font-bold text-dark">İlanlarım</h1>
        <Link href="/panel/ilan-ekle">
          <Button size="sm">
            <Plus className="w-4 h-4" /> Yeni İlan
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-stone">Yükleniyor...</div>
      ) : equipment.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-cream-dark">
          <Package className="w-12 h-12 text-stone/30 mx-auto mb-3" />
          <p className="font-semibold text-dark mb-1">Henüz ilanın yok</p>
          <p className="text-stone text-sm mb-4">İlk ilanını ekle!</p>
          <Link href="/panel/ilan-ekle">
            <Button size="sm">
              <Plus className="w-4 h-4" /> İlan Ekle
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {equipment.map((eq) => (
            <div key={eq.id} className="bg-white rounded-2xl border border-cream-dark p-5">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-cream-dark flex-shrink-0">
                  {eq.images?.[0] ? (
                    <img src={eq.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🎒</div>
                  )}
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggle(eq)}
                        className="p-2 rounded-lg hover:bg-cream-dark transition-colors text-stone hover:text-forest"
                        title={eq.is_available ? "Pasife Al" : "Aktif Et"}
                      >
                        {eq.is_available ? <ToggleRight className="w-5 h-5 text-forest" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                      <Link href={`/panel/ilan-duzenle/${eq.id}`}>
                        <button className="p-2 rounded-lg hover:bg-cream-dark transition-colors text-stone hover:text-forest">
                          <Pencil className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(eq.id)}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors text-stone hover:text-red-500"
                      >
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
