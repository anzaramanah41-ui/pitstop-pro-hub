import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ShoppingCart, ArrowDownUp, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/number-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore, rupiah, tanggalPanjang } from "@/lib/store";

export const Route = createFileRoute("/_shell/admin/stok")({
  head: () => ({
    meta: [
      { title: "Pembelian & Riwayat Stok — AppBenk" },
      { name: "description", content: "Catat pembelian sparepart dari supplier, pantau riwayat pergerakan stok masuk/keluar, dan penggunaan sparepart per servis." },
      { property: "og:title", content: "Pembelian & Riwayat Stok — AppBenk" },
      { property: "og:description", content: "Kelola pembelian supplier, riwayat stok, dan penggunaan sparepart bengkel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StokAdmin,
});

function StokAdmin() {
  const { sparepart, pembelian, riwayatStok, penggunaan, catatPembelian } = useStore();
  const namaPart = useMemo(
    () => new Map(sparepart.map((s) => [s.id, s.nama])),
    [sparepart],
  );

  const kosong = {
    sparepartId: sparepart[0]?.id ?? "",
    supplier: "",
    tanggal: new Date().toISOString().slice(0, 10),
    jumlah: 1,
    harga: 0,
  };
  const [form, setForm] = useState(kosong);

  const simpan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sparepartId || !form.supplier.trim() || form.jumlah <= 0 || form.harga <= 0) {
      toast.error("Lengkapi sparepart, supplier, jumlah, dan harga beli.");
      return;
    }
    void catatPembelian(form);
    toast.success("Pembelian dicatat, stok bertambah");
    setForm({ ...kosong, tanggal: form.tanggal });
  };

  return (
    <>
      <PageHeader title="Pembelian & Stok" description="Pembelian sparepart dari supplier, riwayat pergerakan stok, dan penggunaan per servis." />

      <Tabs defaultValue="pembelian">
        <TabsList>
          <TabsTrigger value="pembelian">Pembelian</TabsTrigger>
          <TabsTrigger value="riwayat">Riwayat Stok</TabsTrigger>
          <TabsTrigger value="penggunaan">Penggunaan</TabsTrigger>
        </TabsList>

        <TabsContent value="pembelian" className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShoppingCart className="size-4 text-primary" /> Catat Pembelian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={simpan} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Sparepart</Label>
                  <Select value={form.sparepartId} onValueChange={(v) => setForm({ ...form, sparepartId: v })}>
                    <SelectTrigger><SelectValue placeholder="Pilih sparepart" /></SelectTrigger>
                    <SelectContent>
                      {sparepart.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Supplier</Label>
                  <Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder="PT Sinar Pelumas" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Tanggal</Label>
                    <Input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Jumlah</Label>
                    <NumberInput value={form.jumlah} onChange={(v) => setForm({ ...form, jumlah: v })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Harga Beli / Satuan</Label>
                  <NumberInput value={form.harga} onChange={(v) => setForm({ ...form, harga: v })} />
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2 text-sm">
                  <span className="font-medium">Total</span>
                  <span className="font-display font-bold">{rupiah(form.jumlah * form.harga)}</span>
                </div>
                <Button type="submit" className="w-full gap-2">
                  <PackageCheck className="size-4" /> Simpan Pembelian
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Daftar Pembelian</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              {pembelian.length === 0 ? (
                <EmptyState title="Belum ada pembelian" description="Pembelian sparepart akan tampil di sini." />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No.</TableHead>
                        <TableHead>Sparepart</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pembelian.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.nomor}</TableCell>
                          <TableCell>{namaPart.get(p.sparepartId) ?? "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{p.supplier}</TableCell>
                          <TableCell className="text-muted-foreground">{tanggalPanjang(p.tanggal)}</TableCell>
                          <TableCell className="text-right">{p.jumlah}</TableCell>
                          <TableCell className="text-right font-semibold">{rupiah(p.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="riwayat" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ArrowDownUp className="size-4 text-primary" /> Riwayat Pergerakan Stok
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              {riwayatStok.length === 0 ? (
                <EmptyState title="Belum ada pergerakan stok" description="Log stok masuk/keluar akan tampil di sini." />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Sparepart</TableHead>
                        <TableHead>Jenis</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                        <TableHead>Keterangan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {riwayatStok.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="text-muted-foreground">{tanggalPanjang(r.tanggal)}</TableCell>
                          <TableCell>{namaPart.get(r.sparepartId) ?? "—"}</TableCell>
                          <TableCell className={r.jenis === "Masuk" ? "font-medium text-success" : "font-medium text-destructive"}>
                            {r.jenis}
                          </TableCell>
                          <TableCell className="text-right">{r.jumlah}</TableCell>
                          <TableCell className="text-muted-foreground">{r.keterangan}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="penggunaan" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Penggunaan Sparepart per Servis</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              {penggunaan.length === 0 ? (
                <EmptyState title="Belum ada pemakaian" description="Pemakaian sparepart tercatat otomatis dari operasional servis." />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>No. Servis</TableHead>
                        <TableHead>Sparepart</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                        <TableHead>Mekanik</TableHead>
                        <TableHead>Keterangan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {penggunaan.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="text-muted-foreground">{tanggalPanjang(p.tanggal)}</TableCell>
                          <TableCell className="font-medium">{p.servisNomor}</TableCell>
                          <TableCell>{namaPart.get(p.sparepartId) ?? "—"}</TableCell>
                          <TableCell className="text-right">{p.jumlah}</TableCell>
                          <TableCell className="text-muted-foreground">{p.mekanik || "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{p.keterangan}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
