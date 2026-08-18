import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, Car, CalendarClock, Loader2, Package, ArrowRight, Plus, History } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStore, tanggalPanjang } from "@/lib/store";

export const Route = createFileRoute("/_shell/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Bengkel Pitstop" },
      { name: "description", content: "Ringkasan operasional bengkel: pelanggan, servis berjalan, dan stok sparepart." },
      { property: "og:title", content: "Dashboard — Bengkel Pitstop" },
      { property: "og:description", content: "Ringkasan operasional bengkel harian." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { pelanggan, servis, sparepart } = useStore();
  const hariIni = "2026-08-18";

  const stats = [
    { label: "Total Pelanggan", value: pelanggan.length, icon: Users, hint: "pelanggan terdaftar" },
    { label: "Total Kendaraan", value: new Set(pelanggan.map((p) => p.plat)).size, icon: Car, hint: "kendaraan tercatat" },
    { label: "Servis Hari Ini", value: servis.filter((s) => s.tanggal === hariIni).length, icon: CalendarClock, hint: "masuk hari ini" },
    { label: "Servis Berjalan", value: servis.filter((s) => s.status === "Diproses").length, icon: Loader2, hint: "sedang dikerjakan" },
    { label: "Total Sparepart", value: sparepart.length, icon: Package, hint: "item di katalog" },
  ];

  const quick = [
    { to: "/pelanggan", label: "Tambah Pelanggan", icon: Plus },
    { to: "/servis", label: "Buat Servis", icon: Plus },
    { to: "/sparepart", label: "Tambah Sparepart", icon: Plus },
    { to: "/riwayat", label: "Lihat Riwayat", icon: History },
  ] as const;

  return (
    <>
      <PageHeader title="Dashboard" description="Ringkasan operasional bengkel hari ini." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label} className="border-l-4 border-l-primary">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</p>
                <s.icon className="size-4 text-primary" />
              </div>
              <p className="mt-3 font-display text-3xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Aksi Cepat
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {quick.map((q) => (
            <Button key={q.label} asChild variant="outline" className="gap-2">
              <Link to={q.to}>
                <q.icon className="size-4" />
                {q.label}
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base">Servis Terbaru</CardTitle>
          <Button asChild variant="ghost" size="sm" className="gap-1 text-primary">
            <Link to="/servis">
              Lihat semua <ArrowRight className="size-4" />
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
                  <TableHead>Kendaraan</TableHead>
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
                    <TableCell className="text-muted-foreground">
                      {s.kendaraan} · {s.plat}
                    </TableCell>
                    <TableCell>{s.mekanik}</TableCell>
                    <TableCell>
                      <StatusBadge status={s.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{tanggalPanjang(s.tanggal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
