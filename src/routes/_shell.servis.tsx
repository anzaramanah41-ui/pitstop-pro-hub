import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Eye, Wrench } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/page-header";
import { SearchBar } from "@/components/search-bar";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useStore, MEKANIK, tanggalPanjang, rupiah, type Servis, type StatusServis } from "@/lib/store";

export const Route = createFileRoute("/_shell/servis")({
  head: () => ({
    meta: [
      { title: "Data Servis — Bengkel Pitstop" },
      { name: "description", content: "Catat dan kelola pekerjaan servis kendaraan beserta status pengerjaannya." },
      { property: "og:title", content: "Data Servis — Bengkel Pitstop" },
      { property: "og:description", content: "Pencatatan servis kendaraan dan status pengerjaan." },
    ],
  }),
  component: ServisPage,
});

const STATUS: StatusServis[] = ["Menunggu", "Diproses", "Selesai"];

const kosong = {
  pelanggan: "",
  kendaraan: "",
  plat: "",
  keluhan: "",
  pekerjaan: "",
  mekanik: MEKANIK[0]!,
  tanggal: "2026-08-18",
  status: "Menunggu" as StatusServis,
  sparepart: "",
  catatan: "",
  total: 0,
};

type Err = Partial<Record<"pelanggan" | "kendaraan" | "keluhan", string>>;

function ServisPage() {
  const { servis, pelanggan, simpanServis, hapusServis } = useStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"Semua" | StatusServis>("Semua");
  const [form, setForm] = useState<(typeof kosong & { id?: string }) | null>(null);
  const [detail, setDetail] = useState<Servis | null>(null);
  const [hapus, setHapus] = useState<Servis | null>(null);
  const [error, setError] = useState<Err>({});

  const data = useMemo(() => {
    const s = q.toLowerCase();
    return servis
      .filter((x) => filter === "Semua" || x.status === filter)
      .filter((x) => [x.nomor, x.pelanggan, x.kendaraan, x.plat, x.mekanik].some((v) => v.toLowerCase().includes(s)));
  }, [servis, q, filter]);

  const submit = () => {
    if (!form) return;
    const err: Err = {};
    if (!form.pelanggan.trim()) err.pelanggan = "Pelanggan wajib dipilih";
    if (!form.kendaraan.trim()) err.kendaraan = "Kendaraan wajib diisi";
    if (!form.keluhan.trim()) err.keluhan = "Keluhan wajib diisi";
    setError(err);
    if (Object.keys(err).length) return;
    simpanServis(form);
    toast.success(form.id ? "Data servis diperbarui" : "Servis baru dibuat");
    setForm(null);
  };

  return (
    <>
      <PageHeader
        title="Data Servis"
        description="Pencatatan pekerjaan servis kendaraan pelanggan."
        action={
          <Button className="gap-2" onClick={() => { setError({}); setForm({ ...kosong }); }}>
            <Plus className="size-4" /> Buat Servis
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <SearchBar value={q} onChange={setQ} placeholder="Cari nomor servis, pelanggan, plat..." />
            <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <SelectTrigger className="w-44 bg-card">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Semua">Semua Status</SelectItem>
                {STATUS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {data.length === 0 ? (
            <EmptyState
              icon={<Wrench className="size-8" />}
              title="Belum ada data servis"
              description="Buat servis baru atau ubah filter pencarian."
            />
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
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.nomor}</TableCell>
                      <TableCell>{s.pelanggan}</TableCell>
                      <TableCell className="text-muted-foreground">{s.kendaraan} · {s.plat}</TableCell>
                      <TableCell className="max-w-48 truncate">{s.keluhan}</TableCell>
                      <TableCell>{s.mekanik}</TableCell>
                      <TableCell className="text-muted-foreground">{tanggalPanjang(s.tanggal)}</TableCell>
                      <TableCell><StatusBadge status={s.status} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => setDetail(s)} aria-label="Lihat">
                            <Eye className="size-4" />
                          </Button>
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
          <p className="text-xs text-muted-foreground">Menampilkan {data.length} dari {servis.length} servis</p>
        </CardContent>
      </Card>

      <Dialog open={!!form} onOpenChange={(v) => !v && setForm(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form?.id ? "Edit Servis" : "Buat Servis Baru"}</DialogTitle>
          </DialogHeader>
          {form && (
            <div className="grid gap-4 sm:grid-cols-2">
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
                {error.pelanggan && <p className="text-xs text-destructive">{error.pelanggan}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Kendaraan</Label>
                <Input value={form.kendaraan} onChange={(e) => setForm({ ...form, kendaraan: e.target.value })} />
                {error.kendaraan && <p className="text-xs text-destructive">{error.kendaraan}</p>}
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Keluhan</Label>
                <Textarea rows={2} value={form.keluhan} onChange={(e) => setForm({ ...form, keluhan: e.target.value })} />
                {error.keluhan && <p className="text-xs text-destructive">{error.keluhan}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Mekanik</Label>
                <Select value={form.mekanik} onValueChange={(v) => setForm({ ...form, mekanik: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MEKANIK.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Tanggal Servis</Label>
                <Input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as StatusServis })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Estimasi Biaya (Rp)</Label>
                <Input
                  type="number"
                  value={form.total}
                  onChange={(e) => setForm({ ...form, total: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Pekerjaan Servis</Label>
                <Input value={form.pekerjaan} onChange={(e) => setForm({ ...form, pekerjaan: e.target.value })} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Sparepart Digunakan</Label>
                <Input value={form.sparepart} onChange={(e) => setForm({ ...form, sparepart: e.target.value })} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Catatan</Label>
                <Textarea rows={2} value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} />
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
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader><SheetTitle>Detail Servis</SheetTitle></SheetHeader>
          {detail && (
            <div className="space-y-4 px-4 pb-6 text-sm">
              <div className="flex items-center justify-between">
                <p className="font-display text-lg font-bold">{detail.nomor}</p>
                <StatusBadge status={detail.status} />
              </div>
              <Info label="Pelanggan" value={detail.pelanggan} />
              <Info label="Kendaraan" value={`${detail.kendaraan} · ${detail.plat}`} />
              <Info label="Keluhan" value={detail.keluhan} />
              <Info label="Pekerjaan" value={detail.pekerjaan || "-"} />
              <Info label="Sparepart" value={detail.sparepart || "-"} />
              <Info label="Mekanik" value={detail.mekanik} />
              <Info label="Tanggal" value={tanggalPanjang(detail.tanggal)} />
              <Info label="Catatan" value={detail.catatan || "-"} />
              <Info label="Estimasi Biaya" value={rupiah(detail.total)} />
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!hapus}
        onOpenChange={(v) => !v && setHapus(null)}
        title={`Hapus ${hapus?.nomor ?? ""}?`}
        description="Data servis akan dihapus dari daftar."
        onConfirm={() => {
          if (hapus) hapusServis(hapus.id);
          toast.success("Data servis dihapus");
          setHapus(null);
        }}
      />
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
