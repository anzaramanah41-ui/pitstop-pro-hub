import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Wrench } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/page-header";
import { SearchBar } from "@/components/search-bar";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  useStore,
  rupiah,
  tanggalPanjang,
  totalItem,
  MEKANIK,
  JENIS_SERVIS,
  URUTAN_STATUS,
  type Servis,
  type StatusServis,
  type ItemPart,
} from "@/lib/store";


export const Route = createFileRoute("/_shell/admin/servis")({
  head: () => ({
    meta: [
      { title: "Operasional Servis — AppBenk" },
      { name: "description", content: "Kelola proses servis: mekanik, sparepart, estimasi biaya, dan pembaruan status pengerjaan." },
      { property: "og:title", content: "Operasional Servis — AppBenk" },
      { property: "og:description", content: "Kendalikan seluruh proses pengerjaan servis bengkel." },
    ],
  }),
  component: ServisAdmin,
});

const kosong = {
  pelanggan: "",
  kendaraan: "",
  plat: "",
  jenis: JENIS_SERVIS[0]!,
  keluhan: "",
  pekerjaan: "",
  mekanik: MEKANIK[0]!,
  tanggal: "2026-08-18",
  status: "Menunggu" as StatusServis,
  catatan: "",
  biayaJasa: 0,
  items: [] as ItemPart[],
};

function ServisAdmin() {
  const { servis, pelanggan, sparepart, simpanServis, hapusServis, ubahStatusServis } = useStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"semua" | StatusServis>("semua");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Servis | null>(null);
  const [form, setForm] = useState(kosong);
  const [hapus, setHapus] = useState<Servis | null>(null);
  const [pilihPart, setPilihPart] = useState("");


  const data = useMemo(() => {
    const s = q.toLowerCase();
    return servis
      .filter((x) => filter === "semua" || x.status === filter)
      .filter((x) => [x.nomor, x.pelanggan, x.kendaraan, x.plat, x.mekanik].some((v) => v.toLowerCase().includes(s)));
  }, [servis, q, filter]);

  const bukaBaru = () => {
    setEdit(null);
    setForm(kosong);
    setOpen(true);
  };

  const bukaEdit = (s: Servis) => {
    setEdit(s);
    setForm({ ...kosong, ...s });
    setOpen(true);
  };

  const simpan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pelanggan || !form.kendaraan.trim() || !form.keluhan.trim()) {
      toast.error("Pelanggan, kendaraan, dan keluhan wajib diisi.");
      return;
    }
    simpanServis(edit ? { ...form, id: edit.id } : form);
    toast.success(edit ? "Data servis diperbarui" : "Servis baru dibuat");
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Operasional Servis"
        description="Catat, kerjakan, dan perbarui status servis kendaraan."
        action={
          <Button onClick={bukaBaru} className="gap-2">
            <Plus className="size-4" /> Servis Baru
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <SearchBar value={q} onChange={setQ} placeholder="Cari nomor servis, pelanggan, atau mekanik..." />
            <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <SelectTrigger className="w-56 bg-card"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua status</SelectItem>
                {URUTAN_STATUS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {data.length === 0 ? (
            <EmptyState icon={<Wrench className="size-8" />} title="Belum ada servis" description="Tambahkan servis baru untuk memulai." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Servis</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Kendaraan</TableHead>
                    <TableHead>Keluhan</TableHead>
                    <TableHead>Mekanik</TableHead>
                    <TableHead>Sparepart</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-52">Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">
                        {s.nomor}
                        <span className="block text-xs text-muted-foreground">{tanggalPanjang(s.tanggal)}</span>
                      </TableCell>
                      <TableCell>{s.pelanggan}</TableCell>
                      <TableCell className="text-muted-foreground">{s.kendaraan} · {s.plat}</TableCell>
                      <TableCell className="max-w-40 truncate">{s.keluhan}</TableCell>
                      <TableCell>{s.mekanik}</TableCell>
                      <TableCell className="max-w-40 truncate text-muted-foreground">{s.sparepart || "—"}</TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        {rupiah(s.total)}
                        <span className="block text-xs text-muted-foreground">
                          Jasa {rupiah(s.biayaJasa)} · Part {rupiah(s.biayaPart)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Select value={s.status} onValueChange={(v) => { ubahStatusServis(s.id, v as StatusServis); toast.success(`Status ${s.nomor}: ${v}`); }}>
                          <SelectTrigger className="h-8 w-48 bg-card text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {URUTAN_STATUS.map((st) => (
                              <SelectItem key={st} value={st}>{st}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="mt-1 block"><StatusBadge status={s.status} /></span>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" aria-label="Ubah" onClick={() => bukaEdit(s)}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button size="icon" variant="ghost" aria-label="Hapus" onClick={() => setHapus(s)}>
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{edit ? `Ubah ${edit.nomor}` : "Servis Baru"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={simpan} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Pelanggan</Label>
              <Select
                value={form.pelanggan}
                onValueChange={(v) => {
                  const p = pelanggan.find((x) => x.nama === v);
                  setForm({ ...form, pelanggan: v, kendaraan: p?.kendaraan ?? form.kendaraan, plat: p?.plat ?? form.plat });
                }}
              >
                <SelectTrigger><SelectValue placeholder="Pilih pelanggan" /></SelectTrigger>
                <SelectContent>
                  {pelanggan.map((p) => (
                    <SelectItem key={p.id} value={p.nama}>{p.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Jenis Servis</Label>
              <Select value={form.jenis} onValueChange={(v) => setForm({ ...form, jenis: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {JENIS_SERVIS.map((j) => (
                    <SelectItem key={j} value={j}>{j}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Kendaraan</Label>
              <Input value={form.kendaraan} onChange={(e) => setForm({ ...form, kendaraan: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Nomor Plat</Label>
              <Input value={form.plat} onChange={(e) => setForm({ ...form, plat: e.target.value })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Keluhan</Label>
              <Textarea value={form.keluhan} onChange={(e) => setForm({ ...form, keluhan: e.target.value })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Pekerjaan</Label>
              <Input value={form.pekerjaan} onChange={(e) => setForm({ ...form, pekerjaan: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Mekanik</Label>
              <Select value={form.mekanik} onValueChange={(v) => setForm({ ...form, mekanik: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MEKANIK.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tanggal</Label>
              <Input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Sparepart Dipakai</Label>
              <Input value={form.sparepart} onChange={(e) => setForm({ ...form, sparepart: e.target.value })} placeholder="Contoh: Busi NGK, Oli 0.8L" />
            </div>
            <div className="space-y-1.5">
              <Label>Estimasi Biaya Jasa</Label>
              <Input type="number" value={form.biayaJasa} onChange={(e) => setForm({ ...form, biayaJasa: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Estimasi Biaya Sparepart</Label>
              <Input type="number" value={form.biayaPart} onChange={(e) => setForm({ ...form, biayaPart: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as StatusServis })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {URUTAN_STATUS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Total</Label>
              <Input readOnly value={rupiah(form.biayaJasa + form.biayaPart)} className="bg-muted" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Catatan</Label>
              <Textarea value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} />
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
        title={`Hapus servis ${hapus?.nomor}?`}
        onConfirm={() => {
          if (hapus) hapusServis(hapus.id);
          setHapus(null);
          toast.success("Data servis dihapus");
        }}
      />
    </>
  );
}
