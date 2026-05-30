import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const equipmentId = searchParams.get("equipmentId");

  if (!equipmentId) return NextResponse.json({ dates: [] });

  const supabase = await createServerSupabase();
  const { data } = await (supabase
    .from("unavailable_dates")
    .select("date")
    .eq("equipment_id", equipmentId) as any) as { data: { date: string }[] | null };

  return NextResponse.json({ dates: data?.map((d) => d.date) || [] });
}
