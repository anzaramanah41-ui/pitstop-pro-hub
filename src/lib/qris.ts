/**
 * AppBenk — QRIS Generator
 *
 * Menghasilkan QR code realistis berformat QRIS (Quick Response Code Indonesian Standard)
 * yang kompatibel dengan semua dompet digital: GoPay, OVO, DANA, ShopeePay, LinkAja,
 * serta semua bank yang mendukung QRIS.
 *
 * Format QR Code mengikuti standar EMVCo QRIS yang diterbitkan Bank Indonesia.
 * Dalam mode ini QR dihasilkan secara lokal (tanpa payment gateway asli),
 * sehingga QR bisa ditampilkan tapi belum terhubung ke sistem pembayaran nyata.
 * 
 * Untuk integrasi nyata, ganti fungsi generateQRISPayload dengan memanggil
 * API Midtrans / Xendit / Duitku dan tampilkan QR string yang dikembalikan.
 */

/** Komponen TLV (Tag-Length-Value) sesuai EMVCo */
function tlv(tag: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${tag}${len}${value}`;
}

/** Hitung checksum CRC16-CCITT untuk QRIS */
function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
}

export type QRISOptions = {
  /** Nama merchant / nama bengkel */
  merchantName: string;
  /** Kota merchant */
  merchantCity: string;
  /** NPWP/NMID merchant (bisa dikosongkan untuk demo) */
  merchantId?: string;
  /** Jumlah pembayaran dalam Rupiah */
  amount: number;
  /** Nomor referensi transaksi */
  transactionRef: string;
};

/**
 * Generate string payload QRIS (standar Bank Indonesia / EMVCo)
 * String ini bisa di-encode menjadi QR code yang bisa discan
 * oleh semua dompet digital yang mendukung QRIS.
 */
export function generateQRISPayload(opts: QRISOptions): string {
  const merchantId = opts.merchantId || "ID1023456789101";
  const nmid = `ID.CO.QRIS.WWW${merchantId}`;

  // 00: Payload Format Indicator
  const pfi = tlv("00", "01");

  // 01: Point of Initiation Method (12 = Dynamic/sekali pakai)
  const pim = tlv("01", "12");

  // 26: Merchant Account Information (QRIS)
  const mai26Inner =
    tlv("00", "ID.CO.QRIS.WWW") +
    tlv("01", nmid) +
    tlv("02", "93600911");
  const mai26 = tlv("26", mai26Inner);

  // 51: Merchant Account Information (tambahan)
  const mai51Inner =
    tlv("00", "ID.CO.QRIS.WWW") +
    tlv("01", nmid) +
    tlv("02", "93600911");
  const mai51 = tlv("51", mai51Inner);

  // 52: Merchant Category Code (7549 = bengkel/otomotif)
  const mcc = tlv("52", "7549");

  // 53: Transaction Currency (360 = IDR)
  const currency = tlv("53", "360");

  // 54: Transaction Amount
  const amountStr = Math.round(opts.amount).toString();
  const amount = tlv("54", amountStr);

  // 55: Tip or Convenience Indicator (jika ada)
  // 58: Country Code
  const country = tlv("58", "ID");

  // 59: Merchant Name (max 25 karakter)
  const merchantName = tlv("59", opts.merchantName.slice(0, 25));

  // 60: Merchant City (max 15 karakter)
  const merchantCity = tlv("60", opts.merchantCity.slice(0, 15));

  // 62: Additional Data Field Template
  const referenceId = opts.transactionRef.slice(0, 25);
  const additionalData =
    tlv("05", referenceId) + // Reference Label
    tlv("07", referenceId);  // Terminal Label
  const adf = tlv("62", additionalData);

  // 63: CRC — kalkulasi di akhir
  const payload =
    pfi + pim + mai26 + mai51 + mcc + currency + amount + country + merchantName + merchantCity + adf + "6304";

  const checksum = crc16(payload);
  return payload + checksum;
}

/**
 * Hitung waktu kedaluwarsa QR (dalam milidetik dari sekarang)
 */
export function hitungKedaluwarsa(menitKe: number = 15): Date {
  const d = new Date();
  d.setMinutes(d.getMinutes() + menitKe);
  return d;
}

/**
 * Format timer countdown
 */
export function formatTimer(detik: number): string {
  const m = Math.floor(detik / 60);
  const s = detik % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export type PaymentProvider = {
  nama: string;
  warna: string;
  icon: string; // emoji
};

export const PAYMENT_PROVIDERS: PaymentProvider[] = [
  { nama: "GoPay", warna: "#00AA13", icon: "🟢" },
  { nama: "OVO", warna: "#4C3494", icon: "🟣" },
  { nama: "DANA", warna: "#108EE9", icon: "🔵" },
  { nama: "ShopeePay", warna: "#EE4D2D", icon: "🔴" },
  { nama: "LinkAja", warna: "#E82529", icon: "🔴" },
  { nama: "BCA Mobile", warna: "#003B71", icon: "🏦" },
  { nama: "BRI", warna: "#004C97", icon: "🏦" },
  { nama: "Mandiri", warna: "#003087", icon: "🏦" },
  { nama: "BNI", warna: "#F77F00", icon: "🏦" },
  { nama: "BSI", warna: "#5A8030", icon: "🏦" },
];
