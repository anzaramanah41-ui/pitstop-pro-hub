import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wallet, Download, CheckCircle2, Receipt } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/lib/auth";
import { unduhNota } from "@/lib/nota";
import { useStore, rupiah, tanggalPanjang, type MetodeBayar, type Servis } from "@/lib/store";

export const Route = createFileRoute("/_shell/pelanggan/pembayaran")({
  validateSearch: (search: Record<string, unknown>): { trx?: string } =>
    typeof search["trx"] === "string" ? { trx: search["trx"] } : {},
  head: () => ({
    meta: [
      { title: "Pembayaran — AppBenk" },
      { name: "description", content: "Lihat nomor transaksi, rincian jasa dan sparepart, total biaya, bayar servis, dan unduh nota pembayaran." },
      { property: "og:title", content: "Pembayaran — AppBenk" },
      { property: "og:description", content: "Detail tagihan, pembayaran, dan nota servis kendaraan Anda." },
    ],
  }),
  component: PembayaranPelanggan,
});

const METODE: MetodeBayar[] = ["Cash", "Transfer Bank", "QRIS"];

function PembayaranPelanggan() {
  const { user } = useAuth();
  const { trx } = Route.useSearch();
  const { servis, bayarServis, pelanggan } = useStore();
  const nama = user?.pelanggan ?? "";
  const profil = pelanggan.find((p) => p.nama === nama);
  const transaksi = servis.filter(
    (s) => s.pelanggan === nama && ["Menunggu Pembayaran", "Selesai Dibayar"].includes(s.status),
  );
  const belumLunas = transaksi.filter((s) => s.status === "Menunggu Pembayaran");

  const [pilih, setPilih] = useState<string | null>(trx ?? belumLunas[0]?.id ?? transaksi[0]?.id ?? null);
  const [bayarOpen, setBayarOpen] = useState(false);
  const [metode, setMetode] = useState<MetodeBayar>("Cash");
  const [sukses, setSukses] = useState(false);

  useEffect(() => {
    if (trx) {
      const found = servis.find((s) => s.noTransaksi === trx || s.id === trx);
      if (found) setPilih(found.id);
    }
  }, [trx, servis]);

  const detail =
    transaksi.find((s) => s.id === pilih || s.noTransaksi === pilih) ?? transaksi[0] ?? null;
  const lunas = detail?.status === "Selesai Dibayar";

  const konfirmasi = (s: Servis) => {
    bayarServis(s.id, metode);
    setSukses(true);
    toast.success(`Pembayaran ${s.noTransaksi} berhasil (mock)`);
  };

  return (
    <>
      <PageHeader title="Pembayaran" description="Detail tagihan, pembayaran, dan nota servis Anda." />

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

      {detail && (
        <Card>
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0 pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt className="size-4 text-primary" /> Detail Transaksi {detail.noTransaksi}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={detail.status} />
              {!lunas && (
                <Button
                  onClick={() => {
                    setSukses(false);
                    setMetode("Cash");
                    setBayarOpen(true);
                  }}
                >
                  Bayar Sekarang
                </Button>
              )}
              <Button
                variant="outline"
                className="gap-2"
                disabled={!lunas}
                onClick={() => {
                  unduhNota(detail, profil);
                  toast.success("Nota diunduh");
                }}
              >
                <Download className="size-4" /> Download Nota
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <Info label="No. Transaksi" value={detail.noTransaksi} />
              <Info label="No. Servis" value={detail.nomor} />
              <Info label="Tanggal Servis" value={tanggalPanjang(detail.tanggal)} />
              <Info label="Nama Pelanggan" value={detail.pelanggan} />
              <Info label="Kendaraan" value={`${detail.kendaraan} · ${detail.plat}`} />
              <Info label="Metode Pembayaran" value={detail.metodeBayar ?? "Belum dipilih"} />
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rincian</TableHead>
                    <TableHead className="w-20 text-center">Jumlah</TableHead>
                    <TableHead className="text-right">Harga</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <span className="block font-medium">Biaya Jasa — {detail.jenis}</span>
                      <span className="block text-xs text-muted-foreground">{detail.pekerjaan || "—"}</span>
                    </TableCell>
                    <TableCell className="text-center">1</TableCell>
                    <TableCell className="text-right">{rupiah(detail.biayaJasa)}</TableCell>
                    <TableCell className="text-right font-medium">{rupiah(detail.biayaJasa)}</TableCell>
                  </TableRow>
                  {detail.items.map((i) => (
                    <TableRow key={i.sparepartId}>
                      <TableCell>
                        <span className="block font-medium">{i.nama}</span>
                        <span className="block text-xs text-muted-foreground">{i.kode}</span>
                      </TableCell>
                      <TableCell className="text-center">{i.jumlah}</TableCell>
                      <TableCell className="text-right">{rupiah(i.harga)}</TableCell>
                      <TableCell className="text-right font-medium">{rupiah(i.harga * i.jumlah)}</TableCell>
                    </TableRow>
                  ))}
                  {detail.items.length === 0 && detail.biayaPart > 0 && (
                    <TableRow>
                      <TableCell colSpan={3}>Sparepart ({detail.sparepart || "—"})</TableCell>
                      <TableCell className="text-right font-medium">{rupiah(detail.biayaPart)}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
              <span className="font-display text-sm font-semibold uppercase tracking-wide">Total</span>
              <span className="font-display text-xl font-bold">{rupiah(detail.total)}</span>
            </div>
          </CardContent>
        </Card>
      )}

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
                    <TableRow key={s.id} className={s.id === detail?.id ? "bg-muted/40" : undefined}>
                      <TableCell className="font-medium">{s.noTransaksi}</TableCell>
                      <TableCell>
                        <span className="block">{s.jenis} · {s.pekerjaan}</span>
                        <span className="block text-xs text-muted-foreground">{s.nomor} · {s.kendaraan}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{tanggalPanjang(s.tanggal)}</TableCell>
                      <TableCell className="text-right font-semibold">{rupiah(s.total)}</TableCell>
                      <TableCell><StatusBadge status={s.status} /></TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => setPilih(s.id)}>
                          Lihat Detail
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

      <Dialog open={bayarOpen} onOpenChange={(v) => { setBayarOpen(v); if (!v) setSukses(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pembayaran Servis</DialogTitle>
          </DialogHeader>

          {!detail ? null : sukses ? (
            <div className="space-y-3 py-4 text-center">
              <CheckCircle2 className="mx-auto size-12 text-success" />
              <p className="font-display text-lg font-bold">Pembayaran Berhasil</p>
              <p className="text-sm text-muted-foreground">
                {detail.noTransaksi} · {rupiah(detail.total)} · {metode}
              </p>
              <StatusBadge status="Selesai Dibayar" />
              <DialogFooter className="sm:justify-center">
                <Button
                  className="gap-2"
                  onClick={() => {
                    unduhNota({ ...detail, status: "Selesai Dibayar", metodeBayar: metode }, profil);
                    toast.success("Nota diunduh");
                  }}
                >
                  <Download className="size-4" /> Download Nota
                </Button>
                <Button variant="outline" onClick={() => setBayarOpen(false)}>Tutup</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                <div className="flex justify-between py-0.5">
                  <span className="text-muted-foreground">No. Transaksi</span>
                  <span className="font-medium">{detail.noTransaksi}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-display text-base font-bold">
                  <span>Total Pembayaran</span>
                  <span>{rupiah(detail.total)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Metode Pembayaran</Label>
                <RadioGroup value={metode} onValueChange={(v) => setMetode(v as MetodeBayar)} className="gap-2">
                  {METODE.map((m) => (
                    <label
                      key={m}
                      className="flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm hover:bg-muted/50"
                    >
                      <RadioGroupItem value={m} /> {m}
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <p className="text-xs text-muted-foreground">
                Pembayaran masih berupa simulasi (mock), belum terhubung ke payment gateway.
              </p>

              <DialogFooter>
                <Button variant="outline" onClick={() => setBayarOpen(false)}>Batal</Button>
                <Button onClick={() => konfirmasi(detail)}>Konfirmasi Pembayaran</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/30 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="truncate font-medium">{value}</p>
    </div>
  );
}
