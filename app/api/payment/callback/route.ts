import { NextRequest, NextResponse } from "next/server";
import { getIyzipay } from "@/lib/iyzico/client";
import { createServiceSupabase } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const token = formData.get("token") as string;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    if (!token) return NextResponse.redirect(`${siteUrl}/rezervasyon/basarisiz`);

    return new Promise<NextResponse>((resolve) => {
      (getIyzipay().checkoutForm.retrieve as Function)({ locale: "TR", token }, async (err: Error | null, result: Record<string, unknown>) => {
        if (err || result.status !== "success" || result.paymentStatus !== "SUCCESS") {
          const rentalId = result?.conversationId as string;
          if (rentalId) {
            const supabase = await createServiceSupabase();
            await (supabase.from("rentals").update({ status: "cancelled" } as never).eq("id", rentalId) as any);
          }
          resolve(NextResponse.redirect(`${siteUrl}/rezervasyon/basarisiz`));
          return;
        }

        const rentalId = result.conversationId as string;
        try {
          const supabase = await createServiceSupabase();

          const { data: rental } = await (supabase
            .from("rentals")
            .select("start_date, end_date, equipment_id")
            .eq("id", rentalId)
            .single() as any) as { data: { start_date: string; end_date: string; equipment_id: string } | null };

          if (rental) {
            await (supabase.from("rentals").update({
              status: "confirmed",
              iyzico_payment_id: result.paymentId as string,
              iyzico_payment_status: "SUCCESS",
            } as never).eq("id", rentalId) as any);

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
          }

          resolve(NextResponse.redirect(`${siteUrl}/rezervasyon/basarili/${rentalId}`));
        } catch {
          resolve(NextResponse.redirect(`${siteUrl}/rezervasyon/basarisiz`));
        }
      });
    });
  } catch {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/rezervasyon/basarisiz`);
  }
}
