import { createFileRoute, Link } from "@tanstack/react-router";
import { Inbox, CalendarClock, Loader2, CheckCircle2, Package, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
<<<<<<< HEAD
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
=======
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
>>>>>>> b897868 (Initial commit - AppBenk)
import { useStore, tanggalPanjang } from "@/lib/store";

export const Route = createFileRoute("/_shell/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard Admin Bengkel — AppBenk" },
<<<<<<< HEAD
      { name: "description", content: "Ringkasan booking masuk, servis hari ini, servis berjalan, dan stok sparepart bengkel." },
      { property: "og:title", content: "Dashboard Admin Bengkel — AppBenk" },
      { property: "og:description", content: "Kendalikan operasional bengkel harian dari satu dashboard." },
=======
      {
        name: "description",
        content:
          "Ringkasan booking masuk, servis hari ini, servis berjalan, dan stok sparepart bengkel.",
      },
      { property: "og:title", content: "Dashboard Admin Bengkel — AppBenk" },
      {
        property: "og:description",
        content: "Kendalikan operasional bengkel harian dari satu dashboard.",
      },
>>>>>>> b897868 (Initial commit - AppBenk)
    ],
  }),
  component: DashboardAdmin,
});

function DashboardAdmin() {
  const { servis, sparepart, booking } = useStore();
<<<<<<< HEAD
  const hariIni = "2026-08-18";

  const stats = [
    { label: "Booking Masuk", value: booking.filter((b) => b.status === "Menunggu Konfirmasi").length, icon: Inbox, hint: "menunggu konfirmasi" },
    { label: "Servis Hari Ini", value: servis.filter((s) => s.tanggal === hariIni).length, icon: CalendarClock, hint: "masuk hari ini" },
    { label: "Sedang Berjalan", value: servis.filter((s) => s.status === "Diproses").length, icon: Loader2, hint: "dikerjakan mekanik" },
    { label: "Servis Selesai", value: servis.filter((s) => ["Selesai", "Selesai Dibayar"].includes(s.status)).length, icon: CheckCircle2, hint: "sudah rampung" },
=======
  const hariIni = new Date().toISOString().slice(0, 10);

  const stats = [
    {
      label: "Booking Masuk",
      value: booking.filter((b) => b.status === "Menunggu Konfirmasi").length,
      icon: Inbox,
      hint: "menunggu konfirmasi",
    },
    {
      label: "Servis Hari Ini",
      value: servis.filter((s) => s.tanggal === hariIni).length,
      icon: CalendarClock,
      hint: "masuk hari ini",
    },
    {
      label: "Sedang Berjalan",
      value: servis.filter((s) => s.status === "Diproses").length,
      icon: Loader2,
      hint: "dikerjakan mekanik",
    },
    {
      label: "Servis Selesai",
      value: servis.filter((s) => ["Selesai", "Selesai Dibayar"].includes(s.status)).length,
      icon: CheckCircle2,
      hint: "sudah rampung",
    },
>>>>>>> b897868 (Initial commit - AppBenk)
    { label: "Sparepart", value: sparepart.length, icon: Package, hint: "item di katalog" },
  ];

  const aktivitas = [
<<<<<<< HEAD
    ...booking.slice(0, 3).map((b) => ({ id: b.id, teks: `Booking ${b.nomor} dari ${b.pelanggan}`, ket: `${b.jenis} · ${b.status}`, tanggal: b.tanggal })),
    ...servis.slice(0, 3).map((s) => ({ id: s.id, teks: `Servis ${s.nomor} — ${s.pelanggan}`, ket: `${s.pekerjaan} · ${s.status}`, tanggal: s.tanggal })),
=======
    ...booking
      .slice(0, 3)
      .map((b) => ({
        id: b.id,
        teks: `Booking ${b.nomor} dari ${b.pelanggan}`,
        ket: `${b.jenis} · ${b.status}`,
        tanggal: b.tanggal,
      })),
    ...servis
      .slice(0, 3)
      .map((s) => ({
        id: s.id,
        teks: `Servis ${s.nomor} — ${s.pelanggan}`,
        ket: `${s.pekerjaan} · ${s.status}`,
        tanggal: s.tanggal,
      })),
>>>>>>> b897868 (Initial commit - AppBenk)
  ].sort((a, b) => b.tanggal.localeCompare(a.tanggal));

  return (
    <>
<<<<<<< HEAD
      <PageHeader title="Dashboard Admin Bengkel" description="Ringkasan operasional bengkel hari ini." />
=======
      <PageHeader
        title="Dashboard Admin Bengkel"
        description="Ringkasan operasional bengkel hari ini."
      />
>>>>>>> b897868 (Initial commit - AppBenk)

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label} className="border-l-4 border-l-primary">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
<<<<<<< HEAD
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</p>
=======
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {s.label}
                </p>
>>>>>>> b897868 (Initial commit - AppBenk)
                <s.icon className="size-4 text-primary" />
              </div>
              <p className="mt-3 font-display text-3xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Servis Terbaru</CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-primary">
              <Link to="/admin/servis">
                Kelola <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Servis</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Mekanik</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servis.slice(0, 6).map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.nomor}</TableCell>
                      <TableCell>{s.pelanggan}</TableCell>
                      <TableCell>{s.mekanik}</TableCell>
<<<<<<< HEAD
                      <TableCell><StatusBadge status={s.status} /></TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{tanggalPanjang(s.tanggal)}</TableCell>
=======
                      <TableCell>
                        <StatusBadge status={s.status} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {tanggalPanjang(s.tanggal)}
                      </TableCell>
>>>>>>> b897868 (Initial commit - AppBenk)
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Aktivitas Terbaru</CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-primary">
              <Link to="/admin/booking">
                Booking <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {aktivitas.slice(0, 6).map((a) => (
              <div key={a.teks} className="rounded-md border p-3">
                <p className="text-sm font-medium">{a.teks}</p>
<<<<<<< HEAD
                <p className="text-xs text-muted-foreground">{a.ket} · {tanggalPanjang(a.tanggal)}</p>
=======
                <p className="text-xs text-muted-foreground">
                  {a.ket} · {tanggalPanjang(a.tanggal)}
                </p>
>>>>>>> b897868 (Initial commit - AppBenk)
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
