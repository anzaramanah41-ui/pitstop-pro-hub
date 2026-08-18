import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/page-header";
import { SearchBar } from "@/components/search-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStore, rupiah, tanggalPanjang } from "@/lib/store";

export const Route = createFileRoute("/_shell/owner/pelanggan")({
  head: () => ({
    meta: [
      { title: "Laporan Pelanggan — AppBenk" },
      { name: "description", content: "Analisis pelanggan bengkel: frekuensi servis, total belanja, dan kunjungan terakhir." },
      { property: "og:title", content: "Laporan Pelanggan — AppBenk" },
      { property: "og:description", content: "Kenali pelanggan paling loyal di bengkel Anda." },
    ],
  }),
  component: LaporanPelangganOwner,
});

function LaporanPelangganOwner() {
  const { pelanggan, servis } = useStore();
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const s = q.toLowerCase();
    return pelanggan
      .map((p) => {
        const list = servis.filter((x) => x.pelanggan === p.nama);
        const terakhir = list.map((x) => x.tanggal).sort().at(-1);
        return {
          ...p,
          jumlah: list.length,
          nilai: list.reduce((a, x) => a + x.total, 0),
          terakhir,
        };
      })
      .filter((p) => [p.nama, p.kendaraan, p.plat].some((v) => v.toLowerCase().includes(s)))
      .sort((a, b) => b.nilai - a.nilai);
  }, [pelanggan, servis, q]);

  const totalNilai = rows.reduce((a, r) => a + r.nilai, 0);
  const aktif = rows.filter((r) => r.jumlah > 0).length;

  return (
    <>
      <PageHeader title="Laporan Pelanggan" description="Loyalitas dan kontribusi pelanggan terhadap omzet." />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Total Pelanggan", String(pelanggan.length)],
          ["Pelanggan Aktif", String(aktif)],
          ["Total Nilai Servis", rupiah(totalNilai)],
        ].map(([l, v]) => (
          <Card key={l} className="border-l-4 border-l-primary">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{l}</p>
              <p className="mt-2 font-display text-xl font-bold">{v}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Detail Pelanggan</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <SearchBar value={q} onChange={setQ} placeholder="Cari nama pelanggan atau plat..." />
          {rows.length === 0 ? (
            <EmptyState icon={<Users className="size-8" />} title="Pelanggan tidak ditemukan" description="Coba kata kunci lain." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kendaraan</TableHead>
                    <TableHead>Telepon</TableHead>
                    <TableHead className="text-right">Jumlah Servis</TableHead>
                    <TableHead className="text-right">Total Belanja</TableHead>
                    <TableHead>Servis Terakhir</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.nama}</TableCell>
                      <TableCell className="text-muted-foreground">{p.kendaraan} · {p.plat}</TableCell>
                      <TableCell className="text-muted-foreground">{p.telepon}</TableCell>
                      <TableCell className="text-right">{p.jumlah}</TableCell>
                      <TableCell className="text-right font-semibold">{rupiah(p.nilai)}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {p.terakhir ? tanggalPanjang(p.terakhir) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
