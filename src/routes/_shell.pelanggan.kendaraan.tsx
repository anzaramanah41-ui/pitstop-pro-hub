import { createFileRoute } from "@tanstack/react-router";
<<<<<<< HEAD
import { useState } from "react";
=======
import { useState, useMemo } from "react";
>>>>>>> b897868 (Initial commit - AppBenk)
import { Car, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/page-header";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
<<<<<<< HEAD
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/number-input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
>>>>>>> b897868 (Initial commit - AppBenk)
import { useAuth } from "@/lib/auth";
import { useStore, type Kendaraan } from "@/lib/store";

export const Route = createFileRoute("/_shell/pelanggan/kendaraan")({
  head: () => ({
    meta: [
      { title: "Kendaraan Saya — AppBenk" },
<<<<<<< HEAD
      { name: "description", content: "Kelola daftar kendaraan Anda: merk, tipe, tahun, nomor polisi, dan kilometer terakhir untuk mempercepat proses booking servis." },
      { property: "og:title", content: "Kendaraan Saya — AppBenk" },
      { property: "og:description", content: "Daftar kendaraan pelanggan beserta detail dan kilometer terakhir." },
=======
      {
        name: "description",
        content:
          "Kelola daftar kendaraan Anda: merk, tipe, tahun, nomor polisi, dan kilometer terakhir untuk mempercepat proses booking servis.",
      },
      { property: "og:title", content: "Kendaraan Saya — AppBenk" },
      {
        property: "og:description",
        content: "Daftar kendaraan pelanggan beserta detail dan kilometer terakhir.",
      },
>>>>>>> b897868 (Initial commit - AppBenk)
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: KendaraanPelanggan,
});

function KendaraanPelanggan() {
  const { user } = useAuth();
<<<<<<< HEAD
  const { pelanggan, kendaraan, simpanKendaraan, hapusKendaraan } = useStore();
  const profil = pelanggan.find((p) => p.nama === (user?.pelanggan ?? ""));
  const milikSaya = kendaraan.filter((k) => k.pelangganId === profil?.id);
=======
  const { pelanggan, kendaraan, simpanKendaraan, hapusKendaraan, simpanPelanggan } = useStore();

  const profil = useMemo(() => {
    if (!user) return undefined;
    return pelanggan.find(
      (p) =>
        (user.id && (p.id === user.id || p.userId === user.id)) ||
        (user.email && p.email?.toLowerCase() === user.email.toLowerCase()) ||
        (user.nama && p.nama?.trim().toLowerCase() === user.nama.trim().toLowerCase()) ||
        (user.pelanggan && p.nama?.trim().toLowerCase() === user.pelanggan.trim().toLowerCase()),
    );
  }, [pelanggan, user]);

  const milikSaya = useMemo(() => {
    const pId = profil?.id;
    const uId = user?.id;
    return kendaraan.filter(
      (k) =>
        (pId && k.pelangganId === pId) ||
        (uId && k.pelangganId === uId),
    );
  }, [kendaraan, profil, user]);
>>>>>>> b897868 (Initial commit - AppBenk)

  const kosong = { merk: "", tipe: "", tahun: new Date().getFullYear(), plat: "", kilometer: 0 };
  const [form, setForm] = useState(kosong);
  const [edit, setEdit] = useState<Kendaraan | null>(null);
  const [open, setOpen] = useState(false);
  const [hapus, setHapus] = useState<Kendaraan | null>(null);

  const simpan = (e: React.FormEvent) => {
    e.preventDefault();
<<<<<<< HEAD
    if (!profil) return;
=======
>>>>>>> b897868 (Initial commit - AppBenk)
    if (!form.merk.trim() || !form.tipe.trim() || !form.plat.trim()) {
      toast.error("Merk, tipe, dan nomor polisi wajib diisi.");
      return;
    }
<<<<<<< HEAD
    void simpanKendaraan(edit ? { ...form, pelangganId: profil.id, id: edit.id } : { ...form, pelangganId: profil.id });
=======

    const targetPelangganId =
      profil?.id ||
      `pl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

    if (!profil && user) {
      simpanPelanggan({
        id: targetPelangganId,
        userId: user.id,
        nama: user.nama || user.email.split("@")[0] || "Pelanggan",
        email: user.email,
        telepon: user.telepon ?? "",
        alamat: "",
        kendaraan: `${form.merk} ${form.tipe} ${form.tahun}`,
        plat: form.plat,
      });
    }

    simpanKendaraan(
      edit
        ? { ...form, pelangganId: targetPelangganId, id: edit.id }
        : { ...form, pelangganId: targetPelangganId },
    );
>>>>>>> b897868 (Initial commit - AppBenk)
    toast.success(edit ? "Kendaraan diperbarui" : "Kendaraan ditambahkan");
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Kendaraan Saya"
        description="Satu akun dapat memiliki lebih dari satu kendaraan."
        action={
<<<<<<< HEAD
          <Button className="gap-2" onClick={() => { setEdit(null); setForm(kosong); setOpen(true); }}>
=======
          <Button
            className="gap-2"
            onClick={() => {
              setEdit(null);
              setForm(kosong);
              setOpen(true);
            }}
          >
>>>>>>> b897868 (Initial commit - AppBenk)
            <Plus className="size-4" /> Tambah Kendaraan
          </Button>
        }
      />

      <Card>
        <CardContent className="px-0">
          {milikSaya.length === 0 ? (
<<<<<<< HEAD
            <EmptyState icon={<Car className="size-8" />} title="Belum ada kendaraan" description="Tambahkan kendaraan agar booking servis lebih cepat." />
=======
            <EmptyState
              icon={<Car className="size-8" />}
              title="Belum ada kendaraan"
              description="Tambahkan kendaraan agar booking servis lebih cepat."
            />
>>>>>>> b897868 (Initial commit - AppBenk)
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
<<<<<<< HEAD
                      <TableCell className="text-right">{k.kilometer.toLocaleString("id-ID")} km</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" aria-label="Ubah" onClick={() => { setEdit(k); setForm({ merk: k.merk, tipe: k.tipe, tahun: k.tahun, plat: k.plat, kilometer: k.kilometer }); setOpen(true); }}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button size="icon" variant="ghost" aria-label="Hapus" onClick={() => setHapus(k)}>
=======
                      <TableCell className="text-right">
                        {k.kilometer.toLocaleString("id-ID")} km
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Ubah"
                            onClick={() => {
                              setEdit(k);
                              setForm({
                                merk: k.merk,
                                tipe: k.tipe,
                                tahun: k.tahun,
                                plat: k.plat,
                                kilometer: k.kilometer,
                              });
                              setOpen(true);
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Hapus"
                            onClick={() => setHapus(k)}
                          >
>>>>>>> b897868 (Initial commit - AppBenk)
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
<<<<<<< HEAD
              <Input value={form.merk} onChange={(e) => setForm({ ...form, merk: e.target.value })} placeholder="Honda" />
            </div>
            <div className="space-y-1.5">
              <Label>Tipe</Label>
              <Input value={form.tipe} onChange={(e) => setForm({ ...form, tipe: e.target.value })} placeholder="Beat" />
=======
              <Input
                value={form.merk}
                onChange={(e) => setForm({ ...form, merk: e.target.value })}
                placeholder="Honda"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tipe</Label>
              <Input
                value={form.tipe}
                onChange={(e) => setForm({ ...form, tipe: e.target.value })}
                placeholder="Beat"
              />
>>>>>>> b897868 (Initial commit - AppBenk)
            </div>
            <div className="space-y-1.5">
              <Label>Tahun</Label>
              <NumberInput value={form.tahun} onChange={(v) => setForm({ ...form, tahun: v })} />
            </div>
            <div className="space-y-1.5">
              <Label>Nomor Polisi</Label>
<<<<<<< HEAD
              <Input value={form.plat} onChange={(e) => setForm({ ...form, plat: e.target.value })} placeholder="D 1234 ABC" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Kilometer Terakhir</Label>
              <NumberInput value={form.kilometer} onChange={(v) => setForm({ ...form, kilometer: v })} />
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
=======
              <Input
                value={form.plat}
                onChange={(e) => setForm({ ...form, plat: e.target.value })}
                placeholder="D 1234 ABC"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Kilometer Terakhir</Label>
              <NumberInput
                value={form.kilometer}
                onChange={(v) => setForm({ ...form, kilometer: v })}
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
        title={`Hapus kendaraan ${hapus?.plat}?`}
        onConfirm={() => {
<<<<<<< HEAD
          if (hapus) void hapusKendaraan(hapus.id);
=======
          if (hapus) hapusKendaraan(hapus.id);
>>>>>>> b897868 (Initial commit - AppBenk)
          setHapus(null);
          toast.success("Kendaraan dihapus");
        }}
      />
    </>
  );
}
