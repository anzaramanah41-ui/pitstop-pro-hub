import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
<<<<<<< HEAD
import { Eye, EyeOff, Loader2, Lock, Mail, UserRoundCheck } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AKUN_DEMO, HOME_ROLE, LABEL_ROLE, useAuth } from "@/lib/auth";
=======
import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  RotateCcw,
  UserRoundCheck,
} from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HOME_ROLE, LABEL_ROLE, useAuth } from "@/lib/auth";
>>>>>>> b897868 (Initial commit - AppBenk)

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Login — AppBenk Solusi Servis Kendaraan" },
      {
        name: "description",
        content:
          "Masuk ke AppBenk untuk mengelola booking servis, status kendaraan, sparepart, dan laporan bengkel sesuai peran Anda.",
      },
      { property: "og:title", content: "Login — AppBenk Solusi Servis Kendaraan" },
      { property: "og:description", content: "Masuk untuk mengakses sistem AppBenk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
<<<<<<< HEAD
  const { user, masuk } = useAuth();
  const [email, setEmail] = useState("pelanggan@appbenk.test");
  const [password, setPassword] = useState("pelanggan123");
=======
  const { user, masuk, kirimKodeResetPassword, verifikasiDanUbahPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
>>>>>>> b897868 (Initial commit - AppBenk)
  const [lihat, setLihat] = useState(false);
  const [ingat, setIngat] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errEmail, setErrEmail] = useState("");
  const [errPassword, setErrPassword] = useState("");
  const [error, setError] = useState("");

<<<<<<< HEAD
=======
  // State Dialog Lupa Password Real (Supabase OTP)
  const [lupaOpen, setLupaOpen] = useState(false);
  const [lupaStep, setLupaStep] = useState<1 | 2>(1);
  const [lupaEmail, setLupaEmail] = useState("");
  const [lupaKode, setLupaKode] = useState("");
  const [lupaPasswordBaru, setLupaPasswordBaru] = useState("");
  const [lupaKonfirmasi, setLupaKonfirmasi] = useState("");
  const [lupaLihat, setLupaLihat] = useState(false);
  const [lupaLoading, setLupaLoading] = useState(false);
  const [lupaError, setLupaError] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Timer hitung mundur resend kode OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

>>>>>>> b897868 (Initial commit - AppBenk)
  useEffect(() => {
    if (user) navigate({ to: HOME_ROLE[user.role], replace: true });
  }, [user, navigate]);

<<<<<<< HEAD
  const submit = (e: React.FormEvent) => {
=======
  const bukaLupaPassword = () => {
    setLupaEmail(email.trim());
    setLupaKode("");
    setLupaPasswordBaru("");
    setLupaKonfirmasi("");
    setLupaError("");
    setLupaStep(1);
    setLupaOpen(true);
  };

  const handleKirimKodeReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetEmail = lupaEmail.trim();
    if (!targetEmail) {
      setLupaError("Silakan masukkan alamat email Anda.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
      setLupaError("Format alamat email tidak valid.");
      return;
    }

    setLupaLoading(true);
    setLupaError("");
    const res = await kirimKodeResetPassword(targetEmail);
    setLupaLoading(false);

    if (!res.ok) {
      setLupaError(res.error || "Gagal mengirim kode verifikasi. Periksa kembali email Anda.");
      return;
    }

    toast.success("Kode verifikasi telah dikirim ke email Anda! Periksa inbox atau folder spam.");
    setLupaStep(2);
    setCountdown(60);
  };

  const handleVerifikasiDanUbah = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = lupaKode.trim();
    const pass = lupaPasswordBaru;
    const conf = lupaKonfirmasi;

    if (!token) {
      setLupaError("Kode verifikasi wajib diisi.");
      return;
    }
    if (token.length < 6) {
      setLupaError("Kode verifikasi minimal 6 karakter/digit.");
      return;
    }
    if (!pass) {
      setLupaError("Kata sandi baru wajib diisi.");
      return;
    }
    if (pass.length < 6) {
      setLupaError("Kata sandi baru minimal 6 karakter.");
      return;
    }
    if (pass !== conf) {
      setLupaError("Konfirmasi kata sandi tidak sesuai.");
      return;
    }

    setLupaLoading(true);
    setLupaError("");
    const res = await verifikasiDanUbahPassword(lupaEmail, token, pass);
    setLupaLoading(false);

    if (!res.ok) {
      setLupaError(res.error || "Gagal memperbarui kata sandi. Pastikan kode verifikasi sesuai.");
      return;
    }

    toast.success("Kata sandi berhasil diubah! Silakan masuk dengan kata sandi baru.");
    setEmail(lupaEmail);
    setPassword("");
    setLupaOpen(false);
  };

  const submit = async (e: React.FormEvent) => {
>>>>>>> b897868 (Initial commit - AppBenk)
    e.preventDefault();
    const ee = !email.trim()
      ? "Email wajib diisi."
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ? "Format email tidak valid."
        : "";
    const ep = !password ? "Password wajib diisi." : "";
    setErrEmail(ee);
    setErrPassword(ep);
    setError("");
    if (ee || ep) return;

    setLoading(true);
<<<<<<< HEAD
    void (async () => {
      const sesi = await masuk(email, password);
      if (!sesi) {
        setLoading(false);
        setError("Email atau password salah. Silakan coba lagi.");
        return;
      }
      toast.success(`Berhasil masuk sebagai ${LABEL_ROLE[sesi.role]}`);
      navigate({ to: HOME_ROLE[sesi.role], replace: true });
    })();
=======
    const hasil = await masuk(email, password);
    setLoading(false);
    if (!hasil.user) {
      let pesan = hasil.error ?? "Email atau password salah. Silakan coba lagi.";
      if (pesan.toLowerCase().includes("email not confirmed")) {
        pesan = "Email belum dikonfirmasi. Periksa kotak masuk email Anda atau matikan 'Confirm email' di Supabase Auth.";
      } else if (pesan.toLowerCase().includes("invalid login credentials")) {
        pesan = "Email atau kata sandi salah. Pastikan akun sudah terdaftar dan data benar.";
      }
      setError(pesan);
      return;
    }
    toast.success(`Berhasil masuk sebagai ${LABEL_ROLE[hasil.user.role]}`);
    navigate({ to: HOME_ROLE[hasil.user.role], replace: true });
>>>>>>> b897868 (Initial commit - AppBenk)
  };

  return (
    <AuthLayout aksi="daftar">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-center text-center">
            <span className="flex size-16 items-center justify-center rounded-full border-2 border-primary/25 text-primary">
              <UserRoundCheck className="size-8" />
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">Login</h1>
            <p className="mt-1 text-sm text-muted-foreground">Masuk untuk mengakses sistem Anda</p>
          </div>

<<<<<<< HEAD
          <form onSubmit={submit} className="mt-7 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
=======
          <form onSubmit={submit} className="mt-7 space-y-5" autoComplete="off">
            <div className="space-y-1.5">
              <Label htmlFor="login_email_field">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login_email_field"
                  name="login_email_field"
                  type="email"
                  autoComplete="off"
>>>>>>> b897868 (Initial commit - AppBenk)
                  className="h-11 pl-9"
                  placeholder="Masukkan email Anda"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {errEmail && <p className="text-xs text-destructive">{errEmail}</p>}
            </div>

            <div className="space-y-1.5">
<<<<<<< HEAD
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={lihat ? "text" : "password"}
=======
              <Label htmlFor="login_password_field">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login_password_field"
                  name="login_password_field"
                  type={lihat ? "text" : "password"}
                  autoComplete="new-password"
>>>>>>> b897868 (Initial commit - AppBenk)
                  className="h-11 pl-9 pr-10"
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setLihat((v) => !v)}
                  aria-label={lihat ? "Sembunyikan password" : "Tampilkan password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {lihat ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errPassword && <p className="text-xs text-destructive">{errPassword}</p>}
            </div>

            <div className="flex items-center justify-between gap-3 text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input
                  type="checkbox"
                  checked={ingat}
                  onChange={(e) => setIngat(e.target.checked)}
                  className="size-4 rounded border-input accent-primary"
                />
                Ingat saya
              </label>
              <button
                type="button"
<<<<<<< HEAD
                onClick={() => toast.info("Hubungi Admin Bengkel untuk reset kata sandi.")}
=======
                onClick={bukaLupaPassword}
>>>>>>> b897868 (Initial commit - AppBenk)
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Lupa password?
              </button>
            </div>

            {error && (
<<<<<<< HEAD
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="h-11 w-full text-base font-semibold" disabled={loading}>
=======
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="h-11 w-full text-base font-semibold"
              disabled={loading}
            >
>>>>>>> b897868 (Initial commit - AppBenk)
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {loading ? "Memproses..." : "Login"}
            </Button>

<<<<<<< HEAD
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              atau
              <span className="h-px flex-1 bg-border" />
            </div>

            <Button asChild variant="outline" className="h-11 w-full font-semibold">
              <Link to="/register">Daftar jika belum punya akun</Link>
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Belum punya akun?{" "}
              <Link to="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
=======
            <p className="text-center text-sm text-muted-foreground">
              Belum punya akun?{" "}
              <Link
                to="/register"
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
>>>>>>> b897868 (Initial commit - AppBenk)
                Daftar sekarang
              </Link>
            </p>
          </form>
        </div>
<<<<<<< HEAD

        <div className="mt-5 space-y-2 rounded-xl border bg-muted/40 p-4">
          <p className="text-xs font-semibold">Akun demo</p>
          {AKUN_DEMO.map((a) => (
            <button
              key={a.email}
              type="button"
              onClick={() => {
                setEmail(a.email);
                setPassword(a.password);
              }}
              className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[11px] text-muted-foreground transition-colors hover:bg-background"
            >
              <span className="font-medium text-foreground">{LABEL_ROLE[a.role]}</span>
              <span>
                {a.email} / {a.password}
              </span>
            </button>
          ))}
        </div>
      </div>
=======
      </div>

      {/* Modal Dialog Lupa Password Real (Kirim OTP ke Email & Verifikasi) */}
      <Dialog open={lupaOpen} onOpenChange={setLupaOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <KeyRound className="size-6" />
            </div>
            <DialogTitle className="text-center text-xl font-bold">
              {lupaStep === 1 ? "Lupa Kata Sandi" : "Verifikasi & Sandi Baru"}
            </DialogTitle>
            <DialogDescription className="text-center text-xs sm:text-sm">
              {lupaStep === 1
                ? "Masukkan email akun Anda. Kami akan mengirimkan kode verifikasi keamanan ke email tersebut."
                : `Masukkan kode verifikasi yang telah dikirim ke ${lupaEmail} dan buat kata sandi baru.`}
            </DialogDescription>
          </DialogHeader>

          {lupaError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs sm:text-sm text-destructive">
              {lupaError}
            </div>
          )}

          {lupaStep === 1 ? (
            <form onSubmit={handleKirimKodeReset} className="mt-2 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="lupa_email_input">Alamat Email Terdaftar</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="lupa_email_input"
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={lupaEmail}
                    onChange={(e) => setLupaEmail(e.target.value)}
                    className="h-11 pl-9"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Pastikan menggunakan email aktif yang sudah terdaftar di AppBenk.
                </p>
              </div>

              <Button
                type="submit"
                className="h-11 w-full font-semibold"
                disabled={lupaLoading}
              >
                {lupaLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                {lupaLoading ? "Mengirim Kode Verifikasi..." : "Kirim Kode Verifikasi"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifikasiDanUbah} className="mt-2 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="lupa_kode_input">Kode Verifikasi (OTP)</Label>
                <Input
                  id="lupa_kode_input"
                  type="text"
                  required
                  placeholder="Contoh: 123456"
                  value={lupaKode}
                  onChange={(e) => setLupaKode(e.target.value)}
                  className="h-11 text-center font-mono text-lg tracking-widest"
                  maxLength={12}
                  autoFocus
                />
                <p className="text-center text-[11px] text-muted-foreground">
                  Periksa kotak masuk atau spam pada email <strong>{lupaEmail}</strong>.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lupa_password_baru">Kata Sandi Baru</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="lupa_password_baru"
                    type={lupaLihat ? "text" : "password"}
                    required
                    placeholder="Minimal 6 karakter"
                    value={lupaPasswordBaru}
                    onChange={(e) => setLupaPasswordBaru(e.target.value)}
                    className="h-11 pl-9 pr-10"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setLupaLihat((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {lupaLihat ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lupa_konfirmasi">Konfirmasi Kata Sandi Baru</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="lupa_konfirmasi"
                    type={lupaLihat ? "text" : "password"}
                    required
                    placeholder="Ulangi kata sandi baru"
                    value={lupaKonfirmasi}
                    onChange={(e) => setLupaKonfirmasi(e.target.value)}
                    className="h-11 pl-9"
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="h-11 w-full font-semibold"
                disabled={lupaLoading}
              >
                {lupaLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                {lupaLoading ? "Memperbarui Kata Sandi..." : "Simpan Kata Sandi Baru"}
              </Button>

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setLupaStep(1);
                    setLupaError("");
                  }}
                  className="text-muted-foreground hover:text-foreground hover:underline"
                >
                  Ubah Alamat Email
                </button>
                <button
                  type="button"
                  disabled={countdown > 0 || lupaLoading}
                  onClick={() => handleKirimKodeReset()}
                  className="font-medium text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
                >
                  {countdown > 0 ? (
                    `Kirim ulang kode (${countdown}s)`
                  ) : (
                    <span className="flex items-center gap-1">
                      <RotateCcw className="size-3" /> Kirim ulang kode
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
>>>>>>> b897868 (Initial commit - AppBenk)
    </AuthLayout>
  );
}
