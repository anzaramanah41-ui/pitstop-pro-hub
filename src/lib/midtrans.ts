/**
 * AppBenk — Midtrans QRIS Payment Gateway Service
 *
 * Mengintegrasikan pembayaran QRIS digital menggunakan Midtrans Core API.
 * QRIS yang dihasilkan dapat dipindai oleh semua aplikasi pembayaran digital:
 * GoPay, OVO, DANA, ShopeePay, LinkAja, BCA Mobile, Livin Mandiri, BRImo, dll.
 *
 * Dilengkapi pengecekan status transaksi real-time dan fallback offline-safe.
 */

import { generateQRISPayload, type QRISOptions } from "./qris";

export type MidtransConfig = {
  enabled: boolean;
  isProduction: boolean;
  serverKey: string;
  clientKey: string;
  merchantId?: string;
};

const MIDTRANS_CONFIG_KEY = "appbenk_midtrans_config";

export function getMidtransConfig(): MidtransConfig {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(MIDTRANS_CONFIG_KEY) : null;
    if (raw) {
      return JSON.parse(raw) as MidtransConfig;
    }
  } catch {}

  const envServerKey = ((import.meta as any).env?.VITE_MIDTRANS_SERVER_KEY as string) || "";
  const envClientKey = ((import.meta as any).env?.VITE_MIDTRANS_CLIENT_KEY as string) || "";
  const envIsProd = ((import.meta as any).env?.VITE_MIDTRANS_IS_PRODUCTION as string) === "true";

  return {
    enabled: Boolean(envServerKey || envClientKey),
    isProduction: envIsProd,
    serverKey: envServerKey,
    clientKey: envClientKey,
    merchantId: "ID1023456789101",
  };
}

export function saveMidtransConfig(config: MidtransConfig): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(MIDTRANS_CONFIG_KEY, JSON.stringify(config));
  }
}

export type MidtransQRISResult = {
  ok: boolean;
  qrString: string;
  transactionId?: string;
  orderId: string;
  grossAmount: number;
  isSimulated?: boolean;
  error?: string;
};

/**
 * Buat tagihan QRIS melalui Midtrans Core API (/v2/charge).
 * Jika Server Key belum disetel atau API gagal dijangkau, otomatis fallback
 * ke QRIS EMVCo Bank Indonesia lokal agar aplikasi tetap selalu berfungsi.
 */
export async function createMidtransQRISCharge(params: {
  orderId: string;
  grossAmount: number;
  customerName?: string;
  email?: string;
  phone?: string;
  itemName?: string;
}): Promise<MidtransQRISResult> {
  const config = getMidtransConfig();
  const amount = Math.round(params.grossAmount);

  // Jika Server Key tersedia dan fitur aktif, panggil Midtrans Core API
  if (config.enabled && config.serverKey) {
    const baseUrl = config.isProduction
      ? "https://api.midtrans.com/v2/charge"
      : "https://api.sandbox.midtrans.com/v2/charge";

    try {
      const basicAuth = btoa(`${config.serverKey}:`);
      const res = await fetch(baseUrl, {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          payment_type: "qris",
          transaction_details: {
            order_id: params.orderId,
            gross_amount: amount,
          },
          qris: {
            acquirer: "gopay",
          },
          customer_details: {
            first_name: params.customerName || "Pelanggan AppBenk",
            email: params.email || undefined,
            phone: params.phone || undefined,
          },
          item_details: [
            {
              id: params.orderId,
              price: amount,
              quantity: 1,
              name: (params.itemName || "Servis Kendaraan AppBenk").slice(0, 50),
            },
          ],
        }),
      });

      const data = await res.json();
      if (res.ok && data.qr_string) {
        return {
          ok: true,
          qrString: data.qr_string,
          transactionId: data.transaction_id,
          orderId: params.orderId,
          grossAmount: amount,
          isSimulated: false,
        };
      }
    } catch (err) {
      console.warn("Midtrans API call error, fallback to local QRIS:", err);
    }
  }

  // Fallback offline / standard QRIS generator
  const fallbackOpts: QRISOptions = {
    merchantName: "AppBenk Bengkel",
    merchantCity: "Yogyakarta",
    amount,
    transactionRef: params.orderId,
  };
  const payload = generateQRISPayload(fallbackOpts);

  return {
    ok: true,
    qrString: payload,
    orderId: params.orderId,
    grossAmount: amount,
    isSimulated: true,
  };
}

/**
 * Periksa status transaksi Midtrans (/v2/:order_id/status).
 * Menentukan apakah pembayaran sudah diselesaikan (settlement/capture)
 * oleh pelanggan melalui GoPay, OVO, DANA, ShopeePay, atau Bank.
 */
export async function checkMidtransStatus(orderId: string): Promise<{
  ok: boolean;
  status: "settlement" | "pending" | "expire" | "cancel" | "not_found";
  isPaid: boolean;
  transactionTime?: string;
  raw?: any;
}> {
  const config = getMidtransConfig();
  if (!config.serverKey) {
    return {
      ok: true,
      status: "pending",
      isPaid: false,
    };
  }

  const baseUrl = config.isProduction
    ? `https://api.midtrans.com/v2/${orderId}/status`
    : `https://api.sandbox.midtrans.com/v2/${orderId}/status`;

  try {
    const basicAuth = btoa(`${config.serverKey}:`);
    const res = await fetch(baseUrl, {
      method: "GET",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        Accept: "application/json",
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return { ok: false, status: "not_found", isPaid: false, raw: data };
    }

    const txStatus = data.transaction_status as string;
    const isPaid = txStatus === "settlement" || txStatus === "capture";

    return {
      ok: true,
      status: isPaid ? "settlement" : (txStatus as any) || "pending",
      isPaid,
      transactionTime: data.transaction_time,
      raw: data,
    };
  } catch (err) {
    return {
      ok: false,
      status: "not_found",
      isPaid: false,
      raw: err,
    };
  }
}
