import Iyzipay from "iyzipay";

let _iyzipay: Iyzipay | null = null;

export function getIyzipay(): Iyzipay {
  if (!_iyzipay) {
    _iyzipay = new Iyzipay({
      apiKey: process.env.IYZICO_API_KEY || "sandbox-key",
      secretKey: process.env.IYZICO_SECRET_KEY || "sandbox-secret",
      uri: process.env.IYZICO_BASE_URL || "https://sandbox.iyzipay.com",
    });
  }
  return _iyzipay;
}
