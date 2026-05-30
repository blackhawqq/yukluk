import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { sendConfirmationEmail } from "@/lib/email";

function formatDateTR(dateStr: string) {
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(dateStr));
}

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
      .select("*, equipment(*), renter:profiles!renter_id(*)")
      .eq("id", rentalId)
      .single() as any) as {
        data: {
          start_date: string; end_date: string; equipment_id: string;
          equipment: { title: string };
          renter: { full_name: string };
          renter_id: string;
        } | null
      };

    if (!rental) return NextResponse.json({ error: "Kiralama bulunamadı" }, { status: 404 });

    // Confirmed yap
    await (supabase.from("rentals").update({
      status: "confirmed",
      iyzico_payment_id: `manual_${rentalId}`,
      iyzico_payment_status: "MANUAL",
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

    // Kullanıcıya onay maili
    const { data: renterUser } = await supabase.auth.admin.getUserById(rental.renter_id) as any;
    if (renterUser?.user?.email) {
      try {
        await sendConfirmationEmail({
          toEmail: renterUser.user.email,
          toName: rental.renter?.full_name || "Kullanıcı",
          equipmentTitle: rental.equipment?.title || "Ekipman",
          startDate: formatDateTR(rental.start_date),
          endDate: formatDateTR(rental.end_date),
        });
      } catch (e) {
        console.error("Onay maili gönderilemedi:", e);
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
