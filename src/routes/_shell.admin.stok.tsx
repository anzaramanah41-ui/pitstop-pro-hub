import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
<<<<<<< HEAD
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
=======
import { ShoppingCart, ArrowDownUp, PackageCheck, RotateCcw, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/page-header";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/number-input";
import { Label } from "@/components/ui/label";
import { ComboboxInput } from "@/components/combobox-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore, rupiah, tanggalPanjang, type PembelianSparepart } from "@/lib/store";
>>>>>>> b897868 (Initial commit - AppBenk)

export const Route = createFileRoute("/_shell/admin/stok")({
  head: () => ({
    meta: [
      { title: "Pembelian & Riwayat Stok — AppBenk" },
<<<<<<< HEAD
      { name: "description", content: "Catat pembelian sparepart dari supplier, pantau riwayat pergerakan stok masuk/keluar, dan penggunaan sparepart per servis." },
      { property: "og:title", content: "Pembelian & Riwayat Stok — AppBenk" },
      { property: "og:description", content: "Kelola pembelian supplier, riwayat stok, dan penggunaan sparepart bengkel." },
=======
      {
        name: "description",
        content:
          "Catat pembelian sparepart dari supplier, pantau riwayat pergerakan stok masuk/keluar, dan penggunaan sparepart per servis.",
      },
      { property: "og:title", content: "Pembelian & Riwayat Stok — AppBenk" },
      {
        property: "og:description",
        content: "Kelola pembelian supplier, riwayat stok, dan penggunaan sparepart bengkel.",
      },
>>>>>>> b897868 (Initial commit - AppBenk)
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StokAdmin,
});

function StokAdmin() {
<<<<<<< HEAD
  const { sparepart, pembelian, riwayatStok, penggunaan, catatPembelian } = useStore();
  const namaPart = useMemo(
    () => new Map(sparepart.map((s) => [s.id, s.nama])),
=======
  const {
    sparepart,
    pembelian,
    riwayatStok,
    penggunaan,
    returSparepart,
    catatPembelian,
    catatReturSparepart,
    ubahPembelian,
    hapusPembelian,
  } = useStore();

  const [editPembelian, setEditPembelian] = useState<PembelianSparepart | null>(null);
  const [formEdit, setFormEdit] = useState({
    sparepartId: "",
    supplier: "",
    tanggal: "",
    jumlah: 1,
    harga: 0,
  });
  const [hapusId, setHapusId] = useState<string | null>(null);

  const bukaEditPembelian = (p: PembelianSparepart) => {
    setEditPembelian(p);
    setFormEdit({
      sparepartId: p.sparepartId,
      supplier: p.supplier,
      tanggal: p.tanggal,
      jumlah: p.jumlah,
      harga: p.harga,
    });
  };

  const handleSimpanEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPembelian) return;
    if (!formEdit.sparepartId.trim() || !formEdit.supplier.trim() || formEdit.jumlah <= 0 || formEdit.harga <= 0) {
      toast.error("Lengkapi sparepart, supplier, jumlah, dan harga beli.");
      return;
    }
    ubahPembelian(editPembelian.id, formEdit);
    toast.success("Pembelian berhasil diperbarui dan stok telah disesuaikan");
    setEditPembelian(null);
  };

  const handleKonfirmasiHapus = async () => {
    if (!hapusId) return;
    await hapusPembelian(hapusId);
    toast.success("Data pembelian berhasil dihapus dan stok telah dikembalikan");
    setHapusId(null);
  };

  const namaPart = useMemo(
    () => new Map(sparepart.map((s) => [s.id, `${s.kode} · ${s.nama}`])),
    [sparepart],
  );

  const nomorPembelian = useMemo(
    () => new Map(pembelian.map((p) => [p.id, p.nomor])),
    [pembelian],
  );

  const sparepartOptions = useMemo(
    () =>
      sparepart.map((s) => ({
        id: s.id,
        value: s.id,
        label: `${s.kode} · ${s.nama}`,
        sublabel: `Stok: ${s.stok} ${s.satuan} | ${rupiah(s.harga)}`,
      })),
>>>>>>> b897868 (Initial commit - AppBenk)
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

<<<<<<< HEAD
  const simpan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sparepartId || !form.supplier.trim() || form.jumlah <= 0 || form.harga <= 0) {
      toast.error("Lengkapi sparepart, supplier, jumlah, dan harga beli.");
      return;
    }
    void catatPembelian(form);
=======
  const kosongRetur = {
    sparepartId: sparepart[0]?.id ?? "",
    pembelianId: "",
    tanggal: new Date().toISOString().slice(0, 10),
    jumlah: 1,
    alasan: "",
    status: "Disetujui" as "Disetujui" | "Diproses" | "Ditolak",
  };
  const [returForm, setReturForm] = useState(kosongRetur);

  const simpan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sparepartId.trim() || !form.supplier.trim() || form.jumlah <= 0 || form.harga <= 0) {
      toast.error("Lengkapi sparepart, supplier, jumlah, dan harga beli.");
      return;
    }
    catatPembelian(form);
>>>>>>> b897868 (Initial commit - AppBenk)
    toast.success("Pembelian dicatat, stok bertambah");
    setForm({ ...kosong, tanggal: form.tanggal });
  };

<<<<<<< HEAD
  return (
    <>
      <PageHeader title="Pembelian & Stok" description="Pembelian sparepart dari supplier, riwayat pergerakan stok, dan penggunaan per servis." />

      <Tabs defaultValue="pembelian">
        <TabsList>
          <TabsTrigger value="pembelian">Pembelian</TabsTrigger>
          <TabsTrigger value="riwayat">Riwayat Stok</TabsTrigger>
          <TabsTrigger value="penggunaan">Penggunaan</TabsTrigger>
=======
  const simpanRetur = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returForm.sparepartId.trim() || !returForm.alasan.trim() || returForm.jumlah <= 0) {
      toast.error("Lengkapi sparepart, alasan retur, dan jumlah retur.");
      return;
    }
    catatReturSparepart({
      sparepartId: returForm.sparepartId,
      pembelianId: returForm.pembelianId ? returForm.pembelianId : null,
      tanggal: returForm.tanggal,
      jumlah: returForm.jumlah,
      alasan: returForm.alasan.trim(),
      status: returForm.status,
    });
    toast.success("Pengembalian sparepart berhasil dicatat");
    setReturForm({ ...kosongRetur, tanggal: returForm.tanggal });
  };

  return (
    <>
      <PageHeader
        title="Pembelian & Stok"
        description="Pembelian sparepart dari supplier, riwayat pergerakan stok, dan penggunaan per servis."
      />

      <Tabs defaultValue="pembelian">
        <TabsList className="grid grid-cols-2 sm:flex">
          <TabsTrigger value="pembelian">Pembelian</TabsTrigger>
          <TabsTrigger value="riwayat">Riwayat Stok</TabsTrigger>
          <TabsTrigger value="penggunaan">Penggunaan</TabsTrigger>
          <TabsTrigger value="retur">Pengembalian (Retur)</TabsTrigger>
>>>>>>> b897868 (Initial commit - AppBenk)
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
<<<<<<< HEAD
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
=======
                  <ComboboxInput
                    value={form.sparepartId}
                    onChange={(v) => {
                      const sp = sparepart.find(
                        (s) => s.id === v || s.nama.toLowerCase() === v.toLowerCase(),
                      );
                      setForm({
                        ...form,
                        sparepartId: v,
                        harga: form.harga === 0 && sp ? sp.harga : form.harga,
                      });
                    }}
                    options={sparepartOptions}
                    placeholder="Pilih atau ketik sparepart baru..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Supplier</Label>
                  <Input
                    value={form.supplier}
                    onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                    placeholder="PT Sinar Pelumas"
                  />
>>>>>>> b897868 (Initial commit - AppBenk)
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Tanggal</Label>
<<<<<<< HEAD
                    <Input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Jumlah</Label>
                    <NumberInput value={form.jumlah} onChange={(v) => setForm({ ...form, jumlah: v })} />
=======
                    <Input
                      type="date"
                      value={form.tanggal}
                      onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Jumlah</Label>
                    <NumberInput
                      value={form.jumlah}
                      onChange={(v) => setForm({ ...form, jumlah: v })}
                    />
>>>>>>> b897868 (Initial commit - AppBenk)
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Harga Beli / Satuan</Label>
<<<<<<< HEAD
                  <NumberInput value={form.harga} onChange={(v) => setForm({ ...form, harga: v })} />
=======
                  <NumberInput
                    value={form.harga}
                    onChange={(v) => setForm({ ...form, harga: v })}
                  />
>>>>>>> b897868 (Initial commit - AppBenk)
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
<<<<<<< HEAD
                <EmptyState title="Belum ada pembelian" description="Pembelian sparepart akan tampil di sini." />
=======
                <EmptyState
                  title="Belum ada pembelian"
                  description="Pembelian sparepart akan tampil di sini."
                />
>>>>>>> b897868 (Initial commit - AppBenk)
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
<<<<<<< HEAD
=======
                        <TableHead className="text-center w-24">Aksi</TableHead>
>>>>>>> b897868 (Initial commit - AppBenk)
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pembelian.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.nomor}</TableCell>
<<<<<<< HEAD
                          <TableCell>{namaPart.get(p.sparepartId) ?? "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{p.supplier}</TableCell>
                          <TableCell className="text-muted-foreground">{tanggalPanjang(p.tanggal)}</TableCell>
                          <TableCell className="text-right">{p.jumlah}</TableCell>
                          <TableCell className="text-right font-semibold">{rupiah(p.total)}</TableCell>
=======
                          <TableCell>{namaPart.get(p.sparepartId) ?? p.sparepartId ?? "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{p.supplier}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {tanggalPanjang(p.tanggal)}
                          </TableCell>
                          <TableCell className="text-right">{p.jumlah}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {rupiah(p.total)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-foreground"
                                title="Edit Pembelian"
                                onClick={() => bukaEditPembelian(p)}
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-destructive"
                                title="Hapus Pembelian"
                                onClick={() => setHapusId(p.id)}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </TableCell>
>>>>>>> b897868 (Initial commit - AppBenk)
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
<<<<<<< HEAD
                <EmptyState title="Belum ada pergerakan stok" description="Log stok masuk/keluar akan tampil di sini." />
=======
                <EmptyState
                  title="Belum ada pergerakan stok"
                  description="Log stok masuk/keluar akan tampil di sini."
                />
>>>>>>> b897868 (Initial commit - AppBenk)
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
<<<<<<< HEAD
                          <TableCell className="text-muted-foreground">{tanggalPanjang(r.tanggal)}</TableCell>
                          <TableCell>{namaPart.get(r.sparepartId) ?? "—"}</TableCell>
                          <TableCell className={r.jenis === "Masuk" ? "font-medium text-success" : "font-medium text-destructive"}>
=======
                          <TableCell className="text-muted-foreground">
                            {tanggalPanjang(r.tanggal)}
                          </TableCell>
                          <TableCell>{namaPart.get(r.sparepartId) ?? r.sparepartId ?? "—"}</TableCell>
                          <TableCell
                            className={
                              r.jenis === "Masuk"
                                ? "font-medium text-success"
                                : "font-medium text-destructive"
                            }
                          >
>>>>>>> b897868 (Initial commit - AppBenk)
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
<<<<<<< HEAD
                <EmptyState title="Belum ada pemakaian" description="Pemakaian sparepart tercatat otomatis dari operasional servis." />
=======
                <EmptyState
                  title="Belum ada pemakaian"
                  description="Pemakaian sparepart tercatat otomatis dari operasional servis."
                />
>>>>>>> b897868 (Initial commit - AppBenk)
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
<<<<<<< HEAD
                          <TableCell className="text-muted-foreground">{tanggalPanjang(p.tanggal)}</TableCell>
                          <TableCell className="font-medium">{p.servisNomor}</TableCell>
                          <TableCell>{namaPart.get(p.sparepartId) ?? "—"}</TableCell>
                          <TableCell className="text-right">{p.jumlah}</TableCell>
                          <TableCell className="text-muted-foreground">{p.mekanik || "—"}</TableCell>
=======
                          <TableCell className="text-muted-foreground">
                            {tanggalPanjang(p.tanggal)}
                          </TableCell>
                          <TableCell className="font-medium">{p.servisNomor}</TableCell>
                          <TableCell>{namaPart.get(p.sparepartId) ?? p.sparepartId ?? "—"}</TableCell>
                          <TableCell className="text-right">{p.jumlah}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {p.mekanik || "—"}
                          </TableCell>
>>>>>>> b897868 (Initial commit - AppBenk)
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
<<<<<<< HEAD
      </Tabs>
=======

        <TabsContent value="retur" className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <RotateCcw className="size-4 text-primary" /> Catat Retur Sparepart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={simpanRetur} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Sparepart</Label>
                  <ComboboxInput
                    value={returForm.sparepartId}
                    onChange={(v) => setReturForm({ ...returForm, sparepartId: v })}
                    options={sparepartOptions}
                    placeholder="Pilih atau ketik sparepart..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Referensi Pembelian (Opsional)</Label>
                  <Select
                    value={returForm.pembelianId || "none"}
                    onValueChange={(v) =>
                      setReturForm({ ...returForm, pembelianId: v === "none" ? "" : v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih referensi pembelian (opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tanpa Referensi Pembelian</SelectItem>
                      {pembelian.map((pb) => (
                        <SelectItem key={pb.id} value={pb.id}>
                          {pb.nomor} · {namaPart.get(pb.sparepartId) ?? pb.sparepartId} ({pb.supplier})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Tanggal</Label>
                    <Input
                      type="date"
                      value={returForm.tanggal}
                      onChange={(e) => setReturForm({ ...returForm, tanggal: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Jumlah Retur</Label>
                    <NumberInput
                      value={returForm.jumlah}
                      onChange={(v) => setReturForm({ ...returForm, jumlah: v })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Alasan Retur</Label>
                  <Input
                    value={returForm.alasan}
                    onChange={(e) => setReturForm({ ...returForm, alasan: e.target.value })}
                    placeholder="Barang cacat pabrik / rusak / salah kirim tipe"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select
                    value={returForm.status}
                    onValueChange={(v) =>
                      setReturForm({
                        ...returForm,
                        status: v as "Disetujui" | "Diproses" | "Ditolak",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Disetujui">Disetujui (Stok Berkurang)</SelectItem>
                      <SelectItem value="Diproses">Diproses</SelectItem>
                      <SelectItem value="Ditolak">Ditolak</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full gap-2">
                  <RotateCcw className="size-4" /> Simpan Pengembalian (Retur)
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Daftar Pengembalian (Retur)</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              {returSparepart.length === 0 ? (
                <EmptyState
                  title="Belum ada data retur"
                  description="Pengembalian sparepart yang dicatat akan tampil di sini."
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Sparepart</TableHead>
                        <TableHead>Ref. Beli</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                        <TableHead>Alasan</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {returSparepart.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="text-muted-foreground">
                            {tanggalPanjang(r.tanggal)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {namaPart.get(r.sparepartId) ?? r.sparepartId ?? "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {r.pembelianId ? (nomorPembelian.get(r.pembelianId) ?? r.pembelianId) : "—"}
                          </TableCell>
                          <TableCell className="text-right font-semibold">{r.jumlah}</TableCell>
                          <TableCell className="text-muted-foreground">{r.alasan}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                r.status === "Disetujui"
                                  ? "bg-success/10 text-success ring-1 ring-success/20"
                                  : r.status === "Ditolak"
                                    ? "bg-destructive/10 text-destructive ring-1 ring-destructive/20"
                                    : "bg-warning/10 text-warning ring-1 ring-warning/20"
                              }`}
                            >
                              {r.status}
                            </span>
                          </TableCell>
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

      {/* DIALOG EDIT PEMBELIAN */}
      <Dialog open={!!editPembelian} onOpenChange={(open) => !open && setEditPembelian(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Pembelian Sparepart ({editPembelian?.nomor})</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSimpanEdit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Sparepart</Label>
              <ComboboxInput
                value={formEdit.sparepartId}
                onChange={(v) => {
                  const sp = sparepart.find(
                    (s) => s.id === v || s.nama.toLowerCase() === v.toLowerCase(),
                  );
                  setFormEdit({
                    ...formEdit,
                    sparepartId: v,
                    harga: formEdit.harga === 0 && sp ? sp.harga : formEdit.harga,
                  });
                }}
                options={sparepartOptions}
                placeholder="Pilih sparepart..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Supplier</Label>
              <Input
                value={formEdit.supplier}
                onChange={(e) => setFormEdit({ ...formEdit, supplier: e.target.value })}
                placeholder="Nama Supplier"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Tanggal</Label>
                <Input
                  type="date"
                  value={formEdit.tanggal}
                  onChange={(e) => setFormEdit({ ...formEdit, tanggal: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Jumlah</Label>
                <NumberInput
                  value={formEdit.jumlah}
                  onChange={(v) => setFormEdit({ ...formEdit, jumlah: v })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Harga Beli / Satuan</Label>
              <NumberInput
                value={formEdit.harga}
                onChange={(v) => setFormEdit({ ...formEdit, harga: v })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2 text-sm">
              <span className="font-medium">Total Baru</span>
              <span className="font-display font-bold">{rupiah(formEdit.jumlah * formEdit.harga)}</span>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditPembelian(null)}>
                Batal
              </Button>
              <Button type="submit">
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CONFIRM DIALOG HAPUS PEMBELIAN */}
      <ConfirmDialog
        open={!!hapusId}
        onOpenChange={(open) => !open && setHapusId(null)}
        title="Hapus Catatan Pembelian?"
        description="Menghapus pembelian ini akan otomatis mengembalikan (rollback) stok sparepart yang pernah tercatat masuk dari transaksi ini."
        onConfirm={handleKonfirmasiHapus}
      />
>>>>>>> b897868 (Initial commit - AppBenk)
    </>
  );
}
