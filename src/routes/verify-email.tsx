import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Mail, RotateCcw, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HOME_ROLE, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/verify-email")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Verifikasi Email — AppBenk Solusi Servis Kendaraan" },
      {
        name: "description",
        content: "Konfirmasi alamat email Anda untuk mengaktifkan akun AppBenk Anda.",
      },
    ],
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const navigate = useNavigate();
  const { user, kirimUlangEmailVerifikasi } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (user) {
      toast.success("Email Anda telah terverifikasi! Selamat datang di AppBenk.");
      navigate({ to: HOME_ROLE[user.role], replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    // Ambil email dari sessionStorage jika baru saja register
    if (typeof window !== "undefined") {
      const pendingEmail = window.sessionStorage.getItem("appbenk_pending_email") || "";
      if (pendingEmail) setEmail(pendingEmail);
    }
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleKirimUlang = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = email.trim();
    if (!targetEmail) {
      toast.error("Masukkan alamat email Anda terlebih dahulu.");
      return;
    }

    setLoading(true);
    const res = await kirimUlangEmailVerifikasi(targetEmail);
    setLoading(false);

    if (!res.ok) {
      let msg = res.error || "Gagal mengirim ulang email verifikasi.";
      if (msg.toLowerCase().includes("rate limit")) {
        msg = "Terlalu banyak permintaan. Silakan tunggu beberapa saat sebelum mengirim ulang.";
      }
      toast.error(msg);
      return;
    }

    toast.success(
      "Tautan verifikasi telah dikirim ulang ke email Anda. Silakan periksa inbox atau spam.",
    );
    setCountdown(60);
  };

  return (
    <AuthLayout aksi="masuk">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail className="size-8" />
        </div>

        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">
          Verifikasi Email Anda
        </h1>

        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Silakan periksa kotak masuk (inbox) atau folder spam email Anda untuk melakukan verifikasi
          akun AppBenk.
        </p>

        {email && (
          <div className="mt-4 rounded-lg bg-muted/60 px-3 py-2 text-xs font-medium text-foreground">
            {email}
          </div>
        )}

        <form onSubmit={handleKirimUlang} className="mt-6 space-y-4 text-left">
          <div className="space-y-1.5">
            <Label htmlFor="verify_email_input" className="text-xs">
              Alamat Email Anda
            </Label>
            <Input
              id="verify_email_input"
              type="email"
              required
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10"
            />
          </div>

          <Button
            type="submit"
            variant="outline"
            className="w-full gap-2 font-medium"
            disabled={loading || countdown > 0}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Mengirim Ulang...
              </>
            ) : countdown > 0 ? (
              `Kirim Ulang Email (${countdown}s)`
            ) : (
              <>
                <RotateCcw className="size-4" /> Kirim Ulang Email Verifikasi
              </>
            )}
          </Button>
        </form>

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
