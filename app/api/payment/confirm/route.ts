import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Test modu: ödemeyi simüle ederek kiralama onaylar
export async function POST(request: NextRequest) {
  try {
    const { rentalId } = await request.json();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
    );

    const { data: rental } = await (supabase
      .from("rentals")
      .select("start_date, end_date, equipment_id")
      .eq("id", rentalId)
      .single() as any) as { data: { start_date: string; end_date: string; equipment_id: string } | null };

    if (!rental) return NextResponse.json({ error: "Kiralama bulunamadı" }, { status: 404 });

    // Confirmed yap
    await (supabase.from("rentals").update({
      status: "confirmed",
      iyzico_payment_id: `test_${rentalId}`,
      iyzico_payment_status: "SUCCESS",
    } as never).eq("id", rentalId) as any);

    // Müsait olmayan tarihleri ekle
    const dates: { equipment_id: string; rental_id: string; date: string }[] = [];
    const cursor = new Date(rental.start_date);
    const end = new Date(rental.end_date);
    while (cursor <= end) {
      dates.push({ equipment_id: rental.equipment_id, rental_id: rentalId, date: cursor.toISOString().split("T")[0] });
      cursor.setDate(cursor.getDate() + 1);
    }
    if (dates.length > 0) {
      await (supabase.from("unavailable_dates").insert(dates as never[]) as any);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
