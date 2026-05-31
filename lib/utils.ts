import { EquipmentCategory, EquipmentCondition, RentalStatus } from "./supabase/types";

// Gelir Modeli Sabitleri
export const REVENUE = {
  COMMISSION_RATE: 0.10,        // %10 komisyon
  DEPOSIT_GUARANTEE_RATE: 0.02, // %2 depozito güvencesi (opsiyonel)
  FEATURED_PRICE_WEEKLY: 49,    // Öne Çıkar: 49 TL/hafta
  PRO_PRICE_MONTHLY: 149,       // Pro Hesap: 149 TL/ay
} as const;

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function formatDateShort(dateStr: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
  }).format(new Date(dateStr));
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("90")) {
    const local = digits.slice(2);
    return `+90 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6, 8)} ${local.slice(8)}`;
  }
  return phone;
}

export function getDaysBetween(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = endDate.getTime() - startDate.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function calculateRentalAmounts(dailyPrice: number, totalDays: number, depositAmount: number, withGuarantee = false) {
  const rentalAmount = dailyPrice * totalDays;
  const platformFee = rentalAmount * REVENUE.COMMISSION_RATE;
  const ownerPayout = rentalAmount * (1 - REVENUE.COMMISSION_RATE);
  const guaranteeFee = withGuarantee ? rentalAmount * REVENUE.DEPOSIT_GUARANTEE_RATE : 0;
  return { rentalAmount, platformFee, ownerPayout, depositAmount, guaranteeFee };
}

export const CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  backpack: "Sırt Çantası",
  tent: "Çadır",
  sleeping_bag: "Uyku Tulumu",
  trekking_pole: "Trekking Direkleri",
  headlamp: "Kafa Lambası",
  camp_stove: "Kamp Ocağı",
  camp_chair: "Kamp Sandalyesi",
  water_filter: "Su Filtresi",
  other: "Diğer",
};

export const CONDITION_LABELS: Record<EquipmentCondition, string> = {
  new: "Sıfır",
  like_new: "Sıfır Gibi",
  good: "İyi",
  fair: "Fena Değil",
};

export const RENTAL_STATUS_LABELS: Record<RentalStatus, string> = {
  pending: "Bekliyor",
  confirmed: "Onaylandı",
  active: "Aktif",
  completed: "Tamamlandı",
  cancelled: "İptal",
  disputed: "Anlaşmazlık",
};

export const RENTAL_STATUS_COLORS: Record<RentalStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  disputed: "bg-orange-100 text-orange-800",
};

export const ISTANBUL_DISTRICTS = [
  "Adalar", "Arnavutköy", "Ataşehir", "Avcılar", "Bağcılar", "Bahçelievler",
  "Bakırköy", "Başakşehir", "Bayrampaşa", "Beşiktaş", "Beykoz", "Beylikdüzü",
  "Beyoğlu", "Büyükçekmece", "Çatalca", "Çekmeköy", "Esenler", "Esenyurt",
  "Eyüpsultan", "Fatih", "Gaziosmanpaşa", "Güngören", "Kadıköy", "Kağıthane",
  "Kartal", "Küçükçekmece", "Maltepe", "Pendik", "Sancaktepe", "Sarıyer",
  "Şile", "Silivri", "Şişli", "Sultanbeyli", "Sultangazi", "Tuzla",
  "Ümraniye", "Üsküdar", "Zeytinburnu",
];

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getWhatsAppUrl(number: string, message: string): string {
  const cleanNumber = number.replace(/\D/g, "");
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Az önce";
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;
  return formatDate(dateStr);
}
