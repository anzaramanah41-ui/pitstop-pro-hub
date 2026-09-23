/**
 * AppBenk — QRIS Display Component
 *
 * Menampilkan QR code QRIS yang dapat discan oleh semua aplikasi
 * pembayaran digital (GoPay, OVO, DANA, ShopeePay, dll.)
 *
 * QR code di-render ke canvas menggunakan library qrcode.
 */
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  generateQRISPayload,
  formatTimer,
  PAYMENT_PROVIDERS,
  type QRISOptions,
} from "@/lib/qris";
import { rupiah } from "@/lib/store";
import { Download, RefreshCw, Shield, Smartphone, QrCode } from "lucide-react";
import { toast } from "sonner";

type Props = {
  options: QRISOptions;
  /** Custom QRIS string (misal dari Midtrans API) */
  qrString?: string;
  /** Durasi timer dalam detik (default: 900 = 15 menit) */
  durasiDetik?: number;
  /** Dipanggil saat waktu habis */
  onExpired?: () => void;
  /** Dipanggil saat user klik "Saya sudah bayar" */
  onCekStatus?: () => void;
  /** Dipanggil saat berhasil dikonfirmasi */
  onSuccess?: (ref: string) => void;
};

export function QRISDisplay({
  options,
  qrString,
  durasiDetik = 900,
  onExpired,
  onCekStatus,
  onSuccess,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timer, setTimer] = useState(durasiDetik);
  const [expired, setExpired] = useState(false);
  const [qrisPayload, setQrisPayload] = useState("");
  const [loading, setLoading] = useState(true);
  const [cekLoading, setCekLoading] = useState(false);

  // Generate QRIS payload
  useEffect(() => {
    let active = true;
    const generateCode = async () => {
      let payload = qrString;
      if (!payload) {
        try {
          const { createMidtransQRISCharge } = await import("@/lib/midtrans");
          const res = await createMidtransQRISCharge({
            orderId: options.transactionRef,
            grossAmount: options.amount,
            customerName: options.merchantName,
          });
          payload = res.qrString;
        } catch {
          payload = generateQRISPayload(options);
        }
      }
      if (!active) return;
      setQrisPayload(payload);

      // Generate QR code menggunakan library qrcode
      import("qrcode")
        .then((QRCode) => {
          if (canvasRef.current && active) {
            QRCode.toCanvas(canvasRef.current, payload, {
              width: 256,
              margin: 2,
              color: {
                dark: "#1a1a2e",
                light: "#ffffff",
              },
              errorCorrectionLevel: "M",
            });
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error("Failed to load qrcode library:", err);
          if (active) setLoading(false);
        });
    };

    generateCode();
    return () => {
      active = false;
    };
  }, [options.transactionRef, options.amount, qrString]);

  // Countdown timer
  useEffect(() => {
    if (expired) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setExpired(true);
          onExpired?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [expired]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `QRIS-${options.transactionRef}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
    toast.success("QR Code berhasil diunduh!");
  };

  const handleCekStatus = async () => {
    setCekLoading(true);
    try {
      const { checkMidtransStatus } = await import("@/lib/midtrans");
      const statusRes = await checkMidtransStatus(options.transactionRef);
      if (statusRes.isPaid) {
        toast.success("Pembayaran berhasil diverifikasi oleh Midtrans!");
        setCekLoading(false);
        onSuccess?.(options.transactionRef);
        return;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 1200));
    setCekLoading(false);
    onCekStatus?.();
  };

  const timerPersen = (timer / durasiDetik) * 100;
  const timerWarning = timer < 120;

  return (
    <div className="flex flex-col items-center gap-5 py-2">
      {/* Header QRIS */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-blue-600" />
          <span className="text-lg font-bold tracking-tight">QRIS</span>
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs px-2">
            Universal
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Scan dengan semua aplikasi pembayaran digital Indonesia
        </p>
      </div>

      {/* QR Code Container */}
      <div className="relative">
        {/* QRIS Frame Border */}
        <div
          className={`relative p-4 rounded-2xl border-2 shadow-lg transition-all ${
            expired
              ? "border-red-300 bg-red-50 opacity-60"
              : "border-blue-200 bg-white"
          }`}
        >
          {/* Logo QRIS di tengah (overlay) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white rounded-full p-1.5 shadow-sm border border-blue-100">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-black">QR</span>
              </div>
            </div>
          </div>

          {/* Canvas QR Code */}
          <div className="relative">
            {loading && (
              <div className="w-64 h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
              </div>
            )}
            <canvas
              ref={canvasRef}
              className={`rounded-lg ${loading ? "hidden" : "block"} ${expired ? "blur-sm" : ""}`}
            />
            {expired && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-lg">
                <span className="text-red-500 font-bold text-lg">⏰ Kedaluwarsa</span>
                <span className="text-sm text-muted-foreground mt-1">QR Code tidak berlaku</span>
              </div>
            )}
          </div>

          {/* Timer bar */}
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground">Berlaku selama</span>
              <span
                className={`text-sm font-mono font-bold tabular-nums ${
                  timerWarning ? "text-red-500 animate-pulse" : "text-blue-600"
                }`}
              >
                {formatTimer(timer)}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  timerWarning ? "bg-red-500" : "bg-blue-500"
                }`}
                style={{ width: `${timerPersen}%` }}
              />
            </div>
          </div>
        </div>

        {/* Nominal Pembayaran */}
        <div className="mt-3 text-center">
          <p className="text-xs text-muted-foreground">Total Pembayaran</p>
          <p className="text-2xl font-black text-foreground tabular-nums">
            {rupiah(options.amount)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {options.merchantName}
          </p>
        </div>
      </div>

      {/* Provider yang didukung */}
      <div className="w-full">
        <p className="text-xs text-center text-muted-foreground mb-2">Diterima oleh</p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {PAYMENT_PROVIDERS.map((p) => (
            <span
              key={p.nama}
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200 font-medium"
              style={{ borderColor: p.warna + "40" }}
            >
              <span>{p.icon}</span>
              {p.nama}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 w-full">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5"
          onClick={handleDownload}
          disabled={expired || loading}
        >
          <Download className="h-4 w-4" />
          Unduh QR
        </Button>
        <Button
          size="sm"
          className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700"
          onClick={handleCekStatus}
          disabled={expired || cekLoading}
        >
          {cekLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Smartphone className="h-4 w-4" />
          )}
          Sudah Bayar
        </Button>
      </div>

      {/* Petunjuk */}
      <div className="w-full bg-blue-50 rounded-xl p-3 space-y-1.5">
        <p className="text-xs font-semibold text-blue-800 flex items-center gap-1">
          <Smartphone className="h-3.5 w-3.5" />
          Cara Bayar dengan QRIS:
        </p>
        <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
          <li>Buka aplikasi GoPay, OVO, DANA, ShopeePay, atau banking app Anda</li>
          <li>Pilih menu "Scan QR" atau "Bayar"</li>
          <li>Arahkan kamera ke QR Code di atas</li>
          <li>Konfirmasi nominal dan selesaikan pembayaran</li>
          <li>Klik "Sudah Bayar" setelah berhasil</li>
        </ol>
      </div>

      {/* Security badge */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Shield className="h-3.5 w-3.5 text-green-600" />
        <span>Transaksi aman menggunakan standar QRIS Bank Indonesia</span>
      </div>
    </div>
  );
}
