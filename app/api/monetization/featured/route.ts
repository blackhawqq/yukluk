import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { REVENUE } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const { equipmentId, weeks = 1 } = await request.json();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  // Ekipmanın bu kullanıcıya ait olduğunu kontrol et
  const { data: eq } = await (supabase
    .from("equipment")
    .select("id, title, is_featured, featured_until")
    .eq("id", equipmentId)
    .eq("owner_id", user.id)
    .single() as any);

  if (!eq) return NextResponse.json({ error: "Ekipman bulunamadı" }, { status: 404 });

  // Bitiş tarihini hesapla (şu an featured ise üstüne ekle)
  const now = new Date();
  const currentEnd = eq.featured_until && new Date(eq.featured_until) > now
    ? new Date(eq.featured_until)
    : now;
  const newEnd = new Date(currentEnd.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);

  await (supabase
    .from("equipment")
    .update({ is_featured: true, featured_until: newEnd.toISOString() } as never)
    .eq("id", equipmentId) as any);

  const totalCost = REVENUE.FEATURED_PRICE_WEEKLY * weeks;

  return NextResponse.json({
    success: true,
    featuredUntil: newEnd.toISOString(),
    cost: totalCost,
    message: `İlanınız ${weeks} hafta öne çıkarıldı. (${totalCost} TL IBAN ile ödenecek)`,
  });
}
