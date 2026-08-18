import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { History, Eye } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/page-header";
import { SearchBar } from "@/components/search-bar";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useStore, tanggalPanjang, rupiah, type Servis } from "@/lib/store";

export const Route = createFileRoute("/_shell/riwayat")({
  head: () => ({
    meta: [
      { title: "Riwayat Servis — Bengkel Pitstop" },
      { name: "description", content: "Telusuri riwayat servis kendaraan berdasarkan pelanggan, plat, nomor servis, atau tanggal." },
      { property: "og:title", content: "Riwayat Servis — Bengkel Pitstop" },
      { property: "og:description", content: "Telusuri riwayat servis kendaraan dengan cepat." },
    ],
  }),
  component: RiwayatPage,
});

function RiwayatPage() {
  const { servis } = useStore();
  const [q, setQ] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [detail, setDetail] = useState<Servis | null>(null);

  const data = useMemo(() => {
    const s = q.toLowerCase();
    return servis
      .filter((x) => !tanggal || x.tanggal === tanggal)
      .filter((x) => [x.nomor, x.pelanggan, x.kendaraan, x.plat].some((v) => v.toLowerCase().includes(s)));
  }, [servis, q, tanggal]);

  return (
    <>
      <PageHeader title="Riwayat Servis" description="Cari riwayat servis kendaraan pelanggan dengan cepat." />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Pencarian</Label>
              <SearchBar value={q} onChange={setQ} placeholder="Nama, kendaraan, plat, atau nomor servis..." />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Tanggal Servis</Label>
              <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-44 bg-card" />
            </div>
            {(q || tanggal) && (
              <Button variant="ghost" onClick={() => { setQ(""); setTanggal(""); }}>Reset</Button>
            )}
          </div>

          {data.length === 0 ? (
            <EmptyState
              icon={<History className="size-8" />}
              title="Riwayat tidak ditemukan"
              description="Coba ubah kata kunci atau tanggal pencarian."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Servis</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Kendaraan</TableHead>
                    <TableHead>Pekerjaan</TableHead>
                    <TableHead>Mekanik</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.nomor}</TableCell>
                      <TableCell className="text-muted-foreground">{tanggalPanjang(s.tanggal)}</TableCell>
                      <TableCell>{s.pelanggan}</TableCell>
                      <TableCell className="text-muted-foreground">{s.kendaraan} · {s.plat}</TableCell>
                      <TableCell className="max-w-48 truncate">{s.pekerjaan}</TableCell>
                      <TableCell>{s.mekanik}</TableCell>
                      <TableCell><StatusBadge status={s.status} /></TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" onClick={() => setDetail(s)} aria-label="Lihat detail">
                          <Eye className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!detail} onOpenChange={(v) => !v && setDetail(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader><SheetTitle>Detail Riwayat Servis</SheetTitle></SheetHeader>
          {detail && (
            <div className="space-y-4 px-4 pb-6 text-sm">
              <div className="flex items-center justify-between">
                <p className="font-display text-lg font-bold">{detail.nomor}</p>
                <StatusBadge status={detail.status} />
              </div>
              <Info label="Pelanggan" value={detail.pelanggan} />
              <Info label="Kendaraan" value={`${detail.kendaraan} · ${detail.plat}`} />
              <Info label="Keluhan" value={detail.keluhan} />
              <Info label="Pekerjaan / Perbaikan" value={detail.pekerjaan || "-"} />
              <Info label="Sparepart Digunakan" value={detail.sparepart || "-"} />
              <Info label="Mekanik" value={detail.mekanik} />
              <Info label="Tanggal Servis" value={tanggalPanjang(detail.tanggal)} />
              <Info label="Catatan" value={detail.catatan || "-"} />
              <Info label="Total Biaya" value={rupiah(detail.total)} />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
