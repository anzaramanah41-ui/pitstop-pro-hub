import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
<<<<<<< HEAD
import { Plus, Pencil, Trash2, Package } from "lucide-react";
=======
import { Plus, Pencil, Trash2, Package, RotateCcw, Tag, ArrowUpDown, Layers } from "lucide-react";
>>>>>>> b897868 (Initial commit - AppBenk)
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/page-header";
import { SearchBar } from "@/components/search-bar";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
<<<<<<< HEAD
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/number-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStore, rupiah, SATUAN_PART, statusStok, tanggalPanjang, type Sparepart } from "@/lib/store";
=======
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
import {
  useStore,
  rupiah,
  KATEGORI_PART,
  SATUAN_PART,
  statusStok,
  tanggalPanjang,
  generateNextKodeSparepart,
  type Sparepart,
} from "@/lib/store";
>>>>>>> b897868 (Initial commit - AppBenk)

export const Route = createFileRoute("/_shell/admin/sparepart")({
  head: () => ({
    meta: [
      { title: "Sparepart & Pricelist — AppBenk" },
<<<<<<< HEAD
      { name: "description", content: "Kelola katalog sparepart bengkel, harga jual, stok, dan kategori komponen kendaraan." },
      { property: "og:title", content: "Sparepart & Pricelist — AppBenk" },
      { property: "og:description", content: "Katalog sparepart dan pricelist bengkel yang selalu siap." },
=======
      {
        name: "description",
        content:
          "Kelola katalog sparepart bengkel, harga jual, stok, dan kategori komponen kendaraan.",
      },
      { property: "og:title", content: "Sparepart & Pricelist — AppBenk" },
      {
        property: "og:description",
        content: "Katalog sparepart dan pricelist bengkel yang selalu siap.",
      },
>>>>>>> b897868 (Initial commit - AppBenk)
    ],
  }),
  component: SparepartAdmin,
});

<<<<<<< HEAD
const kosong = { nama: "", satuan: SATUAN_PART[0]!, harga: 0, stok: 0, stokMinimum: 5, deskripsi: "" };

function SparepartAdmin() {
  const { sparepart, simpanSparepart, hapusSparepart } = useStore();
  const [q, setQ] = useState("");
=======
const kosong = {
  kode: "",
  nama: "",
  kategori: KATEGORI_PART[0]!,
  satuan: SATUAN_PART[0]!,
  harga: 0,
  stok: 0,
  stokMinimum: 5,
};

function SparepartAdmin() {
  const { sparepart, simpanSparepart, hapusSparepart } = useStore();
  const [tab, setTab] = useState<"katalog" | "pricelist">("katalog");
  const [q, setQ] = useState("");
  const [kat, setKat] = useState("semua");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [sortFilter, setSortFilter] = useState("default");
>>>>>>> b897868 (Initial commit - AppBenk)
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Sparepart | null>(null);
  const [form, setForm] = useState(kosong);
  const [hapus, setHapus] = useState<Sparepart | null>(null);

<<<<<<< HEAD
  const data = useMemo(() => {
    const s = q.toLowerCase();
    return sparepart.filter((p) => p.nama.toLowerCase().includes(s) || p.deskripsi.toLowerCase().includes(s));
  }, [sparepart, q]);
=======
  const isFiltered = q.trim() !== "" || kat !== "semua" || statusFilter !== "semua" || sortFilter !== "default";

  const resetFilter = () => {
    setQ("");
    setKat("semua");
    setStatusFilter("semua");
    setSortFilter("default");
  };

  const bukaBaru = () => {
    const nextKode = generateNextKodeSparepart(sparepart);
    setEdit(null);
    setForm({
      ...kosong,
      kode: nextKode,
    });
    setOpen(true);
  };

  const data = useMemo(() => {
    const s = q.toLowerCase().trim();
    let res = sparepart.filter((p) => {
      // Filter Kategori
      if (kat !== "semua" && p.kategori !== kat) return false;
      // Filter Status Stok
      if (statusFilter !== "semua") {
        const st = statusStok(p);
        if (statusFilter === "Aman" && st !== "Aman") return false;
        if (statusFilter === "Menipis" && st !== "Menipis") return false;
        if (statusFilter === "Habis" && st !== "Habis") return false;
      }
      // Filter Pencarian (Nama, Kode, atau Kategori)
      if (s) {
        const namaCocok = p.nama?.toLowerCase().includes(s);
        const kodeCocok = p.kode?.toLowerCase().includes(s);
        const katCocok = p.kategori?.toLowerCase().includes(s);
        if (!namaCocok && !kodeCocok && !katCocok) return false;
      }
      return true;
    });

    // Pengurutan / Sort (default mempertahankan urutan asli / baru di bawah)
    if (sortFilter !== "default") {
      res = [...res].sort((a, b) => {
        if (sortFilter === "nama_asc") return a.nama.localeCompare(b.nama);
        if (sortFilter === "nama_desc") return b.nama.localeCompare(a.nama);
        if (sortFilter === "harga_asc") return a.harga - b.harga;
        if (sortFilter === "harga_desc") return b.harga - a.harga;
        if (sortFilter === "stok_desc") return b.stok - a.stok;
        if (sortFilter === "stok_asc") return a.stok - b.stok;
        if (sortFilter === "terbaru") return (b.tanggalUpdate || "").localeCompare(a.tanggalUpdate || "");
        return 0;
      });
    }

    return res;
  }, [sparepart, q, kat, statusFilter, sortFilter]);

  // Statistik Pricelist
  const statsPricelist = useMemo(() => {
    if (sparepart.length === 0) return { total: 0, minHarga: 0, maxHarga: 0, avgHarga: 0 };
    const hargas = sparepart.map((p) => Number(p.harga || 0));
    const minHarga = Math.min(...hargas);
    const maxHarga = Math.max(...hargas);
    const avgHarga = Math.round(hargas.reduce((a, b) => a + b, 0) / hargas.length);
    return { total: sparepart.length, minHarga, maxHarga, avgHarga };
  }, [sparepart]);
>>>>>>> b897868 (Initial commit - AppBenk)

  const simpan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama.trim() || form.harga <= 0) {
      toast.error("Nama dan harga wajib diisi dengan benar.");
      return;
    }
<<<<<<< HEAD
    void simpanSparepart(edit ? { ...form, id: edit.id } : form);
=======
    const kodeOtomatis = generateNextKodeSparepart(sparepart);
    const kodeInput = (form.kode.trim() || kodeOtomatis).toUpperCase();
    if (!edit && kodeInput && sparepart.some((x) => x.kode.toLowerCase() === kodeInput.toLowerCase())) {
      toast.error(`Kode ${kodeInput} sudah digunakan oleh sparepart lain. Silakan gunakan kode unik.`);
      return;
    }
    simpanSparepart(edit ? { ...form, kode: kodeInput, id: edit.id } : { ...form, kode: kodeInput });
>>>>>>> b897868 (Initial commit - AppBenk)
    toast.success(edit ? "Sparepart diperbarui" : "Sparepart ditambahkan");
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Sparepart & Pricelist"
<<<<<<< HEAD
        description="Katalog komponen beserta harga dan stok."
        action={
          <Button className="gap-2" onClick={() => { setEdit(null); setForm(kosong); setOpen(true); }}>
=======
        description="Katalog komponen lengkap beserta harga jual, pergerakan stok, dan informasi ketersediaan."
        action={
          <Button className="gap-2" onClick={bukaBaru}>
>>>>>>> b897868 (Initial commit - AppBenk)
            <Plus className="size-4" /> Tambah Sparepart
          </Button>
        }
      />

<<<<<<< HEAD
      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <SearchBar value={q} onChange={setQ} placeholder="Cari nama sparepart..." />
          </div>

          {data.length === 0 ? (
            <EmptyState icon={<Package className="size-8" />} title="Sparepart tidak ditemukan" description="Tambahkan item baru atau ubah filter." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Sparepart</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Satuan</TableHead>
                    <TableHead className="text-right">Harga</TableHead>
                    <TableHead className="text-right">Stok</TableHead>
                    <TableHead>Status Stok</TableHead>
                    <TableHead>Update</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.nama}</TableCell>
                      <TableCell className="text-muted-foreground">{p.deskripsi || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{p.satuan}</TableCell>
                      <TableCell className="text-right font-semibold">{rupiah(p.harga)}</TableCell>
                      <TableCell className="text-right">
                        <span className={p.stok <= p.stokMinimum ? "font-semibold text-destructive" : ""}>
                          {p.stok} {p.satuan}
                        </span>
                        <span className="block text-xs text-muted-foreground">min. {p.stokMinimum}</span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            statusStok(p) === "Habis"
                              ? "font-semibold text-destructive"
                              : statusStok(p) === "Menipis"
                                ? "font-semibold text-warning"
                                : "text-muted-foreground"
                          }
                        >
                          {statusStok(p)}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{tanggalPanjang(p.tanggalUpdate)}</TableCell>

                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" aria-label="Ubah" onClick={() => { setEdit(p); setForm({ ...kosong, ...p }); setOpen(true); }}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button size="icon" variant="ghost" aria-label="Hapus" onClick={() => setHapus(p)}>
                            <Trash2 className="size-4 text-destructive" />
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
=======
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="katalog" className="gap-2">
              <Package className="size-4" /> Katalog Sparepart ({sparepart.length})
            </TabsTrigger>
            <TabsTrigger value="pricelist" className="gap-2">
              <Tag className="size-4" /> Pricelist / Daftar Harga
            </TabsTrigger>
          </TabsList>
          {isFiltered && (
            <span className="text-xs text-muted-foreground">
              Menampilkan {data.length} dari {sparepart.length} sparepart
            </span>
          )}
        </div>

        {tab === "pricelist" && (
          <div className="grid gap-3 sm:grid-cols-4">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Item</span>
                <p className="mt-1 text-xl font-bold">{statsPricelist.total} sparepart</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-success">
              <CardContent className="p-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Harga Terendah</span>
                <p className="mt-1 text-xl font-bold text-success">{rupiah(statsPricelist.minHarga)}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rata-Rata Harga</span>
                <p className="mt-1 text-xl font-bold">{rupiah(statsPricelist.avgHarga)}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-amber-500">
              <CardContent className="p-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Harga Tertinggi</span>
                <p className="mt-1 text-xl font-bold text-amber-600">{rupiah(statsPricelist.maxHarga)}</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardContent className="space-y-4 p-4">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-[240px] flex-1">
                <SearchBar
                  value={q}
                  onChange={setQ}
                  placeholder="Cari nama, kode (misal SP-009), atau kategori..."
                />
              </div>

              {/* Filter Kategori */}
              <Select value={kat} onValueChange={setKat}>
                <SelectTrigger className="w-44 bg-card">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Kategori</SelectItem>
                  {KATEGORI_PART.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filter Status Stok */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-card">
                  <SelectValue placeholder="Status Stok" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Status</SelectItem>
                  <SelectItem value="Aman">Tersedia (Aman)</SelectItem>
                  <SelectItem value="Menipis">Stok Menipis</SelectItem>
                  <SelectItem value="Habis">Stok Habis</SelectItem>
                </SelectContent>
              </Select>

              {/* Filter Urutan / Sort */}
              <Select value={sortFilter} onValueChange={setSortFilter}>
                <SelectTrigger className="w-44 bg-card">
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Urutan Ditambahkan (Standar)</SelectItem>
                  <SelectItem value="nama_asc">Nama (A — Z)</SelectItem>
                  <SelectItem value="nama_desc">Nama (Z — A)</SelectItem>
                  <SelectItem value="harga_asc">Harga Terendah</SelectItem>
                  <SelectItem value="harga_desc">Harga Tertinggi</SelectItem>
                  <SelectItem value="stok_desc">Stok Terbanyak</SelectItem>
                  <SelectItem value="stok_asc">Stok Tersedikit</SelectItem>
                  <SelectItem value="terbaru">Update Terbaru</SelectItem>
                </SelectContent>
              </Select>

              {/* Tombol Reset Filter */}
              {isFiltered && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilter}
                  className="gap-1.5 border-dashed text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="size-3.5" /> Reset Filter
                </Button>
              )}
            </div>

            {/* Konten Tab Katalog */}
            <TabsContent value="katalog" className="m-0">
              {data.length === 0 ? (
                <EmptyState
                  icon={<Package className="size-8" />}
                  title="Sparepart tidak ditemukan"
                  description={
                    isFiltered
                      ? "Tidak ada sparepart yang sesuai dengan filter. Coba ubah atau reset filter."
                      : "Belum ada sparepart terdaftar. Silakan klik Tambah Sparepart."
                  }
                  action={
                    isFiltered ? (
                      <Button variant="outline" size="sm" onClick={resetFilter} className="gap-2">
                        <RotateCcw className="size-3.5" /> Kembalikan Semua Data
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kode</TableHead>
                        <TableHead>Nama Sparepart</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Satuan</TableHead>
                        <TableHead className="text-right">Harga Jual</TableHead>
                        <TableHead className="text-right">Stok</TableHead>
                        <TableHead>Status Stok</TableHead>
                        <TableHead>Update</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-mono text-xs font-semibold text-primary">{p.kode}</TableCell>
                          <TableCell className="font-medium">{p.nama}</TableCell>
                          <TableCell className="text-muted-foreground">{p.kategori}</TableCell>
                          <TableCell className="text-muted-foreground">{p.satuan}</TableCell>
                          <TableCell className="text-right font-semibold">{rupiah(p.harga)}</TableCell>
                          <TableCell className="text-right">
                            <span
                              className={
                                p.stok <= p.stokMinimum ? "font-semibold text-destructive" : ""
                              }
                            >
                              {p.stok} {p.satuan}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              min. {p.stokMinimum}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                statusStok(p) === "Habis"
                                  ? "inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive"
                                  : statusStok(p) === "Menipis"
                                    ? "inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600"
                                    : "inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success"
                              }
                            >
                              {statusStok(p)}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {tanggalPanjang(p.tanggalUpdate)}
                          </TableCell>

                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                aria-label="Ubah"
                                onClick={() => {
                                  setEdit(p);
                                  setForm({ ...kosong, ...p });
                                  setOpen(true);
                                }}
                              >
                                <Pencil className="size-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                aria-label="Hapus"
                                onClick={() => setHapus(p)}
                              >
                                <Trash2 className="size-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Konten Tab Pricelist */}
            <TabsContent value="pricelist" className="m-0">
              {data.length === 0 ? (
                <EmptyState
                  icon={<Tag className="size-8" />}
                  title="Pricelist tidak ditemukan"
                  description="Coba ubah kata kunci atau reset filter."
                  action={
                    isFiltered ? (
                      <Button variant="outline" size="sm" onClick={resetFilter} className="gap-2">
                        <RotateCcw className="size-3.5" /> Kembalikan Semua Data
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kode Part</TableHead>
                        <TableHead>Nama Komponen / Sparepart</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Satuan</TableHead>
                        <TableHead className="text-right">Harga Resmi (Pricelist)</TableHead>
                        <TableHead className="text-right">Stok Tersedia</TableHead>
                        <TableHead>Kondisi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-mono text-xs font-semibold text-primary">{p.kode}</TableCell>
                          <TableCell className="font-medium">{p.nama}</TableCell>
                          <TableCell className="text-muted-foreground">{p.kategori}</TableCell>
                          <TableCell className="text-muted-foreground">{p.satuan}</TableCell>
                          <TableCell className="text-right font-display text-base font-bold text-foreground">
                            {rupiah(p.harga)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {p.stok} {p.satuan}
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                statusStok(p) === "Habis"
                                  ? "inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive"
                                  : statusStok(p) === "Menipis"
                                    ? "inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600"
                                    : "inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success"
                              }
                            >
                              {statusStok(p)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
>>>>>>> b897868 (Initial commit - AppBenk)

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{edit ? "Ubah Sparepart" : "Tambah Sparepart"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={simpan} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Nama Sparepart</Label>
<<<<<<< HEAD
              <Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Deskripsi</Label>
              <Input value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} placeholder="Keterangan singkat (opsional)" />
            </div>
            <div className="space-y-1.5">
              <Label>Harga</Label>
              <NumberInput value={form.harga} onChange={(v) => setForm({ ...form, harga: v })} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Stok</Label>
              <NumberInput value={form.stok} onChange={(v) => setForm({ ...form, stok: v })} placeholder="0" />
=======
              <Input
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Kategori</Label>
              <Select
                value={form.kategori}
                onValueChange={(v) => setForm({ ...form, kategori: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KATEGORI_PART.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="sparepart-kode">Kode Sparepart</Label>
                <span className="text-[11px] text-muted-foreground font-medium">Otomatis (SP-xxx)</span>
              </div>
              <Input
                id="sparepart-kode"
                value={form.kode}
                onChange={(e) => setForm({ ...form, kode: e.target.value.toUpperCase() })}
                placeholder="SP-005"
              />
              <p className="text-[11px] text-muted-foreground">
                Kode dibuat otomatis berurutan (misal: SP-005, SP-009). Tetap dapat diedit jika perlu.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Harga</Label>
              <NumberInput
                value={form.harga}
                onChange={(v) => setForm({ ...form, harga: v })}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Stok</Label>
              <NumberInput
                value={form.stok}
                onChange={(v) => setForm({ ...form, stok: v })}
                placeholder="0"
              />
>>>>>>> b897868 (Initial commit - AppBenk)
            </div>
            <div className="space-y-1.5">
              <Label>Satuan</Label>
              <Select value={form.satuan} onValueChange={(v) => setForm({ ...form, satuan: v })}>
<<<<<<< HEAD
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SATUAN_PART.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
=======
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SATUAN_PART.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
>>>>>>> b897868 (Initial commit - AppBenk)
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Stok Minimum</Label>
<<<<<<< HEAD
              <NumberInput value={form.stokMinimum} onChange={(v) => setForm({ ...form, stokMinimum: v })} placeholder="0" />
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
=======
              <NumberInput
                value={form.stokMinimum}
                onChange={(v) => setForm({ ...form, stokMinimum: v })}
                placeholder="0"
              />
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Batal
              </Button>
>>>>>>> b897868 (Initial commit - AppBenk)
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!hapus}
        onOpenChange={(v) => !v && setHapus(null)}
        title={`Hapus ${hapus?.nama}?`}
        onConfirm={() => {
<<<<<<< HEAD
          if (hapus) void hapusSparepart(hapus.id);
=======
          if (hapus) hapusSparepart(hapus.id);
>>>>>>> b897868 (Initial commit - AppBenk)
          setHapus(null);
          toast.success("Sparepart dihapus");
        }}
      />
    </>
  );
}
