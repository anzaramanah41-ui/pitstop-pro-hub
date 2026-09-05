import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Car, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/page-header";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/number-input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/lib/auth";
import { useStore, type Kendaraan } from "@/lib/store";

export const Route = createFileRoute("/_shell/pelanggan/kendaraan")({
  head: () => ({
    meta: [
      { title: "Kendaraan Saya — AppBenk" },
      { name: "description", content: "Kelola daftar kendaraan Anda: merk, tipe, tahun, nomor polisi, dan kilometer terakhir untuk mempercepat proses booking servis." },
      { property: "og:title", content: "Kendaraan Saya — AppBenk" },
      { property: "og:description", content: "Daftar kendaraan pelanggan beserta detail dan kilometer terakhir." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: KendaraanPelanggan,
});

function KendaraanPelanggan() {
  const { user } = useAuth();
  const { pelanggan, kendaraan, simpanKendaraan, hapusKendaraan } = useStore();
  const profil = pelanggan.find((p) => p.nama === (user?.pelanggan ?? ""));
  const milikSaya = kendaraan.filter((k) => k.pelangganId === profil?.id);

  const kosong = { merk: "", tipe: "", tahun: new Date().getFullYear(), plat: "", kilometer: 0 };
  const [form, setForm] = useState(kosong);
  const [edit, setEdit] = useState<Kendaraan | null>(null);
  const [open, setOpen] = useState(false);
  const [hapus, setHapus] = useState<Kendaraan | null>(null);

  const simpan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profil) return;
    if (!form.merk.trim() || !form.tipe.trim() || !form.plat.trim()) {
      toast.error("Merk, tipe, dan nomor polisi wajib diisi.");
      return;
    }
    void simpanKendaraan(edit ? { ...form, pelangganId: profil.id, id: edit.id } : { ...form, pelangganId: profil.id });
    toast.success(edit ? "Kendaraan diperbarui" : "Kendaraan ditambahkan");
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Kendaraan Saya"
        description="Satu akun dapat memiliki lebih dari satu kendaraan."
        action={
          <Button className="gap-2" onClick={() => { setEdit(null); setForm(kosong); setOpen(true); }}>
            <Plus className="size-4" /> Tambah Kendaraan
          </Button>
        }
      />

      <Card>
        <CardContent className="px-0">
          {milikSaya.length === 0 ? (
            <EmptyState icon={<Car className="size-8" />} title="Belum ada kendaraan" description="Tambahkan kendaraan agar booking servis lebih cepat." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Merk</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Tahun</TableHead>
                    <TableHead>Nomor Polisi</TableHead>
                    <TableHead className="text-right">Kilometer</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {milikSaya.map((k) => (
                    <TableRow key={k.id}>
                      <TableCell className="font-medium">{k.merk}</TableCell>
                      <TableCell>{k.tipe}</TableCell>
                      <TableCell className="text-muted-foreground">{k.tahun}</TableCell>
                      <TableCell className="text-muted-foreground">{k.plat}</TableCell>
                      <TableCell className="text-right">{k.kilometer.toLocaleString("id-ID")} km</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" aria-label="Ubah" onClick={() => { setEdit(k); setForm({ merk: k.merk, tipe: k.tipe, tahun: k.tahun, plat: k.plat, kilometer: k.kilometer }); setOpen(true); }}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button size="icon" variant="ghost" aria-label="Hapus" onClick={() => setHapus(k)}>
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
            <DialogTitle>{edit ? "Ubah Kendaraan" : "Tambah Kendaraan"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={simpan} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Merk</Label>
              <Input value={form.merk} onChange={(e) => setForm({ ...form, merk: e.target.value })} placeholder="Honda" />
            </div>
            <div className="space-y-1.5">
              <Label>Tipe</Label>
              <Input value={form.tipe} onChange={(e) => setForm({ ...form, tipe: e.target.value })} placeholder="Beat" />
            </div>
            <div className="space-y-1.5">
              <Label>Tahun</Label>
              <NumberInput value={form.tahun} onChange={(v) => setForm({ ...form, tahun: v })} />
            </div>
            <div className="space-y-1.5">
              <Label>Nomor Polisi</Label>
              <Input value={form.plat} onChange={(e) => setForm({ ...form, plat: e.target.value })} placeholder="D 1234 ABC" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Kilometer Terakhir</Label>
              <NumberInput value={form.kilometer} onChange={(v) => setForm({ ...form, kilometer: v })} />
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
        title={`Hapus kendaraan ${hapus?.plat}?`}
        onConfirm={() => {
          if (hapus) void hapusKendaraan(hapus.id);
          setHapus(null);
          toast.success("Kendaraan dihapus");
        }}
      />
    </>
  );
}
