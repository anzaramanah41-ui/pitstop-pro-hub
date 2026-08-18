import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Masuk — Bengkel Pitstop" },
      { name: "description", content: "Aplikasi administrasi bengkel untuk mengelola pelanggan, servis, sparepart, dan riwayat servis." },
      { property: "og:title", content: "Masuk — Bengkel Pitstop" },
      { property: "og:description", content: "Administrasi bengkel yang sederhana, cepat, dan terstruktur." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@pitstop.id");
  const [password, setPassword] = useState("pitstop123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Email dan kata sandi wajib diisi.");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      toast.success("Berhasil masuk sebagai Admin Bengkel");
      navigate({ to: "/dashboard" });
    }, 700);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3">
          <BrandLogo size={44} />
          <p className="font-display text-lg font-bold tracking-tight text-white">BENGKEL PITSTOP</p>
        </div>
        <div className="max-w-md space-y-4">
          <h2 className="font-display text-4xl font-bold leading-tight text-white">
            Administrasi bengkel, tanpa buku catatan.
          </h2>
          <p className="text-sidebar-foreground/70">
            Kelola data pelanggan, servis, sparepart, dan riwayat kendaraan dalam satu tempat yang rapi dan cepat
            dicari.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              ["Cepat", "Input servis < 1 menit"],
              ["Terstruktur", "Riwayat per kendaraan"],
              ["Praktis", "Pricelist selalu siap"],
            ].map(([t, d]) => (
              <div key={t} className="rounded-md bg-sidebar-accent p-3">
                <p className="text-sm font-semibold text-white">{t}</p>
                <p className="text-[11px] text-sidebar-foreground/60">{d}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-sidebar-foreground/50">© 2026 Bengkel Pitstop · Versi demo</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center gap-3 lg:hidden">
            <BrandLogo size={56} />
            <p className="font-display text-xl font-bold">BENGKEL PITSTOP</p>
          </div>

          <div>
            <h1 className="text-2xl font-bold">Masuk ke Aplikasi</h1>
            <p className="mt-1 text-sm text-muted-foreground">Gunakan akun admin bengkel Anda.</p>
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

          <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" /> Mode demo — data hanya tersimpan sementara di perangkat.
          </p>
        </form>
      </div>
    </div>
  );
}
