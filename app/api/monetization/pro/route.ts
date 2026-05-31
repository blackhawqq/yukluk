import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { REVENUE } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const { months = 1 } = await request.json();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const { data: profile } = await (supabase
    .from("profiles")
    .select("is_pro, pro_until")
    .eq("id", user.id)
    .single() as any);

  const now = new Date();
  const currentEnd = profile?.pro_until && new Date(profile.pro_until) > now
    ? new Date(profile.pro_until)
    : now;
  const newEnd = new Date(currentEnd.getTime() + months * 30 * 24 * 60 * 60 * 1000);

  await (supabase
    .from("profiles")
    .update({ is_pro: true, pro_until: newEnd.toISOString() } as never)
    .eq("id", user.id) as any);

  const totalCost = REVENUE.PRO_PRICE_MONTHLY * months;

  return NextResponse.json({
    success: true,
    proUntil: newEnd.toISOString(),
    cost: totalCost,
    message: `Pro hesap ${months} ay aktif edildi. (${totalCost} TL IBAN ile ödenecek)`,
  });
}
