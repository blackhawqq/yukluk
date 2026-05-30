import { NextRequest, NextResponse } from "next/server";
import { getIyzipay } from "@/lib/iyzico/client";
import { createServiceSupabase } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { rentalId } = await request.json();
    const supabase = await createServiceSupabase();

    const { data: rental } = await (supabase
      .from("rentals")
      .select("iyzico_payment_id, deposit_amount")
      .eq("id", rentalId)
      .single() as any) as { data: { iyzico_payment_id: string | null; deposit_amount: number } | null };

    if (!rental?.iyzico_payment_id) {
      return NextResponse.json({ error: "Kiralama bulunamadı" }, { status: 404 });
    }

    return new Promise<NextResponse>((resolve) => {
      (getIyzipay().refund.create as Function)(
        {
          locale: "TR",
          conversationId: rentalId,
          paymentTransactionId: rental.iyzico_payment_id as string,
          price: String(rental.deposit_amount),
          currency: "TRY",
          ip: "127.0.0.1",
        },
        async (err: Error | null, result: Record<string, unknown>) => {
          if (err || result.status !== "success") {
            resolve(NextResponse.json({ error: "İade başarısız" }, { status: 500 }));
            return;
          }
          await (supabase.from("rentals").update({ status: "completed" } as never).eq("id", rentalId) as any);
          resolve(NextResponse.json({ success: true }));
        }
      );
    });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
