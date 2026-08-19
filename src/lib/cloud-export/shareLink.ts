import QRCode from "qrcode";

export function buildShareUrl(token: string): string {
  return `https://expense-tracker.demo/shared/${token}`;
}

export function generateToken(): string {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
}

export async function generateQrCodeDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    width: 176,
    margin: 1,
    color: { dark: "#1e1b4b", light: "#ffffff" },
  });
}

export function computeExpiry(days: number | null): string | null {
  if (days === null) return null;
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  return expires.toISOString();
}
