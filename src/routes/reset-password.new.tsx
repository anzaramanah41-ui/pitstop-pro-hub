import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, KeyRound, Loader2, Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/reset-password/new")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Buat Kata Sandi Baru — AppBenk Solusi Servis Kendaraan" },
      {
        name: "description",
        content: "Buat kata sandi baru yang aman untuk akun AppBenk Anda setelah verifikasi kode berhasil.",
      },
    ],
  }),
  component: ResetPasswordNewPage,
});

function ResetPasswordNewPage() {
  const navigate = useNavigate();
  const { perbaruiKataSandiBaru, cekSesiRecoveryAktif } = useAuth();

  const [password, setPassword] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [lihatPassword, setLihatPassword] = useState(false);
  const [lihatKonfirmasi, setLihatKonfirmasi] = useState(false);

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [errPassword, setErrPassword] = useState("");
  const [errKonfirmasi, setErrKonfirmasi] = useState("");
  const [generalError, setGeneralError] = useState("");

  const isCompletedRef = useRef(false);

  // Security Guard: Pastikan sesi recovery nyata dari Supabase aktif saat halaman pertama kali dimuat
  useEffect(() => {
    let isMounted = true;

    const verifikasiSesi = async () => {
      if (typeof window === "undefined") return;
      if (isCompletedRef.current) return;

      const otpVerified = sessionStorage.getItem("appbenk_otp_verified") === "true";
      const hasActiveSession = await cekSesiRecoveryAktif();

      if (!isMounted || isCompletedRef.current) return;

      // Jika tidak ada sesi recovery aktif di Supabase atau tidak melalui OTP
      if (!hasActiveSession || !otpVerified) {
        toast.error("Sesi reset password tidak valid atau sudah kedaluwarsa. Silakan mulai kembali.");
        sessionStorage.removeItem("appbenk_otp_verified");
        sessionStorage.removeItem("appbenk_reset_email");
        sessionStorage.removeItem("appbenk_otp_sent_at");
        navigate({ to: "/forgot-password", replace: true });
        return;
      }

      setCheckingSession(false);
    };

    verifikasiSesi();

    return () => {
      isMounted = false;
    };
  }, []); // Hanya dijalankan 1 kali saat mount pertama halaman

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrPassword("");
    setErrKonfirmasi("");
    setGeneralError("");

    let valid = true;

    // 1. Validasi Password Baru
    if (!password) {
      setErrPassword("Kata sandi wajib diisi.");
      valid = false;
    } else if (password.length < 6) {
      setErrPassword("Kata sandi minimal 6 karakter.");
      valid = false;
    }

    // 2. Validasi Konfirmasi Password
    if (!konfirmasi) {
      setErrKonfirmasi("Konfirmasi kata sandi wajib diisi.");
      valid = false;
    } else if (password && konfirmasi && password !== konfirmasi) {
      setErrKonfirmasi("Kata sandi tidak sama.");
      valid = false;
    }

    if (!valid) return;

    // Kunci guard agar signOut setelah update password tidak memicu toast session expired
    isCompletedRef.current = true;
    setLoading(true);

    try {
      const res = await perbaruiKataSandiBaru(password);

      if (!res.ok) {
        isCompletedRef.current = false;
        setLoading(false);
        setGeneralError(res.error || "Gagal memperbarui kata sandi. Silakan coba kembali.");
        return;
      }

      // Bersihkan session storage pemulihan
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("appbenk_otp_verified");
        sessionStorage.removeItem("appbenk_reset_email");
        sessionStorage.removeItem("appbenk_otp_sent_at");
      }

      toast.success("Kata sandi berhasil diubah! Silakan masuk menggunakan kata sandi baru Anda.");
      
      // Langsung diarahkan ke halaman login secara bersih
      navigate({ to: "/login", replace: true });
    } catch {
      isCompletedRef.current = false;
      setLoading(false);
      setGeneralError("Terjadi kesalahan sistem saat memperbarui kata sandi.");
    }
  };

  if (checkingSession) {
    return (
      <AuthLayout aksi="masuk">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
          <Loader2 className="mx-auto size-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Memvalidasi sesi keamanan reset password...</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout aksi="masuk">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <KeyRound className="size-8" />
        </div>

        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">
          Buat Kata Sandi Baru
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Silakan buat kata sandi baru untuk akun Anda.
        </p>

        {generalError && (
          <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-xs text-destructive text-left">
            {generalError}
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4 text-left" noValidate>
          {/* Field 1: Kata Sandi Baru */}
          <div className="space-y-1.5">
            <Label htmlFor="new_password_field">Kata Sandi Baru</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="new_password_field"
                type={lihatPassword ? "text" : "password"}
                placeholder="Masukkan kata sandi baru"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errPassword) setErrPassword("");
                }}
                className="h-11 pl-9 pr-10"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setLihatPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={lihatPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {lihatPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errPassword && (
              <p className="text-xs text-destructive font-medium">{errPassword}</p>
            )}
          </div>

          {/* Field 2: Konfirmasi Kata Sandi Baru */}
          <div className="space-y-1.5">
            <Label htmlFor="confirm_password_field">Konfirmasi Kata Sandi Baru</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirm_password_field"
                type={lihatKonfirmasi ? "text" : "password"}
                placeholder="Ulangi kata sandi baru"
                value={konfirmasi}
                onChange={(e) => {
                  setKonfirmasi(e.target.value);
                  if (errKonfirmasi) setErrKonfirmasi("");
                }}
                className="h-11 pl-9 pr-10"
              />
              <button
                type="button"
                onClick={() => setLihatKonfirmasi((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={lihatKonfirmasi ? "Sembunyikan password" : "Tampilkan password"}
              >
                {lihatKonfirmasi ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errKonfirmasi && (
              <p className="text-xs text-destructive font-medium">{errKonfirmasi}</p>
            )}
          </div>

          <Button type="submit" className="h-11 w-full font-semibold" disabled={loading}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {loading ? "Menyimpan Sandi..." : "Simpan Kata Sandi"}
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-border/60">
          <Button asChild variant="ghost" className="w-full gap-2 text-sm">
            <Link to="/verify-reset-code">
              <ArrowLeft className="size-4" /> Kembali ke Verifikasi Kode
            </Link>
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
