"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Shield, Lock, CheckCircle2, MessageCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { PageSpinner } from "@/components/ui/Spinner";
import { formatPrice, formatDate, getDaysBetween, calculateRentalAmounts } from "@/lib/utils";
import type { EquipmentWithOwner } from "@/types";
import toast from "react-hot-toast";

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "905000000000";
type Step = 1 | 2 | 3;

export default function RezervasPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const startDate = searchParams.get("start") || "";
  const endDate = searchParams.get("end") || "";

  const [equipment, setEquipment] = useState<EquipmentWithOwner | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>(1);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [rentalId, setRentalId] = useState<string | null>(null);
  const [checkoutHtml, setCheckoutHtml] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      // Session kontrolü
      const sessionRes = await fetch("/api/auth/session");
      const { authenticated, userId: uid } = await sessionRes.json();
      if (!authenticated) { router.replace("/giris"); return; }
      setUserId(uid);

      if (!startDate || !endDate) { router.replace(`/ekipmanlar/${id}`); return; }

      // Ekipman verisi
      const eqRes = await fetch(`/api/equipment/${id}`);
      const { equipment: eq } = await eqRes.json();
      setEquipment(eq);
      setLoading(false);
    };
    init();
  }, [id]);

  if (loading) return <><Header /><PageSpinner /><Footer /></>;
  if (!equipment) return null;

  const totalDays = getDaysBetween(startDate, endDate);
  const amounts = calculateRentalAmounts(equipment.daily_price, totalDays, equipment.deposit_amount);

  const handleCreateRental = async () => {
    if (!userId) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipment_id: equipment.id,
          owner_id: equipment.owner_id,
          start_date: startDate,
          end_date: endDate,
          total_days: totalDays,
          daily_price: equipment.daily_price,
          rental_amount: amounts.rentalAmount,
          platform_fee: amounts.platformFee,
          owner_payout: amounts.ownerPayout,
          deposit_amount: equipment.deposit_amount,
          renter_notes: notes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Rezervasyon oluşturulamadı."); return; }

      setRentalId(data.rental.id);

      const payRes = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rentalId: data.rental.id }),
      });
      const payData = await payRes.json();

      if (payData.checkoutFormContent) {
        setCheckoutHtml(payData.checkoutFormContent);
        setStep(2);
      } else {
        toast.error("Ödeme başlatılamadı.");
      }
    } catch {
      toast.error("Bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const stepLabels: Record<Step, string> = { 1: "Özet", 2: "Ödeme", 3: "Onay" };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Link href={`/ekipmanlar/${id}`} className="inline-flex items-center gap-1 text-stone text-sm hover:text-forest transition-colors mb-6">
            <ChevronLeft className="w-4 h-4" /> Ekipmana Dön
          </Link>

          {/* Stepper */}
          <div className="flex items-center mb-8">
            {([1, 2, 3] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step > s ? "bg-green-500 text-white" :
                    step === s ? "bg-forest text-cream" : "bg-cream-dark text-stone"
                  }`}>
                    {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                  </div>
                  <span className="text-xs text-stone mt-1">{stepLabels[s]}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-0.5 mx-2 ${step > s ? "bg-forest" : "bg-cream-dark"}`} />}
              </div>
            ))}
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-cream-dark">
                <h2 className="font-playfair text-xl font-bold text-dark mb-4">Rezervasyon Özeti</h2>
                <div className="flex gap-4 mb-5 pb-5 border-b border-cream-dark">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-cream-dark flex-shrink-0">
                    {equipment.images?.[0] ? (
                      <img src={equipment.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : <div className="w-full h-full flex items-center justify-center text-2xl">🎒</div>}
                  </div>
                  <div>
                    <h3 className="font-playfair font-bold text-dark">{equipment.title}</h3>
                    {equipment.brand && <p className="text-stone text-xs uppercase tracking-wider mt-0.5">{equipment.brand}</p>}
                    <p className="text-stone text-sm mt-2">{formatDate(startDate)} → {formatDate(endDate)}</p>
                    <p className="text-stone text-sm">{totalDays} gün</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone">{formatPrice(equipment.daily_price)} × {totalDays} gün</span>
                    <span className="font-medium text-dark">{formatPrice(amounts.rentalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone">Depozito (hasar yoksa iade)</span>
                    <span className="font-medium text-dark">{formatPrice(equipment.deposit_amount)}</span>
                  </div>
                  <hr className="border-cream-dark my-2" />
                  <div className="flex justify-between font-bold">
                    <span className="text-dark">Genel Toplam</span>
                    <span className="text-dark text-lg">{formatPrice(amounts.rentalAmount + equipment.deposit_amount)}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-cream-dark">
                <Textarea
                  label="Kiraya Verene Not (İsteğe Bağlı)"
                  placeholder="Teslim zamanı, özel istekler..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <Button fullWidth size="lg" loading={submitting} onClick={handleCreateRental}>
                Ödemeye Geç <CheckCircle2 className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && checkoutHtml && (
            <div className="bg-white rounded-2xl p-6 border border-cream-dark space-y-4">
              <h2 className="font-playfair text-xl font-bold text-dark mb-4">Ödeme</h2>
              <details className="bg-cream rounded-xl">
                <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer text-sm font-medium text-dark">
                  <Shield className="w-4 h-4 text-forest" /> Depozito nedir?
                </summary>
                <p className="px-4 pb-3 text-sm text-stone leading-relaxed">
                  Depozito, kiralama süresince güvence olarak bloke edilen bir miktardır. Hasar yoksa iade edilir.
                </p>
              </details>
              <div dangerouslySetInnerHTML={{ __html: checkoutHtml }} />
              <div className="flex items-center justify-center gap-4 mt-4">
                {[{ icon: Lock, label: "SSL Şifreli" }, { icon: Shield, label: "3D Secure" }].map((item) => (
                  <div key={item.label} className="flex items-center gap-1 text-stone text-xs">
                    <item.icon className="w-3.5 h-3.5 text-forest" /> {item.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="bg-white rounded-2xl p-8 border border-cream-dark text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="font-playfair text-2xl font-bold text-dark mb-2">Rezervasyonun Alındı!</h2>
              <p className="text-stone text-sm mb-6 leading-relaxed max-w-xs mx-auto">
                Kiraya veren onayladıktan sonra ekipmanı teslim alabilirsin.
              </p>
              <div className="flex flex-col gap-3">
                <a href={`https://wa.me/${equipment.owner?.phone || whatsappNumber}?text=${encodeURIComponent(`Merhaba, ${equipment.title} rezervasyonum onaylandı mı?`)}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" fullWidth><MessageCircle className="w-4 h-4" /> Kiraya Verene Mesaj Gönder</Button>
                </a>
                <Link href="/panel"><Button fullWidth>Panele Git</Button></Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
