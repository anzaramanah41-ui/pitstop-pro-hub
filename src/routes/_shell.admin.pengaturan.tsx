import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  MessageSquare,
  Mail,
  MapPin,
  Save,
  TestTube,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Settings2,
  Wifi,
  WifiOff,
  ChevronRight,
  Phone,
  RefreshCw,
  Wallet,
  QrCode,
  Building2,
  UploadCloud,
  Plus,
  Trash2,
  Edit2,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { storagePaymentService } from "@/services/appbenk-service";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth";
import {
  getWAConfig,
  saveWAConfig,
  formatNomorWA,
  type WAConfig,
  type WAProvider,
} from "@/lib/whatsapp";
import { BengkelMap, type BengkelLocation, DEMO_BENGKEL_LOCATION } from "@/components/bengkel-map";

export const Route = createFileRoute("/_shell/admin/pengaturan")({
  head: () => ({
    meta: [
      { title: "Pengaturan Integrasi — AppBenk" },
      {
        name: "description",
        content: "Konfigurasi WhatsApp Gateway, Email SMTP, dan lokasi bengkel di Google Maps.",
      },
    ],
  }),
  component: PengaturanIntegrasi,
});

const BENGKEL_LOC_KEY = "appbenk_bengkel_location";

function saveBengkelLocation(loc: BengkelLocation) {
  localStorage.setItem(BENGKEL_LOC_KEY, JSON.stringify(loc));
}

function getBengkelLocation(): BengkelLocation {
  try {
    const raw = localStorage.getItem(BENGKEL_LOC_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEMO_BENGKEL_LOCATION;
}

function PengaturanIntegrasi() {
  const { user } = useAuth();

  // ── WhatsApp State ──────────────────────────────────────────────
  const [waEnabled, setWaEnabled] = useState(false);
  const [waProvider, setWaProvider] = useState<WAProvider>("wablas");
  const [waToken, setWaToken] = useState("");
  const [waGatewayUrl, setWaGatewayUrl] = useState("");
  const [waSender, setWaSender] = useState("");
  const [waTwilioSid, setWaTwilioSid] = useState("");
  const [waTwilioToken, setWaTwilioToken] = useState("");
  const [waTwilioFrom, setWaTwilioFrom] = useState("");
  const [waTestNomor, setWaTestNomor] = useState("");
  const [waTestLoading, setWaTestLoading] = useState(false);
  const [waTestResult, setWaTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [showWaToken, setShowWaToken] = useState(false);

  // ── Maps State ──────────────────────────────────────────────────
  const [bengkelLoc, setBengkelLoc] = useState<BengkelLocation>(getBengkelLocation());
  const [locEditing, setLocEditing] = useState(false);

  useEffect(() => {
    const cfg = getWAConfig();
    if (cfg) {
      setWaEnabled(cfg.enabled);
      setWaProvider(cfg.provider);
      setWaToken(cfg.token);
      setWaGatewayUrl(cfg.gatewayUrl || "");
      setWaSender(cfg.senderNumber || "");
      setWaTwilioSid(cfg.twilioAccountSid || "");
      setWaTwilioToken(cfg.twilioAuthToken || "");
      setWaTwilioFrom(cfg.twilioFrom || "");
    }
  }, []);

  // ── WhatsApp ────────────────────────────────────────────────────
  const simpanWA = () => {
    const cfg: WAConfig = {
      enabled: waEnabled,
      provider: waProvider,
      token: waProvider === "twilio" ? waTwilioToken.trim() : waToken.trim(),
      gatewayUrl: waGatewayUrl.trim() || undefined,
      senderNumber: waSender.trim() ? formatNomorWA(waSender.trim()) : undefined,
      twilioAccountSid: waTwilioSid.trim() || undefined,
      twilioAuthToken: waTwilioToken.trim() || undefined,
      twilioFrom: waTwilioFrom.trim() || undefined,
    };
    saveWAConfig(cfg);
    toast.success("Konfigurasi WhatsApp berhasil disimpan!");
  };

  const testWA = async () => {
    if (!waTestNomor.trim()) {
      toast.error("Masukkan nomor WhatsApp untuk test.");
      return;
    }
    setWaTestLoading(true);
    setWaTestResult(null);

    try {
      const nomorFormatted = formatNomorWA(waTestNomor.trim());
      const pesan = `🧪 *Test Notifikasi AppBenk*\n\nHalo! Ini adalah pesan test dari sistem AppBenk.\n\nJika Anda menerima pesan ini, konfigurasi WhatsApp Gateway berhasil! ✅\n\n_AppBenk — Solusi Manajemen Bengkel_`;

      const { kirimNotifikasiWA } = await import("@/lib/whatsapp");

      // Simpan config dulu
      saveWAConfig({
        enabled: waEnabled,
        provider: waProvider,
        token: waProvider === "twilio" ? waTwilioToken.trim() : waToken.trim(),
        gatewayUrl: waGatewayUrl.trim() || undefined,
        senderNumber: waSender.trim() ? formatNomorWA(waSender.trim()) : undefined,
        twilioAccountSid: waTwilioSid.trim() || undefined,
        twilioAuthToken: waTwilioToken.trim() || undefined,
        twilioFrom: waTwilioFrom.trim() || undefined,
      });

      const result = await kirimNotifikasiWA(nomorFormatted, pesan, {
        openManualIfNoConfig: true,
      });

      if (result.ok) {
        if (result.manual) {
          setWaTestResult({ ok: true, msg: "WhatsApp dibuka di tab baru (mode manual)." });
        } else {
          setWaTestResult({ ok: true, msg: "Pesan test berhasil dikirim!" });
          toast.success("Pesan WhatsApp test berhasil dikirim!");
        }
      } else {
        setWaTestResult({ ok: false, msg: result.error || "Gagal mengirim pesan." });
        toast.error("Gagal kirim pesan test: " + result.error);
      }
    } catch (e) {
      setWaTestResult({ ok: false, msg: String(e) });
    }

    setWaTestLoading(false);
  };

  // ── Maps ────────────────────────────────────────────────────────
  const simpanLokasi = () => {
    saveBengkelLocation(bengkelLoc);
    setLocEditing(false);
    toast.success("Lokasi bengkel berhasil disimpan!");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 lg:p-6">
      <PageHeader
        title="Pengaturan Integrasi"
        description="Konfigurasi WhatsApp, Email, dan Lokasi Bengkel untuk AppBenk"
      />

      <Tabs defaultValue="whatsapp">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="whatsapp" className="gap-1.5">
            <MessageSquare className="h-4 w-4" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-1.5">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="maps" className="gap-1.5">
            <MapPin className="h-4 w-4" />
            Lokasi Bengkel
          </TabsTrigger>
          <TabsTrigger value="pembayaran" className="gap-1.5">
            <Wallet className="h-4 w-4" />
            Pembayaran
          </TabsTrigger>
        </TabsList>

        {/* ── TAB WHATSAPP ──────────────────────────────────────── */}
        <TabsContent value="whatsapp" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                    WhatsApp Reminder & Notifikasi
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Kirim otomatis notifikasi booking, status servis, tagihan, dan reminder berkala
                    ke pelanggan via WhatsApp.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {waEnabled ? (
                    <Badge className="bg-green-100 text-green-700">
                      <Wifi className="mr-1 h-3 w-3" />
                      Aktif
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-muted-foreground">
                      <WifiOff className="mr-1 h-3 w-3" />
                      Nonaktif
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Enable toggle */}
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium text-sm">Aktifkan WhatsApp Notifikasi</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Kirim notifikasi otomatis ke pelanggan saat ada update servis
                  </p>
                </div>
                <Switch
                  id="wa-enabled"
                  checked={waEnabled}
                  onCheckedChange={setWaEnabled}
                />
              </div>

              {/* Provider selection */}
              <div className="space-y-2">
                <Label>Provider / Gateway WhatsApp</Label>
                <Select value={waProvider} onValueChange={(v) => setWaProvider(v as WAProvider)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twilio">
                      <span className="flex flex-col">
                        <span className="font-medium">Twilio WhatsApp</span>
                        <span className="text-xs text-muted-foreground">twilio.com — Official Meta/Twilio Business Cloud API</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="wablas">
                      <span className="flex flex-col">
                        <span className="font-medium">Wablas</span>
                        <span className="text-xs text-muted-foreground">wablas.com — Populer, mudah setup</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="fonnte">
                      <span className="flex flex-col">
                        <span className="font-medium">Fonnte</span>
                        <span className="text-xs text-muted-foreground">fonnte.com — Gratis 250 pesan/bulan</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="manual">
                      <span className="flex flex-col">
                        <span className="font-medium">Manual (wa.me link)</span>
                        <span className="text-xs text-muted-foreground">Buka WhatsApp Web dengan pesan terisi otomatis</span>
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Twilio Configuration Fields */}
              {waProvider === "twilio" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="wa-twilio-sid">Twilio Account SID</Label>
                    <Input
                      id="wa-twilio-sid"
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={waTwilioSid}
                      onChange={(e) => setWaTwilioSid(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Temukan Account SID di{" "}
                      <a
                        href="https://console.twilio.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline inline-flex items-center gap-0.5"
                      >
                        Twilio Console <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wa-twilio-token">Twilio Auth Token</Label>
                    <div className="relative">
                      <Input
                        id="wa-twilio-token"
                        type={showWaToken ? "text" : "password"}
                        placeholder="Masukkan Auth Token Twilio Anda"
                        value={waTwilioToken}
                        onChange={(e) => setWaTwilioToken(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowWaToken(!showWaToken)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showWaToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wa-twilio-from">Nomor Pengirim Twilio WhatsApp (From)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="wa-twilio-from"
                        placeholder="whatsapp:+14155238886"
                        value={waTwilioFrom}
                        onChange={(e) => setWaTwilioFrom(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Contoh untuk Twilio Sandbox: <span className="font-mono">whatsapp:+14155238886</span>
                    </p>
                  </div>
                </>
              )}

              {/* Token/API Key for Wablas & Fonnte */}
              {(waProvider === "wablas" || waProvider === "fonnte") && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="wa-token">
                      {waProvider === "wablas" ? "Token Wablas" : "Token Fonnte"}
                    </Label>
                    <div className="relative">
                      <Input
                        id="wa-token"
                        type={showWaToken ? "text" : "password"}
                        placeholder={`Masukkan token dari dashboard ${waProvider}`}
                        value={waToken}
                        onChange={(e) => setWaToken(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowWaToken(!showWaToken)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showWaToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Dapatkan token dari{" "}
                      <a
                        href={waProvider === "wablas" ? "https://wablas.com" : "https://fonnte.com"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline inline-flex items-center gap-0.5"
                      >
                        {waProvider === "wablas" ? "wablas.com" : "fonnte.com"}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
                  </div>

                  {waProvider === "wablas" && (
                    <div className="space-y-2">
                      <Label htmlFor="wa-gateway-url">Gateway URL Wablas (opsional)</Label>
                      <Input
                        id="wa-gateway-url"
                        placeholder="https://jogja.wablas.com/api/send-message"
                        value={waGatewayUrl}
                        onChange={(e) => setWaGatewayUrl(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Biarkan kosong untuk menggunakan URL default Wablas
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="wa-sender">Nomor WA Pengirim (opsional)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="wa-sender"
                        placeholder="08xxxxxxxxxx"
                        value={waSender}
                        onChange={(e) => setWaSender(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Manual mode info */}
              {waProvider === "manual" && (
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
                  <p className="font-medium">Mode Manual:</p>
                  <p className="mt-1 text-xs">
                    Saat ada event (booking, status update, tagihan), tombol akan muncul untuk membuka
                    WhatsApp Web dengan pesan yang sudah terisi otomatis. Admin cukup klik Send.
                  </p>
                </div>
              )}

              <Separator />

              {/* Test kirim */}
              <div className="space-y-3">
                <Label>Test Kirim Pesan</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Nomor WA tujuan test (08xxxxxxxxxx)"
                      value={waTestNomor}
                      onChange={(e) => setWaTestNomor(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={testWA}
                    disabled={waTestLoading}
                    className="gap-1.5 shrink-0"
                  >
                    {waTestLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4" />
                    )}
                    Kirim Test
                  </Button>
                </div>
                {waTestResult && (
                  <div
                    className={`flex items-start gap-2 rounded-lg p-3 text-sm ${
                      waTestResult.ok
                        ? "bg-green-50 border border-green-200 text-green-800"
                        : "bg-red-50 border border-red-200 text-red-800"
                    }`}
                  >
                    {waTestResult.ok ? (
                      <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    )}
                    {waTestResult.msg}
                  </div>
                )}
              </div>

              {/* Notifikasi yang dikirim otomatis */}
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Notifikasi Otomatis
                </p>
                {[
                  { icon: "📅", text: "Konfirmasi Booking — saat admin konfirmasi booking pelanggan" },
                  { icon: "🔧", text: "Servis Dimulai — saat status berubah ke 'Diproses'" },
                  { icon: "✅", text: "Servis Selesai — saat status berubah ke 'Selesai'" },
                  { icon: "💰", text: "Tagihan Siap — saat status 'Menunggu Pembayaran'" },
                  { icon: "🎉", text: "Pembayaran Diterima — setelah pembayaran terverifikasi" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="shrink-0">{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

              <Button onClick={simpanWA} className="w-full gap-1.5">
                <Save className="h-4 w-4" />
                Simpan Konfigurasi WhatsApp
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB EMAIL ─────────────────────────────────────────── */}
        <TabsContent value="email" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                Konfigurasi Email SMTP Kustom
              </CardTitle>
              <CardDescription>
                Kirim email dari domain bengkel Anda sendiri menggunakan SMTP kustom di Supabase.
                Email pelanggan (verifikasi, reset password, notifikasi) akan terkirim dari akun email bengkel.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Status */}
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 space-y-2">
                <p className="font-semibold text-sm text-amber-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Konfigurasi dilakukan di Supabase Dashboard
                </p>
                <p className="text-xs text-amber-700">
                  Email SMTP dikonfigurasi langsung di Supabase, bukan di kode aplikasi.
                  Ikuti langkah-langkah di bawah untuk mengaktifkan email dari domain bengkel Anda.
                </p>
              </div>

              {/* Langkah-langkah */}
              <div className="space-y-4">
                <p className="font-medium text-sm">Langkah Setup Email SMTP Kustom:</p>

                {[
                  {
                    no: 1,
                    judul: "Buka Supabase Dashboard",
                    desc: "Login ke supabase.com, buka project AppBenk Anda.",
                    link: "https://supabase.com/dashboard",
                    linkText: "Buka Supabase Dashboard",
                  },
                  {
                    no: 2,
                    judul: "Masuk ke Authentication → SMTP Settings",
                    desc: 'Di sidebar kiri: Authentication → Settings → SMTP Settings. Aktifkan "Custom SMTP".',
                  },
                  {
                    no: 3,
                    judul: "Pilih Provider Email",
                    desc: "Gunakan salah satu provider berikut:",
                    providers: [
                      { nama: "Resend", url: "https://resend.com", keterangan: "Gratis 100 email/hari, mudah setup" },
                      { nama: "Brevo (Sendinblue)", url: "https://brevo.com", keterangan: "Gratis 300 email/hari" },
                      { nama: "Mailgun", url: "https://mailgun.com", keterangan: "Gratis 1000 email/bulan (US only)" },
                      { nama: "Gmail SMTP", url: "https://gmail.com", keterangan: "Gratis, butuh App Password" },
                    ],
                  },
                  {
                    no: 4,
                    judul: "Masukkan Kredensial SMTP",
                    desc: "",
                    fields: [
                      { label: "SMTP Host", value: "smtp.resend.com (atau sesuai provider)" },
                      { label: "SMTP Port", value: "465 (SSL) atau 587 (TLS)" },
                      { label: "SMTP User", value: "apikey (untuk Resend/Mailgun)" },
                      { label: "SMTP Password", value: "API Key dari provider email Anda" },
                      { label: "Sender Email", value: "noreply@bengkel-anda.com" },
                      { label: "Sender Name", value: "Nama Bengkel Anda" },
                    ],
                  },
                  {
                    no: 5,
                    judul: "Kustomisasi Template Email",
                    desc: 'Di Authentication → Email Templates, Anda bisa kustomisasi tampilan email (logo bengkel, warna, teks) untuk: Confirm Email, Reset Password, Magic Link.',
                  },
                ].map((step) => (
                  <div key={step.no} className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mt-0.5">
                      {step.no}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <p className="font-medium text-sm">{step.judul}</p>
                      {step.desc && <p className="text-xs text-muted-foreground">{step.desc}</p>}
                      {step.link && (
                        <a
                          href={step.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary underline"
                        >
                          {step.linkText}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {step.providers && (
                        <div className="space-y-1 mt-1">
                          {step.providers.map((p) => (
                            <div key={p.nama} className="flex items-center gap-2">
                              <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                              <a
                                href={p.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary underline"
                              >
                                {p.nama}
                              </a>
                              <span className="text-xs text-muted-foreground">— {p.keterangan}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {step.fields && (
                        <div className="mt-1 rounded-lg border overflow-hidden">
                          {step.fields.map((f) => (
                            <div
                              key={f.label}
                              className="flex items-center justify-between px-3 py-2 text-xs border-b last:border-0 bg-muted/20"
                            >
                              <span className="font-mono text-muted-foreground">{f.label}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-foreground">{f.value}</span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard?.writeText(f.value);
                                    toast.success("Disalin!");
                                  }}
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Link langsung */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Link Langsung ke Supabase:</p>
                <div className="grid grid-cols-1 gap-2">
                  <a
                    href="https://supabase.com/dashboard/project/_/auth/smtp"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="w-full gap-1.5">
                      <Mail className="h-4 w-4" />
                      Buka SMTP Settings di Supabase
                      <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                    </Button>
                  </a>
                  <a
                    href="https://supabase.com/dashboard/project/_/auth/templates"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="w-full gap-1.5">
                      <Mail className="h-4 w-4 text-blue-500" />
                      Kustomisasi Template Email
                      <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB MAPS ──────────────────────────────────────────── */}
        <TabsContent value="maps" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-red-500" />
                Lokasi Bengkel di Peta
              </CardTitle>
              <CardDescription>
                Atur koordinat dan informasi lokasi bengkel yang akan ditampilkan kepada pelanggan
                saat booking servis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Preview peta */}
              <BengkelMap bengkel={bengkelLoc} height={250} />

              {/* Form edit lokasi */}
              {locEditing ? (
                <div className="space-y-4 rounded-lg border p-4 bg-muted/20">
                  <p className="font-medium text-sm">Edit Informasi Bengkel:</p>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="loc-nama">Nama Bengkel</Label>
                      <Input
                        id="loc-nama"
                        value={bengkelLoc.nama}
                        onChange={(e) => setBengkelLoc({ ...bengkelLoc, nama: e.target.value })}
                        placeholder="Nama Bengkel Anda"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="loc-telepon">Telepon</Label>
                      <Input
                        id="loc-telepon"
                        value={bengkelLoc.telepon || ""}
                        onChange={(e) => setBengkelLoc({ ...bengkelLoc, telepon: e.target.value })}
                        placeholder="0274-xxxxxx"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="loc-alamat">Alamat Lengkap</Label>
                      <Input
                        id="loc-alamat"
                        value={bengkelLoc.alamat}
                        onChange={(e) => setBengkelLoc({ ...bengkelLoc, alamat: e.target.value })}
                        placeholder="Jl. Nama Jalan No. X, Kecamatan, Kota"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="loc-lat">Latitude</Label>
                      <Input
                        id="loc-lat"
                        type="number"
                        step="0.0001"
                        value={bengkelLoc.lat}
                        onChange={(e) => setBengkelLoc({ ...bengkelLoc, lat: parseFloat(e.target.value) || 0 })}
                        placeholder="-7.7516"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="loc-lng">Longitude</Label>
                      <Input
                        id="loc-lng"
                        type="number"
                        step="0.0001"
                        value={bengkelLoc.lng}
                        onChange={(e) => setBengkelLoc({ ...bengkelLoc, lng: parseFloat(e.target.value) || 0 })}
                        placeholder="110.3761"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="loc-jam">Jam Operasional</Label>
                      <Input
                        id="loc-jam"
                        value={bengkelLoc.jamOperasional || ""}
                        onChange={(e) => setBengkelLoc({ ...bengkelLoc, jamOperasional: e.target.value })}
                        placeholder="Senin–Sabtu: 08.00–17.00 WIB"
                      />
                    </div>
                  </div>

                  {/* Panduan cari koordinat */}
                  <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-xs text-blue-800 space-y-1.5">
                    <p className="font-semibold">Cara mendapatkan koordinat bengkel:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Buka Google Maps dan cari lokasi bengkel Anda</li>
                      <li>Klik kanan pada titik lokasi bengkel</li>
                      <li>Angka pertama = Latitude, angka kedua = Longitude</li>
                      <li>
                        <a
                          href="https://www.google.com/maps"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline inline-flex items-center gap-0.5"
                        >
                          Buka Google Maps <ExternalLink className="h-3 w-3" />
                        </a>
                      </li>
                    </ol>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={simpanLokasi} className="flex-1 gap-1.5">
                      <Save className="h-4 w-4" />
                      Simpan Lokasi
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setBengkelLoc(getBengkelLocation());
                        setLocEditing(false);
                      }}
                      className="flex-1"
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setLocEditing(true)}
                  className="w-full gap-1.5"
                >
                  <MapPin className="h-4 w-4" />
                  Edit Lokasi Bengkel
                </Button>
              )}

              {/* Info */}
              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
                <p className="font-medium">Peta menggunakan OpenStreetMap:</p>
                <p>✅ Gratis tanpa API key</p>
                <p>✅ Data peta terus diperbarui oleh komunitas</p>
                <p>✅ Tombol petunjuk arah Google Maps & Waze tersedia</p>
                <p>✅ Deteksi lokasi pelanggan + estimasi jarak</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB PEMBAYARAN BENGKEL ──────────────────────────────── */}
        <TabsContent value="pembayaran" className="mt-4 space-y-6">
          <PengaturanPembayaranBengkel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PengaturanPembayaranBengkel() {
  const { user } = useAuth();
  const {
    workshopPaymentAccounts,
    simpanPaymentAccount,
    togglePaymentAccountActive,
    hapusPaymentAccount,
    refreshPaymentAccounts,
  } = useStore();

  const workshopId = user?.bengkelId || user?.workshopId || "bengkel-001";

  // Filter accounts for active workshop
  const workshopAccounts = workshopPaymentAccounts.filter(
    (a) => a.workshop_id === workshopId || a.id_bengkel === workshopId,
  );
  const bankAccounts = workshopAccounts.filter((a) => a.account_type === "bank_transfer");
  const qrisCandidates = workshopAccounts
    .filter((a) => a.account_type === "qris")
    .sort((a, b) => {
      const tb = new Date(b.updated_at || b.created_at || 0).getTime();
      const ta = new Date(a.updated_at || a.created_at || 0).getTime();
      return tb - ta;
    });
  const qrisAccount =
    qrisCandidates.find((a) => Boolean(a.qr_image_url)) ||
    qrisCandidates[0] ||
    workshopPaymentAccounts
      .filter((a) => a.account_type === "qris")
      .sort((a, b) => {
        const tb = new Date(b.updated_at || b.created_at || 0).getTime();
        const ta = new Date(a.updated_at || a.created_at || 0).getTime();
        return tb - ta;
      })[0] ||
    null;

  // Form State Bank Transfer
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [bankIsActive, setBankIsActive] = useState(true);
  const [bankSaving, setBankSaving] = useState(false);

  // Form State QRIS
  const [qrisFile, setQrisFile] = useState<File | null>(null);
  const [qrisPreview, setQrisPreview] = useState<string>(qrisAccount?.qr_image_url || "");
  const [qrisIsActive, setQrisIsActive] = useState<boolean>(qrisAccount?.is_active ?? true);
  const [qrisSaving, setQrisSaving] = useState(false);

  useEffect(() => {
    let savedQrisImage = qrisAccount?.qr_image_url || "";
    let savedQrisActive = qrisAccount?.is_active ?? true;
    let savedTimestamp = qrisAccount ? new Date(qrisAccount.updated_at || qrisAccount.created_at || 0).getTime() : 0;

    if (typeof window !== "undefined") {
      try {
        const wsRaw = localStorage.getItem(`appbenk_qris_active_${workshopId}`);
        const wsImg = localStorage.getItem(`appbenk_qris_image_data_${workshopId}`);
        const raw = wsRaw || localStorage.getItem("appbenk_qris_active");
        if (raw) {
          const parsed = JSON.parse(raw);
          const parsedTime = new Date(parsed.updated_at || parsed.created_at || 0).getTime();
          if (parsedTime >= savedTimestamp) {
            if (parsed.qr_image_url) {
              savedQrisImage = parsed.qr_image_url;
            }
            if (parsed.is_active !== undefined) {
              savedQrisActive = parsed.is_active;
            }
            savedTimestamp = parsedTime;
          }
        }
        const rawImg = wsImg || localStorage.getItem("appbenk_qris_image_data");
        if (rawImg && !savedQrisImage) {
          savedQrisImage = rawImg;
        }
      } catch {}
    }

    if (savedQrisImage && !qrisFile) {
      setQrisPreview(savedQrisImage);
    }
    setQrisIsActive(savedQrisActive);
  }, [qrisAccount, workshopId]);

  const handleEditBank = (acc: typeof bankAccounts[0]) => {
    setEditingBankId(acc.id);
    setBankName(acc.bank_name || "");
    setAccountNumber(acc.account_number || "");
    setAccountHolderName(acc.account_holder_name || "");
    setBankIsActive(acc.is_active);
  };

  const handleCancelEditBank = () => {
    setEditingBankId(null);
    setBankName("");
    setAccountNumber("");
    setAccountHolderName("");
    setBankIsActive(true);
  };

  const handleSimpanBank = async () => {
    if (!bankName.trim()) {
      toast.error("Nama Bank wajib diisi.");
      return;
    }
    if (!accountNumber.trim()) {
      toast.error("Nomor Rekening wajib diisi.");
      return;
    }
    if (!accountHolderName.trim()) {
      toast.error("Nama Pemilik Rekening wajib diisi.");
      return;
    }

    setBankSaving(true);
    try {
      await simpanPaymentAccount({
        ...(editingBankId ? { id: editingBankId } : {}),
        workshop_id: workshopId,
        id_bengkel: workshopId,
        account_type: "bank_transfer",
        provider: "MANUAL",
        bank_name: bankName.trim(),
        account_number: accountNumber.trim(),
        account_holder_name: accountHolderName.trim(),
        display_name: `${bankName.trim()} - ${accountNumber.trim()}`,
        is_active: bankIsActive,
      });

      toast.success(editingBankId ? "Rekening bank berhasil diperbarui." : "Rekening bank baru berhasil disimpan.");
      handleCancelEditBank();
    } catch (err: any) {
      toast.error(`Gagal menyimpan rekening: ${err.message}`);
    } finally {
      setBankSaving(false);
    }
  };

  const handleToggleBank = async (id: string, current: boolean) => {
    try {
      await togglePaymentAccountActive(id, !current);
      toast.success(`Status rekening berhasil ${!current ? "diaktifkan" : "dinonaktifkan"}.`);
    } catch {
      toast.error("Gagal mengubah status rekening.");
    }
  };

  const handleHapusBank = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus rekening bank ini?")) return;
    try {
      await hapusPaymentAccount(id);
      toast.success("Rekening bank berhasil dihapus.");
    } catch {
      toast.error("Gagal menghapus rekening bank.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file via mime atau extension
    const isImageMime = file.type ? file.type.startsWith("image/") : false;
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const isImageExt = ["jpg", "jpeg", "png", "webp", "jfif", "gif", "bmp"].includes(ext);
    if (!isImageMime && !isImageExt) {
      toast.error("Format file harus berupa gambar (.jpg, .jpeg, .png, atau .webp).");
      return;
    }

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran gambar QRIS maksimal 5MB.");
      return;
    }

    setQrisFile(file);

    // Langsung buat preview instan seketika
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setQrisPreview(dataUrl);
        toast.info("Gambar QRIS siap disimpan. Silakan klik tombol 'Simpan QRIS'.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSimpanQRIS = async () => {
    if (!qrisPreview) {
      toast.error("Silakan pilih file gambar QRIS terlebih dahulu.");
      return;
    }

    setQrisSaving(true);
    try {
      let finalUrl = qrisPreview;

      // Jika ada file baru yang diunggah, coba upload
      if (qrisFile) {
        try {
          finalUrl = await storagePaymentService.uploadQRIS(workshopId, qrisFile);
        } catch {
          finalUrl = qrisPreview;
        }
      }

      if (!finalUrl) {
        finalUrl = qrisPreview;
      }

      const basePayload: WorkshopPaymentAccountRow = {
        id: qrisAccount?.id || `qris-${workshopId}-${Date.now()}`,
        workshop_id: workshopId,
        id_bengkel: workshopId,
        account_type: "qris",
        provider: "MANUAL",
        provider_account_id: "qris-manual",
        bank_name: null,
        account_number: null,
        account_holder_name: null,
        qr_image_url: finalUrl,
        display_name: "QRIS Bengkel",
        is_active: qrisIsActive,
        status: "active",
        created_at: qrisAccount?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("appbenk_qris_active", JSON.stringify(basePayload));
          localStorage.setItem(`appbenk_qris_active_${workshopId}`, JSON.stringify(basePayload));
          localStorage.setItem("appbenk_qris_image_data", finalUrl);
          localStorage.setItem(`appbenk_qris_image_data_${workshopId}`, finalUrl);
        } catch (e) {
          console.warn("Storage quota warning on qris save:", e);
        }
      }

      const savedAcc = await simpanPaymentAccount(basePayload);

      setQrisPreview(savedAcc.qr_image_url || finalUrl);
      setQrisFile(null);
      await refreshPaymentAccounts(workshopId);
      toast.success("Pengaturan QRIS berhasil disimpan.");
    } catch (err: any) {
      toast.error(`Gagal menyimpan QRIS: ${err.message}`);
    } finally {
      setQrisSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info Workshop */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border bg-muted/30 p-4">
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Wallet className="size-5 text-primary" />
            Konfigurasi Metode Pembayaran Bengkel
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Kelola rekening bank dan QRIS bengkel Anda untuk pembayaran manual pelanggan. Terisolasi untuk bengkel ID: <span className="font-mono font-bold text-primary">{workshopId}</span>.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refreshPaymentAccounts(workshopId)} className="gap-1.5 shrink-0">
          <RefreshCw className="size-3.5" /> Segarkan
        </Button>
      </div>

      {/* ── BAGIAN A: REKENING TRANSFER BANK ─────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-5 w-5 text-blue-600" />
                BAGIAN A — Rekening Transfer Bank
              </CardTitle>
              <CardDescription>
                Daftar rekening bank bengkel yang akan ditampilkan ke pelanggan saat memilih metode Transfer Bank.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              {bankAccounts.length} Rekening
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Daftar Rekening yang Ada */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Daftar Rekening Terdaftar
            </Label>
            {bankAccounts.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                Belum ada rekening bank yang ditambahkan. Silakan isi form di bawah untuk menambahkan rekening baru.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {bankAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className={cn(
                      "flex flex-col justify-between rounded-xl border p-4 transition-all",
                      acc.is_active ? "bg-card border-border shadow-xs" : "bg-muted/40 border-dashed opacity-75",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-foreground">{acc.bank_name}</span>
                          <Badge variant={acc.is_active ? "default" : "secondary"} className="text-[10px]">
                            {acc.is_active ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </div>
                        <p className="font-mono text-sm font-semibold tracking-wider text-primary">
                          {acc.account_number}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          a.n. <span className="font-medium text-foreground">{acc.account_holder_name}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => handleEditBank(acc)}
                          title="Edit Rekening"
                        >
                          <Edit2 className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive hover:text-destructive"
                          onClick={() => handleHapusBank(acc.id)}
                          title="Hapus Rekening"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t pt-3">
                      <span className="text-xs text-muted-foreground">Status Aktif untuk Pelanggan</span>
                      <Switch
                        checked={acc.is_active}
                        onCheckedChange={() => handleToggleBank(acc.id, acc.is_active)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Form Tambah / Edit Rekening */}
          <div className="rounded-xl border bg-muted/20 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm flex items-center gap-1.5">
                {editingBankId ? <Edit2 className="size-4 text-primary" /> : <Plus className="size-4 text-primary" />}
                {editingBankId ? "Edit Rekening Bank" : "Tambah Rekening Bank Baru"}
              </h4>
              {editingBankId && (
                <Button variant="ghost" size="sm" onClick={handleCancelEditBank} className="text-xs h-7">
                  Batal Edit
                </Button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="bank_name">Nama Bank *</Label>
                <Input
                  id="bank_name"
                  placeholder="Contoh: BCA, Mandiri, BRI"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="account_number">Nomor Rekening *</Label>
                <Input
                  id="account_number"
                  placeholder="Contoh: 1234567890"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="account_holder">Nama Pemilik Rekening *</Label>
                <Input
                  id="account_holder"
                  placeholder="Contoh: PT Bengkel Contoh"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <Switch id="bank_is_active" checked={bankIsActive} onCheckedChange={setBankIsActive} />
                <Label htmlFor="bank_is_active" className="cursor-pointer text-xs">
                  Aktifkan rekening ini agar langsung tampil pada pilihan pembayaran pelanggan
                </Label>
              </div>

              <Button onClick={handleSimpanBank} disabled={bankSaving} className="gap-1.5">
                <Save className="size-4" />
                {bankSaving ? "Menyimpan..." : editingBankId ? "Perbarui Rekening" : "Simpan Rekening"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── BAGIAN B: QRIS BENGKEL ────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <QrCode className="h-5 w-5 text-emerald-600" />
                BAGIAN B — Pembayaran QRIS Bengkel
              </CardTitle>
              <CardDescription>
                Unggah dan kelola gambar kode QRIS bengkel Anda. Pelanggan akan melihat QRIS ini saat membayar tagihan.
              </CardDescription>
            </div>
            <Badge variant={qrisAccount?.is_active ? "default" : "secondary"} className="text-xs">
              {qrisAccount?.is_active ? "QRIS Aktif" : "QRIS Nonaktif"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Visual Preview */}
            <div className="flex flex-col items-center justify-center rounded-xl border bg-muted/20 p-6 text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Preview Gambar QRIS
              </span>
              {qrisPreview ? (
                <div className="relative group max-w-[240px] rounded-xl border bg-white p-3 shadow-md">
                  <img
                    src={qrisPreview}
                    alt="Preview QRIS Bengkel"
                    className="h-auto w-full object-contain rounded-lg aspect-square"
                  />
                  <div className="mt-2 text-center">
                    <p className="font-bold text-xs text-foreground">QRIS AppBenk</p>
                    <p className="text-[10px] text-muted-foreground">Scan menggunakan GoPay, OVO, DANA, BCA, dll</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 w-48 rounded-xl border border-dashed bg-muted/40 p-4 text-muted-foreground">
                  <QrCode className="size-12 stroke-[1.5] mb-2 opacity-50" />
                  <p className="text-xs font-medium">Belum ada gambar QRIS</p>
                  <p className="text-[10px]">Silakan unggah gambar di samping</p>
                </div>
              )}
            </div>

            {/* Form Upload & Pengaturan QRIS */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="qris_file" className="text-sm font-semibold">
                    Upload Gambar QRIS Baru
                  </Label>
                  <div className="flex flex-col gap-2">
                    <Input
                      id="qris_file"
                      type="file"
                      accept="image/*,.jpg,.jpeg,.png,.webp,.jfif"
                      onClick={(e) => {
                        (e.target as HTMLInputElement).value = "";
                      }}
                      onChange={handleFileChange}
                      className="cursor-pointer file:cursor-pointer"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Mendukung format JPG, JPEG, PNG, dan WEBP. Ukuran file maksimal 5MB. Pastikan kode QR terlihat jelas.
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border p-3 bg-muted/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="qris_active" className="cursor-pointer font-medium text-xs block">
                        Status Aktif QRIS
                      </Label>
                      <span className="text-[11px] text-muted-foreground">
                        Aktifkan opsi QRIS pada halaman pembayaran pelanggan
                      </span>
                    </div>
                    <Switch
                      id="qris_active"
                      checked={qrisIsActive}
                      onCheckedChange={setQrisIsActive}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end">
                <Button onClick={handleSimpanQRIS} disabled={qrisSaving} className="gap-1.5 w-full sm:w-auto">
                  <Save className="size-4" />
                  {qrisSaving ? "Menyimpan QRIS..." : "Simpan QRIS"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
