import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const equipmentId = searchParams.get("equipmentId");
  const rentalId = searchParams.get("rentalId");
  const withUserId = searchParams.get("withUserId");

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  let query = supabase
    .from("messages")
    .select("*, sender:profiles!sender_id(*)")
    .order("created_at", { ascending: true }) as any;

  if (rentalId) {
    query = query.eq("rental_id", rentalId);
  } else if (equipmentId && withUserId) {
    // Direkt konuşma: iki kullanıcı arasında belirli ekipman hakkında
    query = query
      .eq("equipment_id", equipmentId)
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${withUserId}),and(sender_id.eq.${withUserId},receiver_id.eq.${user.id})`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ messages: [] });
  return NextResponse.json({ messages: data || [] });
}

export async function POST(request: NextRequest) {
  const { content, receiverId, equipmentId, rentalId } = await request.json();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  if (!content?.trim() || !receiverId) {
    return NextResponse.json({ error: "İçerik ve alıcı gerekli" }, { status: 400 });
  }

  const insertData: Record<string, unknown> = {
    sender_id: user.id,
    receiver_id: receiverId,
    content: content.trim(),
  };

  if (rentalId) insertData.rental_id = rentalId;
  if (equipmentId) insertData.equipment_id = equipmentId;

  const { data, error } = await (supabase
    .from("messages")
    .insert(insertData as never)
    .select("*, sender:profiles!sender_id(*)")
    .single() as any);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: data });
}
