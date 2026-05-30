"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Star, MessageCircle, ChevronLeft, CheckCircle2,
  Calendar, Shield, ArrowRight, Package
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";
import { DateRangePicker } from "@/components/equipment/DateRangePicker";
import { PageSpinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { CATEGORY_LABELS, CONDITION_LABELS, formatPrice, formatDate, getDaysBetween, calculateRentalAmounts, getWhatsAppUrl } from "@/lib/utils";
import type { EquipmentWithOwner, Review, ReviewWithReviewer } from "@/types";
import { MessageCircle as WA } from "lucide-react";

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "905000000000";

export default function EkipmanDetayPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [equipment, setEquipment] = useState<EquipmentWithOwner | null>(null);
  const [reviews, setReviews] = useState<ReviewWithReviewer[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/equipment/${id}`);
      const { equipment: eq, reviews: rv, unavailableDates: dates } = await res.json();
      setEquipment(eq);
      setReviews(rv || []);
      setUnavailableDates(dates || []);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <><Header /><PageSpinner /><Footer /></>;
  if (!equipment) return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Package className="w-16 h-16 text-stone/30" />
        <p className="text-stone">Ekipman bulunamadı.</p>
        <Link href="/ekipmanlar"><Button>Tüm Ekipmanlar</Button></Link>
      </div>
      <Footer />
    </>
  );

  const totalDays = startDate && endDate ? getDaysBetween(startDate, endDate) : 0;
  const amounts = totalDays > 0
    ? calculateRentalAmounts(equipment.daily_price, totalDays, equipment.deposit_amount)
    : null;

  const handleReserve = async () => {
    const res = await fetch("/api/auth/session");
    const { authenticated } = await res.json();
    if (!authenticated) { router.push("/giris"); return; }
    if (!startDate || !endDate) return;
    router.push(`/rezervasyon/${equipment.id}?start=${startDate}&end=${endDate}`);
  };

  const images = equipment.images?.length > 0
    ? equipment.images
    : ["https://images.unsplash.com/photo-1622260614927-5b62b4c2f92f?w=800&q=80"];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream pb-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Link href="/ekipmanlar" className="inline-flex items-center gap-1 text-stone text-sm hover:text-forest transition-colors mb-6">
            <ChevronLeft className="w-4 h-4" /> Ekipmanlara Dön
          </Link>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* LEFT */}
            <div className="lg:col-span-7 space-y-6">
              {/* Gallery */}
              <div>
                <div
                  className="aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer bg-cream-dark"
                  onClick={() => setLightbox(true)}
                >
                  <img
                    src={images[activeImg]}
                    alt={equipment.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 mt-3">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                          i === activeImg ? "border-forest" : "border-transparent"
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="bg-white rounded-2xl p-6 border border-cream-dark">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="forest">{CATEGORY_LABELS[equipment.category]}</Badge>
                  <Badge variant="gray">{CONDITION_LABELS[equipment.condition]}</Badge>
                  {equipment.is_available ? (
                    <Badge variant="green">Müsait</Badge>
                  ) : (
                    <Badge variant="red">Müsait Değil</Badge>
                  )}
                </div>

                <h1 className="font-playfair text-2xl md:text-3xl font-bold text-dark mb-1">
                  {equipment.title}
                </h1>
                {equipment.brand && (
                  <p className="text-stone text-sm uppercase tracking-wider mb-3">{equipment.brand}</p>
                )}

                <div className="flex items-center gap-4 mb-4 flex-wrap">
                  {equipment.rating > 0 && (
                    <StarRating rating={equipment.rating} showValue count={equipment.rating_count} />
                  )}
                  <div className="flex items-center gap-1 text-stone text-sm">
                    <MapPin className="w-4 h-4" />
                    {equipment.location_district
                      ? `${equipment.location_district}, ${equipment.location_city}`
                      : equipment.location_city}
                  </div>
                </div>

                {equipment.description && (
                  <p className="text-dark/80 text-sm leading-relaxed">{equipment.description}</p>
                )}

                {/* Specs */}
                {equipment.specs && Object.keys(equipment.specs as object).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-cream-dark">
                    <h3 className="font-semibold text-dark text-sm mb-3">Özellikler</h3>
                    <dl className="grid grid-cols-2 gap-2">
                      {Object.entries(equipment.specs as Record<string, string>).map(([k, v]) => (
                        <div key={k} className="flex gap-2 text-sm">
                          <dt className="text-stone capitalize">{k}:</dt>
                          <dd className="font-medium text-dark">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </div>

              {/* Owner */}
              <div className="bg-white rounded-2xl p-6 border border-cream-dark">
                <h3 className="font-semibold text-dark mb-4">Kiraya Veren</h3>
                <div className="flex items-center justify-between">
                  <Link href={`/kullanici/${equipment.owner_id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-12 h-12 bg-forest rounded-full flex items-center justify-center text-cream font-bold text-lg">
                      {equipment.owner?.full_name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-dark">{equipment.owner?.full_name || "Kullanıcı"}</p>
                        {equipment.owner?.is_verified && (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      {equipment.owner?.rating > 0 && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-3 h-3 fill-orange text-orange" />
                          <span className="text-xs text-stone">
                            {equipment.owner.rating.toFixed(1)} ({equipment.owner.rating_count} yorum)
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <a
                    href={getWhatsAppUrl(equipment.owner?.phone || whatsappNumber, `Merhaba, ${equipment.title} hakkında sorum var.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      <MessageCircle className="w-4 h-4" /> Soru Sor
                    </Button>
                  </a>
                </div>
              </div>

              {/* Reviews */}
              <div className="bg-white rounded-2xl p-6 border border-cream-dark">
                <h3 className="font-semibold text-dark mb-4">
                  Değerlendirmeler {reviews.length > 0 && `(${reviews.length})`}
                </h3>
                {reviews.length === 0 ? (
                  <p className="text-stone text-sm">Henüz değerlendirme yok.</p>
                ) : (
                  <>
                    {/* Rating summary */}
                    <div className="flex items-center gap-6 mb-6 p-4 bg-cream rounded-xl">
                      <div className="text-center">
                        <p className="font-playfair text-4xl font-bold text-dark">
                          {equipment.rating.toFixed(1)}
                        </p>
                        <StarRating rating={equipment.rating} size="sm" />
                      </div>
                      <div className="flex-1 space-y-1">
                        {[5, 4, 3, 2, 1].map((r) => {
                          const count = reviews.filter((rv) => rv.rating === r).length;
                          const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                          return (
                            <div key={r} className="flex items-center gap-2 text-xs">
                              <span className="w-3 text-stone">{r}</span>
                              <Star className="w-3 h-3 fill-orange text-orange" />
                              <div className="flex-1 bg-cream-dark rounded-full h-1.5">
                                <div className="bg-orange h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="w-4 text-stone">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {reviews.map((rv) => (
                        <div key={rv.id} className="border-t border-cream-dark pt-4 first:border-0 first:pt-0">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 bg-forest rounded-full flex items-center justify-center text-cream text-sm font-bold flex-shrink-0">
                              {rv.reviewer?.full_name?.charAt(0) || "U"}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-medium text-dark text-sm">{rv.reviewer?.full_name}</p>
                                <span className="text-stone text-xs">{formatDate(rv.created_at)}</span>
                              </div>
                              <StarRating rating={rv.rating} size="sm" />
                              {rv.comment && (
                                <p className="text-dark/80 text-sm mt-2 leading-relaxed">{rv.comment}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* RIGHT - Booking box */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 space-y-4">
                <div className="bg-white rounded-2xl p-6 border border-cream-dark shadow-sm">
                  <div className="flex items-end gap-2 mb-5">
                    <span className="font-playfair font-bold text-3xl text-dark">
                      {formatPrice(equipment.daily_price)}
                    </span>
                    <span className="text-stone text-sm mb-1">/gün</span>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-dark mb-2">
                      <Calendar className="w-4 h-4 text-forest" />
                      Tarih Seç
                    </div>
                    <DateRangePicker
                      startDate={startDate}
                      endDate={endDate}
                      unavailableDates={unavailableDates}
                      onSelect={(s, e) => { setStartDate(s); setEndDate(e); }}
                    />
                  </div>

                  {amounts && (
                    <div className="bg-cream rounded-xl p-4 mb-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-stone">{formatPrice(equipment.daily_price)} × {totalDays} gün</span>
                        <span className="font-medium text-dark">{formatPrice(amounts.rentalAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-stone">Depozito (iade edilir)</span>
                        <span className="font-medium text-dark">{formatPrice(equipment.deposit_amount)}</span>
                      </div>
                      <hr className="border-cream-dark" />
                      <div className="flex justify-between">
                        <span className="font-semibold text-dark">Toplam</span>
                        <span className="font-bold text-lg text-dark">
                          {formatPrice(amounts.rentalAmount + equipment.deposit_amount)}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    fullWidth
                    size="lg"
                    onClick={handleReserve}
                    disabled={!startDate || !endDate || !equipment.is_available}
                  >
                    {!equipment.is_available
                      ? "Müsait Değil"
                      : !startDate || !endDate
                      ? "Tarih Seç"
                      : "Rezervasyon Yap"}
                    {startDate && endDate && equipment.is_available && <ArrowRight className="w-4 h-4" />}
                  </Button>

                  <div className="flex items-center justify-center gap-4 mt-3">
                    {[
                      { icon: Shield, label: "Güvenli Ödeme" },
                      { icon: CheckCircle2, label: "3D Secure" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-1 text-stone text-xs">
                        <item.icon className="w-3.5 h-3.5 text-forest" />
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sticky bar */}
        <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-cream-dark p-4 flex items-center justify-between gap-3 z-30">
          <div>
            <span className="font-bold text-dark">{formatPrice(equipment.daily_price)}</span>
            <span className="text-stone text-xs">/gün</span>
          </div>
          <Button onClick={handleReserve} disabled={!startDate || !endDate || !equipment.is_available}>
            {!startDate || !endDate ? "Tarih Seç" : "Kirala"} <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Lightbox */}
        {lightbox && (
          <div className="fixed inset-0 z-50 bg-dark/90 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
            <img src={images[activeImg]} alt="" className="max-w-full max-h-full object-contain rounded-xl" />
          </div>
        )}
      </main>

      {/* WhatsApp sticky */}
      <a
        href={`https://wa.me/${whatsappNumber}?text=Merhaba, ${encodeURIComponent(equipment.title)} hakkında sorum var.`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-6 z-50 lg:bottom-6 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-lg transition-all hover:scale-105"
      >
        <WA className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:inline">Destek</span>
      </a>

      <Footer />
    </>
  );
}
