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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStore, rupiah, KATEGORI_PART, type Sparepart } from "@/lib/store";

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

const kosong = { kode: "", nama: "", kategori: KATEGORI_PART[0]!, harga: 0, stok: 0 };

function SparepartAdmin() {
  const { sparepart, simpanSparepart, hapusSparepart } = useStore();
  const [q, setQ] = useState("");
  const [kat, setKat] = useState("semua");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Sparepart | null>(null);
  const [form, setForm] = useState(kosong);
  const [hapus, setHapus] = useState<Sparepart | null>(null);

  const data = useMemo(() => {
    const s = q.toLowerCase();
    return sparepart
      .filter((p) => kat === "semua" || p.kategori === kat)
      .filter((p) => p.nama.toLowerCase().includes(s) || p.kategori.toLowerCase().includes(s));
  }, [sparepart, q, kat]);

  const simpan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama.trim() || form.harga <= 0) {
      toast.error("Nama dan harga wajib diisi dengan benar.");
      return;
    }
    simpanSparepart(edit ? { ...form, id: edit.id } : form);
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
            <Select value={kat} onValueChange={setKat}>
              <SelectTrigger className="w-52 bg-card"><SelectValue placeholder="Kategori" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua kategori</SelectItem>
                {KATEGORI_PART.map((k) => (
                  <SelectItem key={k} value={k}>{k}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {data.length === 0 ? (
            <EmptyState icon={<Package className="size-8" />} title="Sparepart tidak ditemukan" description="Tambahkan item baru atau ubah filter." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Sparepart</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Harga</TableHead>
                    <TableHead className="text-right">Stok</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-muted-foreground">{p.kode}</TableCell>
                      <TableCell className="font-medium">{p.nama}</TableCell>
                      <TableCell className="text-muted-foreground">{p.kategori}</TableCell>
                      <TableCell className="text-right font-semibold">{rupiah(p.harga)}</TableCell>
                      <TableCell className="text-right">
                        <span className={p.stok <= 5 ? "font-semibold text-destructive" : ""}>{p.stok} pcs</span>
                      </TableCell>
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
            <div className="space-y-1.5">
              <Label>Kategori</Label>
              <Select value={form.kategori} onValueChange={(v) => setForm({ ...form, kategori: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {KATEGORI_PART.map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Kode</Label>
              <Input value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} placeholder="SP-009" />
            </div>
            <div className="space-y-1.5">
              <Label>Harga</Label>
              <Input type="number" value={form.harga} onChange={(e) => setForm({ ...form, harga: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Stok</Label>
              <Input type="number" value={form.stok} onChange={(e) => setForm({ ...form, stok: Number(e.target.value) })} />
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
          if (hapus) hapusSparepart(hapus.id);
          setHapus(null);
          toast.success("Sparepart dihapus");
        }}
      />
    </>
  );
}
