import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
<<<<<<< HEAD
import { CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail, Phone, UserPlus, UserRound } from "lucide-react";
=======
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  UserPlus,
  UserRound,
} from "lucide-react";
>>>>>>> b897868 (Initial commit - AppBenk)
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HOME_ROLE, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Daftar Akun — AppBenk Solusi Servis Kendaraan" },
      {
        name: "description",
        content:
          "Buat akun pelanggan AppBenk untuk booking servis, memantau status kendaraan, dan melihat riwayat pembayaran bengkel.",
      },
      { property: "og:title", content: "Daftar Akun — AppBenk Solusi Servis Kendaraan" },
      { property: "og:description", content: "Buat akun untuk mengakses semua layanan AppBenk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegisterPage,
});

<<<<<<< HEAD
type Err = Partial<Record<"nama" | "email" | "telepon" | "password" | "konfirmasi" | "setuju", string>>;
=======
type Err = Partial<
  Record<"nama" | "email" | "telepon" | "password" | "konfirmasi" | "setuju", string>
>;
>>>>>>> b897868 (Initial commit - AppBenk)

function RegisterPage() {
  const navigate = useNavigate();
  const { user, daftar } = useAuth();
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [telepon, setTelepon] = useState("");
  const [password, setPassword] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [lihat1, setLihat1] = useState(false);
  const [lihat2, setLihat2] = useState(false);
  const [setuju, setSetuju] = useState(false);
  const [err, setErr] = useState<Err>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sukses, setSukses] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: HOME_ROLE[user.role], replace: true });
<<<<<<< HEAD
  }, [user, navigate]);

  const submit = (e: React.FormEvent) => {
=======
    // Reset state on mount to prevent browser autofill
    setNama("");
    setEmail("");
    setTelepon("");
    setPassword("");
    setKonfirmasi("");
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
>>>>>>> b897868 (Initial commit - AppBenk)
    e.preventDefault();
    const next: Err = {};
    if (!nama.trim()) next.nama = "Nama lengkap wajib diisi.";
    if (!email.trim()) next.email = "Email wajib diisi.";
<<<<<<< HEAD
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Format email tidak valid.";
=======
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = "Format email tidak valid.";
>>>>>>> b897868 (Initial commit - AppBenk)
    if (!telepon.trim()) next.telepon = "No. handphone wajib diisi.";
    if (!password) next.password = "Kata sandi wajib diisi.";
    else if (password.length < 8) next.password = "Kata sandi minimal 8 karakter.";
    if (konfirmasi !== password) next.konfirmasi = "Konfirmasi kata sandi tidak sama.";
    if (!setuju) next.setuju = "Anda harus menyetujui Syarat & Ketentuan dan Kebijakan Privasi.";
    setErr(next);
    setError("");
    if (Object.keys(next).length) return;

    setLoading(true);
<<<<<<< HEAD
    void (async () => {
      const hasil = await daftar({ nama, email, telepon, password });
      setLoading(false);
      if (!hasil.ok) {
        setError(hasil.error);
        return;
      }
      setSukses(true);
      toast.success("Akun berhasil dibuat.");
    })();
=======
    const hasil = await daftar({ nama, email, telepon, password });
    setLoading(false);
    if (!hasil.ok) {
      let pesan = hasil.error ?? "Pendaftaran gagal.";
      if (pesan.toLowerCase().includes("user already registered")) {
        pesan = "Email ini sudah terdaftar. Silakan gunakan email lain atau login.";
      } else if (pesan.toLowerCase().includes("email address") && pesan.toLowerCase().includes("invalid")) {
        pesan = "Format alamat email tidak diterima oleh penyedia auth. Gunakan domain email umum (misal: @gmail.com).";
      }
      setError(pesan);
      return;
    }
    setSukses(true);
    toast.success("Akun berhasil dibuat. Periksa email bila verifikasi akun diaktifkan.");
>>>>>>> b897868 (Initial commit - AppBenk)
  };

  if (sukses) {
    return (
      <AuthLayout aksi="masuk">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="size-8" />
          </span>
<<<<<<< HEAD
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">Akun Berhasil Dibuat</h1>
=======
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">
            Akun Berhasil Dibuat
          </h1>
>>>>>>> b897868 (Initial commit - AppBenk)
          <p className="mt-2 text-sm text-muted-foreground">
            Akun Anda berhasil dibuat. Silakan login untuk melanjutkan.
          </p>
          <Button asChild className="mt-6 h-11 w-full text-base font-semibold">
            <Link to="/login">Kembali ke Login</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout aksi="masuk">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-16 items-center justify-center rounded-full border-2 border-primary/25 text-primary">
            <UserPlus className="size-8" />
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">Daftar Akun</h1>
<<<<<<< HEAD
          <p className="mt-1 text-sm text-muted-foreground">Buat akun untuk mengakses semua layanan</p>
        </div>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <Field
            id="nama"
=======
          <p className="mt-1 text-sm text-muted-foreground">
            Buat akun untuk mengakses semua layanan
          </p>
        </div>

        <form onSubmit={submit} className="mt-7 space-y-4" autoComplete="off">
          {/* Decoy inputs to prevent browser password managers from auto-filling saved accounts (e.g. amato@gmail.com) */}
          <input
            type="text"
            name="fake_user_remembered"
            style={{ display: "none" }}
            tabIndex={-1}
            autoComplete="off"
          />
          <input
            type="password"
            name="fake_pass_remembered"
            style={{ display: "none" }}
            tabIndex={-1}
            autoComplete="new-password"
          />

          <Field
            id="reg_nama"
            name="reg_nama"
>>>>>>> b897868 (Initial commit - AppBenk)
            label="Nama Lengkap"
            icon={<UserRound className="size-4" />}
            placeholder="Masukkan nama lengkap Anda"
            value={nama}
            onChange={setNama}
            error={err.nama}
<<<<<<< HEAD
          />
          <Field
            id="email"
=======
            autoComplete="off"
          />
          <Field
            id="reg_email"
            name="reg_email"
>>>>>>> b897868 (Initial commit - AppBenk)
            label="Email"
            type="email"
            icon={<Mail className="size-4" />}
            placeholder="Masukkan email aktif Anda"
            value={email}
            onChange={setEmail}
            error={err.email}
<<<<<<< HEAD
          />
          <Field
            id="telepon"
=======
            autoComplete="new-password"
          />
          <Field
            id="reg_telepon"
            name="reg_telepon"
>>>>>>> b897868 (Initial commit - AppBenk)
            label="No. Handphone"
            type="tel"
            icon={<Phone className="size-4" />}
            placeholder="Masukkan nomor handphone Anda"
            value={telepon}
            onChange={setTelepon}
            error={err.telepon}
<<<<<<< HEAD
          />
          <Field
            id="password"
=======
            autoComplete="off"
          />
          <Field
            id="reg_password"
            name="reg_password"
>>>>>>> b897868 (Initial commit - AppBenk)
            label="Kata Sandi"
            type={lihat1 ? "text" : "password"}
            icon={<Lock className="size-4" />}
            placeholder="Buat kata sandi"
            value={password}
            onChange={setPassword}
            error={err.password}
<<<<<<< HEAD
            toggle={{ on: lihat1, set: () => setLihat1((v) => !v) }}
          />
          <Field
            id="konfirmasi"
=======
            autoComplete="new-password"
            toggle={{ on: lihat1, set: () => setLihat1((v) => !v) }}
          />
          <Field
            id="reg_konfirmasi"
            name="reg_konfirmasi"
>>>>>>> b897868 (Initial commit - AppBenk)
            label="Konfirmasi Kata Sandi"
            type={lihat2 ? "text" : "password"}
            icon={<Lock className="size-4" />}
            placeholder="Ulangi kata sandi"
            value={konfirmasi}
            onChange={setKonfirmasi}
            error={err.konfirmasi}
<<<<<<< HEAD
=======
            autoComplete="new-password"
>>>>>>> b897868 (Initial commit - AppBenk)
            toggle={{ on: lihat2, set: () => setLihat2((v) => !v) }}
          />

          <div className="space-y-1">
            <label className="flex items-start gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={setuju}
                onChange={(e) => setSetuju(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 rounded border-input accent-primary"
              />
              <span>
<<<<<<< HEAD
                Saya setuju dengan <span className="font-medium text-foreground underline">Syarat &amp; Ketentuan</span>{" "}
=======
                Saya setuju dengan{" "}
                <span className="font-medium text-foreground underline">
                  Syarat &amp; Ketentuan
                </span>{" "}
>>>>>>> b897868 (Initial commit - AppBenk)
                dan <span className="font-medium text-foreground underline">Kebijakan Privasi</span>
              </span>
            </label>
            {err.setuju && <p className="text-xs text-destructive">{err.setuju}</p>}
          </div>

<<<<<<< HEAD
          {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
=======
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
>>>>>>> b897868 (Initial commit - AppBenk)

          <Button type="submit" className="h-11 w-full text-base font-semibold" disabled={loading}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {loading ? "Membuat Akun..." : "Daftar"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
<<<<<<< HEAD
            Registrasi publik otomatis terdaftar sebagai <span className="font-semibold">Pelanggan</span>.
=======
            Registrasi publik otomatis terdaftar sebagai{" "}
            <span className="font-semibold">Pelanggan</span>.
>>>>>>> b897868 (Initial commit - AppBenk)
          </p>

          <p className="text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
<<<<<<< HEAD
            <Link to="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
=======
            <Link
              to="/login"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
>>>>>>> b897868 (Initial commit - AppBenk)
              Login
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
}

function Field({
  id,
<<<<<<< HEAD
=======
  name,
>>>>>>> b897868 (Initial commit - AppBenk)
  label,
  icon,
  placeholder,
  value,
  onChange,
  error,
  type = "text",
<<<<<<< HEAD
  toggle,
}: {
  id: string;
=======
  autoComplete = "off",
  toggle,
}: {
  id: string;
  name?: string;
>>>>>>> b897868 (Initial commit - AppBenk)
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | undefined;
  type?: string;
<<<<<<< HEAD
=======
  autoComplete?: string;
>>>>>>> b897868 (Initial commit - AppBenk)
  toggle?: { on: boolean; set: () => void } | undefined;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        <Input
          id={id}
<<<<<<< HEAD
          type={type}
=======
          name={name || id}
          type={type}
          autoComplete={autoComplete}
>>>>>>> b897868 (Initial commit - AppBenk)
          className={toggle ? "h-11 pl-9 pr-10" : "h-11 pl-9"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {toggle && (
          <button
            type="button"
            onClick={toggle.set}
            aria-label={toggle.on ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {toggle.on ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
