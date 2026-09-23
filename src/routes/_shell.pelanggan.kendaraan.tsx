import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Car, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { pelangganService } from "@/services/appbenk-service";
import { PageHeader, EmptyState } from "@/components/page-header";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useAuth } from "@/lib/auth";
import { useStore, type Kendaraan } from "@/lib/store";

export const Route = createFileRoute("/_shell/pelanggan/kendaraan")({
  head: () => ({
    meta: [
      { title: "Kendaraan Saya — AppBenk" },
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: KendaraanPelanggan,
});

function KendaraanPelanggan() {
  const { user } = useAuth();
  const {
    pelanggan,
    kendaraan,
    simpanKendaraan,
    hapusKendaraan,
    simpanPelanggan,
    refreshKendaraan,
    refreshPelanggan,
  } = useStore();

  // Sinkronkan data pelanggan dan kendaraan terbaru saat user aktif
  useEffect(() => {
    if (user?.id) {
      refreshPelanggan().catch(() => {});
      refreshKendaraan().catch(() => {});
    }
  }, [user?.id]);

  const profil = useMemo(() => {
    if (!user) return undefined;
    return pelanggan.find(
      (p) =>
        (user.pelangganId && p.id === user.pelangganId) ||
        (user.id && (p.id === user.id || p.userId === user.id)) ||
        (user.email && p.email?.toLowerCase() === user.email.toLowerCase()) ||
        (user.nama && p.nama?.trim().toLowerCase() === user.nama.trim().toLowerCase()) ||
        (user.pelanggan && p.nama?.trim().toLowerCase() === user.pelanggan.trim().toLowerCase()),
    );
  }, [pelanggan, user]);

  const milikSaya = useMemo(() => {
    const pId = user?.pelangganId || profil?.id;
    const uId = user?.id;
    return kendaraan.filter(
      (k) =>
        (pId && k.pelangganId === pId) ||
        (uId && k.pelangganId === uId),
    );
  }, [kendaraan, profil, user]);

  const kosong = { merk: "", tipe: "", tahun: new Date().getFullYear(), plat: "", kilometer: 0 };
  const [form, setForm] = useState(kosong);
  const [edit, setEdit] = useState<Kendaraan | null>(null);
  const [open, setOpen] = useState(false);
  const [hapus, setHapus] = useState<Kendaraan | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const simpan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.merk.trim() || !form.tipe.trim() || !form.plat.trim()) {
      toast.error("Merk, tipe, dan nomor polisi wajib diisi.");
      return;
    }

    if (!user) {
      toast.error("Sesi pengguna tidak valid. Silakan login kembali.");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Tentukan id_pelanggan resmi dari akun login
      let officialPelangganId = user.pelangganId || profil?.id;

      if (!officialPelangganId) {
        // Query langsung ke database jika state lokal belum ter-update
        const pelDb = await pelangganService.getByUserId(user.id);
        if (pelDb?.id_pelanggan) {
          officialPelangganId = pelDb.id_pelanggan;
        } else {
          // Buat entitas resmi di public.pelanggan jika belum ada
          const officialId = `pl-${user.id.slice(0, 8)}`;
          const created = await pelangganService.create({
            id_pelanggan: officialId,
            user_id: user.id,
            nama: user.nama || user.email.split("@")[0] || "Pelanggan",
            email: user.email,
            no_hp: user.telepon || "-",
            alamat: "Pendaftaran akun pelanggan AppBenk",
          });
          officialPelangganId = created.id_pelanggan;
        }
        await refreshPelanggan();
      }

      // 2. Simpan kendaraan ke Supabase & state lokal
      await simpanKendaraan(
        edit
          ? { ...form, pelangganId: officialPelangganId, id: edit.id }
          : { ...form, pelangganId: officialPelangganId },
      );

      // 3. Refresh data kendaraan agar tampilan selalu tersinkron
      await refreshKendaraan();

      toast.success(edit ? "Kendaraan berhasil diperbarui" : "Kendaraan berhasil ditambahkan");
      setOpen(false);
    } catch (err: any) {
      console.error("Gagal menyimpan kendaraan:", err);
      toast.error(err?.message || "Gagal menyimpan kendaraan. Pastikan koneksi internet stabil.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Kendaraan Saya"
        description="Satu akun dapat memiliki lebih dari satu kendaraan."
        action={
          <Button
            className="gap-2"
            onClick={() => {
              setEdit(null);
              setForm(kosong);
              setOpen(true);
            }}
          >
            <Plus className="size-4" /> Tambah Kendaraan
          </Button>
        }
      />

      <Card>
        <CardContent className="px-0">
          {milikSaya.length === 0 ? (
            <EmptyState
              icon={<Car className="size-8" />}
              title="Belum ada kendaraan"
              description="Tambahkan kendaraan agar booking servis lebih cepat."
            />
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
            </div>
            <div className="space-y-1.5">
              <Label>Tahun</Label>
              <NumberInput value={form.tahun} onChange={(v) => setForm({ ...form, tahun: v })} />
            </div>
            <div className="space-y-1.5">
              <Label>Nomor Polisi</Label>
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
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!hapus}
        onOpenChange={(v) => !v && setHapus(null)}
        title={`Hapus kendaraan ${hapus?.plat}?`}
        onConfirm={() => {
          if (hapus) hapusKendaraan(hapus.id);
          setHapus(null);
          toast.success("Kendaraan dihapus");
        }}
      />
    </>
  );
}
