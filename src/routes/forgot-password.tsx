import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { KeyRound, Mail, ArrowLeft, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/forgot-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Lupa Kata Sandi — AppBenk Solusi Servis Kendaraan" },
      {
        name: "description",
        content:
          "Pulihkan kata sandi akun AppBenk Anda melalui tautan atau kode yang dikirim ke email.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { kirimKodeResetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [terkirim, setTerkirim] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Alamat email wajib diisi.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Format alamat email tidak valid.");
      return;
    }
    if (!cleanEmail.endsWith("@gmail.com")) {
      setError("Hanya alamat email @gmail.com yang diperbolehkan.");
      return;
    }

    setLoading(true);
    setError("");
    const res = await kirimKodeResetPassword(cleanEmail);
    setLoading(false);

    if (!res.ok) {
      setError(res.error || "Gagal mengirim kode verifikasi. Periksa kembali email Anda.");
      return;
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem("appbenk_reset_email", cleanEmail);
      sessionStorage.setItem("appbenk_otp_sent_at", String(Date.now()));
    }
    toast.success(
      "Kode verifikasi telah dikirim ke email Gmail Anda! Periksa inbox atau folder spam.",
    );
    navigate({ to: "/verify-reset-code", search: { email: cleanEmail } });
  };

  return (
    <AuthLayout aksi="masuk">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <KeyRound className="size-8" />
        </div>

        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">Lupa Kata Sandi</h1>

        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {terkirim
            ? `Kode verifikasi telah dikirim ke ${email}. Silakan periksa inbox atau folder spam Gmail Anda, lalu masukkan kode tersebut di halaman berikutnya.`
            : "Masukkan alamat email yang terdaftar pada akun AppBenk Anda. Kami akan mengirimkan kode verifikasi 8 digit ke email Anda."}
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-xs text-destructive text-left">
            {error}
          </div>
        )}

        {!terkirim ? (
          <form onSubmit={submit} className="mt-6 space-y-4 text-left">
            <div className="space-y-1.5">
              <Label htmlFor="forgot_email">Email Terdaftar</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="forgot_email"
                  type="email"
                  required
                  autoFocus
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 pl-9"
                />
              </div>
            </div>

            <Button type="submit" className="h-11 w-full font-semibold" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {loading ? "Mengirim Kode..." : "Kirim Kode Verifikasi"}
            </Button>
          </form>
        ) : (
          <div className="mt-6 space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={submit}
              disabled={loading || countdown > 0}
              className="w-full gap-2"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : countdown > 0 ? (
                `Kirim ulang kode (${countdown}s)`
              ) : (
                <>
                  <RotateCcw className="size-4" /> Kirim Ulang Kode
                </>
              )}
            </Button>

            <Button asChild className="w-full">
              <Link to="/verify-reset-code">Sudah Menerima Kode? Masukkan Kode</Link>
            </Button>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-border/60">
          <Button asChild variant="ghost" className="w-full gap-2 text-sm">
            <Link to="/login">
              <ArrowLeft className="size-4" /> Kembali ke Login
            </Link>
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
