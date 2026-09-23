import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import {
  ShoppingCart,
  ArrowDownUp,
  PackageCheck,
  RotateCcw,
  Pencil,
  Trash2,
  Building2,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  AlertTriangle,
  FileText,
  Info,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/page-header";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useAuth } from "@/lib/auth";
import {
  useStore,
  rupiah,
  tanggalPanjang,
  ALASAN_RETUR_OPTIONS,
  STATUS_RETUR_OPTIONS,
  type StatusRetur,
  type ReturSparepart,
  type PembelianSparepart,
} from "@/lib/store";

export const Route = createFileRoute("/_shell/admin/stok")({
  head: () => ({
    meta: [
      { title: "Pembelian & Riwayat Stok — AppBenk" },
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StokAdmin,
});

function StokAdmin() {
  const { user } = useAuth();
  const {
    sparepart,
    pembelian,
    riwayatStok,
    penggunaan,
    returSparepart,
    supplier,
    catatPembelian,
    catatReturSparepart,
    ubahStatusRetur,
    ubahPembelian,
    hapusPembelian,
    refreshSupplier,
    refreshRetur,
  } = useStore();

  useEffect(() => {
    refreshSupplier().catch(() => {});
    refreshRetur().catch(() => {});
    const interval = setInterval(() => {
      refreshRetur().catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  // ==========================================================================
  // RETUR PEMBELIAN (RELASIONAL SUPPLIER -> PEMBELIAN -> BARANG -> RETUR)
  // ==========================================================================
  const [returSupplierId, setReturSupplierId] = useState<string>("");
  const [returPembelianId, setReturPembelianId] = useState<string>("");
  const [returSelectedPartId, setReturSelectedPartId] = useState<string>("");
  const [returJumlah, setReturJumlah] = useState<number>(1);
  const [returAlasan, setReturAlasan] = useState<string>(ALASAN_RETUR_OPTIONS[0]);
  const [returAlasanDetail, setReturAlasanDetail] = useState<string>("");
  const [returKeterangan, setReturKeterangan] = useState<string>("");
  const [returTanggal, setReturTanggal] = useState<string>(new Date().toISOString().slice(0, 10));

  // Dialog detail retur & dialog tolak
  const [detailRetur, setDetailRetur] = useState<ReturSparepart | null>(null);
  const [dialogTolak, setDialogTolak] = useState<ReturSparepart | null>(null);
  const [alasanPenolakan, setAlasanPenolakan] = useState<string>("");
  const [errPenolakan, setErrPenolakan] = useState<string>("");
  const [statusReturFilter, setStatusReturFilter] = useState<string>("semua");

  // Filter transaksi pembelian berdasarkan Supplier terpilih
  const purchasesBySupplier = useMemo(() => {
    if (!returSupplierId) return [];
    const supObj = supplier.find((s) => s.id === returSupplierId);
    const supNama = supObj?.nama?.trim().toLowerCase() || "";

    return pembelian.filter((p) => {
      if (p.supplierId && p.supplierId === returSupplierId) return true;
      if (p.supplier && supNama && p.supplier.toLowerCase().includes(supNama)) return true;
      if (p.supplier && supObj?.nama && p.supplier.toLowerCase() === supObj.nama.toLowerCase()) return true;
      return false;
    });
  }, [pembelian, returSupplierId, supplier]);

  // Daftar nomor pembelian unik untuk dropdown pilihan pembelian
  const uniquePembelianOptions = useMemo(() => {
    const seen = new Set<string>();
    const list: { id: string; nomor: string; tanggal: string; itemCount: number; total: number }[] = [];
    for (const p of purchasesBySupplier) {
      if (!seen.has(p.nomor)) {
        seen.add(p.nomor);
        const allItems = purchasesBySupplier.filter((x) => x.nomor === p.nomor);
        const sumTotal = allItems.reduce((acc, it) => acc + it.total, 0);
        list.push({
          id: p.id,
          nomor: p.nomor,
          tanggal: p.tanggal,
          itemCount: allItems.length,
          total: sumTotal,
        });
      }
    }
    return list;
  }, [purchasesBySupplier]);

  // Daftar item barang dari transaksi pembelian yang dipilih beserta kuota retur
  const purchaseItems = useMemo(() => {
    if (!returPembelianId) return [];
    const target = purchasesBySupplier.find(
      (p) => p.id === returPembelianId || p.nomor === returPembelianId,
    );
    if (!target) return [];

    const matchingRows = purchasesBySupplier.filter((p) => p.nomor === target.nomor);

    return matchingRows.map((pb) => {
      const sp = sparepart.find(
        (s) => s.id.toLowerCase() === pb.sparepartId.toLowerCase(),
      );

      // Hitung akumulasi jumlah yang sudah pernah diretur untuk item ini (kecuali yang ditolak)
      const sudahDiretur = returSparepart
        .filter(
          (r) =>
            (r.pembelianId === pb.id || r.nomorPembelian === pb.nomor) &&
            r.sparepartId.toLowerCase() === pb.sparepartId.toLowerCase() &&
            r.status !== "Ditolak",
        )
        .reduce((sum, r) => sum + r.jumlah, 0);

      const maxRetur = Math.max(0, pb.jumlah - sudahDiretur);

      return {
        pembelianId: pb.id,
        nomorPembelian: pb.nomor,
        sparepartId: pb.sparepartId,
        kode: sp?.kode || pb.sparepartId,
        nama: sp?.nama || pb.sparepartId,
        satuan: sp?.satuan || "Pcs",
        jumlahDibeli: pb.jumlah,
        sudahDiretur,
        maxRetur,
        hargaBeli: pb.harga,
        total: pb.total,
        stokGudang: sp?.stok ?? 0,
      };
    });
  }, [purchasesBySupplier, returPembelianId, sparepart, returSparepart]);

  // Detail sparepart yang sedang dipilih di form retur
  const selectedItemInfo = useMemo(() => {
    if (!returSelectedPartId) return null;
    return purchaseItems.find((it) => it.sparepartId === returSelectedPartId) || null;
  }, [purchaseItems, returSelectedPartId]);

  const handleSupplierChange = (supId: string) => {
    setReturSupplierId(supId);
    setReturPembelianId("");
    setReturSelectedPartId("");
    setReturJumlah(1);
  };

  const handlePembelianChange = (pembId: string) => {
    setReturPembelianId(pembId);
    setReturSelectedPartId("");
    setReturJumlah(1);
  };

  const handleSelectItemForRetur = (partId: string) => {
    setReturSelectedPartId(partId);
    const it = purchaseItems.find((x) => x.sparepartId === partId);
    if (it && it.maxRetur > 0) {
      setReturJumlah(1);
    } else {
      setReturJumlah(0);
    }
  };

  const simpan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sparepartId.trim() || !form.supplier.trim() || form.jumlah <= 0 || form.harga <= 0) {
      toast.error("Lengkapi sparepart, supplier, jumlah, dan harga beli.");
      return;
    }
    catatPembelian(form);
    toast.success("Pembelian dicatat, stok bertambah");
    setForm({ ...kosong, tanggal: form.tanggal });
  };

  const simpanRetur = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returSupplierId) {
      toast.error("Pilih Supplier / PT tujuan retur.");
      return;
    }
    if (!returPembelianId) {
      toast.error("Pilih Referensi Transaksi Pembelian asalnya (Wajib).");
      return;
    }
    if (!returSelectedPartId || !selectedItemInfo) {
      toast.error("Pilih sparepart yang akan diretur dari tabel barang pembelian.");
      return;
    }
    if (selectedItemInfo.maxRetur <= 0) {
      toast.error("Seluruh kuota barang dari pembelian ini telah diretur.");
      return;
    }
    if (returJumlah <= 0) {
      toast.error("Jumlah retur harus minimal 1 unit.");
      return;
    }
    if (returJumlah > selectedItemInfo.maxRetur) {
      toast.error(
        `Jumlah retur (${returJumlah}) melebihi kuota maksimal yang boleh diretur (${selectedItemInfo.maxRetur} ${selectedItemInfo.satuan}).`,
      );
      return;
    }
    if (returAlasan === "Lainnya" && !returAlasanDetail.trim()) {
      toast.error("Penjelasan alasan retur wajib diisi jika memilih opsi 'Lainnya'.");
      return;
    }

    const supObj = supplier.find((s) => s.id === returSupplierId);
    try {
      const created = await catatReturSparepart({
        bengkelId: user?.bengkelId || "bengkel-001",
        supplierId: returSupplierId,
        supplier: supObj?.nama || "Supplier",
        pembelianId: selectedItemInfo.pembelianId,
        nomorPembelian: selectedItemInfo.nomorPembelian,
        sparepartId: selectedItemInfo.sparepartId,
        namaSparepart: selectedItemInfo.nama,
        jumlah: returJumlah,
        hargaSatuan: selectedItemInfo.hargaBeli,
        totalNilai: returJumlah * selectedItemInfo.hargaBeli,
        tanggal: returTanggal,
        alasan: returAlasan,
        alasanDetail: returAlasan === "Lainnya" ? returAlasanDetail.trim() : undefined,
        keterangan: returKeterangan.trim() || undefined,
        status: "Diajukan",
      });

      toast.success(`Pengajuan retur ${created.nomorRetur} berhasil dibuat dengan status Diajukan`);
      await refreshRetur().catch(() => {});
      setReturSelectedPartId("");
      setReturJumlah(1);
      setReturAlasan(ALASAN_RETUR_OPTIONS[0]);
      setReturAlasanDetail("");
      setReturKeterangan("");
    } catch (err: any) {
      toast.error(err?.message || "Gagal mencatat pengajuan retur.");
    }
  };

  const handleUbahStatus = async (returId: string, statusBaru: StatusRetur, alasanTolak?: string) => {
    try {
      await ubahStatusRetur(returId, statusBaru, alasanTolak);
      await refreshRetur().catch(() => {});
      toast.success(`Status retur berhasil diubah ke "${statusBaru}"`);
      if (detailRetur?.id === returId) {
        setDetailRetur((prev) =>
          prev
            ? {
                ...prev,
                status: statusBaru,
                alasanPenolakan: alasanTolak ?? prev.alasanPenolakan,
                stokDikurangi:
                  statusBaru === "Disetujui" || statusBaru === "Selesai" || statusBaru === "Barang Dikirim"
                    ? true
                    : prev.stokDikurangi,
              }
            : null,
        );
      }
    } catch (e: any) {
      toast.error(e?.message || "Gagal mengubah status retur");
    }
  };

  const konfirmasiTolakRetur = async () => {
    if (!dialogTolak) return;
    if (!alasanPenolakan.trim()) {
      setErrPenolakan("Alasan penolakan retur wajib diisi.");
      return;
    }
    await handleUbahStatus(dialogTolak.id, "Ditolak", alasanPenolakan.trim());
    setDialogTolak(null);
    setAlasanPenolakan("");
    setErrPenolakan("");
  };

  const filteredRetur = useMemo(() => {
    return returSparepart.filter((r) => {
      if (statusReturFilter !== "semua" && r.status !== statusReturFilter) return false;
      return true;
    });
  }, [returSparepart, statusReturFilter]);

  const renderStatusReturBadge = (status: StatusRetur) => {
    switch (status) {
      case "Diajukan":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20">
            <Clock className="size-3" /> Diajukan
          </span>
        );
      case "Diproses":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20">
            <ArrowDownUp className="size-3" /> Diproses
          </span>
        );
      case "Disetujui":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
            <CheckCircle2 className="size-3" /> Disetujui
          </span>
        );
      case "Barang Dikirim":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-semibold text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/20">
            <Truck className="size-3" /> Barang Dikirim
          </span>
        );
      case "Selesai":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-600/10 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400 ring-1 ring-green-600/20">
            <PackageCheck className="size-3" /> Selesai
          </span>
        );
      case "Ditolak":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive ring-1 ring-destructive/20">
            <XCircle className="size-3" /> Ditolak
          </span>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Tanggal</Label>
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
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Harga Beli / Satuan</Label>
                  <NumberInput
                    value={form.harga}
                    onChange={(v) => setForm({ ...form, harga: v })}
                  />
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
                <EmptyState
                  title="Belum ada pembelian"
                  description="Pembelian sparepart akan tampil di sini."
                />
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
                        <TableHead className="text-center w-24">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pembelian.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.nomor}</TableCell>
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
                <EmptyState
                  title="Belum ada pergerakan stok"
                  description="Log stok masuk/keluar akan tampil di sini."
                />
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
                <EmptyState
                  title="Belum ada pemakaian"
                  description="Pemakaian sparepart tercatat otomatis dari operasional servis."
                />
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
                          <TableCell className="text-muted-foreground">
                            {tanggalPanjang(p.tanggal)}
                          </TableCell>
                          <TableCell className="font-medium">{p.servisNomor}</TableCell>
                          <TableCell>{namaPart.get(p.sparepartId) ?? p.sparepartId ?? "—"}</TableCell>
                          <TableCell className="text-right">{p.jumlah}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {p.mekanik || "—"}
                          </TableCell>
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

        <TabsContent value="retur" className="mt-4 space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
            {/* FORM PENGAJUAN RETUR */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <RotateCcw className="size-4 text-primary" /> Pengajuan Retur Pembelian ke Supplier
                </CardTitle>
                <CardDescription>
                  Ajukan pengembalian sparepart yang terhubung langsung ke transaksi pembelian asalnya.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={simpanRetur} className="space-y-4">
                  {/* STEP 1: PILIH SUPPLIER */}
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5">
                      <Building2 className="size-3.5 text-primary" />
                      1. Pilih Supplier / PT Tujuan Retur <span className="text-destructive">*</span>
                    </Label>
                    <Select value={returSupplierId} onValueChange={handleSupplierChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Supplier / PT..." />
                      </SelectTrigger>
                      <SelectContent>
                        {supplier.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.nama} {s.kontak ? `(${s.kontak})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* STEP 2: PILIH REFERENSI TRANSAKSI PEMBELIAN */}
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5">
                      <FileText className="size-3.5 text-primary" />
                      2. Referensi Faktur / Pembelian Asal <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={returPembelianId}
                      onValueChange={handlePembelianChange}
                      disabled={!returSupplierId || uniquePembelianOptions.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !returSupplierId
                              ? "Pilih supplier terlebih dahulu"
                              : uniquePembelianOptions.length === 0
                                ? "Belum ada riwayat pembelian dari supplier ini"
                                : "Pilih faktur pembelian asal..."
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {uniquePembelianOptions.map((pb) => (
                          <SelectItem key={pb.id} value={pb.id}>
                            {pb.nomor} · {tanggalPanjang(pb.tanggal)} ({pb.itemCount} item · {rupiah(pb.total)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {returSupplierId && uniquePembelianOptions.length === 0 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        Tidak ditemukan riwayat pembelian untuk supplier ini. Pastikan pembelian sudah dicatat dengan nama supplier yang sesuai.
                      </p>
                    )}
                  </div>

                  {/* STEP 3: DAFTAR BARANG DARI PEMBELIAN YANG DIPILIH */}
                  {returPembelianId && purchaseItems.length > 0 && (
                    <div className="space-y-2 rounded-lg border border-border/80 bg-muted/20 p-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          3. Pilih Sparepart Yang Diretur
                        </Label>
                        <span className="text-xs text-muted-foreground">
                          {purchaseItems.length} item ditemukan
                        </span>
                      </div>
                      <div className="space-y-2">
                        {purchaseItems.map((item) => {
                          const isSelected = returSelectedPartId === item.sparepartId;
                          const isExhausted = item.maxRetur <= 0;

                          return (
                            <div
                              key={item.sparepartId}
                              className={`flex flex-col gap-2 rounded-md border p-2.5 text-sm transition-all sm:flex-row sm:items-center sm:justify-between ${
                                isSelected
                                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                                  : isExhausted
                                    ? "border-dashed border-border/60 bg-muted/40 opacity-60"
                                    : "border-border bg-card hover:border-primary/50"
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-bold text-primary">{item.kode}</span>
                                  <span className="font-medium text-foreground">{item.nama}</span>
                                </div>
                                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                  <span>Beli: {item.jumlahDibeli} {item.satuan}</span>
                                  <span>Harga: {rupiah(item.hargaBeli)}</span>
                                  <span>Diretur: {item.sudahDiretur} {item.satuan}</span>
                                  <span className="font-semibold text-foreground">
                                    Sisa Kuota: <span className={item.maxRetur > 0 ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-destructive"}>{item.maxRetur} {item.satuan}</span>
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center justify-end sm:shrink-0">
                                {isExhausted ? (
                                  <Badge variant="outline" className="text-[11px] text-muted-foreground">
                                    Kuota Habis
                                  </Badge>
                                ) : isSelected ? (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="default"
                                    className="h-7 text-xs gap-1"
                                    onClick={() => setReturSelectedPartId("")}
                                  >
                                    <Check className="size-3.5" /> Terpilih
                                  </Button>
                                ) : (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs"
                                    onClick={() => handleSelectItemForRetur(item.sparepartId)}
                                  >
                                    Pilih
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* STEP 4: FORM DETAIL RETUR (HANYA MUNCUL JIKA SUDAH PILIH BARANG) */}
                  {selectedItemInfo && (
                    <div className="space-y-4 rounded-lg border border-primary/20 bg-primary/[0.02] p-3.5">
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">
                          4. Rincian & Alasan Retur
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Maksimal: {selectedItemInfo.maxRetur} {selectedItemInfo.satuan}
                        </Badge>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label>Tanggal Pengajuan</Label>
                          <Input
                            type="date"
                            value={returTanggal}
                            onChange={(e) => setReturTanggal(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="flex items-center justify-between">
                            <span>Jumlah Retur</span>
                            <span className="text-xs text-muted-foreground">
                              Max: {selectedItemInfo.maxRetur}
                            </span>
                          </Label>
                          <NumberInput
                            value={returJumlah}
                            onChange={(v) => {
                              const clamped = Math.min(Math.max(1, v), selectedItemInfo.maxRetur);
                              setReturJumlah(clamped);
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label>Alasan Retur <span className="text-destructive">*</span></Label>
                        <Select value={returAlasan} onValueChange={setReturAlasan}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ALASAN_RETUR_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {returAlasan === "Lainnya" && (
                        <div className="space-y-1.5">
                          <Label>Penjelasan Alasan Retur <span className="text-destructive">*</span></Label>
                          <Input
                            value={returAlasanDetail}
                            onChange={(e) => setReturAlasanDetail(e.target.value)}
                            placeholder="Jelaskan alasan retur secara spesifik..."
                          />
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <Label>Keterangan Tambahan (Opsional)</Label>
                        <Textarea
                          value={returKeterangan}
                          onChange={(e) => setReturKeterangan(e.target.value)}
                          placeholder="Contoh: Dus barang penyok, nomor seri fisik tidak terbaca, dll."
                          className="h-16 resize-none text-xs"
                        />
                      </div>

                      {/* TOTAL NILAI RETUR & NOTICE */}
                      <div className="rounded-md bg-muted/60 p-3 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Harga Satuan Beli:</span>
                          <span className="font-mono">{rupiah(selectedItemInfo.hargaBeli)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm font-semibold">
                          <span>Total Nilai Retur:</span>
                          <span className="font-display font-bold text-primary">
                            {rupiah(returJumlah * selectedItemInfo.hargaBeli)}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                          Status retur awal adalah <strong>Diajukan</strong>. Stok di gudang <strong>TIDAK</strong> berkurang sampai pengajuan disetujui oleh admin/supplier.
                        </p>
                      </div>

                      <Button type="submit" className="w-full gap-2 font-medium shadow-sm">
                        <RotateCcw className="size-4" /> Ajukan Retur Pembelian
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* TABEL DAFTAR PENGEMBALIAN (RETUR) */}
            <Card>
              <CardHeader className="pb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base">Riwayat Retur Pembelian</CardTitle>
                  <CardDescription>
                    Kelola status persetujuan dan pengiriman barang retur ke supplier.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={statusReturFilter} onValueChange={setStatusReturFilter}>
                    <SelectTrigger className="h-8 w-36 text-xs">
                      <SelectValue placeholder="Filter Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semua">Semua Status</SelectItem>
                      {STATUS_RETUR_OPTIONS.map((st) => (
                        <SelectItem key={st} value={st}>
                          {st}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="px-0">
                {filteredRetur.length === 0 ? (
                  <EmptyState
                    title="Belum ada data retur"
                    description={
                      statusReturFilter !== "semua"
                        ? `Tidak ada data retur dengan status "${statusReturFilter}".`
                        : "Pengembalian sparepart ke supplier yang dicatat akan tampil di sini."
                    }
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>No. Retur</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Supplier</TableHead>
                          <TableHead>No. Beli</TableHead>
                          <TableHead>Sparepart</TableHead>
                          <TableHead className="text-right">Jumlah</TableHead>
                          <TableHead className="text-right">Total Nilai</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-center">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRetur.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell className="font-mono text-xs font-semibold text-primary">
                              {r.nomorRetur || r.id}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                              {tanggalPanjang(r.tanggal)}
                            </TableCell>
                            <TableCell className="font-medium text-xs">
                              {r.supplier || "—"}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                              {r.nomorPembelian || (r.pembelianId ? nomorPembelian.get(r.pembelianId) ?? r.pembelianId : "—")}
                            </TableCell>
                            <TableCell className="text-xs">
                              {r.namaSparepart || namaPart.get(r.sparepartId) || r.sparepartId}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-xs whitespace-nowrap">
                              {r.jumlah}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs font-semibold whitespace-nowrap">
                              {rupiah(r.totalNilai || (r.jumlah * (r.hargaSatuan || 0)))}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {renderStatusReturBadge(r.status)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                title="Lihat Detail & Kelola Status"
                                onClick={() => setDetailRetur(r)}
                              >
                                <Eye className="size-3.5" />
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
          </div>
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

      {/* DIALOG DETAIL RETUR */}
      <Dialog open={!!detailRetur} onOpenChange={(open) => !open && setDetailRetur(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between gap-2 pr-4">
              <DialogTitle className="flex items-center gap-2 text-base">
                <RotateCcw className="size-4 text-primary" />
                Detail Retur: {detailRetur?.nomorRetur || detailRetur?.id}
              </DialogTitle>
              {detailRetur && renderStatusReturBadge(detailRetur.status)}
            </div>
            <DialogDescription>
              Informasi lengkap pengembalian sparepart ke supplier dan alur persetujuan.
            </DialogDescription>
          </DialogHeader>

          {detailRetur && (
            <div className="space-y-4 py-2 text-sm">
              {/* SUPPLIER & FAKTUR PEMBELIAN */}
              <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3">
                <div>
                  <span className="text-xs text-muted-foreground block">Supplier / PT Tujuan:</span>
                  <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                    <Building2 className="size-3.5 text-primary" />
                    {detailRetur.supplier || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Faktur Pembelian Asal:</span>
                  <span className="font-mono font-semibold text-foreground mt-0.5 block">
                    {detailRetur.nomorPembelian || (detailRetur.pembelianId ? nomorPembelian.get(detailRetur.pembelianId) ?? detailRetur.pembelianId : "—")}
                  </span>
                </div>
              </div>

              {/* SPAREPART & TOTAL */}
              <div className="rounded-lg border bg-card p-3 space-y-2">
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <span className="text-xs text-muted-foreground block">Sparepart yang Diretur:</span>
                    <span className="font-medium text-foreground">
                      {detailRetur.namaSparepart || namaPart.get(detailRetur.sparepartId) || detailRetur.sparepartId}
                    </span>
                  </div>
                  <Badge variant="outline" className="font-mono">
                    {detailRetur.jumlah} unit
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-muted-foreground">Harga Beli Satuan:</span>
                    <p className="font-mono font-medium">{rupiah(detailRetur.hargaSatuan || 0)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Nilai Retur:</span>
                    <p className="font-mono font-bold text-primary">
                      {rupiah(detailRetur.totalNilai || (detailRetur.jumlah * (detailRetur.hargaSatuan || 0)))}
                    </p>
                  </div>
                </div>
              </div>

              {/* ALASAN & KETERANGAN */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-foreground">Alasan Pengembalian:</span>
                  <p className="text-muted-foreground mt-0.5">{detailRetur.alasan}</p>
                </div>
                {detailRetur.alasanDetail && (
                  <div>
                    <span className="font-semibold text-foreground">Penjelasan Spesifik:</span>
                    <p className="text-muted-foreground mt-0.5">{detailRetur.alasanDetail}</p>
                  </div>
                )}
                {detailRetur.keterangan && (
                  <div>
                    <span className="font-semibold text-foreground">Keterangan Tambahan:</span>
                    <p className="text-muted-foreground mt-0.5">{detailRetur.keterangan}</p>
                  </div>
                )}
              </div>

              {/* STATUS PEMOTONGAN STOK */}
              <div className="pt-1">
                {detailRetur.stokDikurangi ? (
                  <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 p-2.5 text-xs text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/20">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                    <span>Stok fisik gudang <strong>telah dipotong (-{detailRetur.jumlah})</strong> dan dicatat pada Riwayat Stok Masuk/Keluar.</span>
                  </div>
                ) : detailRetur.status === "Ditolak" ? (
                  <div className="flex flex-col gap-1 rounded-md bg-destructive/10 p-2.5 text-xs text-destructive ring-1 ring-destructive/20">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <XCircle className="size-4 shrink-0" />
                      Retur Ditolak
                    </div>
                    <span>Alasan penolakan: {detailRetur.alasanPenolakan || "Tidak ada rincian alasan penolakan."}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-md bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/20">
                    <AlertTriangle className="size-4 shrink-0 text-amber-600" />
                    <span>Stok fisik gudang <strong>belum dipotong</strong>. Stok akan berkurang otomatis saat retur disetujui.</span>
                  </div>
                )}
              </div>

              {/* WORKFLOW UPDATE STATUS */}
              <div className="border-t pt-3 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  Perbarui Status Alur Retur:
                </span>
                <div className="flex flex-wrap gap-2">
                  {detailRetur.status === "Diajukan" && (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-1 text-xs"
                        onClick={() => handleUbahStatus(detailRetur.id, "Diproses")}
                      >
                        <ArrowDownUp className="size-3.5" /> Proses Pengajuan
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="default"
                        className="gap-1 text-xs bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleUbahStatus(detailRetur.id, "Disetujui")}
                      >
                        <CheckCircle2 className="size-3.5" /> Setujui & Potong Stok
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="gap-1 text-xs"
                        onClick={() => setDialogTolak(detailRetur)}
                      >
                        <XCircle className="size-3.5" /> Tolak Retur
                      </Button>
                    </>
                  )}

                  {detailRetur.status === "Diproses" && (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        variant="default"
                        className="gap-1 text-xs bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleUbahStatus(detailRetur.id, "Disetujui")}
                      >
                        <CheckCircle2 className="size-3.5" /> Setujui & Potong Stok
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="gap-1 text-xs"
                        onClick={() => setDialogTolak(detailRetur)}
                      >
                        <XCircle className="size-3.5" /> Tolak Retur
                      </Button>
                    </>
                  )}

                  {detailRetur.status === "Disetujui" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="default"
                      className="gap-1 text-xs bg-purple-600 hover:bg-purple-700"
                      onClick={() => handleUbahStatus(detailRetur.id, "Barang Dikirim")}
                    >
                      <Truck className="size-3.5" /> Kirim Barang ke Supplier
                    </Button>
                  )}

                  {detailRetur.status === "Barang Dikirim" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="default"
                      className="gap-1 text-xs bg-green-600 hover:bg-green-700"
                      onClick={() => handleUbahStatus(detailRetur.id, "Selesai")}
                    >
                      <PackageCheck className="size-3.5" /> Selesaikan Retur (Selesai)
                    </Button>
                  )}

                  {(detailRetur.status === "Selesai" || detailRetur.status === "Ditolak") && (
                    <p className="text-xs text-muted-foreground italic">
                      Retur ini telah berada pada status akhir ({detailRetur.status}) dan tidak dapat diubah lagi.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDetailRetur(null)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG TOLAK RETUR */}
      <Dialog open={!!dialogTolak} onOpenChange={(open) => !open && setDialogTolak(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="size-4" /> Tolak Retur: {dialogTolak?.nomorRetur || dialogTolak?.id}
            </DialogTitle>
            <DialogDescription>
              Wajib memberikan alasan penolakan retur sparepart untuk dokumentasi bengkel dan supplier.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="alasanPenolakan">
                Alasan Penolakan <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="alasanPenolakan"
                value={alasanPenolakan}
                onChange={(e) => {
                  setAlasanPenolakan(e.target.value);
                  if (errPenolakan) setErrPenolakan("");
                }}
                placeholder="Contoh: Melebihi batas waktu garansi retur supplier (maksimal 7 hari), segel barang rusak oleh mekanik..."
                className="h-24 resize-none text-xs"
              />
              {errPenolakan && (
                <p className="text-xs font-medium text-destructive">{errPenolakan}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDialogTolak(null);
                setAlasanPenolakan("");
                setErrPenolakan("");
              }}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="gap-1"
              onClick={konfirmasiTolakRetur}
            >
              <XCircle className="size-4" /> Konfirmasi Tolak Retur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
