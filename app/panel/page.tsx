"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ShoppingBag, TrendingUp, Star, Plus, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { formatPrice, formatDate, RENTAL_STATUS_LABELS, RENTAL_STATUS_COLORS } from "@/lib/utils";
import type { RentalWithDetails } from "@/types";

export default function PanelPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ activeRentals: 0, pendingRequests: 0, totalEarnings: 0, avgRating: 0 });
  const [recentRentals, setRecentRentals] = useState<RentalWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/rentals/my?type=renter").then(r => r.json()),
      fetch("/api/rentals/my?type=owner").then(r => r.json()),
    ]).then(([renterData, ownerData]) => {
      const ownerRentals: RentalWithDetails[] = ownerData.rentals || [];
      const totalEarnings = ownerRentals.filter(r => r.status === "completed").reduce((s, r) => s + (r.owner_payout || 0), 0);
      setStats({
        activeRentals: ownerRentals.filter(r => r.status === "active").length,
        pendingRequests: ownerRentals.filter(r => r.status === "pending").length,
        totalEarnings,
        avgRating: 0,
      });
      setRecentRentals((renterData.rentals || []).slice(0, 3));
      setLoading(false);
    });
  }, []);

  const statCards = [
    { label: "Aktif Kiralama", value: stats.activeRentals, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Bekleyen Talep", value: stats.pendingRequests, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Toplam Kazanç", value: formatPrice(stats.totalEarnings), icon: TrendingUp, color: "text-green-600", bg: "bg-green-50", isText: true },
    { label: "Ortalama Puan", value: profile?.rating && profile.rating > 0 ? `${profile.rating.toFixed(1)} ★` : "—", icon: Star, color: "text-orange", bg: "bg-orange/10", isText: true },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-playfair text-2xl font-bold text-dark">
          Merhaba, {profile?.full_name?.split(" ")[0] || "Kullanıcı"} 👋
        </h1>
        <p className="text-stone text-sm mt-1">Hesabına genel bakış</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl p-5 border border-cream-dark">
            <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="font-bold text-xl text-dark">{card.value}</p>
            <p className="text-stone text-xs mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-cream-dark p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-dark">Son Kiralamalarım</h2>
            <Link href="/panel/kiralamalarim" className="text-forest text-xs hover:underline">Tümünü gör</Link>
          </div>
          {loading ? (
            <div className="text-center py-8 text-stone text-sm">Yükleniyor...</div>
          ) : recentRentals.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="w-10 h-10 text-stone/30 mx-auto mb-2" />
              <p className="text-stone text-sm">Henüz kiralaman yok.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRentals.map(rental => (
                <div key={rental.id} className="flex items-center gap-3 p-3 bg-cream rounded-xl">
                  <div className="w-12 h-12 bg-cream-dark rounded-xl overflow-hidden flex-shrink-0">
                    {rental.equipment?.images?.[0] ? (
                      <img src={rental.equipment.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : <div className="w-full h-full flex items-center justify-center text-lg">🎒</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-dark text-sm truncate">{rental.equipment?.title}</p>
                    <p className="text-stone text-xs">{formatDate(rental.start_date)} → {formatDate(rental.end_date)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${RENTAL_STATUS_COLORS[rental.status]}`}>
                      {RENTAL_STATUS_LABELS[rental.status]}
                    </span>
                    <p className="text-dark font-semibold text-sm mt-1">{formatPrice(rental.rental_amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-forest rounded-2xl p-5 text-cream">
            <Package className="w-8 h-8 text-orange mb-3" />
            <h3 className="font-playfair font-bold text-lg mb-1">Yeni İlan Ekle</h3>
            <p className="text-cream/70 text-xs mb-4 leading-relaxed">Ekipmanını kiraya ver, pasif gelir elde et.</p>
            <Link href="/panel/ilan-ekle">
              <Button size="sm" variant="primary"><Plus className="w-4 h-4" /> İlan Ekle</Button>
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-cream-dark p-5">
            <h3 className="font-semibold text-dark mb-3">Hızlı Erişim</h3>
            <div className="space-y-2">
              {[
                { href: "/panel/ilanlarim", label: "İlanlarım", icon: Package },
                { href: "/panel/kiralamalarim", label: "Kiralamalarım", icon: ShoppingBag },
                { href: "/panel/mesajlar", label: "Mesajlar", icon: ArrowRight },
              ].map(item => (
                <Link key={item.href} href={item.href} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-cream transition-colors group">
                  <item.icon className="w-4 h-4 text-stone group-hover:text-forest transition-colors" />
                  <span className="text-sm text-dark group-hover:text-forest transition-colors">{item.label}</span>
                  <ArrowRight className="w-3 h-3 text-stone ml-auto" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
