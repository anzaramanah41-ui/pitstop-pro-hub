import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail, UserRoundCheck } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AKUN_DEMO, HOME_ROLE, LABEL_ROLE, useAuth } from "@/lib/auth";

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
  const { user, masuk } = useAuth();
  const [email, setEmail] = useState("pelanggan@appbenk.test");
  const [password, setPassword] = useState("pelanggan123");
  const [lihat, setLihat] = useState(false);
  const [ingat, setIngat] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errEmail, setErrEmail] = useState("");
  const [errPassword, setErrPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) navigate({ to: HOME_ROLE[user.role], replace: true });
  }, [user, navigate]);

  const submit = (e: React.FormEvent) => {
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
    setTimeout(() => {
      const sesi = masuk(email, password);
      if (!sesi) {
        setLoading(false);
        setError("Email atau password salah. Silakan coba lagi.");
        return;
      }
      toast.success(`Berhasil masuk sebagai ${LABEL_ROLE[sesi.role]}`);
      navigate({ to: HOME_ROLE[sesi.role], replace: true });
    }, 500);
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

          <form onSubmit={submit} className="mt-7 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className="h-11 pl-9"
                  placeholder="Masukkan email Anda"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {errEmail && <p className="text-xs text-destructive">{errEmail}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={lihat ? "text" : "password"}
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
                onClick={() => toast.info("Hubungi Admin Bengkel untuk reset kata sandi.")}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Lupa password?
              </button>
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="h-11 w-full text-base font-semibold" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {loading ? "Memproses..." : "Login"}
            </Button>

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
                Daftar sekarang
              </Link>
            </p>
          </form>
        </div>

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
    </AuthLayout>
  );
}
