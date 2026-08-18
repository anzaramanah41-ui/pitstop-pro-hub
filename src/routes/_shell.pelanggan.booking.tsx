import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/page-header";
import { BookingBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/lib/auth";
import { useStore, tanggalPanjang, JENIS_SERVIS } from "@/lib/store";

export const Route = createFileRoute("/_shell/pelanggan/booking")({
  head: () => ({
    meta: [
      { title: "Booking Servis — AppBenk" },
      { name: "description", content: "Buat booking servis kendaraan: pilih jenis servis, tanggal, waktu, dan tuliskan keluhan Anda." },
      { property: "og:title", content: "Booking Servis — AppBenk" },
      { property: "og:description", content: "Booking servis kendaraan dengan mudah dari mana saja." },
    ],
  }),
  component: BookingPelanggan,
});

function BookingPelanggan() {
  const { user } = useAuth();
  const { booking, pelanggan, buatBooking } = useStore();
  const nama = user?.pelanggan ?? "";
  const profil = pelanggan.find((p) => p.nama === nama);

  const kosong = {
    kendaraan: profil?.kendaraan ?? "",
    plat: profil?.plat ?? "",
    jenis: "",
    keluhan: "",
    tanggal: "",
    waktu: "",
    catatan: "",
  };
  const [form, setForm] = useState(kosong);
  const [err, setErr] = useState<Partial<Record<keyof typeof kosong, string>>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof err = {};
    if (!form.kendaraan.trim()) next.kendaraan = "Kendaraan wajib diisi.";
    if (!form.jenis) next.jenis = "Pilih jenis servis.";
    if (!form.keluhan.trim()) next.keluhan = "Keluhan wajib diisi.";
    if (!form.tanggal) next.tanggal = "Pilih tanggal booking.";
    if (!form.waktu) next.waktu = "Pilih waktu booking.";
    setErr(next);
    if (Object.keys(next).length) return;

    const baru = buatBooking({ ...form, pelanggan: nama });
    toast.success(`Booking ${baru.nomor} dibuat — menunggu konfirmasi admin`);
    setForm(kosong);
  };

  const milikSaya = booking.filter((b) => b.pelanggan === nama);

  return (
    <>
      <PageHeader title="Booking Servis" description="Ajukan jadwal servis kendaraan Anda ke bengkel." />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Form Booking</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Kendaraan</Label>
                <Input value={form.kendaraan} onChange={(e) => setForm({ ...form, kendaraan: e.target.value })} placeholder="Honda Beat 2019" />
                {err.kendaraan && <p className="text-xs text-destructive">{err.kendaraan}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Nomor Plat</Label>
                <Input value={form.plat} onChange={(e) => setForm({ ...form, plat: e.target.value })} placeholder="D 1234 ABC" />
              </div>
              <div className="space-y-1.5">
                <Label>Jenis Servis</Label>
                <Select value={form.jenis} onValueChange={(v) => setForm({ ...form, jenis: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis servis" />
                  </SelectTrigger>
                  <SelectContent>
                    {JENIS_SERVIS.map((j) => (
                      <SelectItem key={j} value={j}>{j}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {err.jenis && <p className="text-xs text-destructive">{err.jenis}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Keluhan</Label>
                <Textarea value={form.keluhan} onChange={(e) => setForm({ ...form, keluhan: e.target.value })} placeholder="Ceritakan keluhan kendaraan Anda" />
                {err.keluhan && <p className="text-xs text-destructive">{err.keluhan}</p>}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Tanggal Booking</Label>
                  <Input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} />
                  {err.tanggal && <p className="text-xs text-destructive">{err.tanggal}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Waktu Booking</Label>
                  <Input type="time" value={form.waktu} onChange={(e) => setForm({ ...form, waktu: e.target.value })} />
                  {err.waktu && <p className="text-xs text-destructive">{err.waktu}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Catatan Tambahan</Label>
                <Textarea value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} placeholder="Opsional" />
              </div>
              <Button type="submit" className="w-full gap-2">
                <CalendarPlus className="size-4" /> Kirim Booking
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Booking Saya</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {milikSaya.length === 0 ? (
              <EmptyState title="Belum ada booking" description="Booking yang Anda buat akan muncul di sini." />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No. Booking</TableHead>
                      <TableHead>Jenis</TableHead>
                      <TableHead>Jadwal</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {milikSaya.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">{b.nomor}</TableCell>
                        <TableCell>{b.jenis}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {tanggalPanjang(b.tanggal)} · {b.waktu}
                        </TableCell>
                        <TableCell><BookingBadge status={b.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
