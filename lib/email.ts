import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const ADMIN_IBAN = process.env.ADMIN_IBAN!;
const ADMIN_IBAN_NAME = process.env.ADMIN_IBAN_NAME || "Yüklük";
const FROM = "Yüklük <onboarding@resend.dev>";

function formatPrice(n: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 0 }).format(n);
}

// Kullanıcıya ödeme talimatı
export async function sendPaymentInstructionEmail(params: {
  toEmail: string;
  toName: string;
  rentalId: string;
  equipmentTitle: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  rentalAmount: number;
  depositAmount: number;
}) {
  const total = params.rentalAmount + params.depositAmount;
  const ref = params.rentalId.slice(0, 8).toUpperCase();

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#FAFAF5;">
      <div style="background:#1B4332;padding:24px;border-radius:12px;text-align:center;margin-bottom:24px;">
        <h1 style="color:#FAFAF5;font-size:24px;margin:0;">🎒 Yüklük</h1>
        <p style="color:#FAFAF5;opacity:0.7;margin:8px 0 0;">Sırtına yükle, doğaya çık.</p>
      </div>

      <h2 style="color:#1A1A18;font-size:20px;">Rezervasyonunuz Alındı!</h2>
      <p style="color:#8B8680;">Merhaba ${params.toName},</p>
      <p style="color:#8B8680;">
        <strong>${params.equipmentTitle}</strong> için rezervasyon talebiniz oluşturuldu.
        Ödemenizi aşağıdaki bilgilere göre yapınca rezervasyonunuzu onaylıyoruz.
      </p>

      <div style="background:white;border-radius:12px;padding:20px;margin:20px 0;border:1px solid #F0EFE8;">
        <h3 style="color:#1A1A18;margin:0 0 16px;">📋 Rezervasyon Detayı</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="color:#8B8680;padding:6px 0;">Ekipman</td><td style="color:#1A1A18;font-weight:bold;text-align:right;">${params.equipmentTitle}</td></tr>
          <tr><td style="color:#8B8680;padding:6px 0;">Tarih</td><td style="color:#1A1A18;text-align:right;">${params.startDate} → ${params.endDate}</td></tr>
          <tr><td style="color:#8B8680;padding:6px 0;">Süre</td><td style="color:#1A1A18;text-align:right;">${params.totalDays} gün</td></tr>
          <tr><td style="color:#8B8680;padding:6px 0;">Kira</td><td style="color:#1A1A18;text-align:right;">${formatPrice(params.rentalAmount)}</td></tr>
          <tr><td style="color:#8B8680;padding:6px 0;">Depozito</td><td style="color:#1A1A18;text-align:right;">${formatPrice(params.depositAmount)}</td></tr>
          <tr style="border-top:1px solid #F0EFE8;">
            <td style="color:#1A1A18;font-weight:bold;padding:12px 0 6px;font-size:16px;">TOPLAM</td>
            <td style="color:#F97316;font-weight:bold;text-align:right;font-size:20px;">${formatPrice(total)}</td>
          </tr>
        </table>
      </div>

      <div style="background:#1B4332;border-radius:12px;padding:20px;margin:20px 0;color:white;">
        <h3 style="margin:0 0 16px;font-size:16px;">💳 Ödeme Bilgileri</h3>
        <p style="margin:6px 0;font-size:14px;opacity:0.8;">Ad Soyad</p>
        <p style="margin:0 0 12px;font-size:16px;font-weight:bold;">${ADMIN_IBAN_NAME}</p>
        <p style="margin:6px 0;font-size:14px;opacity:0.8;">IBAN</p>
        <p style="margin:0 0 12px;font-size:16px;font-weight:bold;letter-spacing:1px;">${ADMIN_IBAN}</p>
        <p style="margin:6px 0;font-size:14px;opacity:0.8;">Açıklama (Zorunlu)</p>
        <p style="margin:0;font-size:18px;font-weight:bold;color:#F97316;">YUKLUK-${ref}</p>
      </div>

      <div style="background:#FFF7ED;border-radius:12px;padding:16px;margin:20px 0;border-left:4px solid #F97316;">
        <p style="margin:0;color:#92400E;font-size:14px;">
          ⚠️ <strong>Önemli:</strong> Transfer açıklamasına mutlaka <strong>YUKLUK-${ref}</strong> yazın.
          Ödeme doğrulandıktan sonra (genellikle 1-2 saat içinde) onay maili alacaksınız.
        </p>
      </div>

      <p style="color:#8B8680;font-size:12px;text-align:center;margin-top:32px;">
        Sorularınız için: <a href="mailto:${ADMIN_EMAIL}" style="color:#1B4332;">${ADMIN_EMAIL}</a><br>
        © 2025 Yüklük — Sırtına yükle, doğaya çık.
      </p>
    </div>
  `;

  return resend.emails.send({
    from: FROM,
    to: params.toEmail,
    subject: `Rezervasyon Ödeme Talimatı — YUKLUK-${ref}`,
    html,
  });
}

// Admin'e yeni rezervasyon bildirimi
export async function sendAdminNotificationEmail(params: {
  rentalId: string;
  renterEmail: string;
  renterName: string;
  equipmentTitle: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
}) {
  const ref = params.rentalId.slice(0, 8).toUpperCase();

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
      <h2 style="color:#1B4332;">🔔 Yeni Rezervasyon — YUKLUK-${ref}</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="color:#666;padding:8px 0;border-bottom:1px solid #eee;">Kullanıcı</td><td style="font-weight:bold;text-align:right;">${params.renterName} (${params.renterEmail})</td></tr>
        <tr><td style="color:#666;padding:8px 0;border-bottom:1px solid #eee;">Ekipman</td><td style="font-weight:bold;text-align:right;">${params.equipmentTitle}</td></tr>
        <tr><td style="color:#666;padding:8px 0;border-bottom:1px solid #eee;">Tarih</td><td style="font-weight:bold;text-align:right;">${params.startDate} → ${params.endDate}</td></tr>
        <tr><td style="color:#666;padding:8px 0;">Toplam</td><td style="font-weight:bold;text-align:right;color:#F97316;font-size:18px;">${formatPrice(params.totalAmount)}</td></tr>
      </table>
      <p style="color:#666;margin-top:20px;">
        Transfer açıklaması: <strong>YUKLUK-${ref}</strong><br>
        Ödeme gelince <a href="https://supabase.com/dashboard/project/aqmgnfzlfymfqqyucacd/editor" style="color:#1B4332;">Supabase</a>'den onaylayın.
      </p>
    </div>
  `;

  return resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `💰 Yeni Rezervasyon: ${formatPrice(params.totalAmount)} — YUKLUK-${ref}`,
    html,
  });
}

// Kullanıcıya onay maili
export async function sendConfirmationEmail(params: {
  toEmail: string;
  toName: string;
  equipmentTitle: string;
  startDate: string;
  endDate: string;
}) {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#FAFAF5;">
      <div style="background:#1B4332;padding:24px;border-radius:12px;text-align:center;margin-bottom:24px;">
        <h1 style="color:#FAFAF5;font-size:24px;margin:0;">🎒 Yüklük</h1>
      </div>
      <div style="text-align:center;padding:24px;">
        <div style="font-size:48px;margin-bottom:16px;">✅</div>
        <h2 style="color:#1B4332;font-size:22px;">Rezervasyonunuz Onaylandı!</h2>
        <p style="color:#8B8680;">Merhaba ${params.toName},</p>
        <p style="color:#8B8680;">
          <strong>${params.equipmentTitle}</strong> için ödemeniz alındı.
          Ekipmanı <strong>${params.startDate}</strong> tarihinde teslim alabilirsiniz.
        </p>
        <p style="color:#8B8680;">İyi maceralar! 🏔️</p>
      </div>
    </div>
  `;

  return resend.emails.send({
    from: FROM,
    to: params.toEmail,
    subject: `✅ Rezervasyonunuz Onaylandı — ${params.equipmentTitle}`,
    html,
  });
}
