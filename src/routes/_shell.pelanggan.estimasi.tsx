import { createFileRoute } from "@tanstack/react-router";
import { Calculator } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/lib/auth";
import { useStore, rupiah, tanggalPanjang } from "@/lib/store";

export const Route = createFileRoute("/_shell/pelanggan/estimasi")({
  head: () => ({
    meta: [
      { title: "Estimasi Servis — AppBenk" },
      { name: "description", content: "Lihat rincian estimasi biaya jasa servis dan sparepart sebelum pengerjaan kendaraan Anda." },
      { property: "og:title", content: "Estimasi Servis — AppBenk" },
      { property: "og:description", content: "Transparansi biaya jasa dan sparepart sebelum servis." },
    ],
  }),
  component: EstimasiPelanggan,
});

function EstimasiPelanggan() {
  const { user } = useAuth();
  const { servis } = useStore();
  const nama = user?.pelanggan ?? "";
  const daftar = servis.filter((s) => s.pelanggan === nama && s.status !== "Selesai Dibayar");
  const totalSemua = daftar.reduce((a, s) => a + s.total, 0);

  return (
    <>
      <PageHeader title="Estimasi Servis" description="Rincian perkiraan biaya jasa dan sparepart." />

      {daftar.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState icon={<Calculator className="size-8" />} title="Belum ada estimasi" description="Estimasi muncul saat servis sedang berjalan." />
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total Estimasi Aktif</p>
              <p className="mt-2 font-display text-3xl font-bold">{rupiah(totalSemua)}</p>
              <p className="text-xs text-muted-foreground">{daftar.length} servis belum lunas</p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {daftar.map((s) => (
              <Card key={s.id}>
                <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
                  <div>
                    <CardTitle className="text-base">{s.nomor} · {s.jenis}</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {s.kendaraan} · {s.plat} · {tanggalPanjang(s.tanggal)}
                    </p>
                  </div>
                  <StatusBadge status={s.status} />
                </CardHeader>
                <CardContent className="px-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Rincian</TableHead>
                        <TableHead className="text-right">Estimasi Biaya</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Jasa Servis</TableCell>
                        <TableCell className="text-muted-foreground">{s.pekerjaan}</TableCell>
                        <TableCell className="text-right">{rupiah(s.biayaJasa)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Sparepart</TableCell>
                        <TableCell className="text-muted-foreground">{s.sparepart || "—"}</TableCell>
                        <TableCell className="text-right">{rupiah(s.biayaPart)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2} className="font-semibold">Total Estimasi</TableCell>
                        <TableCell className="text-right font-display text-lg font-bold">{rupiah(s.total)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  );
}
