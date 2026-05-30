import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Yüklük — Sırtına yükle, doğaya çık.",
  description: "Türkiye'nin ilk peer-to-peer outdoor ekipman kiralama platformu. İstanbul'da outdoor ekipman kirala veya ekipmanını kiraya ver.",
  keywords: "outdoor ekipman kiralama, kamp ekipmanı, çadır kiralama, sırt çantası kiralama, İstanbul",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="min-h-screen flex flex-col bg-cream">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1B4332",
              color: "#FAFAF5",
              fontFamily: "var(--font-dm)",
            },
            success: {
              iconTheme: { primary: "#F97316", secondary: "#FAFAF5" },
            },
          }}
        />
      </body>
    </html>
  );
}
