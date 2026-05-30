import Link from "next/link";
import {
  Shield, CheckCircle2, Sparkles, MessageCircle,
  ChevronRight, Star, ArrowRight, TrendingUp
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { createServerSupabase } from "@/lib/supabase/server";
import { EquipmentCard } from "@/components/equipment/EquipmentCard";
import type { EquipmentWithOwner } from "@/types";

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "905000000000";

const categories = [
  { key: "backpack", label: "Sırt Çantaları", emoji: "🎒", image: "https://images.unsplash.com/photo-1622260614927-5b62b4c2f92f?w=400&q=80" },
  { key: "tent", label: "Çadırlar", emoji: "⛺", image: "https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=400&q=80" },
  { key: "sleeping_bag", label: "Uyku Tulumları", emoji: "🛏️", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80" },
  { key: "trekking_pole", label: "Trekking", emoji: "🏔️", image: "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=400&q=80" },
  { key: "camp_stove", label: "Kamp Ocağı", emoji: "🔥", image: "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?w=400&q=80" },
  { key: "other", label: "Diğer", emoji: "🧭", image: "https://images.unsplash.com/photo-1502780402662-acc01c57beb3?w=400&q=80" },
];

const features = [
  { icon: Shield, title: "Depozito Güvencesi", desc: "Her kiralama için depozito bloke edilir. Hasar yoksa iade edilir." },
  { icon: CheckCircle2, title: "Doğrulanmış Kullanıcılar", desc: "Tüm üyeler kimlik doğrulama sürecinden geçer." },
  { icon: Sparkles, title: "Hijyen Sertifikası", desc: "Ekipmanlar kiralanamadan önce temizlik kontrolünden geçer." },
  { icon: MessageCircle, title: "WhatsApp Destek", desc: "7/24 WhatsApp destek hattı ile yanınızdayız." },
];

const testimonials = [
  { name: "Mert Yıldız", role: "Dağcı", text: "Osprey çantayı üç günlüğüne kiraladım. Harika durumdaydı, fiyat da çok uygundu. Kesinlikle tekrar kullanacağım!", rating: 5, avatar: "M" },
  { name: "Selin Kaya", role: "Kamp Meraklısı", text: "Ekipmanımı Yüklük'te listeledim ve ilk haftada 3 kiralama aldım. Pasif gelir harika!", rating: 5, avatar: "S" },
  { name: "Burak Demir", role: "Trekking Rehberi", text: "Müşterilerimin ekipman ihtiyacını artık Yüklük ile karşılıyorum. Güvenilir ve hızlı.", rating: 5, avatar: "B" },
];

const steps = [
  { step: "01", title: "Ekipmanı Seç", desc: "Tarih seç, fiyatı hesapla ve rezervasyon yap." },
  { step: "02", title: "Güvenli Öde", desc: "Depozito bloke edilir, onay bekle." },
  { step: "03", title: "Teslim Al", desc: "Kullan, iade et ve puan ver." },
];

async function getFeaturedEquipment() {
  try {
    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from("equipment")
      .select("*, owner:profiles!owner_id(*)")
      .eq("is_available", true)
      .order("created_at", { ascending: false })
      .limit(6);
    return (data as EquipmentWithOwner[]) || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featured = await getFeaturedEquipment();

  return (
    <>
      <Header />
      <main>
        {/* HERO */}
        <section className="min-h-[90vh] grid lg:grid-cols-2">
          <div className="bg-forest-dark flex flex-col justify-center px-8 md:px-16 py-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-forest/30 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10 max-w-lg">
              <div className="inline-flex items-center gap-2 bg-orange/20 border border-orange/30 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 bg-orange rounded-full animate-pulse" />
                <span className="text-orange text-xs font-medium tracking-wide">
                  Türkiye&apos;nin İlk Outdoor Ekipman Platformu
                </span>
              </div>
              <h1 className="font-playfair text-5xl md:text-6xl xl:text-7xl font-bold text-cream leading-tight mb-5">
                Sırtına yükle,<br />
                <span className="text-orange italic">doğaya çık.</span>
              </h1>
              <p className="text-cream/70 text-base md:text-lg leading-relaxed mb-8 max-w-md">
                İstanbul&apos;da outdoor ekipman kirala veya ekipmanını kiraya ver. Güvenli, sigortaılı, kolay.
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <Link href="/ekipmanlar">
                  <Button size="lg" variant="primary">Ekipman Kirala</Button>
                </Link>
                <Link href="/panel/ilan-ekle">
                  <Button size="lg" variant="ghost">
                    Kiraya Ver <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6">
                {[
                  { label: "850+ Ekipman", icon: "🎒" },
                  { label: "4.9★ Puan", icon: "⭐" },
                  { label: "%100 Güvenli", icon: "🛡️" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-lg mb-0.5">{stat.icon}</div>
                    <div className="text-cream/80 text-xs font-medium whitespace-nowrap">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div
            className="relative hidden lg:block min-h-[500px]"
            style={{ backgroundImage: "url(https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=80)", backgroundSize: "cover", backgroundPosition: "center" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-forest-dark/30 to-transparent" />
            <div className="absolute bottom-8 left-8 bg-white rounded-2xl shadow-2xl p-4 max-w-[200px]">
              <div className="w-full h-24 rounded-xl bg-cream-dark mb-3 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1622260614927-5b62b4c2f92f?w=200&q=80" alt="Osprey" className="w-full h-full object-cover" />
              </div>
              <p className="font-playfair font-bold text-sm text-dark truncate">Osprey Atmos 65L</p>
              <p className="text-orange font-bold text-base mt-0.5">350 TL/gün</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs text-stone">Müsait · İstanbul</span>
              </div>
            </div>
          </div>
        </section>

        {/* SEARCH BAR */}
        <section className="bg-white border-b border-cream-dark py-6 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <input type="text" placeholder="Ne kiralamak istiyorsun?" className="w-full border border-cream-dark rounded-xl px-5 py-3 text-dark placeholder:text-stone focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest text-sm" />
              </div>
              <Link href="/ekipmanlar">
                <Button size="md">Ekipman Bul</Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "⛺ Çadır", key: "tent" },
                { label: "🎒 Sırt Çantası", key: "backpack" },
                { label: "🛏️ Uyku Tulumu", key: "sleeping_bag" },
                { label: "🏔️ Trekking", key: "trekking_pole" },
                { label: "✨ Tümü", key: "" },
              ].map((cat) => (
                <Link key={cat.key} href={cat.key ? `/ekipmanlar?category=${cat.key}` : "/ekipmanlar"} className="px-4 py-1.5 bg-cream border border-cream-dark rounded-full text-sm text-dark hover:bg-forest hover:text-cream hover:border-forest transition-all">
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="nasil-calisir" className="py-20 px-4 bg-cream">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-dark mb-3">Nasıl Çalışır?</h2>
              <p className="text-stone text-base">Üç adımda maceraya hazır ol.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {steps.map((step) => (
                <div key={step.step} className="group bg-white rounded-2xl p-7 border border-cream-dark hover:bg-forest-dark hover:border-transparent hover:shadow-xl transition-all duration-300 cursor-default">
                  <div className="text-4xl font-playfair font-bold text-cream-dark group-hover:text-orange/40 transition-colors mb-4">{step.step}</div>
                  <h3 className="font-playfair text-lg font-bold text-dark group-hover:text-cream transition-colors mb-2">{step.title}</h3>
                  <p className="text-stone text-sm group-hover:text-cream/70 transition-colors leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <h2 className="font-playfair text-3xl font-bold text-dark">Kategoriler</h2>
              <Link href="/ekipmanlar" className="flex items-center gap-1 text-forest text-sm font-medium hover:gap-2 transition-all">
                Tümünü gör <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <Link key={cat.key} href={`/ekipmanlar?category=${cat.key}`} className="group relative overflow-hidden rounded-2xl aspect-[4/3]">
                  <img src={cat.image} alt={cat.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/80 via-forest-dark/20 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="text-2xl mb-1 block">{cat.emoji}</span>
                    <span className="font-playfair font-bold text-cream text-lg">{cat.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED */}
        {featured.length > 0 && (
          <section className="py-20 px-4 bg-cream">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-10">
                <h2 className="font-playfair text-3xl font-bold text-dark">Öne Çıkan İlanlar</h2>
                <Link href="/ekipmanlar" className="flex items-center gap-1 text-forest text-sm font-medium hover:gap-2 transition-all">
                  Tümünü gör <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {featured.map((eq) => (
                  <EquipmentCard key={eq.id} equipment={eq} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* WHY YUKLUK */}
        <section id="guvence" className="py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-dark mb-3">Neden Yüklük?</h2>
              <p className="text-stone text-base">Güvenilir, şeffaf ve topluluk odaklı.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {features.map((f) => (
                <div key={f.title} className="bg-cream rounded-2xl p-6 border border-cream-dark hover:shadow-md hover:border-forest/30 transition-all">
                  <div className="w-10 h-10 bg-forest rounded-xl flex items-center justify-center mb-4">
                    <f.icon className="w-5 h-5 text-cream" />
                  </div>
                  <h3 className="font-semibold text-dark mb-2 text-sm">{f.title}</h3>
                  <p className="text-stone text-xs leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RENT OUT CTA */}
        <section className="py-20 px-4 bg-forest">
          <div className="max-w-4xl mx-auto text-center">
            <TrendingUp className="w-10 h-10 text-orange mx-auto mb-5" />
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-cream mb-4">Ekipmanın depoda mı bekliyor?</h2>
            <p className="text-cream/70 text-base mb-3">Kiraya ver, kazan.</p>
            <div className="bg-forest-light/50 rounded-xl inline-block px-6 py-3 mb-8">
              <span className="text-cream/80 text-sm">Osprey 65L → Ayda <span className="text-orange font-bold text-lg">~5.000 TL</span></span>
            </div>
            <div>
              <Link href="/panel/ilan-ekle">
                <Button size="lg" variant="primary">Hemen İlan Ver <ArrowRight className="w-5 h-5" /></Button>
              </Link>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-20 px-4 bg-forest-dark">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-playfair text-3xl font-bold text-cream text-center mb-12">Kullanıcılarımız Ne Diyor?</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {testimonials.map((t) => (
                <div key={t.name} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: t.rating }, (_, i) => (
                      <Star key={i} className="w-4 h-4 fill-orange text-orange" />
                    ))}
                  </div>
                  <p className="text-cream/80 text-sm leading-relaxed mb-5 italic">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-orange rounded-full flex items-center justify-center text-white font-bold text-sm">{t.avatar}</div>
                    <div>
                      <p className="text-cream font-semibold text-sm">{t.name}</p>
                      <p className="text-cream/50 text-xs">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WhatsApp sticky */}
        <a
          href={`https://wa.me/${whatsappNumber}?text=Merhaba, Yüklük hakkında bilgi almak istiyorum.`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-lg transition-all hover:shadow-xl hover:scale-105"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Destek</span>
        </a>
      </main>
      <Footer />
    </>
  );
}
