import { createFileRoute, Link } from "@tanstack/react-router";
<<<<<<< HEAD
import { CalendarPlus, Activity, Wallet, History, ArrowRight, Receipt, Download } from "lucide-react";
=======
import {
  CalendarPlus,
  Activity,
  Wallet,
  History,
  ArrowRight,
  Receipt,
  Download,
} from "lucide-react";
>>>>>>> b897868 (Initial commit - AppBenk)
import { PageHeader, EmptyState } from "@/components/page-header";
import { StatusBadge, BookingBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { useStore, rupiah, tanggalPanjang } from "@/lib/store";

export const Route = createFileRoute("/_shell/pelanggan/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard Pelanggan — AppBenk" },
<<<<<<< HEAD
      { name: "description", content: "Pantau booking aktif, status servis, estimasi biaya, dan pembayaran kendaraan Anda." },
=======
      {
        name: "description",
        content:
          "Pantau booking aktif, status servis, estimasi biaya, dan pembayaran kendaraan Anda.",
      },
>>>>>>> b897868 (Initial commit - AppBenk)
      { property: "og:title", content: "Dashboard Pelanggan — AppBenk" },
      { property: "og:description", content: "Ringkasan servis kendaraan Anda dalam satu layar." },
    ],
  }),
  component: DashboardPelanggan,
});

function DashboardPelanggan() {
  const { user } = useAuth();
  const { servis, booking } = useStore();
  const nama = user?.pelanggan ?? "";

  const servisSaya = servis.filter((s) => s.pelanggan === nama);
  const bookingSaya = booking.filter((b) => b.pelanggan === nama);
  const aktif = servisSaya.filter((s) => !["Selesai Dibayar"].includes(s.status));
  const tagihan = servisSaya.filter((s) => s.status === "Menunggu Pembayaran");
  const pembayaran = servisSaya
    .filter((s) => ["Menunggu Pembayaran", "Selesai Dibayar"].includes(s.status))
    .slice(0, 3);

  const stats = [
<<<<<<< HEAD
    { label: "Booking Aktif", value: bookingSaya.filter((b) => b.status !== "Ditolak").length, hint: "booking tercatat" },
=======
    {
      label: "Booking Aktif",
      value: bookingSaya.filter((b) => b.status !== "Ditolak").length,
      hint: "booking tercatat",
    },
>>>>>>> b897868 (Initial commit - AppBenk)
    { label: "Servis Berjalan", value: aktif.length, hint: "belum selesai dibayar" },
    { label: "Menunggu Bayar", value: tagihan.length, hint: "tagihan aktif" },
    { label: "Total Riwayat", value: servisSaya.length, hint: "servis kendaraan" },
  ];

  const aksi = [
    { to: "/pelanggan/booking", label: "Buat Booking", icon: CalendarPlus },
    { to: "/pelanggan/status", label: "Status Servis", icon: Activity },
    { to: "/pelanggan/pembayaran", label: "Pembayaran", icon: Wallet },
    { to: "/pelanggan/riwayat", label: "Riwayat", icon: History },
  ] as const;

  return (
    <>
<<<<<<< HEAD
      <PageHeader title={`Halo, ${user?.nama}`} description="Ringkasan servis kendaraan Anda hari ini." />
=======
      <PageHeader
        title={`Halo, ${user?.nama}`}
        description="Ringkasan servis kendaraan Anda hari ini."
      />
>>>>>>> b897868 (Initial commit - AppBenk)

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-l-4 border-l-primary">
            <CardContent className="p-5">
<<<<<<< HEAD
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</p>
=======
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {s.label}
              </p>
>>>>>>> b897868 (Initial commit - AppBenk)
              <p className="mt-3 font-display text-3xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
<<<<<<< HEAD
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Aksi Cepat</CardTitle>
=======
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Aksi Cepat
          </CardTitle>
>>>>>>> b897868 (Initial commit - AppBenk)
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {aksi.map((a) => (
            <Button key={a.to} asChild variant="outline" className="gap-2">
              <Link to={a.to}>
                <a.icon className="size-4" /> {a.label}
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="size-4 text-primary" /> Pembayaran Terbaru
          </CardTitle>
          <Button asChild variant="ghost" size="sm" className="gap-1 text-primary">
            <Link to="/pelanggan/pembayaran" search={{}}>
              Semua <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {pembayaran.length === 0 ? (
<<<<<<< HEAD
            <EmptyState title="Belum ada pembayaran" description="Tagihan muncul setelah servis selesai dikerjakan." />
          ) : (
            pembayaran.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{s.noTransaksi} · {s.nomor}</p>
=======
            <EmptyState
              title="Belum ada pembayaran"
              description="Tagihan muncul setelah servis selesai dikerjakan."
            />
          ) : (
            pembayaran.map((s) => (
              <div
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {s.noTransaksi} · {s.nomor}
                  </p>
>>>>>>> b897868 (Initial commit - AppBenk)
                  <p className="truncate text-xs text-muted-foreground">
                    {tanggalPanjang(s.tanggal)} · {s.kendaraan} · {rupiah(s.total)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={s.status} />
                  <Button asChild size="sm" variant="outline">
<<<<<<< HEAD
                    <Link to="/pelanggan/pembayaran" search={{ trx: s.noTransaksi }}>Lihat Pembayaran</Link>
=======
                    <Link to="/pelanggan/pembayaran" search={{ trx: s.noTransaksi }}>
                      Lihat Pembayaran
                    </Link>
>>>>>>> b897868 (Initial commit - AppBenk)
                  </Button>
                  <Button asChild size="sm" className="gap-1.5">
                    <Link to="/pelanggan/pembayaran" search={{ trx: s.noTransaksi }}>
                      <Download className="size-4" /> Download Nota
                    </Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
<<<<<<< HEAD

=======
>>>>>>> b897868 (Initial commit - AppBenk)
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Booking Saya</CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-primary">
              <Link to="/pelanggan/booking">
                Kelola <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {bookingSaya.length === 0 ? (
<<<<<<< HEAD
              <EmptyState title="Belum ada booking" description="Buat booking servis pertama Anda." />
            ) : (
              bookingSaya.slice(0, 4).map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{b.nomor} · {b.jenis}</p>
=======
              <EmptyState
                title="Belum ada booking"
                description="Buat booking servis pertama Anda."
              />
            ) : (
              bookingSaya.slice(0, 4).map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between gap-3 rounded-md border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {b.nomor} · {b.jenis}
                    </p>
>>>>>>> b897868 (Initial commit - AppBenk)
                    <p className="truncate text-xs text-muted-foreground">
                      {tanggalPanjang(b.tanggal)} · {b.waktu} · {b.kendaraan}
                    </p>
                  </div>
                  <BookingBadge status={b.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Servis Terbaru</CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-primary">
              <Link to="/pelanggan/riwayat">
                Riwayat <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {servisSaya.length === 0 ? (
<<<<<<< HEAD
              <EmptyState title="Belum ada servis" description="Riwayat servis akan tampil di sini." />
            ) : (
              servisSaya.slice(0, 4).map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{s.nomor} · {s.pekerjaan}</p>
=======
              <EmptyState
                title="Belum ada servis"
                description="Riwayat servis akan tampil di sini."
              />
            ) : (
              servisSaya.slice(0, 4).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-md border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {s.nomor} · {s.pekerjaan}
                    </p>
>>>>>>> b897868 (Initial commit - AppBenk)
                    <p className="truncate text-xs text-muted-foreground">
                      {tanggalPanjang(s.tanggal)} · {rupiah(s.total)}
                    </p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
