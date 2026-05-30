import { NextRequest, NextResponse } from "next/server";
import { getIyzipay } from "@/lib/iyzico/client";
import { createServiceSupabase } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { rentalId } = await request.json();
    if (!rentalId) return NextResponse.json({ error: "rentalId gerekli" }, { status: 400 });

    const supabase = await createServiceSupabase();

    const { data: rental, error } = await (supabase
      .from("rentals")
      .select("*, equipment(*), renter:profiles!renter_id(*)")
      .eq("id", rentalId)
      .single() as any);

    if (error || !rental) return NextResponse.json({ error: "Kiralama bulunamadı" }, { status: 404 });

    const r = rental as {
      renter_id: string;
      rental_amount: number;
      deposit_amount: number;
      renter: { full_name: string; phone?: string };
      equipment: { title: string };
    };

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const totalPrice = String(r.rental_amount + r.deposit_amount);
    const nameParts = r.renter.full_name?.split(" ") || ["Ad", "Soyad"];

    const requestBody = {
      locale: "TR",
      conversationId: rentalId,
      price: totalPrice,
      paidPrice: totalPrice,
      currency: "TRY",
      basketId: rentalId,
      paymentGroup: "PRODUCT",
      callbackUrl: `${siteUrl}/api/payment/callback`,
      enabledInstallments: [1, 2, 3],
      buyer: {
        id: r.renter_id,
        name: nameParts[0] || "Ad",
        surname: nameParts.slice(1).join(" ") || "Soyad",
        gsmNumber: r.renter.phone ? `+90${r.renter.phone}` : "+905000000000",
        email: `${r.renter_id}@yukluk.com`,
        identityNumber: "11111111111",
        registrationAddress: "İstanbul",
        ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
        city: "İstanbul",
        country: "Türkiye",
      },
      shippingAddress: {
        contactName: r.renter.full_name || "Kullanıcı",
        city: "İstanbul",
        country: "Türkiye",
        address: "İstanbul",
        zipCode: "34000",
      },
      billingAddress: {
        contactName: r.renter.full_name || "Kullanıcı",
        city: "İstanbul",
        country: "Türkiye",
        address: "İstanbul",
        zipCode: "34000",
      },
      basketItems: [
        {
          id: "rental",
          name: r.equipment.title || "Ekipman Kiralama",
          category1: "Outdoor",
          itemType: "PHYSICAL",
          price: String(r.rental_amount),
        },
        {
          id: "deposit",
          name: "Depozito",
          category1: "Outdoor",
          itemType: "PHYSICAL",
          price: String(r.deposit_amount),
        },
      ],
    };

    return new Promise<NextResponse>((resolve) => {
      (getIyzipay().checkoutFormInitialize.create as Function)(requestBody, (err: Error | null, result: Record<string, unknown>) => {
        if (err || result.status !== "success") {
          resolve(NextResponse.json({ error: "Ödeme başlatılamadı", detail: result?.errorMessage }, { status: 500 }));
        } else {
          resolve(NextResponse.json({ checkoutFormContent: result.checkoutFormContent, token: result.token }));
        }
      });
    });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
