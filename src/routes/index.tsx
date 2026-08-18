import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AKUN_DEMO, HOME_ROLE, LABEL_ROLE, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Masuk — AppBenk Solusi Servis Kendaraan" },
      {
        name: "description",
        content:
          "Masuk ke AppBenk sebagai Pelanggan, Admin Bengkel, atau Owner untuk mengelola booking, servis, sparepart, dan laporan bengkel.",
      },
      { property: "og:title", content: "Masuk — AppBenk Solusi Servis Kendaraan" },
      { property: "og:description", content: "Satu platform, tiga peran: Pelanggan, Admin Bengkel, dan Owner." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, masuk } = useAuth();
  const [email, setEmail] = useState("pelanggan@appbenk.test");
  const [password, setPassword] = useState("pelanggan123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) navigate({ to: HOME_ROLE[user.role], replace: true });
  }, [user, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Email dan kata sandi wajib diisi.");
      return;
    }
    setLoading(true);
    setError("");
    setTimeout(() => {
      const sesi = masuk(email, password);
      if (!sesi) {
        setLoading(false);
        setError("Email atau kata sandi salah. Gunakan akun demo di samping.");
        return;
      }
      toast.success(`Berhasil masuk sebagai ${LABEL_ROLE[sesi.role]}`);
      navigate({ to: HOME_ROLE[sesi.role], replace: true });
    }, 500);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3">
          <BrandLogo size={44} />
          <p className="font-display text-lg font-bold tracking-tight text-white">APPBENK</p>
        </div>
        <div className="max-w-md space-y-4">
          <h2 className="font-display text-4xl font-bold leading-tight text-white">
            Solusi servis kendaraan untuk semua peran.
          </h2>
          <p className="text-sidebar-foreground/70">
            Pelanggan booking dan pantau servis, Admin Bengkel mengelola operasional, Owner memantau performa bisnis —
            dalam satu aplikasi.
          </p>
          <div className="space-y-2 pt-2">
            {AKUN_DEMO.map((a) => (
              <button
                key={a.email}
                type="button"
                onClick={() => {
                  setEmail(a.email);
                  setPassword(a.password);
                }}
                className="flex w-full items-center justify-between rounded-md bg-sidebar-accent px-3 py-2.5 text-left transition-colors hover:bg-sidebar-accent/70"
              >
                <span>
                  <span className="block text-sm font-semibold text-white">{LABEL_ROLE[a.role]}</span>
                  <span className="block text-[11px] text-sidebar-foreground/60">{a.email}</span>
                </span>
                <span className="text-[11px] text-sidebar-foreground/60">{a.password}</span>
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-sidebar-foreground/50">© 2026 AppBenk · Mock authentication</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center gap-3 lg:hidden">
            <BrandLogo size={56} />
            <p className="font-display text-xl font-bold">APPBENK</p>
          </div>

          <div>
            <h1 className="text-2xl font-bold">Masuk ke AppBenk</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sistem akan mengarahkan Anda sesuai role akun.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Kata Sandi</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {loading ? "Memproses..." : "Masuk"}
          </Button>

          <div className="space-y-2 rounded-md border bg-muted/40 p-3 lg:hidden">
            <p className="text-xs font-semibold">Akun demo</p>
            {AKUN_DEMO.map((a) => (
              <button
                key={a.email}
                type="button"
                onClick={() => {
                  setEmail(a.email);
                  setPassword(a.password);
                }}
                className="block w-full text-left text-[11px] text-muted-foreground"
              >
                {LABEL_ROLE[a.role]} — {a.email} / {a.password}
              </button>
            ))}
          </div>

          <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" /> Mock login — belum terhubung autentikasi asli.
          </p>
        </form>
      </div>
    </div>
  );
}
