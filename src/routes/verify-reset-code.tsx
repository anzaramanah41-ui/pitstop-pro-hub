import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { KeyRound, ArrowLeft, Loader2, RotateCcw, Mail } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/verify-reset-code")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { email?: string | undefined } => ({
    email: typeof search["email"] === "string" ? (search["email"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Verifikasi Kode — AppBenk Solusi Servis Kendaraan" },
      {
        name: "description",
        content: "Masukkan 8 digit kode verifikasi yang dikirim ke email Anda untuk melanjutkan pemulihan kata sandi.",
      },
    ],
  }),
  component: VerifyResetCodePage,
});

function VerifyResetCodePage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { verifikasiKodeResetOtp, kirimKodeResetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [errToken, setErrToken] = useState("");
  const [generalError, setGeneralError] = useState("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Ambil email dari search param URL atau sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const qEmail = search.email || new URLSearchParams(window.location.search).get("email");
    const sEmail = sessionStorage.getItem("appbenk_reset_email");
    const targetEmail = qEmail || sEmail || "";
    if (targetEmail) {
      setEmail(targetEmail);
      sessionStorage.setItem("appbenk_reset_email", targetEmail);
    }
  }, [search.email]);

  // Timer hitung mundur untuk kirim ulang kode (anti-double timer)
  useEffect(() => {
    if (countdown <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [countdown]);

  const handleKirimUlang = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setGeneralError("Alamat email belum tersedia. Silakan kembali ke halaman Lupa Password.");
      return;
    }
    if (!cleanEmail.endsWith("@gmail.com")) {
      setGeneralError("Hanya alamat email @gmail.com yang diperbolehkan.");
      return;
    }

    setResendLoading(true);
    setGeneralError("");
    setErrToken("");

    try {
      const res = await kirimKodeResetPassword(cleanEmail);
      if (!res.ok) {
        setGeneralError(res.error || "Gagal mengirim ulang kode verifikasi. Silakan coba beberapa saat lagi.");
      } else {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("appbenk_otp_sent_at", String(Date.now()));
        }
        toast.success("Kode verifikasi baru telah dikirim ke email Gmail Anda!");
        setCountdown(60);
      }
    } catch {
      setGeneralError("Terjadi kesalahan koneksi saat mengirim ulang kode.");
    } finally {
      setResendLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrToken("");
    setGeneralError("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = token.trim();

    // 1. Validasi Email
    if (!cleanEmail) {
      setGeneralError("Alamat email tidak ditemukan. Silakan kembali ke halaman Lupa Password.");
      return;
    }

    // 2. Validasi OTP Kosong
    if (!cleanToken) {
      setErrToken("Kode verifikasi wajib diisi.");
      return;
    }

    // 3. Validasi OTP Bukan 8 Digit
    if (cleanToken.length !== 8) {
      setErrToken("Kode verifikasi harus 8 digit.");
      return;
    }

    setLoading(true);

    // 4. Verifikasi kriptografis nyata ke Supabase Auth server
    const res = await verifikasiKodeResetOtp(cleanEmail, cleanToken);
    setLoading(false);

    if (!res.ok) {
      if (res.errorType === "empty") {
        setErrToken("Kode verifikasi wajib diisi.");
      } else if (res.errorType === "length") {
        setErrToken("Kode verifikasi harus 8 digit.");
      } else if (res.errorType === "expired") {
        setErrToken("Kode verifikasi sudah kedaluwarsa. Silakan kirim ulang kode.");
      } else {
        // Error tidak sesuai atau invalid
        setErrToken("Kode verifikasi tidak sesuai.");
      }
      return;
    }

    // 5. OTP Benar dan Masih Valid -> Lanjut ke Tahap 2
    if (typeof window !== "undefined") {
      sessionStorage.setItem("appbenk_otp_verified", "true");
      sessionStorage.setItem("appbenk_reset_email", cleanEmail);
    }
    toast.success("Kode verifikasi berhasil divalidasi!");
    navigate({ to: "/reset-password/new" });
  };

  return (
    <AuthLayout aksi="masuk">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <KeyRound className="size-8" />
        </div>

        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">Verifikasi Kode</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Masukkan kode verifikasi yang dikirim ke email Anda.
        </p>

        {email ? (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1 text-xs text-muted-foreground border">
            <Mail className="size-3.5 text-primary" />
            <span>Kode dikirim ke: <strong className="text-foreground">{email}</strong></span>
          </div>
        ) : (
          <div className="mt-3 text-xs text-amber-600 bg-amber-500/10 p-2 rounded-lg">
            Email belum terdeteksi. Silakan ketik email Anda atau kembali ke Lupa Password.
          </div>
        )}

        {generalError && (
          <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-xs text-destructive text-left">
            {generalError}
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4 text-left" noValidate>
          {!email && (
            <div className="space-y-1.5">
              <Label htmlFor="manual_email">Alamat Email (@gmail.com)</Label>
              <Input
                id="manual_email"
                type="email"
                required
                placeholder="nama@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="reset_otp_input">Kode Verifikasi (OTP)</Label>
              <button
                type="button"
                onClick={handleKirimUlang}
                disabled={resendLoading || countdown > 0}
                className="text-xs font-medium text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
              >
                {resendLoading ? (
                  "Mengirim..."
                ) : countdown > 0 ? (
                  `Kirim ulang (${countdown}s)`
                ) : (
                  <span className="flex items-center gap-1">
                    <RotateCcw className="size-3" /> Kirim ulang kode
                  </span>
                )}
              </button>
            </div>

            <Input
              id="reset_otp_input"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={8}
              placeholder="Masukkan 8 digit kode"
              value={token}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 8);
                setToken(val);
                if (errToken) setErrToken("");
              }}
              className="h-12 text-center font-mono text-xl tracking-widest"
              autoFocus
            />

            {errToken ? (
              <p className="text-xs text-destructive mt-1 font-medium">{errToken}</p>
            ) : (
              <p className="text-[11px] text-muted-foreground mt-1.5 text-center">
                Gunakan kode verifikasi 8 digit terbaru yang dikirim ke Gmail Anda.
              </p>
            )}
          </div>

          <Button type="submit" className="h-11 w-full font-semibold" disabled={loading}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {loading ? "Memverifikasi Kode..." : "Verifikasi Kode"}
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-border/60">
          <Button asChild variant="ghost" className="w-full gap-2 text-sm">
            <Link to="/forgot-password">
              <ArrowLeft className="size-4" /> Kembali ke Lupa Password
            </Link>
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
