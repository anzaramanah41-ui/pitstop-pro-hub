import { createFileRoute, Link } from "@tanstack/react-router";
import { TrendingUp, Users, Wrench, Package, Crown, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStore, rupiah, MEKANIK } from "@/lib/store";

export const Route = createFileRoute("/_shell/owner/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard Owner — AppBenk" },
      { name: "description", content: "Ringkasan bisnis bengkel: omzet, jumlah servis, pelanggan aktif, dan performa mekanik." },
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
    { label: "Total Servis", value: String(servis.length), icon: Wrench, hint: "pekerjaan tercatat" },
    { label: "Pelanggan Aktif", value: String(pelanggan.length), icon: Users, hint: "terdaftar di sistem" },
    { label: "Item Sparepart", value: String(sparepart.length), icon: Package, hint: "di katalog" },
  ];

  const perMekanik = MEKANIK.map((m) => {
    const list = servis.filter((s) => s.mekanik === m);
    return { m, jumlah: list.length, nilai: list.reduce((a, s) => a + s.total, 0) };
  }).sort((a, b) => b.nilai - a.nilai);

  return (
    <>
      <PageHeader title="Dashboard Owner" description="Gambaran menyeluruh performa bisnis bengkel." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-l-4 border-l-primary">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</p>
                <s.icon className="size-4 text-primary" />
              </div>
              <p className="mt-3 font-display text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/40 bg-primary/5">
        <CardContent className="flex flex-wrap items-center gap-4 p-5">
          <Crown className="size-6 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm font-bold">Laporan Keuntungan (Premium)</p>
            <p className="text-xs text-muted-foreground">Analisis margin, laba bersih, dan tren keuntungan bulanan.</p>
          </div>
          <Button asChild size="sm" className="gap-1">
            <Link to="/owner/keuntungan">Buka Laporan <ArrowRight className="size-4" /></Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Kontribusi Mekanik</CardTitle></CardHeader>
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
