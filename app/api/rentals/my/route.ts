import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "renter";

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const field = type === "renter" ? "renter_id" : "owner_id";
  const { data, error } = await (supabase
    .from("rentals")
    .select("*, equipment(*), renter:profiles!renter_id(*), owner:profiles!owner_id(*)")
    .eq(field, user.id)
    .order("created_at", { ascending: false }) as any);

  return NextResponse.json({ rentals: data || [] });
}

export async function PATCH(request: NextRequest) {
  const { rentalId, status } = await request.json();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const { data, error } = await (supabase
    .from("rentals")
    .update({ status } as never)
    .eq("id", rentalId)
    .select()
    .single() as any);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rental: data });
}
