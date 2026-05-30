"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Star, MapPin, Package } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { EquipmentCard } from "@/components/equipment/EquipmentCard";
import { StarRating } from "@/components/ui/StarRating";
import { PageSpinner } from "@/components/ui/Spinner";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import type { Profile, Equipment, ReviewWithReviewer } from "@/types";
import { MessageCircle } from "lucide-react";

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "905000000000";

export default function PublicProfilPage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [reviews, setReviews] = useState<ReviewWithReviewer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const [{ data: p }, { data: eq }, { data: rv }] = await Promise.all([
        (supabase.from("profiles") as any).select("*").eq("id", id).single(),
        (supabase.from("equipment") as any).select("*").eq("owner_id", id).eq("is_available", true).order("created_at", { ascending: false }),
        (supabase.from("reviews") as any).select("*, reviewer:profiles!reviewer_id(*)").eq("reviewed_id", id).order("created_at", { ascending: false }).limit(10),
      ]);
      setProfile(p as Profile | null);
      setEquipment(eq as Equipment[] || []);
      setReviews(rv as ReviewWithReviewer[] || []);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <><Header /><PageSpinner /><Footer /></>;
  if (!profile) return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-stone">Kullanıcı bulunamadı.</p>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream py-10 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Profile header */}
          <div className="bg-white rounded-2xl border border-cream-dark p-8 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-20 h-20 bg-forest rounded-full flex items-center justify-center text-cream text-3xl font-bold overflow-hidden flex-shrink-0">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  profile.full_name?.charAt(0)?.toUpperCase() || "U"
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="font-playfair text-2xl font-bold text-dark">{profile.full_name}</h1>
                  {profile.is_verified && (
                    <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Doğrulanmış
                    </div>
                  )}
                </div>
                {profile.rating > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <StarRating rating={profile.rating} showValue count={profile.rating_count} />
                  </div>
                )}
                <div className="flex items-center gap-4 mt-2 text-stone text-sm">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> İstanbul
                  </span>
                  <span>Üye: {formatDate(profile.created_at)}</span>
                  <span>{profile.total_rentals} kiralama</span>
                </div>
                {profile.bio && (
                  <p className="text-dark/80 text-sm mt-3 leading-relaxed max-w-md">{profile.bio}</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Equipment */}
            <div className="lg:col-span-2">
              <h2 className="font-playfair text-xl font-bold text-dark mb-4">
                Aktif İlanlar {equipment.length > 0 && `(${equipment.length})`}
              </h2>
              {equipment.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-cream-dark">
                  <Package className="w-10 h-10 text-stone/30 mx-auto mb-2" />
                  <p className="text-stone text-sm">Aktif ilan yok</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {equipment.map((eq) => (
                    <EquipmentCard key={eq.id} equipment={eq as never} />
                  ))}
                </div>
              )}
            </div>

            {/* Reviews */}
            <div>
              <h2 className="font-playfair text-xl font-bold text-dark mb-4">
                Değerlendirmeler {reviews.length > 0 && `(${reviews.length})`}
              </h2>
              <div className="space-y-3">
                {reviews.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-2xl border border-cream-dark">
                    <Star className="w-8 h-8 text-stone/30 mx-auto mb-2" />
                    <p className="text-stone text-sm">Henüz değerlendirme yok</p>
                  </div>
                ) : (
                  reviews.map((rv) => (
                    <div key={rv.id} className="bg-white rounded-xl border border-cream-dark p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 bg-forest rounded-full flex items-center justify-center text-cream text-xs font-bold">
                          {rv.reviewer?.full_name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-medium text-dark text-xs">{rv.reviewer?.full_name}</p>
                          <p className="text-stone text-xs">{formatDate(rv.created_at)}</p>
                        </div>
                      </div>
                      <StarRating rating={rv.rating} size="sm" />
                      {rv.comment && (
                        <p className="text-dark/80 text-xs mt-2 leading-relaxed">{rv.comment}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <a
        href={`https://wa.me/${whatsappNumber}?text=Merhaba, Yüklük hakkında bilgi almak istiyorum.`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-lg transition-all hover:scale-105"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:inline">Destek</span>
      </a>

      <Footer />
    </>
  );
}
