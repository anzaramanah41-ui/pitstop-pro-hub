import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileBarChart } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStore, rupiah, MEKANIK } from "@/lib/store";

export const Route = createFileRoute("/_shell/admin/laporan")({
  head: () => ({
    meta: [
      { title: "Laporan Operasional — AppBenk" },
      { name: "description", content: "Laporan servis harian dan bulanan, performa mekanik, serta pemakaian sparepart bengkel." },
      { property: "og:title", content: "Laporan Operasional — AppBenk" },
      { property: "og:description", content: "Pantau produktivitas bengkel lewat laporan operasional." },
    ],
  }),
  component: LaporanAdmin,
});

function LaporanAdmin() {
  const { servis, sparepart } = useStore();
  const [periode, setPeriode] = useState<"harian" | "bulanan" | "tahunan">("bulanan");
  const [tahun, setTahun] = useState<string>("semua");

  const daftarTahun = useMemo(
    () => Array.from(new Set(servis.map((s) => s.tanggal.slice(0, 4)))).sort((a, b) => b.localeCompare(a)),
    [servis],
  );

  const data = useMemo(() => {
    let list = servis;
    if (tahun !== "semua") list = list.filter((s) => s.tanggal.startsWith(tahun));
    if (periode === "harian") list = list.filter((s) => s.tanggal === "2026-08-18");
    else if (periode === "bulanan") list = list.filter((s) => s.tanggal.startsWith(`${tahun === "semua" ? "2026" : tahun}-08`));
    return list;
  }, [servis, periode, tahun]);

  const labelPeriode = periode === "harian" ? "hari ini" : periode === "bulanan" ? `Agustus ${tahun === "semua" ? "2026" : tahun}` : tahun === "semua" ? "semua tahun" : `Tahun ${tahun}`;

  const omzet = data.reduce((a, s) => a + s.total, 0);
  const selesai = data.filter((s) => ["Selesai", "Selesai Dibayar"].includes(s.status)).length;

  const perMekanik = MEKANIK.map((m) => {
    const list = data.filter((s) => s.mekanik === m);
    return { mekanik: m, jumlah: list.length, nilai: list.reduce((a, s) => a + s.total, 0) };
  }).sort((a, b) => b.jumlah - a.jumlah);

  const partTerlaris = [...sparepart].sort((a, b) => b.terpakai - a.terpakai).slice(0, 6);

  return (
    <>
      <PageHeader
        title="Laporan Operasional"
        description="Ringkasan servis, performa mekanik, dan pemakaian sparepart."
        action={
          <div className="flex flex-wrap gap-2">
            <Select value={tahun} onValueChange={setTahun}>
              <SelectTrigger className="w-40 bg-card" aria-label="Filter tahun"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Tahun</SelectItem>
                {daftarTahun.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={periode} onValueChange={(v) => setPeriode(v as typeof periode)}>
              <SelectTrigger className="w-40 bg-card" aria-label="Filter periode"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="harian">Harian</SelectItem>
                <SelectItem value="bulanan">Bulanan</SelectItem>
                <SelectItem value="tahunan">Tahunan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Total Servis", String(data.length), "unit pekerjaan"],
          ["Servis Selesai", String(selesai), "sudah rampung"],
          ["Nilai Servis", rupiah(omzet), labelPeriode],
        ].map(([l, v, h]) => (
          <Card key={l} className="border-l-4 border-l-primary">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{l}</p>
              <p className="mt-2 font-display text-2xl font-bold">{v}</p>
              <p className="text-xs text-muted-foreground">{h}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><FileBarChart className="size-4 text-primary" /> Performa Mekanik</CardTitle></CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mekanik</TableHead>
                  <TableHead className="text-right">Servis</TableHead>
                  <TableHead className="text-right">Nilai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {perMekanik.map((m) => (
                  <TableRow key={m.mekanik}>
                    <TableCell className="font-medium">{m.mekanik}</TableCell>
                    <TableCell className="text-right">{m.jumlah}</TableCell>
                    <TableCell className="text-right">{rupiah(m.nilai)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Sparepart Paling Terpakai</CardTitle></CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sparepart</TableHead>
                  <TableHead className="text-right">Terpakai</TableHead>
                  <TableHead className="text-right">Sisa Stok</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partTerlaris.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.nama}</TableCell>
                    <TableCell className="text-right">{p.terpakai}</TableCell>
                    <TableCell className="text-right">
                      <span className={p.stok <= 5 ? "font-semibold text-destructive" : ""}>{p.stok}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
