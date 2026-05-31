import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { withUserId, equipmentId, rentalId } = await request.json();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false });

  let query = supabase
    .from("messages")
    .update({ is_read: true } as never)
    .eq("receiver_id", user.id)
    .eq("is_read", false) as any;

  if (rentalId) query = query.eq("rental_id", rentalId);
  else if (equipmentId) query = query.eq("equipment_id", equipmentId).eq("sender_id", withUserId);

  await query;
  return NextResponse.json({ ok: true });
}
