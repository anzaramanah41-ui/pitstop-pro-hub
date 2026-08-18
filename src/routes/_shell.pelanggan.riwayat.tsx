import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { History } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/page-header";
import { SearchBar } from "@/components/search-bar";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/lib/auth";
import { useStore, rupiah, tanggalPanjang } from "@/lib/store";

export const Route = createFileRoute("/_shell/pelanggan/riwayat")({
  head: () => ({
    meta: [
      { title: "Riwayat Servis — AppBenk" },
      { name: "description", content: "Telusuri riwayat servis kendaraan Anda lengkap dengan pekerjaan, sparepart, dan total biaya." },
      { property: "og:title", content: "Riwayat Servis — AppBenk" },
      { property: "og:description", content: "Semua catatan servis kendaraan Anda dalam satu daftar." },
    ],
  }),
  component: RiwayatPelanggan,
});

function RiwayatPelanggan() {
  const { user } = useAuth();
  const { servis } = useStore();
  const [q, setQ] = useState("");
  const nama = user?.pelanggan ?? "";

  const data = useMemo(() => {
    const s = q.toLowerCase();
    return servis
      .filter((x) => x.pelanggan === nama)
      .filter((x) => [x.nomor, x.kendaraan, x.plat, x.jenis, x.pekerjaan].some((v) => v.toLowerCase().includes(s)));
  }, [servis, nama, q]);

  return (
    <>
      <PageHeader title="Riwayat Servis" description="Catatan lengkap servis kendaraan Anda." />

      <Card>
        <CardContent className="space-y-4 p-4">
          <SearchBar value={q} onChange={setQ} placeholder="Cari nomor servis, kendaraan, atau pekerjaan..." />

          {data.length === 0 ? (
            <EmptyState icon={<History className="size-8" />} title="Riwayat tidak ditemukan" description="Coba kata kunci lain." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Kendaraan</TableHead>
                    <TableHead>Jenis Servis</TableHead>
                    <TableHead>Keluhan</TableHead>
                    <TableHead>Pekerjaan</TableHead>
                    <TableHead>Sparepart</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{tanggalPanjang(s.tanggal)}</TableCell>
                      <TableCell>{s.kendaraan} · {s.plat}</TableCell>
                      <TableCell>{s.jenis}</TableCell>
                      <TableCell className="max-w-40 truncate">{s.keluhan}</TableCell>
                      <TableCell className="max-w-40 truncate">{s.pekerjaan}</TableCell>
                      <TableCell className="max-w-40 truncate text-muted-foreground">{s.sparepart || "—"}</TableCell>
                      <TableCell className="text-right font-semibold">{rupiah(s.total)}</TableCell>
                      <TableCell><StatusBadge status={s.status} /></TableCell>
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
