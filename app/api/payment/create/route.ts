import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: NextRequest) {
  try {
    const { rentalId } = await request.json();
    if (!rentalId) return NextResponse.json({ error: "rentalId gerekli" }, { status: 400 });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
    );

    const { data: rental } = await (supabase
      .from("rentals")
      .select("*")
      .eq("id", rentalId)
      .single() as any) as { data: { rental_amount: number; deposit_amount: number; start_date: string; end_date: string; equipment_id: string } | null };

    if (!rental) return NextResponse.json({ error: "Kiralama bulunamadı" }, { status: 404 });

    const apiKey = process.env.IYZICO_API_KEY || "";
    const hasRealIyzico = apiKey && !apiKey.includes("sandbox-BIqOc7P6k");

    if (!hasRealIyzico) {
      // TEST MODU: Ödemeyi simüle et, direkt onay sayfası göster
      return NextResponse.json({
        testMode: true,
        rentalId,
        message: "Test modu: Ödeme simüle edildi",
      });
    }

    // Gerçek İyzico entegrasyonu
    const { getIyzipay } = await import("@/lib/iyzico/client");
    const iyzipay = getIyzipay();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yukluk.vercel.app";
    const totalPrice = String(rental.rental_amount + rental.deposit_amount);

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
        id: rentalId,
        name: "Kullanici",
        surname: "Yukluk",
        gsmNumber: "+905000000000",
        email: `user@yukluk.com`,
        identityNumber: "11111111111",
        registrationAddress: "İstanbul",
        ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
        city: "İstanbul",
        country: "Türkiye",
      },
      shippingAddress: { contactName: "Kullanici Yukluk", city: "İstanbul", country: "Türkiye", address: "İstanbul", zipCode: "34000" },
      billingAddress: { contactName: "Kullanici Yukluk", city: "İstanbul", country: "Türkiye", address: "İstanbul", zipCode: "34000" },
      basketItems: [
        { id: "rental", name: "Ekipman Kiralama", category1: "Outdoor", itemType: "PHYSICAL", price: String(rental.rental_amount) },
        { id: "deposit", name: "Depozito", category1: "Outdoor", itemType: "PHYSICAL", price: String(rental.deposit_amount) },
      ],
    };

    return new Promise<NextResponse>((resolve) => {
      (iyzipay.checkoutFormInitialize.create as Function)(requestBody, (err: Error | null, result: Record<string, unknown>) => {
        if (err || result.status !== "success") {
          resolve(NextResponse.json({ error: "Ödeme başlatılamadı", detail: result?.errorMessage }, { status: 500 }));
        } else {
          resolve(NextResponse.json({ checkoutFormContent: result.checkoutFormContent, token: result.token }));
        }
      });
    });
  } catch (err) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
