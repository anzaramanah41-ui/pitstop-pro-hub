import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
<<<<<<< HEAD
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
=======
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
>>>>>>> b897868 (Initial commit - AppBenk)
import { TrendingUp, Users, Wrench, Package, Crown, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
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
import { useStore, rupiah, MEKANIK } from "@/lib/store";

export const Route = createFileRoute("/_shell/owner/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard Owner — AppBenk" },
<<<<<<< HEAD
      { name: "description", content: "Ringkasan bisnis bengkel: omzet, jumlah servis, pelanggan aktif, dan performa mekanik." },
=======
      {
        name: "description",
        content:
          "Ringkasan bisnis bengkel: omzet, jumlah servis, pelanggan aktif, dan performa mekanik.",
      },
>>>>>>> b897868 (Initial commit - AppBenk)
      { property: "og:title", content: "Dashboard Owner — AppBenk" },
      { property: "og:description", content: "Pantau kinerja bisnis bengkel secara menyeluruh." },
    ],
  }),
  component: DashboardOwner,
});

function DashboardOwner() {
  const { servis, pelanggan, sparepart } = useStore();
  const omzet = servis.reduce((a, s) => a + s.total, 0);

  const stats = [
    { label: "Total Omzet", value: rupiah(omzet), icon: TrendingUp, hint: "seluruh transaksi" },
<<<<<<< HEAD
    { label: "Total Servis", value: String(servis.length), icon: Wrench, hint: "pekerjaan tercatat" },
    { label: "Pelanggan Aktif", value: String(pelanggan.length), icon: Users, hint: "terdaftar di sistem" },
=======
    {
      label: "Total Servis",
      value: String(servis.length),
      icon: Wrench,
      hint: "pekerjaan tercatat",
    },
    {
      label: "Pelanggan Aktif",
      value: String(pelanggan.length),
      icon: Users,
      hint: "terdaftar di sistem",
    },
>>>>>>> b897868 (Initial commit - AppBenk)
    { label: "Item Sparepart", value: String(sparepart.length), icon: Package, hint: "di katalog" },
  ];

  const [periode, setPeriode] = useState<"bulanan" | "tahunan">("tahunan");
  const [tahun, setTahun] = useState<string>("2026");

  const daftarTahun = useMemo(
<<<<<<< HEAD
    () => Array.from(new Set(servis.map((s) => s.tanggal.slice(0, 4)))).sort((a, b) => b.localeCompare(a)),
=======
    () =>
      Array.from(new Set(servis.map((s) => s.tanggal.slice(0, 4)))).sort((a, b) =>
        b.localeCompare(a),
      ),
>>>>>>> b897868 (Initial commit - AppBenk)
    [servis],
  );

  const transaksi = useMemo(
    () => servis.filter((s) => s.status === "Selesai Dibayar" && s.tanggal.startsWith(tahun)),
    [servis, tahun],
  );

<<<<<<< HEAD
  const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
=======
  const BULAN = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
>>>>>>> b897868 (Initial commit - AppBenk)

  const grafik = useMemo(() => {
    if (periode === "tahunan") {
      return BULAN.map((b, i) => ({
        label: b,
        nilai: transaksi
          .filter((s) => Number(s.tanggal.slice(5, 7)) === i + 1)
          .reduce((a, s) => a + s.total, 0),
      }));
    }
    const hari = new Map<string, number>();
    transaksi
      .filter((s) => s.tanggal.slice(5, 7) === "08")
<<<<<<< HEAD
      .forEach((s) => hari.set(s.tanggal.slice(8, 10), (hari.get(s.tanggal.slice(8, 10)) ?? 0) + s.total));
=======
      .forEach((s) =>
        hari.set(s.tanggal.slice(8, 10), (hari.get(s.tanggal.slice(8, 10)) ?? 0) + s.total),
      );
>>>>>>> b897868 (Initial commit - AppBenk)
    return [...hari.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([d, nilai]) => ({ label: `${d} Agu`, nilai }));
  }, [transaksi, periode]);

  const totalPenjualan = transaksi.reduce((a, s) => a + s.total, 0);
  const rataPenjualan = transaksi.length ? Math.round(totalPenjualan / transaksi.length) : 0;

  const perMekanik = MEKANIK.map((m) => {
    const list = servis.filter((s) => s.mekanik === m);
    return { m, jumlah: list.length, nilai: list.reduce((a, s) => a + s.total, 0) };
  }).sort((a, b) => b.nilai - a.nilai);

  return (
    <>
<<<<<<< HEAD
      <PageHeader title="Dashboard Owner" description="Gambaran menyeluruh performa bisnis bengkel." />
=======
      <PageHeader
        title="Dashboard Owner"
        description="Gambaran menyeluruh performa bisnis bengkel."
      />
>>>>>>> b897868 (Initial commit - AppBenk)

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
              <p className="mt-3 font-display text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0 pb-3">
          <CardTitle className="text-base">Grafik Penjualan</CardTitle>
          <div className="flex gap-2">
            <Select value={tahun} onValueChange={setTahun}>
<<<<<<< HEAD
              <SelectTrigger className="w-32 bg-card" aria-label="Filter tahun penjualan"><SelectValue /></SelectTrigger>
              <SelectContent>
                {daftarTahun.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
=======
              <SelectTrigger className="w-32 bg-card" aria-label="Filter tahun penjualan">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {daftarTahun.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
>>>>>>> b897868 (Initial commit - AppBenk)
                ))}
              </SelectContent>
            </Select>
            <Select value={periode} onValueChange={(v) => setPeriode(v as typeof periode)}>
<<<<<<< HEAD
              <SelectTrigger className="w-36 bg-card" aria-label="Periode grafik"><SelectValue /></SelectTrigger>
=======
              <SelectTrigger className="w-36 bg-card" aria-label="Periode grafik">
                <SelectValue />
              </SelectTrigger>
>>>>>>> b897868 (Initial commit - AppBenk)
              <SelectContent>
                <SelectItem value="bulanan">Bulanan</SelectItem>
                <SelectItem value="tahunan">Tahunan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Total Penjualan", rupiah(totalPenjualan)],
              ["Transaksi", `${transaksi.length} transaksi`],
              ["Rata-rata Penjualan", rupiah(rataPenjualan)],
            ].map(([l, v]) => (
              <div key={l} className="rounded-md border bg-muted/40 p-3">
<<<<<<< HEAD
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{l}</p>
=======
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {l}
                </p>
>>>>>>> b897868 (Initial commit - AppBenk)
                <p className="mt-1 font-display text-lg font-bold">{v}</p>
              </div>
            ))}
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={grafik} margin={{ left: 8, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis
<<<<<<< HEAD
                  tickFormatter={(v: number) => (v >= 1000000 ? `${v / 1000000}jt` : `${v / 1000}rb`)}
=======
                  tickFormatter={(v: number) =>
                    v >= 1000000 ? `${v / 1000000}jt` : `${v / 1000}rb`
                  }
>>>>>>> b897868 (Initial commit - AppBenk)
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  width={52}
                />
<<<<<<< HEAD
                <Tooltip formatter={(v: number) => rupiah(v)} cursor={{ className: "fill-muted" }} />
                <Bar dataKey="nilai" name="Penjualan" className="fill-primary" radius={[4, 4, 0, 0]} />
=======
                <Tooltip
                  formatter={(v: number) => rupiah(v)}
                  cursor={{ className: "fill-muted" }}
                />
                <Bar
                  dataKey="nilai"
                  name="Penjualan"
                  className="fill-primary"
                  radius={[4, 4, 0, 0]}
                />
>>>>>>> b897868 (Initial commit - AppBenk)
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/40 bg-primary/5">
        <CardContent className="flex flex-wrap items-center gap-4 p-5">
          <Crown className="size-6 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm font-bold">Laporan Keuntungan (Premium)</p>
<<<<<<< HEAD
            <p className="text-xs text-muted-foreground">Analisis margin, laba bersih, dan tren keuntungan bulanan.</p>
          </div>
          <Button asChild size="sm" className="gap-1">
            <Link to="/owner/keuntungan">Buka Laporan <ArrowRight className="size-4" /></Link>
=======
            <p className="text-xs text-muted-foreground">
              Analisis margin, laba bersih, dan tren keuntungan bulanan.
            </p>
          </div>
          <Button asChild size="sm" className="gap-1">
            <Link to="/owner/keuntungan">
              Buka Laporan <ArrowRight className="size-4" />
            </Link>
>>>>>>> b897868 (Initial commit - AppBenk)
          </Button>
        </CardContent>
      </Card>

      <Card>
<<<<<<< HEAD
        <CardHeader className="pb-3"><CardTitle className="text-base">Kontribusi Mekanik</CardTitle></CardHeader>
=======
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Kontribusi Mekanik</CardTitle>
        </CardHeader>
>>>>>>> b897868 (Initial commit - AppBenk)
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mekanik</TableHead>
                <TableHead className="text-right">Jumlah Servis</TableHead>
                <TableHead className="text-right">Nilai Servis</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {perMekanik.map((m) => (
                <TableRow key={m.m}>
                  <TableCell className="font-medium">{m.m}</TableCell>
                  <TableCell className="text-right">{m.jumlah}</TableCell>
                  <TableCell className="text-right">{rupiah(m.nilai)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
