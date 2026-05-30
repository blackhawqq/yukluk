"use client";

import { useState } from "react";
import { Camera, Save, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function ProfilPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    bio: profile?.bio || "",
    iban: profile?.iban || "",
  });
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await (supabase.from("profiles").update(form as never).eq("id", user.id) as any);
    setSaving(false);
    if (error) { toast.error("Kaydedilemedi."); return; }
    await refreshProfile();
    toast.success("Profil güncellendi!");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      await (supabase.from("profiles").update({ avatar_url: data.publicUrl } as never).eq("id", user.id) as any);
      await refreshProfile();
      toast.success("Fotoğraf güncellendi!");
    } else {
      toast.error("Fotoğraf yüklenemedi.");
    }
    setUploading(false);
  };

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) { toast.error("Şifreler eşleşmiyor."); return; }
    if (passwords.new.length < 8) { toast.error("Şifre en az 8 karakter olmalı."); return; }
    setSavingPw(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: passwords.new });
    setSavingPw(false);
    if (error) { toast.error("Şifre değiştirilemedi."); return; }
    setPasswords({ current: "", new: "", confirm: "" });
    toast.success("Şifre güncellendi!");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="font-playfair text-2xl font-bold text-dark mb-8">Profilim</h1>

      <div className="space-y-6">
        {/* Avatar */}
        <div className="bg-white rounded-2xl border border-cream-dark p-6">
          <h2 className="font-semibold text-dark mb-4">Profil Fotoğrafı</h2>
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-forest flex items-center justify-center text-cream text-2xl font-bold overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  profile?.full_name?.charAt(0)?.toUpperCase() || "U"
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-orange rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-light transition-colors shadow-sm">
                <Camera className="w-3.5 h-3.5 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
              </label>
            </div>
            <div>
              <p className="font-semibold text-dark">{profile?.full_name}</p>
              <p className="text-stone text-sm">{user?.email}</p>
              {uploading && <p className="text-xs text-forest mt-1">Yükleniyor...</p>}
            </div>
          </div>
        </div>

        {/* Personal info */}
        <div className="bg-white rounded-2xl border border-cream-dark p-6">
          <h2 className="font-semibold text-dark mb-4">Kişisel Bilgiler</h2>
          <div className="space-y-4">
            <Input
              label="Ad Soyad"
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              required
            />
            <Input
              label="Telefon"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="5XXXXXXXXX"
            />
            <Textarea
              label="Bio"
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="Kendinizi kısaca tanıtın..."
              rows={3}
            />
            <Input
              label="IBAN (Ödeme almak için)"
              value={form.iban}
              onChange={(e) => setForm((f) => ({ ...f, iban: e.target.value }))}
              placeholder="TR00 0000 0000 0000 0000 0000 00"
            />
            <Button loading={saving} onClick={handleSave}>
              <Save className="w-4 h-4" /> Kaydet
            </Button>
          </div>
        </div>

        {/* Password */}
        <div className="bg-white rounded-2xl border border-cream-dark p-6">
          <h2 className="font-semibold text-dark mb-4">Şifre Değiştir</h2>
          <div className="space-y-4">
            <Input
              label="Yeni Şifre"
              type={showPw ? "text" : "password"}
              value={passwords.new}
              onChange={(e) => setPasswords((p) => ({ ...p, new: e.target.value }))}
              placeholder="En az 8 karakter"
              rightIcon={
                <button type="button" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            <Input
              label="Şifre Tekrar"
              type={showPw ? "text" : "password"}
              value={passwords.confirm}
              onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
              placeholder="Şifreyi tekrarlayın"
            />
            <Button variant="outline" loading={savingPw} onClick={handlePasswordChange}>
              Şifreyi Güncelle
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
