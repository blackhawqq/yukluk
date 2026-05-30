import Link from "next/link";
import { Backpack, MessageCircle } from "lucide-react";

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "905000000000";

export function Footer() {
  return (
    <footer className="bg-forest-dark text-cream/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-orange rounded-lg flex items-center justify-center">
                <Backpack className="w-5 h-5 text-white" />
              </div>
              <span className="font-playfair font-bold text-xl text-cream">
                Yüklük
              </span>
            </Link>
            <p className="text-sm text-cream/60 max-w-xs leading-relaxed">
              Türkiye&apos;nin ilk peer-to-peer outdoor ekipman kiralama platformu.
              Sırtına yükle, doğaya çık.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <a
                href={`https://wa.me/${whatsappNumber}?text=Merhaba, Yüklük hakkında bilgi almak istiyorum.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-cream/70 hover:text-cream transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-green-400" />
                WhatsApp Destek
              </a>
              <a
                href="https://instagram.com/yukluk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-cream/70 hover:text-cream transition-colors"
              >
                <span className="text-pink-400 text-sm">📸</span>
                Instagram
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-cream mb-3 text-sm uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/ekipmanlar", label: "Ekipmanlar" },
                { href: "/#nasil-calisir", label: "Nasıl Çalışır?" },
                { href: "/#guvence", label: "Güvence Sistemi" },
                { href: "/panel/ilan-ekle", label: "İlan Ver" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream/60 hover:text-cream transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-cream mb-3 text-sm uppercase tracking-wider">
              İletişim
            </h4>
            <ul className="space-y-2">
              <li className="text-sm text-cream/60">İstanbul, Türkiye</li>
              <li>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-cream/60 hover:text-cream transition-colors"
                >
                  +90 5XX XXX XXXX
                </a>
              </li>
              <li>
                <a
                  href="mailto:destek@yukluk.com"
                  className="text-sm text-cream/60 hover:text-cream transition-colors"
                >
                  destek@yukluk.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-cream/10 mt-10 mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream/40">
          <p>© 2025 Yüklük. Tüm hakları saklıdır.</p>
          <div className="flex gap-4">
            <Link href="/gizlilik" className="hover:text-cream/70 transition-colors">
              Gizlilik Politikası
            </Link>
            <Link href="/kullanim-sartlari" className="hover:text-cream/70 transition-colors">
              Kullanım Şartları
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
