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
import { NumberInput } from "@/components/number-input";
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
    setForm({
      pelanggan: s.pelanggan,
      kendaraan: s.kendaraan,
      plat: s.plat,
      jenis: s.jenis,
      keluhan: s.keluhan,
      pekerjaan: s.pekerjaan,
      mekanik: s.mekanik,
      tanggal: s.tanggal,
      status: s.status,
      catatan: s.catatan,
      biayaJasa: s.biayaJasa,
      items: s.items.map((i) => ({ ...i })),
    });
    setPilihPart("");
    setOpen(true);
  };

  const totalPart = totalItem(form.items);

  const tambahPart = (id: string) => {
    const sp = sparepart.find((x) => x.id === id);
    if (!sp) return;
    setForm((f) => {
      const ada = f.items.find((i) => i.sparepartId === id);
      if (ada) {
        return { ...f, items: f.items.map((i) => (i.sparepartId === id ? { ...i, jumlah: i.jumlah + 1 } : i)) };
      }
      return {
        ...f,
        items: [...f.items, { sparepartId: sp.id, nama: sp.nama, harga: sp.harga, jumlah: 1 }],
      };
    });
    setPilihPart("");
  };

  const ubahJumlah = (id: string, jumlah: number) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((i) => (i.sparepartId === id ? { ...i, jumlah: Math.max(1, jumlah || 1) } : i)),
    }));

  const hapusPart = (id: string) =>
    setForm((f) => ({ ...f, items: f.items.filter((i) => i.sparepartId !== id) }));


  const simpan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pelanggan || !form.kendaraan.trim() || !form.keluhan.trim()) {
      toast.error("Pelanggan, kendaraan, dan keluhan wajib diisi.");
      return;
    }
    void simpanServis(edit ? { ...form, id: edit.id } : form);
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
                        <Select value={s.status} onValueChange={(v) => { void ubahStatusServis(s.id, v as StatusServis); toast.success(`Status ${s.nomor}: ${v}`); }}>
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
            <div className="space-y-2 rounded-lg border p-3 sm:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label className="text-sm font-semibold">Sparepart yang Digunakan</Label>
                <span className="text-xs text-muted-foreground">Sumber data: Kelola Sparepart</span>
              </div>

              <Select value={pilihPart} onValueChange={tambahPart}>
                <SelectTrigger><SelectValue placeholder="Pilih sparepart untuk ditambahkan" /></SelectTrigger>
                <SelectContent>
                  {sparepart.map((sp) => (
                    <SelectItem key={sp.id} value={sp.id}>
                      {sp.nama} — {rupiah(sp.harga)} (stok {sp.stok})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {form.items.length === 0 ? (
                <p className="rounded-md bg-muted/40 px-3 py-4 text-center text-xs text-muted-foreground">
                  Belum ada sparepart dipilih.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sparepart</TableHead>
                        <TableHead className="text-right">Harga</TableHead>
                        <TableHead className="w-24">Jumlah</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {form.items.map((i) => {
                        const sp = sparepart.find((x) => x.id === i.sparepartId);
                        const dipakaiAwal = edit?.items.find((o) => o.sparepartId === i.sparepartId)?.jumlah ?? 0;
                        const stokSetelah = sp ? Math.max(0, sp.stok - (i.jumlah - dipakaiAwal)) : 0;
                        return (
                          <TableRow key={i.sparepartId}>
                            <TableCell>
                              <span className="block text-sm font-medium">{i.nama}</span>
                              <span className="block text-xs text-muted-foreground">
                                stok {sp?.stok ?? 0} → {stokSetelah}
                              </span>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-right">{rupiah(i.harga)}</TableCell>
                            <TableCell>
                              <NumberInput
                                aria-label={`Jumlah ${i.nama}`}
                                min={1}
                                className="h-8"
                                value={i.jumlah}
                                onChange={(v) => ubahJumlah(i.sparepartId, v)}
                              />
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-right font-semibold">
                              {rupiah(i.harga * i.jumlah)}
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                aria-label={`Hapus ${i.nama}`}
                                onClick={() => hapusPart(i.sparepartId)}
                              >
                                <Trash2 className="size-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Biaya Jasa</Label>
              <NumberInput value={form.biayaJasa} onChange={(v) => setForm({ ...form, biayaJasa: v })} placeholder="0" />
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
            <div className="rounded-lg border bg-muted/40 p-3 text-sm sm:col-span-2">
              <div className="flex justify-between py-0.5">
                <span className="text-muted-foreground">Biaya Jasa</span>
                <span className="font-medium">{rupiah(form.biayaJasa)}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-muted-foreground">Total Sparepart</span>
                <span className="font-medium">{rupiah(totalPart)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t pt-2 font-display text-base font-bold">
                <span>Total Biaya</span>
                <span>{rupiah(form.biayaJasa + totalPart)}</span>
              </div>
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
          if (hapus) void hapusServis(hapus.id);
          setHapus(null);
          toast.success("Data servis dihapus");
        }}
      />
    </>
  );
}
