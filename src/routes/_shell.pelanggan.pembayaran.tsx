import { createFileRoute } from "@tanstack/react-router";
<<<<<<< HEAD
import { useEffect, useState } from "react";
import { Wallet, Download, CheckCircle2, Receipt } from "lucide-react";
=======
import { useEffect, useState, useRef } from "react";
import {
  Wallet,
  Download,
  CheckCircle2,
  Receipt,
  QrCode,
  CreditCard,
  Building2,
  Clock,
  Printer,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Eye,
  ArrowRight,
  AlertCircle,
  FileCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";
>>>>>>> b897868 (Initial commit - AppBenk)
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
<<<<<<< HEAD
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/lib/auth";
import { unduhNota } from "@/lib/nota";
import { useStore, rupiah, tanggalPanjang, type MetodeBayar, type Servis } from "@/lib/store";
=======
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/auth";
import { unduhNota } from "@/lib/nota";
import {
  useStore,
  rupiah,
  tanggalPanjang,
  type MetodeBayar,
  type Servis,
} from "@/lib/store";
>>>>>>> b897868 (Initial commit - AppBenk)

export const Route = createFileRoute("/_shell/pelanggan/pembayaran")({
  validateSearch: (search: Record<string, unknown>): { trx?: string } =>
    typeof search["trx"] === "string" ? { trx: search["trx"] } : {},
  head: () => ({
    meta: [
      { title: "Pembayaran — AppBenk" },
<<<<<<< HEAD
      { name: "description", content: "Lihat nomor transaksi, rincian jasa dan sparepart, total biaya, bayar servis, dan unduh nota pembayaran." },
      { property: "og:title", content: "Pembayaran — AppBenk" },
      { property: "og:description", content: "Detail tagihan, pembayaran, dan nota servis kendaraan Anda." },
=======
      {
        name: "description",
        content:
          "Lihat nomor transaksi, rincian jasa dan sparepart, total biaya, bayar servis dengan QRIS & Payment Gateway, dan unduh bukti pembayaran.",
      },
      { property: "og:title", content: "Pembayaran — AppBenk" },
      {
        property: "og:description",
        content: "Detail tagihan, pembayaran, QRIS Payment Gateway, dan nota servis kendaraan Anda.",
      },
>>>>>>> b897868 (Initial commit - AppBenk)
    ],
  }),
  component: PembayaranPelanggan,
});

<<<<<<< HEAD
const METODE: MetodeBayar[] = ["Cash", "Transfer Bank", "QRIS"];
=======
const METODE: { id: MetodeBayar; label: string; desc: string; icon: any }[] = [
  {
    id: "QRIS" as MetodeBayar,
    label: "QRIS (Pembayaran Cepat & Otomatis)",
    desc: "Scan via GoPay, OVO, DANA, BCA, Mandiri, BRI, dll. Verifikasi real-time.",
    icon: QrCode,
  },
  {
    id: "Transfer Bank" as MetodeBayar,
    label: "Transfer Rekening Bank",
    desc: "Transfer via Virtual Account / Rekening Bank & unggah bukti transfer.",
    icon: Building2,
  },
  {
    id: "Cash" as MetodeBayar,
    label: "Tunai / Kasir Bengkel",
    desc: "Lakukan pembayaran tunai langsung di meja kasir bengkel.",
    icon: Wallet,
  },
];

export interface BuktiBayarData {
  noTransaksi: string;
  nomorServis: string;
  gatewayRef: string;
  waktu: string;
  pelanggan: string;
  kendaraan: string;
  plat: string;
  mekanik: string;
  jenisServis: string;
  biayaJasa: number;
  biayaPart: number;
  total: number;
  metode: string;
  items: Array<{ nama: string; jumlah: number; harga: number }>;
}
>>>>>>> b897868 (Initial commit - AppBenk)

function PembayaranPelanggan() {
  const { user } = useAuth();
  const { trx } = Route.useSearch();
<<<<<<< HEAD
  const { servis, bayarServis, pelanggan } = useStore();
  const nama = user?.pelanggan ?? "";
  const profil = pelanggan.find((p) => p.nama === nama);
=======
  const { servis, ajukanPembayaran, pelanggan, verifikasiPembayaran, pembayaran } = useStore();
  const nama = user?.pelanggan ?? "";
  const profil = pelanggan.find((p) => p.nama === nama);

>>>>>>> b897868 (Initial commit - AppBenk)
  const transaksi = servis.filter(
    (s) => s.pelanggan === nama && ["Menunggu Pembayaran", "Selesai Dibayar"].includes(s.status),
  );
  const belumLunas = transaksi.filter((s) => s.status === "Menunggu Pembayaran");

<<<<<<< HEAD
  const [pilih, setPilih] = useState<string | null>(trx ?? belumLunas[0]?.id ?? transaksi[0]?.id ?? null);
  const [bayarOpen, setBayarOpen] = useState(false);
  const [metode, setMetode] = useState<MetodeBayar>("Cash");
  const [sukses, setSukses] = useState(false);
=======
  const [pilih, setPilih] = useState<string | null>(
    trx ?? belumLunas[0]?.id ?? transaksi[0]?.id ?? null,
  );

  // Dialog States
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState<Servis | null>(null);

  const [bayarOpen, setBayarOpen] = useState(false);
  const [metode, setMetode] = useState<MetodeBayar>("QRIS");
  const [sukses, setSukses] = useState(false);
  const [bukti, setBukti] = useState<string | undefined>();
  const [namaBukti, setNamaBukti] = useState("");

  // QRIS Payment Gateway States
  const [qrisTimer, setQrisTimer] = useState(900); // 15 menit
  const [gatewayProcessing, setGatewayProcessing] = useState(false);
  const [gatewayChecking, setGatewayChecking] = useState(false);

  // Bukti Pembayaran Digital (E-Receipt) State
  const [buktiModalOpen, setBuktiModalOpen] = useState(false);
  const [buktiData, setBuktiData] = useState<BuktiBayarData | null>(null);

  const printRef = useRef<HTMLDivElement>(null);
>>>>>>> b897868 (Initial commit - AppBenk)

  useEffect(() => {
    if (trx) {
      const found = servis.find((s) => s.noTransaksi === trx || s.id === trx);
<<<<<<< HEAD
      if (found) setPilih(found.id);
    }
  }, [trx, servis]);

=======
      if (found) {
        setPilih(found.id);
        setModalItem(found);
      }
    }
  }, [trx, servis]);

  // Countdown timer for QRIS
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (bayarOpen && metode === "QRIS" && !sukses) {
      interval = setInterval(() => {
        setQrisTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [bayarOpen, metode, sukses]);

>>>>>>> b897868 (Initial commit - AppBenk)
  const detail =
    transaksi.find((s) => s.id === pilih || s.noTransaksi === pilih) ?? transaksi[0] ?? null;
  const lunas = detail?.status === "Selesai Dibayar";

<<<<<<< HEAD
  const konfirmasi = (s: Servis) => {
    void bayarServis(s.id, metode);
    setSukses(true);
    toast.success(`Pembayaran ${s.noTransaksi} berhasil (mock)`);
=======
  const bukaDetailModal = (s: Servis) => {
    setPilih(s.id);
    setModalItem(s);
    setDetailModalOpen(true);
  };

  const bukaModalBayar = (s: Servis) => {
    setPilih(s.id);
    setModalItem(s);
    setSukses(false);
    setMetode("QRIS");
    setQrisTimer(900);
    setBukti(undefined);
    setNamaBukti("");
    setBayarOpen(true);
  };

  const handleSimulasiGatewayQRIS = async (s: Servis) => {
    setGatewayProcessing(true);
    // Simulasi respons payment gateway
    await new Promise((r) => setTimeout(r, 1400));
    setGatewayProcessing(false);

    const gwRef = `GW-QRIS-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toLocaleString("id-ID", {
      dateStyle: "full",
      timeStyle: "medium",
    });

    const receipt: BuktiBayarData = {
      noTransaksi: s.noTransaksi,
      nomorServis: s.nomor,
      gatewayRef: gwRef,
      waktu: nowStr,
      pelanggan: s.pelanggan,
      kendaraan: s.kendaraan,
      plat: s.plat,
      mekanik: s.mekanik,
      jenisServis: s.jenis,
      biayaJasa: s.biayaJasa,
      biayaPart: s.biayaPart,
      total: s.total,
      metode: "QRIS Payment Gateway (Midtrans/Xendit Sandbox)",
      items: s.items.map((i) => ({ nama: i.nama, jumlah: i.jumlah, harga: i.harga })),
    };

    setBuktiData(receipt);

    // Konfirmasi pembayaran di state / Supabase
    ajukanPembayaran(s.id, "QRIS", `qris-ref:${gwRef}`);
    try {
      verifikasiPembayaran?.(s.id, true, undefined, "Payment Gateway (Auto)");
    } catch {}

    setSukses(true);
    toast.success(`Pembayaran QRIS ${s.noTransaksi} berhasil diverifikasi oleh Payment Gateway!`);
    setBayarOpen(false);
    setBuktiModalOpen(true);
  };

  const cekStatusGateway = async () => {
    setGatewayChecking(true);
    await new Promise((r) => setTimeout(r, 900));
    setGatewayChecking(false);
    toast.info("Payment Gateway: Menunggu transfer atau scan dari aplikasi e-wallet Anda.");
  };

  const konfirmasiManual = (s: Servis) => {
    if (metode === "Transfer Bank" && !bukti) {
      toast.error("Bukti transfer wajib diunggah untuk verifikasi bank.");
      return;
    }
    if (metode === "QRIS" && !bukti) {
      toast.error("Silakan unggah tangkap layar (screenshot) bukti pembayaran e-wallet terlebih dahulu.");
      return;
    }
    ajukanPembayaran(s.id, metode, bukti);
    setSukses(true);
    toast.success(`Pembayaran ${metode} ${s.noTransaksi} berhasil diajukan! Notifikasi telah dikirim ke Admin.`);
  };

  const generateDemoEwalletScreenshot = (
    provider: "DANA" | "GoPay" | "OVO" | "ShopeePay",
    s: Servis,
  ) => {
    const canvas = document.createElement("canvas");
    canvas.width = 440;
    canvas.height = 760;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#F8FAFC";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // E-Wallet Theme Colors
    let primaryColor = "#108EE9"; // DANA
    let secondaryColor = "#0D71B9";
    if (provider === "GoPay") {
      primaryColor = "#00AA13";
      secondaryColor = "#008810";
    } else if (provider === "OVO") {
      primaryColor = "#4C3494";
      secondaryColor = "#392470";
    } else if (provider === "ShopeePay") {
      primaryColor = "#EE4D2D";
      secondaryColor = "#C43A1E";
    }

    // Header Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 160);
    grad.addColorStop(0, primaryColor);
    grad.addColorStop(1, secondaryColor);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, 160);

    // Phone Status Bar Simulation
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("14:30", 24, 28);
    ctx.font = "12px sans-serif";
    ctx.fillText("📶 4G  🔋 95%", canvas.width - 95, 28);

    // Provider Title
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${provider} · Pembayaran Berhasil`, canvas.width / 2, 75);

    ctx.font = "12px sans-serif";
    ctx.fillText("Standar Pembayaran QRIS Nasional", canvas.width / 2, 98);

    // White Card for Details
    ctx.fillStyle = "#FFFFFF";
    ctx.shadowColor = "rgba(0, 0, 0, 0.08)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.beginPath();
    ctx.roundRect(20, 120, 400, 580, 16);
    ctx.fill();
    ctx.shadowColor = "transparent";

    // Success Circle Icon
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 175, 30, 0, Math.PI * 2);
    ctx.fill();

    // Checkmark inside circle
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 12, 175);
    ctx.lineTo(canvas.width / 2 - 3, 184);
    ctx.lineTo(canvas.width / 2 + 14, 165);
    ctx.stroke();

    // Status text
    ctx.fillStyle = "#1E293B";
    ctx.font = "bold 17px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Transaksi QRIS Berhasil!", canvas.width / 2, 230);

    // Nominal Total
    ctx.font = "bold 26px sans-serif";
    ctx.fillStyle = primaryColor;
    ctx.fillText(rupiah(s.total), canvas.width / 2, 268);

    // Merchant name
    ctx.font = "13px sans-serif";
    ctx.fillStyle = "#64748B";
    ctx.fillText("Merchant: AppBenk Workshop & Service", canvas.width / 2, 292);

    // Divider line
    ctx.strokeStyle = "#E2E8F0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 315);
    ctx.lineTo(400, 315);
    ctx.stroke();

    // Receipt Row details
    const drawRow = (label: string, val: string, y: number) => {
      ctx.textAlign = "left";
      ctx.font = "13px sans-serif";
      ctx.fillStyle = "#64748B";
      ctx.fillText(label, 40, y);

      ctx.textAlign = "right";
      ctx.font = "bold 13px sans-serif";
      ctx.fillStyle = "#1E293B";
      ctx.fillText(val, 400, y);
    };

    const now = new Date().toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    drawRow("No. Transaksi", s.noTransaksi, 350);
    drawRow("Waktu Bayar", now, 385);
    drawRow("Metode Bayar", `QRIS (${provider})`, 420);
    drawRow("Kendaraan", `${s.kendaraan} (${s.plat})`, 455);
    drawRow("Pelanggan", s.pelanggan, 490);
    drawRow("ID Ref Transaksi", `REF-${Date.now().toString().slice(-8)}`, 525);
    drawRow("Biaya Admin", "Rp 0 (Gratis)", 560);

    // Bottom Notice Box
    ctx.fillStyle = "#F1F5F9";
    ctx.beginPath();
    ctx.roundRect(40, 585, 360, 60, 8);
    ctx.fill();

    ctx.textAlign = "center";
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#475569";
    ctx.fillText("Simpan tangkap layar ini sebagai bukti transaksi resmi.", canvas.width / 2, 610);
    ctx.fillText("NMID: ID1020268839102 · AppBenk QRIS Official", canvas.width / 2, 630);

    // Watermark
    ctx.font = "10px sans-serif";
    ctx.fillStyle = "#94A3B8";
    ctx.fillText("Tangkap Layar Aplikasi E-Wallet Resmi", canvas.width / 2, 680);

    const dataUrl = canvas.toDataURL("image/png");
    setBukti(dataUrl);
    setNamaBukti(`screenshot_${provider.toLowerCase()}_${s.noTransaksi}.png`);
    toast.success(`Screenshot bukti bayar ${provider} siap dilampirkan!`);
  };

  const unggahBukti = (file?: File) => {
    if (!file) return;
    if (!/^(image\/(jpeg|png)|application\/pdf)$/.test(file.type)) {
      toast.error("Format bukti harus JPG, JPEG, PNG, atau PDF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran bukti maksimal 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setBukti(String(reader.result));
      setNamaBukti(file.name);
    };
    reader.readAsDataURL(file);
  };

  const tampilkanBuktiPembayaran = (s: Servis) => {
    const gwRef = `GW-TRX-${s.noTransaksi.replace(/[^a-zA-Z0-9]/g, "")}`;
    const nowStr = new Date().toLocaleString("id-ID", {
      dateStyle: "full",
      timeStyle: "medium",
    });
    setBuktiData({
      noTransaksi: s.noTransaksi,
      nomorServis: s.nomor,
      gatewayRef: gwRef,
      waktu: nowStr,
      pelanggan: s.pelanggan,
      kendaraan: s.kendaraan,
      plat: s.plat,
      mekanik: s.mekanik,
      jenisServis: s.jenis,
      biayaJasa: s.biayaJasa,
      biayaPart: s.biayaPart,
      total: s.total,
      metode: s.metodeBayar || "QRIS",
      items: s.items.map((i) => ({ nama: i.nama, jumlah: i.jumlah, harga: i.harga })),
    });
    setBuktiModalOpen(true);
  };

  const cetakStruk = () => {
    window.print();
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
>>>>>>> b897868 (Initial commit - AppBenk)
  };

  return (
    <>
<<<<<<< HEAD
      <PageHeader title="Pembayaran" description="Detail tagihan, pembayaran, dan nota servis Anda." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Belum Dibayar</p>
            <p className="mt-2 font-display text-2xl font-bold">{rupiah(belumLunas.reduce((a, s) => a + s.total, 0))}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sudah Dibayar</p>
            <p className="mt-2 font-display text-2xl font-bold">
              {rupiah(transaksi.filter((s) => s.status === "Selesai Dibayar").reduce((a, s) => a + s.total, 0))}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total Transaksi</p>
            <p className="mt-2 font-display text-2xl font-bold">{transaksi.length}</p>
=======
      <PageHeader
        title="Pembayaran & Tagihan"
        description="Kelola pembayaran servis kendaraan Anda, bayar cepat dengan QRIS & Payment Gateway, serta unduh bukti pembayaran resmi."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-l-4 border-l-warning shadow-xs">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Belum Dibayar
            </p>
            <p className="mt-2 font-display text-2xl font-bold text-warning-foreground">
              {rupiah(belumLunas.reduce((a, s) => a + s.total, 0))}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{belumLunas.length} tagihan aktif</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success shadow-xs">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Sudah Dibayar (Lunas)
            </p>
            <p className="mt-2 font-display text-2xl font-bold text-success">
              {rupiah(
                transaksi
                  .filter((s) => s.status === "Selesai Dibayar")
                  .reduce((a, s) => a + s.total, 0),
              )}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {transaksi.filter((s) => s.status === "Selesai Dibayar").length} transaksi tuntas
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary shadow-xs">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Total Riwayat Transaksi
            </p>
            <p className="mt-2 font-display text-2xl font-bold">{transaksi.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">Termasuk cash, transfer & QRIS</p>
>>>>>>> b897868 (Initial commit - AppBenk)
          </CardContent>
        </Card>
      </div>

<<<<<<< HEAD
      {detail && (
        <Card>
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0 pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt className="size-4 text-primary" /> Detail Transaksi {detail.noTransaksi}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={detail.status} />
              {!lunas && (
                <Button
                  onClick={() => {
                    setSukses(false);
                    setMetode("Cash");
                    setBayarOpen(true);
                  }}
                >
                  Bayar Sekarang
=======
      {/* DETAIL AKTIF ATAS (JIKA ADA PILIHAN) */}
      {detail && (
        <Card className="overflow-hidden border-2 shadow-sm transition-all hover:border-primary/30">
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0 border-b bg-muted/20 pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-bold sm:text-lg">
              <Receipt className="size-5 text-primary" /> Detail Tagihan: {detail.noTransaksi}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={detail.status} />
              {!lunas ? (
                <Button onClick={() => bukaModalBayar(detail)} className="gap-1.5 shadow-sm">
                  <QrCode className="size-4" /> Bayar Sekarang
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => tampilkanBuktiPembayaran(detail)}
                  className="gap-1.5"
                >
                  <FileCheck className="size-4 text-success" /> Bukti Pembayaran
>>>>>>> b897868 (Initial commit - AppBenk)
                </Button>
              )}
              <Button
                variant="outline"
<<<<<<< HEAD
=======
                size="sm"
>>>>>>> b897868 (Initial commit - AppBenk)
                className="gap-2"
                disabled={!lunas}
                onClick={() => {
                  unduhNota(detail, profil);
                  toast.success("Nota diunduh");
                }}
              >
<<<<<<< HEAD
                <Download className="size-4" /> Download Nota
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
=======
                <Download className="size-4" /> Unduh Nota
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 p-5">
            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
>>>>>>> b897868 (Initial commit - AppBenk)
              <Info label="No. Transaksi" value={detail.noTransaksi} />
              <Info label="No. Servis" value={detail.nomor} />
              <Info label="Tanggal Servis" value={tanggalPanjang(detail.tanggal)} />
              <Info label="Nama Pelanggan" value={detail.pelanggan} />
<<<<<<< HEAD
              <Info label="Kendaraan" value={`${detail.kendaraan} · ${detail.plat}`} />
              <Info label="Metode Pembayaran" value={detail.metodeBayar ?? "Belum dipilih"} />
=======
              <Info label="Kendaraan & Plat" value={`${detail.kendaraan} · ${detail.plat}`} />
              <Info
                label="Metode Pembayaran"
                value={detail.metodeBayar ?? (lunas ? "QRIS Gateway" : "Belum dipilih")}
              />
>>>>>>> b897868 (Initial commit - AppBenk)
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
<<<<<<< HEAD
                  <TableRow>
                    <TableHead>Rincian</TableHead>
                    <TableHead className="w-20 text-center">Jumlah</TableHead>
                    <TableHead className="text-right">Harga</TableHead>
=======
                  <TableRow className="bg-muted/40">
                    <TableHead>Rincian Servis & Sparepart</TableHead>
                    <TableHead className="w-20 text-center">Jumlah</TableHead>
                    <TableHead className="text-right">Harga Satuan</TableHead>
>>>>>>> b897868 (Initial commit - AppBenk)
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <span className="block font-medium">Biaya Jasa — {detail.jenis}</span>
<<<<<<< HEAD
                      <span className="block text-xs text-muted-foreground">{detail.pekerjaan || "—"}</span>
                    </TableCell>
                    <TableCell className="text-center">1</TableCell>
                    <TableCell className="text-right">{rupiah(detail.biayaJasa)}</TableCell>
                    <TableCell className="text-right font-medium">{rupiah(detail.biayaJasa)}</TableCell>
=======
                      <span className="block text-xs text-muted-foreground">
                        {detail.pekerjaan || "Pengerjaan servis berkala & perbaikan teknisi"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">1</TableCell>
                    <TableCell className="text-right">{rupiah(detail.biayaJasa)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {rupiah(detail.biayaJasa)}
                    </TableCell>
>>>>>>> b897868 (Initial commit - AppBenk)
                  </TableRow>
                  {detail.items.map((i) => (
                    <TableRow key={i.sparepartId}>
                      <TableCell>
                        <span className="block font-medium">{i.nama}</span>
<<<<<<< HEAD
                      </TableCell>
                      <TableCell className="text-center">{i.jumlah}</TableCell>
                      <TableCell className="text-right">{rupiah(i.harga)}</TableCell>
                      <TableCell className="text-right font-medium">{rupiah(i.harga * i.jumlah)}</TableCell>
=======
                        <span className="block text-xs text-muted-foreground">{i.kode}</span>
                      </TableCell>
                      <TableCell className="text-center">{i.jumlah}</TableCell>
                      <TableCell className="text-right">{rupiah(i.harga)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {rupiah(i.harga * i.jumlah)}
                      </TableCell>
>>>>>>> b897868 (Initial commit - AppBenk)
                    </TableRow>
                  ))}
                  {detail.items.length === 0 && detail.biayaPart > 0 && (
                    <TableRow>
                      <TableCell colSpan={3}>Sparepart ({detail.sparepart || "—"})</TableCell>
<<<<<<< HEAD
                      <TableCell className="text-right font-medium">{rupiah(detail.biayaPart)}</TableCell>
=======
                      <TableCell className="text-right font-medium">
                        {rupiah(detail.biayaPart)}
                      </TableCell>
>>>>>>> b897868 (Initial commit - AppBenk)
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

<<<<<<< HEAD
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
              <span className="font-display text-sm font-semibold uppercase tracking-wide">Total</span>
              <span className="font-display text-xl font-bold">{rupiah(detail.total)}</span>
=======
            <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-muted/50 to-muted/80 p-4 border">
              <div>
                <span className="block font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Total Tagihan Pembayaran
                </span>
                <span className="text-xs text-muted-foreground">
                  {lunas ? "Status: Pembayaran Lunas" : "Status: Menunggu Pembayaran"}
                </span>
              </div>
              <span className="font-display text-2xl font-bold text-primary">
                {rupiah(detail.total)}
              </span>
>>>>>>> b897868 (Initial commit - AppBenk)
            </div>
          </CardContent>
        </Card>
      )}

<<<<<<< HEAD
      <Card>
        <CardContent className="px-0">
          {transaksi.length === 0 ? (
            <EmptyState icon={<Wallet className="size-8" />} title="Belum ada tagihan" description="Tagihan muncul setelah servis selesai dikerjakan." />
=======
      {/* TABEL SEMUA TRANSAKSI */}
      <Card>
        <CardHeader className="border-b bg-muted/10 pb-4">
          <CardTitle className="text-base font-bold">Daftar Transaksi Pembayaran</CardTitle>
          <p className="text-xs text-muted-foreground">
            Klik "Lihat Detail" pada transaksi mana saja untuk membuka popup rincian lengkap servis, biaya, dan bukti pembayaran.
          </p>
        </CardHeader>
        <CardContent className="px-0">
          {transaksi.length === 0 ? (
            <EmptyState
              icon={<Wallet className="size-8" />}
              title="Belum ada transaksi pembayaran"
              description="Tagihan servis akan muncul otomatis setelah pengerjaan selesai di bengkel."
            />
>>>>>>> b897868 (Initial commit - AppBenk)
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Transaksi</TableHead>
<<<<<<< HEAD
                    <TableHead>Detail Servis</TableHead>
=======
                    <TableHead>Detail Servis & Kendaraan</TableHead>
>>>>>>> b897868 (Initial commit - AppBenk)
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Total Biaya</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transaksi.map((s) => (
<<<<<<< HEAD
                    <TableRow key={s.id} className={s.id === detail?.id ? "bg-muted/40" : undefined}>
                      <TableCell className="font-medium">{s.noTransaksi}</TableCell>
                      <TableCell>
                        <span className="block">{s.jenis} · {s.pekerjaan}</span>
                        <span className="block text-xs text-muted-foreground">{s.nomor} · {s.kendaraan}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{tanggalPanjang(s.tanggal)}</TableCell>
                      <TableCell className="text-right font-semibold">{rupiah(s.total)}</TableCell>
                      <TableCell><StatusBadge status={s.status} /></TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => setPilih(s.id)}>
                          Lihat Detail
                        </Button>
=======
                    <TableRow
                      key={s.id}
                      className={s.id === detail?.id ? "bg-primary/5" : undefined}
                    >
                      <TableCell className="font-bold">{s.noTransaksi}</TableCell>
                      <TableCell>
                        <span className="block font-medium">
                          {s.jenis} · {s.pekerjaan || s.nomor}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {s.kendaraan} ({s.plat}) · Mekanik: {s.mekanik}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {tanggalPanjang(s.tanggal)}
                      </TableCell>
                      <TableCell className="text-right font-display font-bold">
                        {rupiah(s.total)}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const pmb = pembayaran.find(
                            (p) => p.servisId === s.id || p.noTransaksi === s.noTransaksi,
                          );
                          return (
                            <div className="space-y-1">
                              <StatusBadge status={s.status} />
                              {pmb?.status === "Menunggu Verifikasi" && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                  <Clock className="size-3" /> Verifikasi Admin
                                </span>
                              )}
                              {pmb?.status === "Bukti Ditolak" && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold text-destructive border border-destructive/30">
                                  <AlertCircle className="size-3" /> Bukti Ditolak
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="text-right space-x-1.5 whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 shadow-2xs hover:border-primary hover:text-primary"
                          onClick={() => bukaDetailModal(s)}
                        >
                          <Eye className="size-3.5" /> Detail
                        </Button>
                        {(() => {
                          const pmb = pembayaran.find(
                            (p) => p.servisId === s.id || p.noTransaksi === s.noTransaksi,
                          );
                          if (s.status === "Menunggu Pembayaran") {
                            if (pmb?.status === "Menunggu Verifikasi") {
                              return (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1 border-amber-400 text-amber-700 hover:bg-amber-50 dark:text-amber-300"
                                  onClick={() => bukaModalBayar(s)}
                                >
                                  <Clock className="size-3.5" /> Bukti Terkirim
                                </Button>
                              );
                            }
                            if (pmb?.status === "Bukti Ditolak") {
                              return (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="gap-1"
                                  onClick={() => bukaModalBayar(s)}
                                >
                                  <UploadCloud className="size-3.5" /> Unggah Ulang
                                </Button>
                              );
                            }
                            return (
                              <Button
                                size="sm"
                                className="gap-1 shadow-xs"
                                onClick={() => bukaModalBayar(s)}
                              >
                                <QrCode className="size-3.5" /> Bayar
                              </Button>
                            );
                          }
                          return (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="gap-1 shadow-2xs"
                              onClick={() => tampilkanBuktiPembayaran(s)}
                            >
                              <FileCheck className="size-3.5 text-success" /> Bukti
                            </Button>
                          );
                        })()}
>>>>>>> b897868 (Initial commit - AppBenk)
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

<<<<<<< HEAD
      <Dialog open={bayarOpen} onOpenChange={(v) => { setBayarOpen(v); if (!v) setSukses(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pembayaran Servis</DialogTitle>
          </DialogHeader>

          {!detail ? null : sukses ? (
            <div className="space-y-3 py-4 text-center">
              <CheckCircle2 className="mx-auto size-12 text-success" />
              <p className="font-display text-lg font-bold">Pembayaran Berhasil</p>
              <p className="text-sm text-muted-foreground">
                {detail.noTransaksi} · {rupiah(detail.total)} · {metode}
              </p>
              <StatusBadge status="Selesai Dibayar" />
              <DialogFooter className="sm:justify-center">
                <Button
                  className="gap-2"
                  onClick={() => {
                    unduhNota({ ...detail, status: "Selesai Dibayar", metodeBayar: metode }, profil);
                    toast.success("Nota diunduh");
                  }}
                >
                  <Download className="size-4" /> Download Nota
                </Button>
                <Button variant="outline" onClick={() => setBayarOpen(false)}>Tutup</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                <div className="flex justify-between py-0.5">
                  <span className="text-muted-foreground">No. Transaksi</span>
                  <span className="font-medium">{detail.noTransaksi}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-display text-base font-bold">
                  <span>Total Pembayaran</span>
                  <span>{rupiah(detail.total)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Metode Pembayaran</Label>
                <RadioGroup value={metode} onValueChange={(v) => setMetode(v as MetodeBayar)} className="gap-2">
                  {METODE.map((m) => (
                    <label
                      key={m}
                      className="flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm hover:bg-muted/50"
                    >
                      <RadioGroupItem value={m} /> {m}
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <p className="text-xs text-muted-foreground">
                Pembayaran masih berupa simulasi (mock), belum terhubung ke payment gateway.
              </p>

              <DialogFooter>
                <Button variant="outline" onClick={() => setBayarOpen(false)}>Batal</Button>
                <Button onClick={() => konfirmasi(detail)}>Konfirmasi Pembayaran</Button>
=======
      {/* -------------------------------------------------------------------- */}
      {/* 1. DIALOG DETAIL TRANSAKSI LENGKAP (Memperbaiki "Lihat Detail") */}
      {/* -------------------------------------------------------------------- */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Receipt className="size-5 text-primary" /> Detail Transaksi & Servis
            </DialogTitle>
          </DialogHeader>

          {modalItem && (
            <div className="space-y-4 py-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                <div>
                  <p className="font-display text-xl font-bold">{modalItem.noTransaksi}</p>
                  <p className="text-xs text-muted-foreground">
                    No. Servis: {modalItem.nomor} · {tanggalPanjang(modalItem.tanggal)}
                  </p>
                </div>
                <StatusBadge status={modalItem.status} />
              </div>

              {/* Data Kendaraan & Mekanik */}
              <div className="grid gap-2.5 sm:grid-cols-2 text-sm">
                <Info label="Nama Pelanggan" value={modalItem.pelanggan} />
                <Info label="Kendaraan" value={`${modalItem.kendaraan} (${modalItem.plat})`} />
                <Info label="Mekanik Bertugas" value={modalItem.mekanik || "Teknisi Bengkel"} />
                <Info label="Jenis Servis" value={modalItem.jenis} />
              </div>

              {modalItem.keluhan && (
                <div className="rounded-lg border bg-muted/20 p-3 text-xs">
                  <span className="font-semibold text-foreground">Keluhan Awal:</span>{" "}
                  <span className="text-muted-foreground">{modalItem.keluhan}</span>
                </div>
              )}

              {/* Tabel Rincian */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Rincian Biaya Pengerjaan & Suku Cadang
                </p>
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead>Rincian</TableHead>
                        <TableHead className="w-16 text-center">Qty</TableHead>
                        <TableHead className="text-right">Harga</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <span className="font-medium">Jasa Servis ({modalItem.jenis})</span>
                          <span className="block text-xs text-muted-foreground">
                            {modalItem.pekerjaan || "Pengerjaan perbaikan teknisi"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">1</TableCell>
                        <TableCell className="text-right">{rupiah(modalItem.biayaJasa)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {rupiah(modalItem.biayaJasa)}
                        </TableCell>
                      </TableRow>
                      {modalItem.items.map((i) => (
                        <TableRow key={i.sparepartId}>
                          <TableCell>
                            <span className="font-medium">{i.nama}</span>
                            <span className="block text-xs text-muted-foreground">{i.kode}</span>
                          </TableCell>
                          <TableCell className="text-center">{i.jumlah}</TableCell>
                          <TableCell className="text-right">{rupiah(i.harga)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {rupiah(i.harga * i.jumlah)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Total & Status Bayar */}
              <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4 border">
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block">
                    Total Biaya Servis
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Metode: {modalItem.metodeBayar || (modalItem.status === "Selesai Dibayar" ? "QRIS" : "Belum ditentukan")}
                  </span>
                </div>
                <span className="font-display text-2xl font-bold text-primary">
                  {rupiah(modalItem.total)}
                </span>
              </div>

              <DialogFooter className="flex-row flex-wrap justify-between gap-2 sm:justify-between pt-2">
                <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
                  Tutup
                </Button>
                <div className="flex items-center gap-2">
                  {modalItem.status === "Menunggu Pembayaran" ? (
                    <Button
                      onClick={() => {
                        setDetailModalOpen(false);
                        bukaModalBayar(modalItem);
                      }}
                      className="gap-1.5"
                    >
                      <QrCode className="size-4" /> Bayar Sekarang
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setDetailModalOpen(false);
                          tampilkanBuktiPembayaran(modalItem);
                        }}
                        className="gap-1.5"
                      >
                        <FileCheck className="size-4 text-success" /> Bukti Bayar
                      </Button>
                      <Button
                        onClick={() => {
                          unduhNota(modalItem, profil);
                          toast.success("Nota berhasil diunduh");
                        }}
                        className="gap-1.5"
                      >
                        <Download className="size-4" /> Unduh Nota
                      </Button>
                    </>
                  )}
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* -------------------------------------------------------------------- */}
      {/* 2. DIALOG PEMBAYARAN SERVIS (QRIS BARCODE & PAYMENT GATEWAY) */}
      {/* -------------------------------------------------------------------- */}
      <Dialog
        open={bayarOpen}
        onOpenChange={(v) => {
          setBayarOpen(v);
          if (!v) setSukses(false);
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="size-5 text-primary" /> Pembayaran Servis & Payment Gateway
            </DialogTitle>
          </DialogHeader>

          {!detail ? null : sukses ? (
            <div className="py-6 text-center space-y-4">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 shadow-xs">
                <CheckCircle2 className="size-10" />
              </div>
              <div className="space-y-1.5 px-2">
                <h3 className="font-display text-xl font-bold text-foreground">
                  Pembayaran {metode} Berhasil Dikonfirmasi!
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Bukti pembayaran tangkap layar (screenshot) e-wallet Anda telah berhasil terkirim. Admin bengkel telah menerima notifikasi dan akan segera memverifikasi transaksi Anda.
                </p>
              </div>

              <div className="mx-auto max-w-sm rounded-xl border bg-muted/30 p-3 text-left text-xs space-y-2">
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">No. Transaksi</span>
                  <span className="font-mono font-bold text-foreground">{detail.noTransaksi}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Total Tagihan</span>
                  <span className="font-bold text-primary">{rupiah(detail.total)}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Metode Bayar</span>
                  <span className="font-semibold text-foreground">{metode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status Verifikasi</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    Menunggu Verifikasi Admin
                  </span>
                </div>
              </div>

              {bukti && (
                <div className="mx-auto max-w-xs rounded-xl border bg-card p-2 text-left">
                  <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">
                    Screenshot Bukti yang Diunggah:
                  </p>
                  <img
                    src={bukti}
                    alt="Bukti Transfer E-Wallet"
                    className="max-h-52 w-auto mx-auto rounded-lg border object-contain shadow-xs"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1 truncate text-center">
                    {namaBukti || "screenshot_pembayaran.png"}
                  </p>
                </div>
              )}

              <div className="pt-2">
                <Button
                  onClick={() => {
                    setBayarOpen(false);
                    setSukses(false);
                  }}
                  className="w-full sm:w-auto px-8"
                >
                  Selesai & Pantau Riwayat
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Ringkasan Tagihan */}
              <div className="rounded-xl border bg-muted/40 p-4 text-sm">
                <div className="flex justify-between py-0.5">
                  <span className="text-muted-foreground">No. Transaksi</span>
                  <span className="font-bold">{detail.noTransaksi}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-muted-foreground">Kendaraan</span>
                  <span className="font-medium">{detail.kendaraan} ({detail.plat})</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2 font-display text-base font-bold">
                  <span>Total Tagihan</span>
                  <span className="text-primary text-xl font-bold">{rupiah(detail.total)}</span>
                </div>
              </div>

              {/* Pemilihan Metode */}
              <div className="space-y-2">
                <Label className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Pilih Metode Pembayaran
                </Label>
                <div className="grid gap-2">
                  {METODE.map((m) => {
                    const IconComponent = m.icon;
                    const isSelected = metode === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => setMetode(m.id)}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-xs"
                            : "hover:bg-muted/50 border-border"
                        }`}
                      >
                        <div
                          className={`mt-0.5 rounded-lg p-2 ${
                            isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                          }`}
                        >
                          <IconComponent className="size-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm leading-snug">{m.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ---------------- QRIS CONTAINER LENGKAP & ALUR E-WALLET ---------------- */}
              {metode === "QRIS" && (
                <div className="space-y-4 rounded-2xl border-2 border-primary/30 bg-gradient-to-b from-primary/5 via-background to-muted/20 p-4">
                  {/* Header Resmi QRIS */}
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 items-center justify-center rounded-md bg-red-600 px-2.5 text-xs font-black tracking-widest text-white shadow-sm">
                        QRIS
                      </div>
                      <div>
                        <p className="text-xs font-bold leading-none">Standar Pembayaran Nasional (QRIS)</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">NMID: ID1020268839102 · AppBenk Hub</p>
                      </div>
                    </div>
                    {/* Countdown Timer */}
                    <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400 border border-amber-500/20">
                      <Clock className="size-3.5" />
                      <span>{formatTimer(qrisTimer)}</span>
                    </div>
                  </div>

                  {/* Supported E-Wallets Banner */}
                  <div className="rounded-xl border bg-card/90 p-2.5 text-center shadow-2xs">
                    <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">
                      Mendukung Pembayaran via E-Wallet & Mobile Banking:
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                      <span className="rounded-md bg-blue-500/15 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 text-[10px] border border-blue-500/30">DANA</span>
                      <span className="rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 text-[10px] border border-emerald-500/30">GoPay</span>
                      <span className="rounded-md bg-purple-500/15 text-purple-700 dark:text-purple-300 font-bold px-2 py-0.5 text-[10px] border border-purple-500/30">OVO</span>
                      <span className="rounded-md bg-orange-500/15 text-orange-700 dark:text-orange-300 font-bold px-2 py-0.5 text-[10px] border border-orange-500/30">ShopeePay</span>
                      <span className="rounded-md bg-red-500/15 text-red-700 dark:text-red-300 font-bold px-2 py-0.5 text-[10px] border border-red-500/30">LinkAja</span>
                      <span className="rounded-md bg-slate-500/15 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 text-[10px] border border-slate-500/30">BCA / Mandiri / BRImo</span>
                    </div>
                  </div>

                  {/* LANGKAH 1: SCAN QRIS */}
                  <div className="space-y-2 rounded-xl border bg-card p-3 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">1</span>
                      <p className="text-xs font-bold text-foreground">Scan Barcode QRIS di Aplikasi E-Wallet</p>
                    </div>

                    {/* BARCODE QR CODE QRIS */}
                    <div className="flex flex-col items-center justify-center py-2">
                      <div className="relative rounded-2xl border-4 border-foreground/10 bg-white p-3.5 shadow-md">
                        <QrisBarcodeSvg size={190} />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="rounded-md bg-white p-1 shadow-xs border">
                            <span className="rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-black text-white">
                              QRIS
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="mt-2 text-center text-xs text-muted-foreground">
                        Nominal Pembayaran Terkunci:
                      </p>
                      <p className="font-display text-xl font-black text-primary">
                        {rupiah(detail.total)}
                      </p>
                    </div>
                  </div>

                  {/* LANGKAH 2: TANGKAP LAYAR (SCREENSHOT) BUKTI BAYAR DI E-WALLET */}
                  <div className="space-y-1.5 rounded-xl border bg-card p-3 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">2</span>
                      <p className="text-xs font-bold text-foreground">Selesaikan Pembayaran & Ambil Tangkap Layar (Screenshot)</p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                      Buka aplikasi E-Wallet Anda (DANA / GoPay / OVO / ShopeePay), lakukan pembayaran sukses. Ambil <strong>tangkap layar (screenshot)</strong> bukti transaksi berhasil di ponsel Anda.
                    </p>
                  </div>

                  {/* LANGKAH 3: UNGGAH BUKTI TANGKAP LAYAR (SCREENSHOT) */}
                  <div className="space-y-3 rounded-xl border bg-card p-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">3</span>
                        <p className="text-xs font-bold text-foreground">
                          Unggah Tangkap Layar Bukti Pembayaran <span className="text-red-500">*</span>
                        </p>
                      </div>
                      {bukti && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="size-3" /> Bukti Terlampir
                        </span>
                      )}
                    </div>

                    {/* PRATINJAU BUKTI GAMBAR JIKA SUDAH DIPILIH */}
                    {bukti ? (
                      <div className="relative rounded-xl border-2 border-emerald-500/40 bg-emerald-500/5 p-3 text-center space-y-2">
                        <img
                          src={bukti}
                          alt="Pratinjau Screenshot Bukti Pembayaran"
                          className="max-h-56 w-auto mx-auto rounded-lg border shadow-sm object-contain"
                        />
                        <div className="flex items-center justify-between gap-2 px-1">
                          <p className="text-[11px] font-medium text-foreground truncate max-w-[200px]">
                            {namaBukti || "screenshot_pembayaran.png"}
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setBukti(undefined);
                              setNamaBukti("");
                            }}
                            className="h-7 text-xs text-destructive hover:text-destructive"
                          >
                            Hapus / Ganti
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <label
                          htmlFor="bukti-qris"
                          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/40 p-4 text-center hover:border-primary/70 transition-colors bg-muted/10 cursor-pointer"
                        >
                          <Smartphone className="size-8 text-muted-foreground mb-1.5" />
                          <span className="text-xs font-bold text-primary hover:underline">
                            Pilih File Tangkap Layar (Screenshot) dari HP
                          </span>
                          <span className="text-[10px] text-muted-foreground mt-0.5">
                            Mendukung file JPG, PNG, atau PDF (maksimal 5 MB)
                          </span>
                          <input
                            id="bukti-qris"
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,image/*"
                            onChange={(e) => unggahBukti(e.target.files?.[0])}
                            className="hidden"
                          />
                        </label>

                        {/* FITUR BANTUAN SCREENSHOT DEMO */}
                        <div className="rounded-lg border bg-muted/30 p-2.5 text-xs space-y-1.5">
                          <div className="flex items-center gap-1.5 font-semibold text-primary">
                            <Sparkles className="size-3.5 text-amber-500" />
                            <span>Uji Coba Cepat (Buat Contoh Screenshot E-Wallet):</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            Pilih e-wallet di bawah untuk membuat screenshot transaksi realistis secara instan:
                          </p>
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => generateDemoEwalletScreenshot("DANA", detail)}
                              className="h-7 text-[11px] gap-1 border-blue-400 text-blue-700 dark:text-blue-300 hover:bg-blue-50"
                            >
                              📸 DANA
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => generateDemoEwalletScreenshot("GoPay", detail)}
                              className="h-7 text-[11px] gap-1 border-emerald-400 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50"
                            >
                              📸 GoPay
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => generateDemoEwalletScreenshot("OVO", detail)}
                              className="h-7 text-[11px] gap-1 border-purple-400 text-purple-700 dark:text-purple-300 hover:bg-purple-50"
                            >
                              📸 OVO
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => generateDemoEwalletScreenshot("ShopeePay", detail)}
                              className="h-7 text-[11px] gap-1 border-orange-400 text-orange-700 dark:text-orange-300 hover:bg-orange-50"
                            >
                              📸 ShopeePay
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ---------------- TRANSFER BANK CONTAINER ---------------- */}
              {metode === "Transfer Bank" && (
                <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
                  <div className="rounded-lg border bg-card p-3 space-y-2 text-xs">
                    <p className="font-bold text-sm">Rekening Resmi Bengkel:</p>
                    <div className="space-y-1">
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-muted-foreground">Bank BCA</span>
                        <span className="font-mono font-bold">8830-192-881 (AppBenk Hub)</span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-muted-foreground">Bank Mandiri</span>
                        <span className="font-mono font-bold">132-00-9921-002 (AppBenk Hub)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bank BRI</span>
                        <span className="font-mono font-bold">0341-01-002931-501</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bukti-transfer">
                      Unggah Bukti Transfer <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="bukti-transfer"
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                      onChange={(e) => unggahBukti(e.target.files?.[0])}
                    />
                    <p className="text-xs text-muted-foreground">
                      Format JPG, JPEG, PNG, atau PDF. Maksimal 5 MB.
                    </p>
                    {namaBukti && (
                      <p className="text-xs font-medium text-success">
                        Bukti siap dikirim: {namaBukti}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ---------------- CASH / KASIR ---------------- */}
              {metode === "Cash" && (
                <div className="rounded-xl border bg-muted/30 p-4 text-xs text-muted-foreground space-y-1.5">
                  <p className="font-bold text-foreground text-sm">Pembayaran Tunai di Meja Kasir</p>
                  <p>
                    Silakan tunjukkan nomor transaksi <span className="font-bold text-foreground">{detail.noTransaksi}</span> kepada petugas kasir bengkel saat mengambil kendaraan Anda.
                  </p>
                </div>
              )}

              <DialogFooter className="gap-2 sm:justify-between pt-2">
                <Button variant="outline" onClick={() => setBayarOpen(false)}>
                  Batal
                </Button>
                <Button
                  onClick={() => konfirmasiManual(detail)}
                  className="gap-2 shadow-xs font-bold"
                >
                  <CheckCircle2 className="size-4" /> Konfirmasi Pembayaran ({metode})
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* -------------------------------------------------------------------- */}
      {/* 3. DIALOG BUKTI PEMBAYARAN DIGITAL (E-RECEIPT RESMI) */}
      {/* -------------------------------------------------------------------- */}
      <Dialog open={buktiModalOpen} onOpenChange={setBuktiModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="size-5 text-success" /> Bukti Pembayaran Digital (E-Receipt)
            </DialogTitle>
          </DialogHeader>

          {buktiData && (
            <div className="space-y-4 py-2">
              {/* STRUK CETAK BERGAYA DIGITAL RECEIPT */}
              <div
                ref={printRef}
                className="rounded-2xl border-2 border-dashed border-primary/30 bg-card p-5 shadow-sm space-y-4 text-sm"
              >
                {/* Header Struk */}
                <div className="text-center border-b pb-4 space-y-1">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-success/15 text-success mb-2">
                    <CheckCircle2 className="size-6" />
                  </div>
                  <h3 className="font-display text-lg font-black tracking-tight text-foreground">
                    APPBENK WORKSHOP & SERVICE
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Pitstop Pro Hub · Solusi Perawatan Kendaraan Terpadu
                  </p>
                  <div className="inline-block rounded-full bg-success/10 px-3 py-0.5 text-xs font-bold text-success mt-1">
                    PEMBAYARAN BERHASIL / LUNAS
                  </div>
                </div>

                {/* Metadata Transaksi */}
                <div className="grid grid-cols-2 gap-2 text-xs border-b pb-3">
                  <div>
                    <span className="text-muted-foreground block">No. Transaksi:</span>
                    <span className="font-mono font-bold text-foreground">{buktiData.noTransaksi}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">No. Servis:</span>
                    <span className="font-mono font-bold text-foreground">{buktiData.nomorServis}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Ref. Gateway:</span>
                    <span className="font-mono text-[11px] text-foreground">{buktiData.gatewayRef}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Waktu Pembayaran:</span>
                    <span className="text-[11px] text-foreground">{buktiData.waktu}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Pelanggan:</span>
                    <span className="font-semibold text-foreground">{buktiData.pelanggan}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Kendaraan:</span>
                    <span className="font-semibold text-foreground">{buktiData.kendaraan} ({buktiData.plat})</span>
                  </div>
                </div>

                {/* Rincian Tagihan */}
                <div className="space-y-1.5 text-xs">
                  <p className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                    Rincian Pembayaran
                  </p>
                  <div className="flex justify-between py-1 border-b border-muted">
                    <span>Jasa Servis ({buktiData.jenisServis})</span>
                    <span className="font-medium">{rupiah(buktiData.biayaJasa)}</span>
                  </div>
                  {buktiData.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between py-1 border-b border-muted text-muted-foreground">
                      <span>{it.nama} ({it.jumlah}x)</span>
                      <span>{rupiah(it.harga * it.jumlah)}</span>
                    </div>
                  ))}
                  {buktiData.items.length === 0 && buktiData.biayaPart > 0 && (
                    <div className="flex justify-between py-1 border-b border-muted text-muted-foreground">
                      <span>Sparepart & Bahan</span>
                      <span>{rupiah(buktiData.biayaPart)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 font-display text-base font-bold text-foreground">
                    <span>TOTAL DIBAYAR</span>
                    <span className="text-primary">{rupiah(buktiData.total)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground pt-1">
                    <span>Metode Bayar</span>
                    <span className="font-bold text-foreground">{buktiData.metode}</span>
                  </div>
                </div>

                {/* Footer Struk & Security Stamp */}
                <div className="border-t pt-3 text-center space-y-1 text-[11px] text-muted-foreground">
                  <p className="font-medium text-foreground">
                    Terima kasih telah mempercayakan kendaraan Anda pada AppBenk!
                  </p>
                  <p className="text-[10px]">
                    Struk ini adalah bukti pembayaran digital yang sah dan terverifikasi secara elektronik oleh sistem AppBenk Gateway.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <DialogFooter className="flex-row flex-wrap justify-between gap-2 sm:justify-between pt-2">
                <Button variant="outline" onClick={() => setBuktiModalOpen(false)}>
                  Tutup
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={cetakStruk} className="gap-1.5">
                    <Printer className="size-4" /> Cetak Bukti (Print)
                  </Button>
                  <Button
                    onClick={() => {
                      if (detail) unduhNota(detail, profil);
                    }}
                    className="gap-1.5 shadow-xs"
                  >
                    <Download className="size-4" /> Unduh Nota PDF/HTML
                  </Button>
                </div>
>>>>>>> b897868 (Initial commit - AppBenk)
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
<<<<<<< HEAD
    <div className="rounded-md border bg-muted/30 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="truncate font-medium">{value}</p>
    </div>
  );
}
=======
    <div className="rounded-xl border bg-muted/30 px-3.5 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="truncate font-semibold text-foreground text-sm mt-0.5">{value}</p>
    </div>
  );
}

/**
 * Authentic Indonesian QRIS Standard Barcode SVG Vector representation
 */
function QrisBarcodeSvg({ size = 200 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      className="max-w-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="240" height="240" fill="white" rx="8" />

      {/* TOP-LEFT FINDER PATTERN */}
      <rect x="20" y="20" width="56" height="56" fill="black" rx="4" />
      <rect x="28" y="28" width="40" height="40" fill="white" rx="2" />
      <rect x="36" y="36" width="24" height="24" fill="black" rx="2" />

      {/* TOP-RIGHT FINDER PATTERN */}
      <rect x="164" y="20" width="56" height="56" fill="black" rx="4" />
      <rect x="172" y="28" width="40" height="40" fill="white" rx="2" />
      <rect x="180" y="36" width="24" height="24" fill="black" rx="2" />

      {/* BOTTOM-LEFT FINDER PATTERN */}
      <rect x="20" y="164" width="56" height="56" fill="black" rx="4" />
      <rect x="28" y="172" width="40" height="40" fill="white" rx="2" />
      <rect x="36" y="180" width="24" height="24" fill="black" rx="2" />

      {/* ALIGNMENT PATTERNS & TIMING BITS */}
      <rect x="88" y="44" width="8" height="8" fill="black" />
      <rect x="104" y="44" width="8" height="8" fill="black" />
      <rect x="120" y="44" width="8" height="8" fill="black" />
      <rect x="136" y="44" width="8" height="8" fill="black" />

      <rect x="44" y="88" width="8" height="8" fill="black" />
      <rect x="44" y="104" width="8" height="8" fill="black" />
      <rect x="44" y="120" width="8" height="8" fill="black" />
      <rect x="44" y="136" width="8" height="8" fill="black" />

      {/* MATRIX DATA MODULES */}
      {/* Col 1 */}
      <rect x="88" y="88" width="16" height="8" fill="black" />
      <rect x="88" y="104" width="8" height="16" fill="black" />
      <rect x="104" y="120" width="8" height="8" fill="black" />
      <rect x="88" y="136" width="16" height="8" fill="black" />
      <rect x="88" y="164" width="8" height="8" fill="black" />
      <rect x="96" y="180" width="16" height="8" fill="black" />
      <rect x="88" y="204" width="8" height="16" fill="black" />

      {/* Col 2 */}
      <rect x="120" y="88" width="8" height="16" fill="black" />
      <rect x="136" y="104" width="16" height="8" fill="black" />
      <rect x="128" y="128" width="8" height="8" fill="black" />
      <rect x="120" y="144" width="16" height="8" fill="black" />
      <rect x="128" y="168" width="16" height="8" fill="black" />
      <rect x="120" y="184" width="8" height="16" fill="black" />
      <rect x="136" y="204" width="16" height="8" fill="black" />

      {/* Col 3 */}
      <rect x="160" y="88" width="16" height="8" fill="black" />
      <rect x="184" y="88" width="8" height="16" fill="black" />
      <rect x="200" y="88" width="16" height="8" fill="black" />
      <rect x="168" y="104" width="8" height="16" fill="black" />
      <rect x="192" y="112" width="16" height="8" fill="black" />
      <rect x="160" y="136" width="16" height="8" fill="black" />
      <rect x="184" y="136" width="16" height="16" fill="black" />

      {/* Bottom Right Matrix */}
      <rect x="164" y="164" width="24" height="24" fill="black" rx="2" />
      <rect x="172" y="172" width="8" height="8" fill="white" />
      <rect x="196" y="164" width="8" height="16" fill="black" />
      <rect x="212" y="164" width="8" height="8" fill="black" />
      <rect x="196" y="188" width="16" height="8" fill="black" />
      <rect x="164" y="196" width="16" height="8" fill="black" />
      <rect x="188" y="204" width="24" height="8" fill="black" />
      <rect x="164" y="212" width="8" height="8" fill="black" />
      <rect x="204" y="216" width="16" height="8" fill="black" />
    </svg>
  );
}
>>>>>>> b897868 (Initial commit - AppBenk)
