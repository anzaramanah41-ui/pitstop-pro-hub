import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Crown, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStore, rupiah } from "@/lib/store";

export const Route = createFileRoute("/_shell/owner/keuntungan")({
  head: () => ({
    meta: [
      { title: "Laporan Keuntungan Premium — AppBenk" },
      { name: "description", content: "Fitur premium: analisis pendapatan, biaya sparepart, margin jasa, dan laba bersih bengkel per bulan." },
      { property: "og:title", content: "Laporan Keuntungan Premium — AppBenk" },
      { property: "og:description", content: "Lihat laba bersih dan margin bengkel Anda." },
    ],
  }),
  component: KeuntunganOwner,
});

const BULAN: Record<string, string> = { "2026-07": "Juli 2026", "2026-08": "Agustus 2026" };

function KeuntunganOwner() {
  const { servis } = useStore();
  const [bulan, setBulan] = useState("semua");

  const data = useMemo(
    () => servis.filter((s) => bulan === "semua" || s.tanggal.startsWith(bulan)),
    [servis, bulan],
  );

  const pendapatan = data.reduce((a, s) => a + s.total, 0);
  const jasa = data.reduce((a, s) => a + s.biayaJasa, 0);
  const part = data.reduce((a, s) => a + s.biayaPart, 0);
  const modalPart = Math.round(part * 0.7);
  const laba = pendapatan - modalPart;
  const margin = pendapatan ? Math.round((laba / pendapatan) * 100) : 0;

  const perBulan = Object.keys(BULAN).map((k) => {
    const list = servis.filter((s) => s.tanggal.startsWith(k));
    const p = list.reduce((a, s) => a + s.total, 0);
    const mp = Math.round(list.reduce((a, s) => a + s.biayaPart, 0) * 0.7);
    return { k, label: BULAN[k]!, pendapatan: p, modal: mp, laba: p - mp, jumlah: list.length };
  });

  return (
    <>
      <PageHeader
        title="Laporan Keuntungan"
        description="Analisis laba bersih dan margin bengkel."
        action={
          <div className="flex items-center gap-2">
            <Badge className="gap-1 bg-primary/15 text-primary hover:bg-primary/15">
              <Crown className="size-3.5" /> Premium
            </Badge>
            <Select value={bulan} onValueChange={setBulan}>
              <SelectTrigger className="w-44 bg-card"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua periode</SelectItem>
                {Object.entries(BULAN).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Pendapatan", rupiah(pendapatan), "total transaksi servis"],
          ["Pendapatan Jasa", rupiah(jasa), "murni dari pengerjaan"],
          ["Modal Sparepart", rupiah(modalPart), "estimasi 70% harga jual"],
          ["Laba Bersih", rupiah(laba), `margin ${margin}%`],
        ].map(([l, v, h]) => (
          <Card key={l} className="border-l-4 border-l-primary">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{l}</p>
              <p className="mt-2 font-display text-xl font-bold">{v}</p>
              <p className="text-xs text-muted-foreground">{h}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="size-4 text-primary" /> Tren Keuntungan Bulanan
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Periode</TableHead>
                <TableHead className="text-right">Servis</TableHead>
                <TableHead className="text-right">Pendapatan</TableHead>
                <TableHead className="text-right">Modal Part</TableHead>
                <TableHead className="text-right">Laba Bersih</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {perBulan.map((b) => (
                <TableRow key={b.k}>
                  <TableCell className="font-medium">{b.label}</TableCell>
                  <TableCell className="text-right">{b.jumlah}</TableCell>
                  <TableCell className="text-right">{rupiah(b.pendapatan)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{rupiah(b.modal)}</TableCell>
                  <TableCell className="text-right font-semibold text-success">{rupiah(b.laba)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
