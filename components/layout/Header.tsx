"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Menu, X, User, Package, MessageSquare, LogOut, ChevronDown,
  Backpack
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

const navLinks = [
  { href: "/ekipmanlar", label: "Ekipmanlar" },
  { href: "/#nasil-calisir", label: "Nasıl Çalışır?" },
  { href: "/#guvence", label: "Güvence" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Çıkış yapıldı");
    router.push("/");
    router.refresh();
  };

  const isDashboard = pathname.startsWith("/panel");

  if (isDashboard) return null;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-cream-dark shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-forest rounded-lg flex items-center justify-center group-hover:bg-forest-light transition-colors">
              <Backpack className="w-5 h-5 text-cream" />
            </div>
            <span className="font-playfair font-bold text-xl text-dark">
              Yüklük
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-forest",
                  pathname === link.href ? "text-forest" : "text-stone"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-cream-dark transition-colors"
                >
                  <div className="w-7 h-7 bg-forest rounded-full flex items-center justify-center text-cream text-xs font-bold">
                    {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-medium text-dark max-w-[120px] truncate">
                    {profile?.full_name || "Kullanıcı"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-stone" />
                </button>

                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-cream-dark z-20 py-1">
                      <Link
                        href="/panel"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark hover:bg-cream transition-colors"
                      >
                        <User className="w-4 h-4 text-stone" />
                        Panelim
                      </Link>
                      <Link
                        href="/panel/ilanlarim"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark hover:bg-cream transition-colors"
                      >
                        <Package className="w-4 h-4 text-stone" />
                        İlanlarım
                      </Link>
                      <Link
                        href="/panel/mesajlar"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark hover:bg-cream transition-colors"
                      >
                        <MessageSquare className="w-4 h-4 text-stone" />
                        Mesajlar
                      </Link>
                      <hr className="my-1 border-cream-dark" />
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Çıkış Yap
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link href="/giris">
                  <Button variant="outline" size="sm">
                    Giriş Yap
                  </Button>
                </Link>
                <Link href="/kayit">
                  <Button variant="primary" size="sm">
                    Kayıt Ol
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-cream-dark transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="w-5 h-5 text-dark" />
            ) : (
              <Menu className="w-5 h-5 text-dark" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-cream-dark px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2.5 text-sm font-medium text-dark hover:text-forest transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-cream-dark" />
          {user ? (
            <>
              <Link
                href="/panel"
                onClick={() => setMobileOpen(false)}
                className="block py-2.5 text-sm font-medium text-dark hover:text-forest transition-colors"
              >
                Panelim
              </Link>
              <button
                onClick={handleSignOut}
                className="block py-2.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors w-full text-left"
              >
                Çıkış Yap
              </button>
            </>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link href="/giris" className="flex-1">
                <Button variant="outline" size="sm" fullWidth>
                  Giriş Yap
                </Button>
              </Link>
              <Link href="/kayit" className="flex-1">
                <Button variant="primary" size="sm" fullWidth>
                  Kayıt Ol
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
