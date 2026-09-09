import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";

/** Kerangka halaman autentikasi AppBenk: header brand + konten terpusat + footer. */
export function AuthLayout({
  children,
  aksi,
}: {
  children: ReactNode;
  /** Tombol kanan atas: "masuk" pada halaman register, "daftar" pada halaman login. */
  aksi: "masuk" | "daftar";
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link to="/login" className="flex items-center gap-2.5">
            <BrandLogo size={34} />
            <span className="leading-tight">
              <span className="block font-display text-base font-bold tracking-tight">AppBenk</span>
              <span className="hidden text-[11px] text-muted-foreground sm:block">
                Solusi Servis Kendaraan
              </span>
            </span>
          </Link>

<<<<<<< HEAD
          <nav className="ml-auto hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
            <Link to="/login" className="transition-colors hover:text-foreground">
              Beranda
            </Link>
            <Link to="/register" className="transition-colors hover:text-foreground">
              Daftar Akun
            </Link>
          </nav>

          <div className="ml-auto md:ml-7">
            {aksi === "masuk" ? (
              <Button asChild variant="outline" className="font-semibold">
                <Link to="/login">Masuk</Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="font-semibold">
                <Link to="/register">Daftar</Link>
              </Button>
=======
          <div className="ml-auto">
            {aksi === "masuk" && (
              <Button asChild variant="outline" className="font-semibold">
                <Link to="/login">Masuk</Link>
              </Button>
>>>>>>> b897868 (Initial commit - AppBenk)
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-10 sm:py-14">{children}</main>

      <footer className="border-t bg-card">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <BrandLogo size={30} />
              <span className="font-display text-sm font-bold tracking-tight">AppBenk</span>
            </div>
            <p className="max-w-xs text-xs text-muted-foreground">
              Solusi servis kendaraan untuk pelanggan, admin bengkel, dan owner dalam satu platform.
            </p>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p className="text-sm font-semibold text-foreground">Navigasi</p>
            <p>
              <Link to="/login" className="hover:text-foreground">
                Login
              </Link>
            </p>
            <p>
              <Link to="/register" className="hover:text-foreground">
                Daftar Akun
              </Link>
            </p>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p className="text-sm font-semibold text-foreground">Layanan</p>
            <p>Booking Servis</p>
            <p>Status &amp; Estimasi Servis</p>
            <p>Riwayat &amp; Pembayaran</p>
          </div>
        </div>
        <div className="border-t py-4 text-center text-[11px] text-muted-foreground">
          © 2026 AppBenk. Seluruh hak cipta dilindungi.
        </div>
      </footer>
    </div>
  );
}
