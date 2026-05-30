import Link from "next/link";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "905000000000";

export default function RezervasBasariliPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 border border-cream-dark text-center max-w-md w-full shadow-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="font-playfair text-2xl font-bold text-dark mb-2">
            Rezervasyonun Alındı!
          </h1>
          <p className="text-stone text-sm mb-6 leading-relaxed max-w-xs mx-auto">
            Ödemen başarıyla alındı. Kiraya veren onayladıktan sonra teslim alabilirsin.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href={`https://wa.me/${whatsappNumber}?text=Merhaba, rezervasyonum hakkında bilgi almak istiyorum.`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" fullWidth>
                <MessageCircle className="w-4 h-4" /> WhatsApp Destek
              </Button>
            </a>
            <Link href="/panel/kiralamalarim">
              <Button fullWidth>Kiralamalarıma Git</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
