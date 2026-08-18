import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Eye, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/page-header";
import { SearchBar } from "@/components/search-bar";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useStore, type Pelanggan } from "@/lib/store";

export const Route = createFileRoute("/_shell/pelanggan")({
  head: () => ({
    meta: [
      { title: "Data Pelanggan — Bengkel Pitstop" },
      { name: "description", content: "Kelola data pelanggan bengkel beserta kendaraan yang dimiliki." },
      { property: "og:title", content: "Data Pelanggan — Bengkel Pitstop" },
      { property: "og:description", content: "Kelola data pelanggan dan kendaraan." },
    ],
  }),
  component: PelangganPage,
});

const kosong = { nama: "", telepon: "", alamat: "", kendaraan: "", plat: "" };

function PelangganPage() {
  const { pelanggan, servis, simpanPelanggan, hapusPelanggan } = useStore();
  const [q, setQ] = useState("");
  const [form, setForm] = useState<(typeof kosong & { id?: string }) | null>(null);
  const [detail, setDetail] = useState<Pelanggan | null>(null);
  const [hapus, setHapus] = useState<Pelanggan | null>(null);
  type Err = Partial<Record<"nama" | "telepon" | "kendaraan", string>>;
  const [error, setError] = useState<Err>({});

  const data = useMemo(() => {
    const s = q.toLowerCase();
    return pelanggan.filter((p) =>
      [p.nama, p.telepon, p.kendaraan, p.plat].some((v) => v.toLowerCase().includes(s)),
    );
  }, [pelanggan, q]);

  const submit = () => {
    if (!form) return;
    const err: Err = {};
    if (!form.nama.trim()) err.nama = "Nama pelanggan wajib diisi";
    if (!form.telepon.trim()) err.telepon = "Nomor telepon wajib diisi";
    if (!form.kendaraan.trim()) err.kendaraan = "Kendaraan wajib diisi";
    setError(err);
    if (Object.keys(err).length) return;
    simpanPelanggan(form);
    toast.success(form.id ? "Data pelanggan diperbarui" : "Pelanggan baru ditambahkan");
    setForm(null);
  };

  return (
    <>
      <PageHeader
        title="Data Pelanggan"
        description="Daftar pelanggan bengkel dan kendaraan yang dimiliki."
        action={
          <Button className="gap-2" onClick={() => { setError({}); setForm({ ...kosong }); }}>
            <Plus className="size-4" /> Tambah Pelanggan
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <SearchBar value={q} onChange={setQ} placeholder="Cari nama, telepon, atau plat..." />

          {data.length === 0 ? (
            <EmptyState
              icon={<Users className="size-8" />}
              title="Pelanggan tidak ditemukan"
              description="Coba kata kunci lain atau tambahkan pelanggan baru."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Telepon</TableHead>
                    <TableHead>Kendaraan</TableHead>
                    <TableHead>Plat</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.nama}</TableCell>
                      <TableCell>{p.telepon}</TableCell>
                      <TableCell className="text-muted-foreground">{p.kendaraan}</TableCell>
                      <TableCell>{p.plat}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => setDetail(p)} aria-label="Lihat">
                            <Eye className="size-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => { setError({}); setForm(p); }} aria-label="Edit">
                            <Pencil className="size-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setHapus(p)} aria-label="Hapus">
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
          <p className="text-xs text-muted-foreground">Menampilkan {data.length} dari {pelanggan.length} pelanggan</p>
        </CardContent>
      </Card>

      <Dialog open={!!form} onOpenChange={(v) => !v && setForm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form?.id ? "Edit Pelanggan" : "Tambah Pelanggan"}</DialogTitle>
          </DialogHeader>
          {form && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nama Pelanggan</Label>
                <Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
                {error.nama && <p className="text-xs text-destructive">{error.nama}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Nomor Telepon</Label>
                <Input value={form.telepon} onChange={(e) => setForm({ ...form, telepon: e.target.value })} />
                {error.telepon && <p className="text-xs text-destructive">{error.telepon}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Alamat</Label>
                <Textarea rows={2} value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Kendaraan</Label>
                  <Input value={form.kendaraan} onChange={(e) => setForm({ ...form, kendaraan: e.target.value })} />
                  {error.kendaraan && <p className="text-xs text-destructive">{error.kendaraan}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Nomor Plat</Label>
                  <Input value={form.plat} onChange={(e) => setForm({ ...form, plat: e.target.value })} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setForm(null)}>Batal</Button>
            <Button onClick={submit}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={!!detail} onOpenChange={(v) => !v && setDetail(null)}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Detail Pelanggan</SheetTitle>
          </SheetHeader>
          {detail && (
            <div className="space-y-4 px-4 pb-6 text-sm">
              <Field label="Nama" value={detail.nama} />
              <Field label="Telepon" value={detail.telepon} />
              <Field label="Alamat" value={detail.alamat || "-"} />
              <Field label="Kendaraan" value={`${detail.kendaraan} · ${detail.plat}`} />
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Riwayat Servis</p>
                <ul className="mt-2 space-y-2">
                  {servis.filter((s) => s.pelanggan === detail.nama).map((s) => (
                    <li key={s.id} className="rounded-md border p-3">
                      <p className="font-medium">{s.nomor} · {s.status}</p>
                      <p className="text-muted-foreground">{s.keluhan}</p>
                    </li>
                  ))}
                  {servis.filter((s) => s.pelanggan === detail.nama).length === 0 && (
                    <li className="text-muted-foreground">Belum ada riwayat servis.</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!hapus}
        onOpenChange={(v) => !v && setHapus(null)}
        title={`Hapus ${hapus?.nama ?? ""}?`}
        description="Data pelanggan akan dihapus dari daftar."
        onConfirm={() => {
          if (hapus) hapusPelanggan(hapus.id);
          toast.success("Pelanggan dihapus");
          setHapus(null);
        }}
      />
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
