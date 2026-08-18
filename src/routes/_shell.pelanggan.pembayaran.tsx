import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/lib/auth";
import { useStore, rupiah, tanggalPanjang } from "@/lib/store";

export const Route = createFileRoute("/_shell/pelanggan/pembayaran")({
  head: () => ({
    meta: [
      { title: "Pembayaran — AppBenk" },
      { name: "description", content: "Lihat nomor transaksi, detail servis, total biaya, dan status pembayaran servis kendaraan Anda." },
      { property: "og:title", content: "Pembayaran — AppBenk" },
      { property: "og:description", content: "Informasi tagihan dan status pembayaran servis." },
    ],
  }),
  component: PembayaranPelanggan,
});

function PembayaranPelanggan() {
  const { user } = useAuth();
  const { servis, bayarServis } = useStore();
  const nama = user?.pelanggan ?? "";
  const transaksi = servis.filter(
    (s) => s.pelanggan === nama && ["Menunggu Pembayaran", "Selesai Dibayar"].includes(s.status),
  );
  const belumLunas = transaksi.filter((s) => s.status === "Menunggu Pembayaran");

  return (
    <>
      <PageHeader title="Pembayaran" description="Tagihan servis dan status pembayaran Anda." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Belum Dibayar</p>
            <p className="mt-2 font-display text-2xl font-bold">{rupiah(belumLunas.reduce((a, s) => a + s.total, 0))}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sudah Dibayar</p>
            <p className="mt-2 font-display text-2xl font-bold">
              {rupiah(transaksi.filter((s) => s.status === "Selesai Dibayar").reduce((a, s) => a + s.total, 0))}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total Transaksi</p>
            <p className="mt-2 font-display text-2xl font-bold">{transaksi.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="px-0">
          {transaksi.length === 0 ? (
            <EmptyState icon={<Wallet className="size-8" />} title="Belum ada tagihan" description="Tagihan muncul setelah servis selesai dikerjakan." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Transaksi</TableHead>
                    <TableHead>Detail Servis</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Total Biaya</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transaksi.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.noTransaksi}</TableCell>
                      <TableCell>
                        <span className="block">{s.jenis} · {s.pekerjaan}</span>
                        <span className="block text-xs text-muted-foreground">{s.nomor} · {s.kendaraan}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{tanggalPanjang(s.tanggal)}</TableCell>
                      <TableCell className="text-right font-semibold">{rupiah(s.total)}</TableCell>
                      <TableCell><StatusBadge status={s.status} /></TableCell>
                      <TableCell className="text-right">
                        {s.status === "Menunggu Pembayaran" ? (
                          <Button
                            size="sm"
                            onClick={() => {
                              bayarServis(s.id);
                              toast.success(`Pembayaran ${s.noTransaksi} berhasil (mock)`);
                            }}
                          >
                            Bayar
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">Lunas</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Pembayaran masih berupa simulasi. Belum ada integrasi payment gateway pada tahap ini.
      </p>
    </>
  );
}
