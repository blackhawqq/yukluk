"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, ImagePlus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { CATEGORY_LABELS, CONDITION_LABELS, ISTANBUL_DISTRICTS } from "@/lib/utils";
import { useEquipment } from "@/hooks/useEquipment";
import type { CreateEquipmentData } from "@/types";
import type { EquipmentCategory, EquipmentCondition } from "@/lib/supabase/types";
import toast from "react-hot-toast";

type Step = 1 | 2 | 3 | 4;

const categoryOptions = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }));
const conditionOptions = Object.entries(CONDITION_LABELS).map(([value, label]) => ({ value, label }));
const districtOptions = ISTANBUL_DISTRICTS.map((d) => ({ value: d, label: d }));

interface EquipmentFormProps {
  initialData?: Partial<CreateEquipmentData & { id: string }>;
  mode?: "create" | "edit";
}

export function EquipmentForm({ initialData, mode = "create" }: EquipmentFormProps) {
  const router = useRouter();
  const { uploadImages } = useEquipment();

  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(initialData?.images || []);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<CreateEquipmentData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category: (initialData?.category || "") as EquipmentCategory,
    brand: initialData?.brand || "",
    condition: (initialData?.condition || "good") as EquipmentCondition,
    daily_price: initialData?.daily_price || 0,
    deposit_amount: initialData?.deposit_amount || 0,
    images: initialData?.images || [],
    location_city: "İstanbul",
    location_district: initialData?.location_district || "",
  });

  const update = (key: keyof CreateEquipmentData, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleFileAdd = (files: FileList | null) => {
    if (!files) return;
    const remaining = 5 - imagePreviews.length;
    const newFiles = Array.from(files).slice(0, remaining);
    setImageFiles((prev) => [...prev, ...newFiles]);
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      let imageUrls = form.images.filter((url) => url.startsWith("http"));
      if (imageFiles.length > 0) {
        setUploadProgress(20);
        const uploaded = await uploadImages(imageFiles);
        imageUrls = [...imageUrls, ...uploaded];
        setUploadProgress(80);
      }

      const data: CreateEquipmentData = { ...form, images: imageUrls };

      if (mode === "edit" && initialData?.id) {
        const res = await fetch("/api/equipment/my", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ equipmentId: initialData.id, ...data }),
        });
        if (!res.ok) throw new Error("Güncelleme başarısız");
        toast.success("İlan güncellendi!");
      } else {
        const res = await fetch("/api/equipment/my", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("İlan eklenemedi");
        toast.success("İlan yayınlandı!");
      }

      setUploadProgress(100);
      router.push("/panel/ilanlarim");
    } catch {
      toast.error("İlan kaydedilemedi.");
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const stepLabels = ["Temel Bilgiler", "Fotoğraflar", "Fiyatlandırma", "Önizleme"];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Stepper */}
      <div className="flex items-center mb-8">
        {([1, 2, 3, 4] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step > s ? "bg-green-500 text-white" :
                step === s ? "bg-forest text-cream" :
                "bg-cream-dark text-stone"
              }`}>
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              <span className="text-xs text-stone mt-1 hidden sm:block">{stepLabels[i]}</span>
            </div>
            {i < 3 && <div className={`flex-1 h-0.5 mx-2 ${step > s ? "bg-forest" : "bg-cream-dark"}`} />}
          </div>
        ))}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="space-y-4">
          <Input
            label="İlan Başlığı"
            placeholder="Osprey Atmos AG 65L Sırt Çantası"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            maxLength={60}
            hint={`${form.title.length}/60 karakter`}
            required
          />
          <div>
            <p className="text-sm font-medium text-dark mb-3">Kategori <span className="text-orange">*</span></p>
            <div className="grid grid-cols-3 gap-2">
              {categoryOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update("category", opt.value)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all text-left ${
                    form.category === opt.value
                      ? "border-forest bg-forest text-cream"
                      : "border-cream-dark hover:border-forest text-dark"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <Input label="Marka" placeholder="Osprey, MSR, Black Diamond..." value={form.brand} onChange={(e) => update("brand", e.target.value)} />
          <Textarea label="Açıklama" placeholder="Ekipmanı detaylı anlat (min 50 karakter)..." value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} minLength={50} required />
          <div>
            <p className="text-sm font-medium text-dark mb-3">Durum <span className="text-orange">*</span></p>
            <div className="grid grid-cols-2 gap-2">
              {conditionOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update("condition", opt.value)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all text-left ${
                    form.condition === opt.value
                      ? "border-forest bg-forest text-cream"
                      : "border-cream-dark hover:border-forest text-dark"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <Select label="İlçe" options={districtOptions} value={form.location_district} onChange={(e) => update("location_district", e.target.value)} placeholder="İlçe seçin" />
          <Button fullWidth onClick={() => { if (!form.title || !form.category || !form.description) { toast.error("Zorunlu alanları doldurun"); return; } setStep(2); }}>
            Devam Et →
          </Button>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-cream-dark rounded-2xl p-8 text-center hover:border-forest transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleFileAdd(e.dataTransfer.files); }}
          >
            <ImagePlus className="w-10 h-10 text-stone/50 mx-auto mb-3" />
            <p className="font-medium text-dark mb-1">Fotoğraf Ekle</p>
            <p className="text-stone text-xs">Sürükle bırak veya tıkla · Max 5 fotoğraf</p>
            <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFileAdd(e.target.files)} />
          </div>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {imagePreviews.map((preview, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-cream-dark group">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <div className="absolute top-2 left-2 bg-forest text-cream text-xs px-2 py-0.5 rounded-full">Kapak</div>
                  )}
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <X className="w-3 h-3 text-dark" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)}>← Geri</Button>
            <Button fullWidth onClick={() => setStep(3)}>Devam Et →</Button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="space-y-4">
          <Input
            label="Günlük Fiyat (TL)"
            type="number"
            min={1}
            value={form.daily_price || ""}
            onChange={(e) => {
              const price = Number(e.target.value);
              update("daily_price", price);
              if (!form.deposit_amount) update("deposit_amount", price * 3);
            }}
            required
          />
          <Input
            label="Depozito Tutarı (TL)"
            type="number"
            min={0}
            value={form.deposit_amount || ""}
            onChange={(e) => update("deposit_amount", Number(e.target.value))}
            hint={form.daily_price ? `Önerilen: ${form.daily_price * 3} TL (3x günlük fiyat)` : undefined}
            required
          />

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)}>← Geri</Button>
            <Button fullWidth onClick={() => { if (!form.daily_price || !form.deposit_amount) { toast.error("Fiyat bilgilerini girin"); return; } setStep(4); }}>
              Önizleme →
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-cream-dark p-5">
            <h3 className="font-semibold text-dark mb-4">İlan Özeti</h3>
            {imagePreviews[0] && (
              <div className="w-full h-48 rounded-xl overflow-hidden mb-4">
                <img src={imagePreviews[0]} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <dl className="space-y-2 text-sm">
              {[
                { label: "Başlık", value: form.title },
                { label: "Kategori", value: CATEGORY_LABELS[form.category] },
                { label: "Marka", value: form.brand || "—" },
                { label: "Durum", value: CONDITION_LABELS[form.condition] },
                { label: "Günlük Fiyat", value: `${form.daily_price} TL` },
                { label: "Depozito", value: `${form.deposit_amount} TL` },
                { label: "Konum", value: form.location_district ? `${form.location_district}, İstanbul` : "İstanbul" },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-2">
                  <dt className="text-stone w-28 flex-shrink-0">{label}:</dt>
                  <dd className="font-medium text-dark">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {uploadProgress > 0 && (
            <div className="bg-cream rounded-xl p-3">
              <div className="h-2 bg-cream-dark rounded-full overflow-hidden">
                <div className="h-full bg-forest rounded-full transition-all duration-500" style={{ width: `${uploadProgress}%` }} />
              </div>
              <p className="text-xs text-stone mt-1.5">Yükleniyor... %{uploadProgress}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(3)}>← Geri</Button>
            <Button fullWidth loading={submitting} onClick={handleSubmit} variant="secondary">
              <CheckCircle2 className="w-4 h-4" />
              {mode === "edit" ? "Güncelle" : "İlanı Yayınla"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
