import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );

  const [{ data: equipment }, { data: reviews }, { data: unavailable }] = await Promise.all([
    supabase.from("equipment").select("*, owner:profiles!owner_id(*)").eq("id", id).single() as any,
    supabase.from("reviews").select("*, reviewer:profiles!reviewer_id(*)").eq("equipment_id", id).order("created_at", { ascending: false }) as any,
    supabase.from("unavailable_dates").select("date").eq("equipment_id", id) as any,
  ]);

  return NextResponse.json({
    equipment: equipment || null,
    reviews: reviews || [],
    unavailableDates: (unavailable || []).map((d: { date: string }) => d.date),
  });
}
