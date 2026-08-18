import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Package, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/page-header";
import { SearchBar } from "@/components/search-bar";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useStore, rupiah, type Sparepart } from "@/lib/store";

export const Route = createFileRoute("/_shell/sparepart")({
  head: () => ({
    meta: [
      { title: "Sparepart & Pricelist — Bengkel Pitstop" },
      { name: "description", content: "Katalog sparepart bengkel lengkap dengan harga dan ketersediaan stok." },
      { property: "og:title", content: "Sparepart & Pricelist — Bengkel Pitstop" },
      { property: "og:description", content: "Katalog sparepart, harga, dan stok." },
    ],
  }),
  component: SparepartPage,
});

const KATEGORI = ["Oli", "Mesin", "Rem", "Kelistrikan", "Ban", "Kaki-kaki", "AC"];
const kosong = { kode: "", nama: "", kategori: KATEGORI[0]!, harga: 0, stok: 0 };
type Err = Partial<Record<"kode" | "nama", string>>;

function SparepartPage() {
  const { sparepart, simpanSparepart, hapusSparepart } = useStore();
  const [q, setQ] = useState("");
  const [kategori, setKategori] = useState("Semua");
  const [urutHarga, setUrutHarga] = useState<"none" | "asc" | "desc">("none");
  const [form, setForm] = useState<(typeof kosong & { id?: string }) | null>(null);
  const [hapus, setHapus] = useState<Sparepart | null>(null);
  const [error, setError] = useState<Err>({});

  const data = useMemo(() => {
    const s = q.toLowerCase();
    const list = sparepart
      .filter((x) => kategori === "Semua" || x.kategori === kategori)
      .filter((x) => [x.nama, x.kode, x.kategori].some((v) => v.toLowerCase().includes(s)));
    if (urutHarga !== "none") {
      list.sort((a, b) => (urutHarga === "asc" ? a.harga - b.harga : b.harga - a.harga));
    }
    return list;
  }, [sparepart, q, kategori, urutHarga]);

  const submit = () => {
    if (!form) return;
    const err: Err = {};
    if (!form.kode.trim()) err.kode = "Kode sparepart wajib diisi";
    if (!form.nama.trim()) err.nama = "Nama sparepart wajib diisi";
    setError(err);
    if (Object.keys(err).length) return;
    simpanSparepart(form);
    toast.success(form.id ? "Sparepart diperbarui" : "Sparepart ditambahkan");
    setForm(null);
  };

  return (
    <>
      <PageHeader
        title="Sparepart & Pricelist"
        description="Katalog sparepart beserta harga dan ketersediaan stok."
        action={
          <Button className="gap-2" onClick={() => { setError({}); setForm({ ...kosong }); }}>
            <Plus className="size-4" /> Tambah Sparepart
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <SearchBar value={q} onChange={setQ} placeholder="Cari nama atau kode sparepart..." />
            <Select value={kategori} onValueChange={setKategori}>
              <SelectTrigger className="w-44 bg-card"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Semua">Semua Kategori</SelectItem>
                {KATEGORI.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {data.length === 0 ? (
            <EmptyState
              icon={<Package className="size-8" />}
              title="Sparepart tidak ditemukan"
              description="Ubah kata kunci atau tambahkan sparepart baru."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Sparepart</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>
                      <button
                        className="inline-flex items-center gap-1"
                        onClick={() => setUrutHarga(urutHarga === "asc" ? "desc" : "asc")}
                      >
                        Harga <ArrowUpDown className="size-3.5" />
                      </button>
                    </TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs">{s.kode}</TableCell>
                      <TableCell className="font-medium">{s.nama}</TableCell>
                      <TableCell className="text-muted-foreground">{s.kategori}</TableCell>
                      <TableCell>{rupiah(s.harga)}</TableCell>
                      <TableCell>
                        <span
                          className={
                            s.stok === 0
                              ? "font-semibold text-destructive"
                              : s.stok <= 5
                                ? "font-semibold text-warning-foreground"
                                : ""
                          }
                        >
                          {s.stok === 0 ? "Habis" : `${s.stok} pcs`}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => { setError({}); setForm(s); }} aria-label="Edit">
                            <Pencil className="size-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setHapus(s)} aria-label="Hapus">
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
          <p className="text-xs text-muted-foreground">Menampilkan {data.length} dari {sparepart.length} item</p>
        </CardContent>
      </Card>

      <Dialog open={!!form} onOpenChange={(v) => !v && setForm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form?.id ? "Edit Sparepart" : "Tambah Sparepart"}</DialogTitle>
          </DialogHeader>
          {form && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Kode Sparepart</Label>
                <Input value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} />
                {error.kode && <p className="text-xs text-destructive">{error.kode}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Kategori</Label>
                <Select value={form.kategori} onValueChange={(v) => setForm({ ...form, kategori: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {KATEGORI.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Nama Sparepart</Label>
                <Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
                {error.nama && <p className="text-xs text-destructive">{error.nama}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Harga (Rp)</Label>
                <Input type="number" value={form.harga} onChange={(e) => setForm({ ...form, harga: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Stok</Label>
                <Input type="number" value={form.stok} onChange={(e) => setForm({ ...form, stok: Number(e.target.value) })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setForm(null)}>Batal</Button>
            <Button onClick={submit}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!hapus}
        onOpenChange={(v) => !v && setHapus(null)}
        title={`Hapus ${hapus?.nama ?? ""}?`}
        onConfirm={() => {
          if (hapus) hapusSparepart(hapus.id);
          toast.success("Sparepart dihapus");
          setHapus(null);
        }}
      />
    </>
  );
}
