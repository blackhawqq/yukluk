"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingBag, MessageSquare, User,
  LogOut, Backpack, MessageCircle, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

const navItems = [
  { href: "/panel", label: "Genel Bakış", icon: LayoutDashboard, exact: true },
  { href: "/panel/kiralamalarim", label: "Kiralamalarım", icon: ShoppingBag },
  { href: "/panel/ilanlarim", label: "İlanlarım", icon: Package },
  { href: "/panel/mesajlar", label: "Mesajlar", icon: MessageSquare },
  { href: "/panel/profil", label: "Profil", icon: User },
];

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "905000000000";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile } = useAuth();

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Çıkış yapıldı");
    window.location.href = "/";
  };

  return (
    <div className="flex h-screen bg-cream overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-forest-dark flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange rounded-lg flex items-center justify-center">
              <Backpack className="w-5 h-5 text-white" />
            </div>
            <span className="font-playfair font-bold text-lg text-cream">
              Yüklük
            </span>
          </Link>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-forest rounded-full flex items-center justify-center text-cream font-bold flex-shrink-0">
              {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-cream truncate">
                {profile?.full_name || "Kullanıcı"}
              </p>
              <p className="text-xs text-cream/50 truncate">
                {user?.email}
              </p>
            </div>
            {profile?.is_verified && (
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "bg-orange text-white"
                    : "text-cream/70 hover:bg-white/10 hover:text-cream"
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <a
            href={`https://wa.me/${whatsappNumber}?text=Merhaba, destek almak istiyorum.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-cream/70 hover:bg-white/10 hover:text-cream transition-all"
          >
            <MessageCircle className="w-4 h-4 text-green-400" />
            WhatsApp Destek
          </a>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-cream/70 hover:bg-red-500/20 hover:text-red-400 transition-all w-full text-left"
          >
            <LogOut className="w-4 h-4" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
