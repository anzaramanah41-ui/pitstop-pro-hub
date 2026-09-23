/**
 * AppBenk — WhatsApp Notification Service
 *
 * Mendukung provider WA Gateway lokal Indonesia:
 *  - Wablas (wablas.com)
 *  - WA.me Gateway
 *  - Fonnte (fonnte.com)
 *  - Custom REST gateway lainnya
 *
 * Konfigurasi disimpan di localStorage bengkel dan bisa diubah
 * oleh admin dari halaman Pengaturan.
 */

export type WAProvider = "wablas" | "fonnte" | "twilio" | "manual";

export type WAConfig = {
  provider: WAProvider;
  /** Token / API key dari provider */
  token: string;
  /** Base URL gateway (diperlukan untuk provider kustom) */
  gatewayUrl?: string | undefined;
  /** Nomor WA bisnis pengirim (format: 628xxxxxxxx) */
  senderNumber?: string | undefined;
  /** Twilio Account SID (khusus provider twilio) */
  twilioAccountSid?: string | undefined;
  /** Twilio Auth Token (khusus provider twilio) */
  twilioAuthToken?: string | undefined;
  /** Twilio WhatsApp Sender Number (format: whatsapp:+14155238886) */
  twilioFrom?: string | undefined;
  /** Apakah fitur WA aktif */
  enabled: boolean;
};

const WA_CONFIG_KEY = "appbenk_wa_config";

export function getWAConfig(): WAConfig | null {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(WA_CONFIG_KEY) : null;
    if (raw) return JSON.parse(raw) as WAConfig;
  } catch {
    return null;
  }

  // Fallback ke environment variables jika ada konfigurasi Twilio di .env
  const twilioSid = ((import.meta as any).env?.VITE_TWILIO_ACCOUNT_SID as string) || "";
  const twilioToken = ((import.meta as any).env?.VITE_TWILIO_AUTH_TOKEN as string) || "";
  const twilioFrom = ((import.meta as any).env?.VITE_TWILIO_WHATSAPP_FROM as string) || "";

  if (twilioSid && twilioToken) {
    return {
      provider: "twilio",
      token: twilioToken,
      twilioAccountSid: twilioSid,
      twilioAuthToken: twilioToken,
      twilioFrom: twilioFrom || "whatsapp:+14155238886",
      enabled: true,
    };
  }

  return null;
}

export function saveWAConfig(config: WAConfig): void {
  localStorage.setItem(WA_CONFIG_KEY, JSON.stringify(config));
}

/**
 * Format nomor telepon Indonesia ke format internasional (628xxxxxxxx)
 */
export function formatNomorWA(nomor: string): string {
  const cleaned = nomor.replace(/\D/g, "");
  if (cleaned.startsWith("62")) return cleaned;
  if (cleaned.startsWith("0")) return "62" + cleaned.slice(1);
  if (cleaned.startsWith("8")) return "62" + cleaned;
  return cleaned;
}

/** Template pesan WA yang akan dikirim */
export type WAMessageType =
  | "booking_confirmed"
  | "booking_rejected"
  | "service_started"
  | "service_done"
  | "payment_due"
  | "payment_received"
  | "service_reminder";

export type WAMessageData = {
  namaPelanggan: string;
  namaKendaraan?: string;
  platNomor?: string;
  namaBengkel?: string;
  tanggalBooking?: string;
  namaTeknisi?: string;
  totalTagihan?: number;
  nomorTransaksi?: string;
  linkPembayaran?: string;
  bulanTerakhirServis?: string;
  alasanPenolakan?: string;
};

function rupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export function buildPesan(type: WAMessageType, data: WAMessageData): string {
  const nama = data.namaPelanggan || "Pelanggan";
  const bengkel = data.namaBengkel || "Bengkel";
  const kendaraan = data.namaKendaraan ? `${data.namaKendaraan}` : "kendaraan Anda";
  const plat = data.platNomor ? ` (${data.platNomor})` : "";

  const templates: Record<WAMessageType, string> = {
    booking_confirmed:
      `Halo ${nama} 👋\n\n` +
      `✅ *Booking Servis Diterima!*\n\n` +
      `🚗 Kendaraan: ${kendaraan}${plat}\n` +
      `📅 Jadwal: ${data.tanggalBooking || "-"}\n` +
      `🏪 Bengkel: ${bengkel}\n\n` +
      `bookingan diterima silahkan datang ke bengkel.\n\n` +
      `_Terima kasih telah memilih ${bengkel}_ 🙏`,

    booking_rejected:
      `Halo ${nama} 👋\n\n` +
      `❌ *Status Booking Servis*\n\n` +
      `🚗 Kendaraan: ${kendaraan}${plat}\n` +
      `📅 Jadwal: ${data.tanggalBooking || "-"}\n` +
      `🏪 Bengkel: ${bengkel}\n\n` +
      `Alasan Penolakan: ${data.alasanPenolakan || "Mohon maaf, booking belum dapat diterima saat ini."}\n\n` +
      `_Silakan ajukan jadwal lain atau hubungi customer service kami_ 🙏`,

    service_started:
      `Halo ${nama} 👋\n\n` +
      `🔧 *Servis Kendaraan Dimulai*\n\n` +
      `🚗 ${kendaraan}${plat} sedang ditangani oleh teknisi kami.\n` +
      (data.namaTeknisi ? `👨‍🔧 Teknisi: ${data.namaTeknisi}\n` : "") +
      `\nKami akan menginformasikan Anda segera setelah servis selesai.\n\n` +
      `_${bengkel}_ 🏪`,

    service_done:
      `Halo ${nama} 👋\n\n` +
      `✅ *Servis Kendaraan Selesai!*\n\n` +
      `🚗 ${kendaraan}${plat} sudah selesai diservis dan siap diambil.\n\n` +
      `Silakan ke bengkel untuk mengambil kendaraan Anda.\n\n` +
      `_${bengkel}_ 🏪`,

    payment_due:
      `Halo ${nama} 👋\n\n` +
      `💰 *Tagihan Servis Siap*\n\n` +
      `🚗 Kendaraan: ${kendaraan}${plat}\n` +
      `💵 Total: *${rupiah(data.totalTagihan || 0)}*\n` +
      `🧾 No. Transaksi: ${data.nomorTransaksi || "-"}\n\n` +
      (data.linkPembayaran
        ? `Bayar sekarang: ${data.linkPembayaran}\n\n`
        : "") +
      `Tersedia metode: QRIS, Transfer Bank, dan Tunai.\n\n` +
      `_${bengkel}_ 🏪`,

    payment_received:
      `Halo ${nama} 👋\n\n` +
      `🎉 *Pembayaran Berhasil Diterima!*\n\n` +
      `✅ Pembayaran servis ${kendaraan}${plat} sebesar *${rupiah(data.totalTagihan || 0)}* telah kami terima.\n` +
      `🧾 No. Transaksi: ${data.nomorTransaksi || "-"}\n\n` +
      `Terima kasih atas kepercayaan Anda! Semoga kendaraan selalu dalam kondisi prima 🚀\n\n` +
      `_${bengkel}_ 🏪`,

    service_reminder:
      `Halo ${nama} 👋\n\n` +
      `🔔 *Waktunya Servis Berkala!*\n\n` +
      `🚗 ${kendaraan}${plat} sudah waktunya untuk servis rutin.\n` +
      (data.bulanTerakhirServis
        ? `📅 Terakhir servis: ${data.bulanTerakhirServis}\n`
        : "") +
      `\nJangan tunda servis berkala untuk menjaga performa kendaraan Anda!\n\n` +
      `Hubungi kami atau booking langsung melalui AppBenk.\n\n` +
      `_${bengkel}_ 🏪`,
  };

  return templates[type];
}

/**
 * Kirim pesan WhatsApp melalui Wablas API
 */
async function kirimViaWablas(
  config: WAConfig,
  nomor: string,
  pesan: string,
): Promise<{ ok: boolean; error?: string }> {
  const url = config.gatewayUrl || "https://jogja.wablas.com/api/send-message";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: config.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: nomor,
        message: pesan,
      }),
    });
    const data = await res.json();
    if (data.status || data.success) return { ok: true };
    return { ok: false, error: data.message || "Gagal kirim pesan" };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/**
 * Kirim pesan WhatsApp melalui Fonnte API
 */
async function kirimViaFonnte(
  config: WAConfig,
  nomor: string,
  pesan: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: config.token,
      },
      body: new URLSearchParams({
        target: nomor,
        message: pesan,
        countryCode: "62",
      }),
    });
    const data = await res.json();
    if (data.status) return { ok: true };
    return { ok: false, error: data.reason || "Gagal kirim pesan" };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/**
 * Kirim pesan WhatsApp melalui Twilio WhatsApp Messages API
 */
async function kirimViaTwilio(
  config: WAConfig,
  nomor: string,
  pesan: string,
): Promise<{ ok: boolean; error?: string }> {
  const accountSid =
    config.twilioAccountSid || ((import.meta as any).env?.VITE_TWILIO_ACCOUNT_SID as string);
  const authToken =
    config.twilioAuthToken || ((import.meta as any).env?.VITE_TWILIO_AUTH_TOKEN as string);
  const fromNum =
    config.twilioFrom ||
    ((import.meta as any).env?.VITE_TWILIO_WHATSAPP_FROM as string) ||
    (config.senderNumber ? `whatsapp:${config.senderNumber}` : "whatsapp:+14155238886");

  if (!accountSid || !authToken) {
    return { ok: false, error: "Twilio Account SID atau Auth Token belum disetel" };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const cleanTo = nomor.startsWith("+") ? nomor : `+${nomor}`;
  const toNum = cleanTo.startsWith("whatsapp:") ? cleanTo : `whatsapp:${cleanTo}`;
  const fromFormatted = fromNum.startsWith("whatsapp:") ? fromNum : `whatsapp:${fromNum}`;

  try {
    const basicAuth = btoa(`${accountSid}:${authToken}`);
    const bodyParams = new URLSearchParams();
    bodyParams.append("To", toNum);
    bodyParams.append("From", fromFormatted);
    bodyParams.append("Body", pesan);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: bodyParams.toString(),
    });

    const data = await res.json();
    if (res.ok && !data.error_code) {
      return { ok: true };
    }
    return { ok: false, error: data.message || `Twilio error: ${data.code || "unknown"}` };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/**
 * Fungsi utama: kirim notifikasi WhatsApp
 * Jika provider manual, buka link wa.me di tab baru
 */
export async function kirimNotifikasiWA(
  nomor: string,
  pesan: string,
  options?: { openManualIfNoConfig?: boolean },
): Promise<{ ok: boolean; error?: string; manual?: boolean }> {
  const nomorFormatted = formatNomorWA(nomor);
  const config = getWAConfig();

  // Jika tidak ada konfigurasi atau provider manual
  if (!config || !config.enabled || config.provider === "manual") {
    if (options?.openManualIfNoConfig) {
      const encodedPesan = encodeURIComponent(pesan);
      window.open(`https://wa.me/${nomorFormatted}?text=${encodedPesan}`, "_blank");
      return { ok: true, manual: true };
    }
    return { ok: false, error: "WhatsApp gateway belum dikonfigurasi" };
  }

  if (config.provider === "twilio") {
    return kirimViaTwilio(config, nomorFormatted, pesan);
  }

  if (config.provider === "wablas") {
    return kirimViaWablas(config, nomorFormatted, pesan);
  }

  if (config.provider === "fonnte") {
    return kirimViaFonnte(config, nomorFormatted, pesan);
  }

  return { ok: false, error: "Provider tidak dikenali" };
}

/**
 * Helper: kirim notifikasi berdasarkan tipe event
 */
export async function notifikasiEvent(
  type: WAMessageType,
  nomorTelepon: string,
  data: WAMessageData,
): Promise<{ ok: boolean; error?: string; manual?: boolean }> {
  const pesan = buildPesan(type, data);
  return kirimNotifikasiWA(nomorTelepon, pesan, { openManualIfNoConfig: true });
}
