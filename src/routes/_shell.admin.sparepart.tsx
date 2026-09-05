import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/page-header";
import { SearchBar } from "@/components/search-bar";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/number-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStore, rupiah, SATUAN_PART, statusStok, tanggalPanjang, type Sparepart } from "@/lib/store";

export const Route = createFileRoute("/_shell/admin/sparepart")({
  head: () => ({
    meta: [
      { title: "Sparepart & Pricelist — AppBenk" },
      { name: "description", content: "Kelola katalog sparepart bengkel, harga jual, stok, dan kategori komponen kendaraan." },
      { property: "og:title", content: "Sparepart & Pricelist — AppBenk" },
      { property: "og:description", content: "Katalog sparepart dan pricelist bengkel yang selalu siap." },
    ],
  }),
  component: SparepartAdmin,
});

const kosong = { nama: "", satuan: SATUAN_PART[0]!, harga: 0, stok: 0, stokMinimum: 5, deskripsi: "" };

function SparepartAdmin() {
  const { sparepart, simpanSparepart, hapusSparepart } = useStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Sparepart | null>(null);
  const [form, setForm] = useState(kosong);
  const [hapus, setHapus] = useState<Sparepart | null>(null);

  const data = useMemo(() => {
    const s = q.toLowerCase();
    return sparepart.filter((p) => p.nama.toLowerCase().includes(s) || p.deskripsi.toLowerCase().includes(s));
  }, [sparepart, q]);

  const simpan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama.trim() || form.harga <= 0) {
      toast.error("Nama dan harga wajib diisi dengan benar.");
      return;
    }
    void simpanSparepart(edit ? { ...form, id: edit.id } : form);
    toast.success(edit ? "Sparepart diperbarui" : "Sparepart ditambahkan");
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Sparepart & Pricelist"
        description="Katalog komponen beserta harga dan stok."
        action={
          <Button className="gap-2" onClick={() => { setEdit(null); setForm(kosong); setOpen(true); }}>
            <Plus className="size-4" /> Tambah Sparepart
          </Button>
        }
      />

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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{edit ? "Ubah Sparepart" : "Tambah Sparepart"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={simpan} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Nama Sparepart</Label>
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
            </div>
            <div className="space-y-1.5">
              <Label>Satuan</Label>
              <Select value={form.satuan} onValueChange={(v) => setForm({ ...form, satuan: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SATUAN_PART.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Stok Minimum</Label>
              <NumberInput value={form.stokMinimum} onChange={(v) => setForm({ ...form, stokMinimum: v })} placeholder="0" />
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
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
          if (hapus) void hapusSparepart(hapus.id);
          setHapus(null);
          toast.success("Sparepart dihapus");
        }}
      />
    </>
  );
}
