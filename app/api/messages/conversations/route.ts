import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  // Kullanıcının tüm mesajlarını al (gönderilen ve alınan)
  const { data: messages } = await (supabase
    .from("messages")
    .select(`
      id, content, created_at, is_read, sender_id, receiver_id, equipment_id, rental_id,
      sender:profiles!sender_id(id, full_name, avatar_url),
      receiver:profiles!receiver_id(id, full_name, avatar_url),
      equipment:equipment(id, title, images)
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false }) as any);

  if (!messages) return NextResponse.json({ conversations: [] });

  // Konuşmaları grupla: karşı kullanıcı + ekipman bazında
  const convMap = new Map<string, Record<string, unknown>>();

  for (const msg of messages) {
    const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
    const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender;
    const key = `${otherId}_${msg.equipment_id || msg.rental_id || "direct"}`;

    if (!convMap.has(key)) {
      convMap.set(key, {
        key,
        other_user: otherUser,
        equipment: msg.equipment || null,
        rental_id: msg.rental_id || null,
        equipment_id: msg.equipment_id || null,
        last_message: msg,
        unread_count: 0,
      });
    }

    const conv = convMap.get(key)!;
    if (msg.receiver_id === user.id && !msg.is_read) {
      (conv.unread_count as number);
      conv.unread_count = (conv.unread_count as number) + 1;
    }
  }

  return NextResponse.json({ conversations: Array.from(convMap.values()) });
}
