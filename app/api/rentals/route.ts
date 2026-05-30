import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { sendPaymentInstructionEmail, sendAdminNotificationEmail } from "@/lib/email";

function formatDateTR(dateStr: string) {
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(dateStr));
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  // Kiralama oluştur
  const { data: rental, error } = await (supabase
    .from("rentals")
    .insert({ ...body, renter_id: user.id } as never)
    .select()
    .single() as any);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Ekipman bilgisi al
  const { data: equipment } = await (supabase
    .from("equipment")
    .select("title, brand")
    .eq("id", body.equipment_id)
    .single() as any) as { data: { title: string; brand: string } | null };

  // Kullanıcı profili al
  const { data: profile } = await (supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single() as any) as { data: { full_name: string } | null };

  const equipmentTitle = equipment?.title || "Ekipman";
  const renterName = profile?.full_name || "Kullanıcı";
  const totalAmount = body.rental_amount + body.deposit_amount;

  // Mailleri gönder (async, hata olursa kiralama yine oluşur)
  try {
    await Promise.all([
      sendPaymentInstructionEmail({
        toEmail: user.email!,
        toName: renterName,
        rentalId: rental.id,
        equipmentTitle,
        startDate: formatDateTR(body.start_date),
        endDate: formatDateTR(body.end_date),
        totalDays: body.total_days,
        rentalAmount: body.rental_amount,
        depositAmount: body.deposit_amount,
      }),
      sendAdminNotificationEmail({
        rentalId: rental.id,
        renterEmail: user.email!,
        renterName,
        equipmentTitle,
        startDate: formatDateTR(body.start_date),
        endDate: formatDateTR(body.end_date),
        totalAmount,
      }),
    ]);
  } catch (emailErr) {
    console.error("Mail gönderilemedi:", emailErr);
  }

  return NextResponse.json({ rental });
}
