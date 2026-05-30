"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Backpack } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export default function GirisPage() {
  const router = useRouter();
  const { signInWithGoogle } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (error) {
        toast.error(error.message.includes("Invalid") ? "E-posta veya şifre hatalı." : error.message);
      } else if (data.session) {
        toast.success("Hoş geldin!");
        router.push("/panel");
        router.refresh();
      }
    } catch (err) {
      toast.error("Bağlantı hatası. Tekrar dene.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signInWithGoogle();
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — photo */}
      <div
        className="hidden lg:flex lg:w-1/2 relative items-end p-12"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-forest-dark/70" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-orange rounded-xl flex items-center justify-center">
              <Backpack className="w-6 h-6 text-white" />
            </div>
            <span className="font-playfair font-bold text-2xl text-cream">Yüklük</span>
          </div>
          <h2 className="font-playfair text-3xl text-cream font-bold leading-tight mb-3">
            Yüklük&apos;e hoş geldin
          </h2>
          <p className="text-cream/70 text-sm leading-relaxed max-w-xs">
            Türkiye&apos;nin ilk outdoor ekipman kiralama platformu. Sırtına yükle, doğaya çık.
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-cream">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-forest rounded-xl flex items-center justify-center">
              <Backpack className="w-5 h-5 text-cream" />
            </div>
            <span className="font-playfair font-bold text-xl text-dark">Yüklük</span>
          </div>

          <h1 className="font-playfair text-2xl font-bold text-dark mb-1">
            Giriş Yap
          </h1>
          <p className="text-stone text-sm mb-6">
            Hesabın yok mu?{" "}
            <Link href="/kayit" className="text-forest font-medium hover:underline">
              Kayıt ol
            </Link>
          </p>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 border border-cream-dark rounded-xl py-2.5 px-4 text-sm font-medium text-dark hover:bg-white hover:border-stone transition-all mb-5 disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
            </svg>
            Google ile giriş yap
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-cream-dark" />
            <span className="text-xs text-stone">veya e-posta ile</span>
            <div className="flex-1 h-px bg-cream-dark" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-posta"
              type="email"
              placeholder="ornek@email.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
            <Input
              label="Şifre"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <div className="flex justify-end">
              <Link
                href="/sifre-unuttum"
                className="text-xs text-stone hover:text-forest transition-colors"
              >
                Şifremi unuttum
              </Link>
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg">
              Giriş Yap
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
