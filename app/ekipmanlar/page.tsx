"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { EquipmentGrid } from "@/components/equipment/EquipmentGrid";
import { EquipmentFilters } from "@/components/equipment/EquipmentFilters";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import type { EquipmentFilters as FiltersType, EquipmentWithOwner } from "@/types";
import { ChevronLeft, ChevronRight, SlidersHorizontal, X, MessageCircle } from "lucide-react";
import type { EquipmentCategory } from "@/lib/supabase/types";

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "905000000000";

const sortOptions = [
  { value: "newest", label: "En Yeni" },
  { value: "cheapest", label: "En Ucuz" },
  { value: "expensive", label: "En Pahalı" },
  { value: "best_rated", label: "En Yüksek Puan" },
];

function EkipmanlarContent() {
  const searchParams = useSearchParams();
  const [equipment, setEquipment] = useState<EquipmentWithOwner[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [filters, setFilters] = useState<FiltersType>({
    category: (searchParams.get("category") || "") as EquipmentCategory | "",
    search: searchParams.get("search") || "",
    sortBy: "newest",
    page: 1,
  });

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.set("category", filters.category);
      if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
      if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
      if (filters.condition) params.set("condition", filters.condition);
      if (filters.minRating) params.set("minRating", String(filters.minRating));
      if (filters.onlyAvailable) params.set("onlyAvailable", "true");
      if (filters.search) params.set("search", filters.search);
      if (filters.sortBy) params.set("sortBy", filters.sortBy);
      if (filters.page) params.set("page", String(filters.page));

      const res = await fetch(`/api/equipment?${params}`);
      const { data, count } = await res.json();
      setEquipment(data || []);
      setTotal(count || 0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchEquipment(); }, [fetchEquipment]);

  const totalPages = Math.ceil(total / 12);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream">
        {/* Top bar */}
        <div className="bg-white border-b border-cream-dark px-4 py-5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div>
              <h1 className="font-playfair font-bold text-2xl text-dark">Ekipmanlar</h1>
              <p className="text-stone text-sm">{total} ekipman bulundu</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 border border-cream-dark rounded-xl px-3 py-2 text-sm text-dark hover:bg-cream-dark transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtreler
              </button>
              <Select
                options={sortOptions}
                value={filters.sortBy}
                onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value as FiltersType["sortBy"], page: 1 }))}
                className="text-sm"
              />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <EquipmentFilters filters={filters} onChange={setFilters} />
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex justify-center py-20">
                <Spinner size="lg" />
              </div>
            ) : (
              <EquipmentGrid equipment={equipment} />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, (f.page || 1) - 1) }))}
                  disabled={(filters.page || 1) <= 1}
                  className="p-2 rounded-xl border border-cream-dark hover:bg-white disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilters((f) => ({ ...f, page: p }))}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                      (filters.page || 1) === p
                        ? "bg-forest text-cream"
                        : "border border-cream-dark hover:bg-white text-dark"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setFilters((f) => ({ ...f, page: Math.min(totalPages, (f.page || 1) + 1) }))}
                  disabled={(filters.page || 1) >= totalPages}
                  className="p-2 rounded-xl border border-cream-dark hover:bg-white disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile filter drawer */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-dark/50" onClick={() => setShowMobileFilters(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-cream overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-dark">Filtreler</h2>
                <button onClick={() => setShowMobileFilters(false)}>
                  <X className="w-5 h-5 text-stone" />
                </button>
              </div>
              <EquipmentFilters filters={filters} onChange={(f) => { setFilters(f); setShowMobileFilters(false); }} />
            </div>
          </div>
        )}
      </main>

      {/* WhatsApp sticky */}
      <a
        href={`https://wa.me/${whatsappNumber}?text=Merhaba, Yüklük hakkında bilgi almak istiyorum.`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-lg transition-all hover:scale-105"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:inline">Destek</span>
      </a>

      <Footer />
    </>
  );
}

export default function EkipmanlarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center"><div className="text-stone">Yükleniyor...</div></div>}>
      <EkipmanlarContent />
    </Suspense>
  );
}
