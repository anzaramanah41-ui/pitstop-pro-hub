<<<<<<< HEAD
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarPlus } from "lucide-react";
=======
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { CalendarPlus, Car } from "lucide-react";
>>>>>>> b897868 (Initial commit - AppBenk)
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/page-header";
import { BookingBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
<<<<<<< HEAD
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/lib/auth";
import { useStore, tanggalPanjang, labelKendaraan, JENIS_SERVIS, MEKANIK_DETAIL } from "@/lib/store";
=======
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/auth";
import {
  useStore,
  tanggalPanjang,
  labelKendaraan,
  JENIS_SERVIS,
} from "@/lib/store";
>>>>>>> b897868 (Initial commit - AppBenk)

export const Route = createFileRoute("/_shell/pelanggan/booking")({
  head: () => ({
    meta: [
      { title: "Booking Servis — AppBenk" },
<<<<<<< HEAD
      { name: "description", content: "Buat booking servis kendaraan: pilih jenis servis, tanggal, waktu, dan tuliskan keluhan Anda." },
      { property: "og:title", content: "Booking Servis — AppBenk" },
      { property: "og:description", content: "Booking servis kendaraan dengan mudah dari mana saja." },
=======
      {
        name: "description",
        content:
          "Buat booking servis kendaraan: pilih jenis servis, tanggal, waktu, dan tuliskan keluhan Anda.",
      },
      { property: "og:title", content: "Booking Servis — AppBenk" },
      {
        property: "og:description",
        content: "Booking servis kendaraan dengan mudah dari mana saja.",
      },
>>>>>>> b897868 (Initial commit - AppBenk)
    ],
  }),
  component: BookingPelanggan,
});

function BookingPelanggan() {
  const { user } = useAuth();
<<<<<<< HEAD
  const { booking, pelanggan, kendaraan, buatBooking } = useStore();
  const nama = user?.pelanggan ?? "";
  const profil = pelanggan.find((p) => p.nama === nama);
  const kendaraanSaya = kendaraan.filter((k) => k.pelangganId === profil?.id);
  const utama = kendaraanSaya[0];

  const kosong = {
    kendaraan: utama ? labelKendaraan(utama) : (profil?.kendaraan ?? ""),
    plat: utama?.plat ?? profil?.plat ?? "",
=======
  const {
    booking,
    pelanggan,
    kendaraan,
    bengkel,
    mekanik,
    buatBooking,
    simpanPelanggan,
    refreshMekanik,
    refreshBooking,
    refreshKendaraan,
  } = useStore();

  useEffect(() => {
    refreshMekanik?.();
    refreshBooking?.();
    refreshKendaraan?.();
  }, [refreshMekanik, refreshBooking, refreshKendaraan]);

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

  const kendaraanSaya = useMemo(() => {
    const pId = profil?.id;
    const uId = user?.id;
    return kendaraan.filter(
      (k) =>
        (pId && k.pelangganId === pId) ||
        (uId && k.pelangganId === uId),
    );
  }, [kendaraan, profil, user]);

  const utama = kendaraanSaya[0];

  const kosong = {
    bengkelId: bengkel[0]?.id || "bengkel-001",
    vehicleId: utama?.id ?? "",
    kendaraan: utama ? labelKendaraan(utama) : "",
    plat: utama?.plat ?? "",
>>>>>>> b897868 (Initial commit - AppBenk)
    jenis: "",
    keluhan: "",
    tanggal: "",
    waktu: "",
    catatan: "",
    mekanikDiinginkan: "",
<<<<<<< HEAD
  };
  const [form, setForm] = useState(kosong);
  const [err, setErr] = useState<Partial<Record<keyof typeof kosong, string>>>({});

=======
    mekanikId: "",
    jenisLainnya: "",
  };

  const [form, setForm] = useState(kosong);
  const [err, setErr] = useState<Partial<Record<keyof typeof kosong, string>>>({});

  // Sync form vehicle when registered vehicles are loaded or change
  useEffect(() => {
    if (kendaraanSaya.length > 0 && !form.vehicleId) {
      const first = kendaraanSaya[0];
      if (first) {
        setForm((prev) => ({
          ...prev,
          vehicleId: first.id,
          kendaraan: labelKendaraan(first),
          plat: first.plat,
        }));
      }
    }
  }, [kendaraanSaya, form.vehicleId]);

  // Semua mekanik aktif dari data master admin
  const mekanikTersedia = useMemo(() => {
    const targetBengkel = form.bengkelId || bengkel[0]?.id || "bengkel-001";
    const cabang = mekanik.filter(
      (m) => (!m.bengkelId || m.bengkelId === targetBengkel) && m.status === "Aktif",
    );
    if (cabang.length > 0) return cabang;
    return mekanik.filter((m) => m.status === "Aktif");
  }, [mekanik, form.bengkelId, bengkel]);
>>>>>>> b897868 (Initial commit - AppBenk)

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof err = {};
<<<<<<< HEAD
    if (!form.kendaraan.trim()) next.kendaraan = "Kendaraan wajib diisi.";
    if (!form.jenis) next.jenis = "Pilih jenis servis.";
    if (!form.keluhan.trim()) next.keluhan = "Keluhan wajib diisi.";
=======
    if (!form.vehicleId || !form.kendaraan.trim()) {
      next.kendaraan = "Pilih kendaraan yang akan diservis.";
    }
    if (!form.jenis) next.jenis = "Pilih jenis servis.";
    if (!form.keluhan.trim()) next.keluhan = "Keluhan kendaraan wajib diisi.";
    if (form.jenis === "Lainnya" && !form.jenisLainnya.trim())
      next.jenisLainnya = "Jelaskan jenis servis yang dibutuhkan.";
>>>>>>> b897868 (Initial commit - AppBenk)
    if (!form.tanggal) next.tanggal = "Pilih tanggal booking.";
    if (!form.waktu) next.waktu = "Pilih waktu booking.";
    setErr(next);
    if (Object.keys(next).length) return;

<<<<<<< HEAD
    void (async () => {
      const baru = await buatBooking({ ...form, pelanggan: nama });
      toast.success(`Booking ${baru.nomor} dibuat — menunggu konfirmasi admin`);
      setForm(kosong);
    })();
  };

  const milikSaya = booking.filter((b) => b.pelanggan === nama);

  return (
    <>
      <PageHeader title="Booking Servis" description="Ajukan jadwal servis kendaraan Anda ke bengkel." />
=======
    const targetCustomerId =
      profil?.id ||
      `pl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

    if (!profil && user) {
      simpanPelanggan({
        id: targetCustomerId,
        userId: user.id,
        nama: user.nama || "Pelanggan",
        email: user.email,
        telepon: user.telepon ?? "",
        alamat: "",
        kendaraan: form.kendaraan,
        plat: form.plat,
      });
    }

    const { jenisLainnya, ...bookingForm } = form;
    const baru = buatBooking({
      ...bookingForm,
      bengkelId: form.bengkelId || "bengkel-001",
      mekanikDiinginkan: form.mekanikDiinginkan.trim() || undefined,
      mekanikId: form.mekanikId || undefined,
      jenis: form.jenis === "Lainnya" ? jenisLainnya.trim() : form.jenis,
      pelanggan: user?.nama || profil?.nama || "Pelanggan",
      customerId: targetCustomerId,
      vehicleId: form.vehicleId,
    });
    toast.success(`Booking ${baru.nomor} dibuat — menunggu konfirmasi admin`);

    const defaultKendaraan = kendaraanSaya[0];
    setForm({
      ...kosong,
      vehicleId: defaultKendaraan ? defaultKendaraan.id : "",
      kendaraan: defaultKendaraan ? labelKendaraan(defaultKendaraan) : "",
      plat: defaultKendaraan ? defaultKendaraan.plat : "",
    });
  };

  const milikSaya = useMemo(() => {
    const userNamaLower = (user?.nama || "").trim().toLowerCase();
    const userPelangganLower = (user?.pelanggan || "").trim().toLowerCase();
    const profilId = profil?.id;
    const authId = user?.id;

    return booking.filter((b) => {
      if (b.customerId) {
        if (profilId && b.customerId === profilId) return true;
        if (authId && b.customerId === authId) return true;
      }
      if (b.pelanggan) {
        const bNama = b.pelanggan.trim().toLowerCase();
        if (userNamaLower && bNama === userNamaLower) return true;
        if (userPelangganLower && bNama === userPelangganLower) return true;
      }
      return false;
    });
  }, [booking, user, profil]);

  return (
    <>
      <PageHeader
        title="Booking Servis"
        description="Ajukan jadwal servis kendaraan Anda ke bengkel."
      />
>>>>>>> b897868 (Initial commit - AppBenk)

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Form Booking</CardTitle>
          </CardHeader>
          <CardContent>
<<<<<<< HEAD
            <form onSubmit={submit} className="space-y-4">
              {kendaraanSaya.length > 0 && (
                <div className="space-y-1.5">
                  <Label>Pilih Kendaraan Terdaftar</Label>
                  <Select
                    value={kendaraanSaya.find((k) => k.plat === form.plat)?.id ?? ""}
                    onValueChange={(v) => {
                      const k = kendaraanSaya.find((x) => x.id === v);
                      if (k) setForm({ ...form, kendaraan: labelKendaraan(k), plat: k.plat });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kendaraan" />
                    </SelectTrigger>
                    <SelectContent>
                      {kendaraanSaya.map((k) => (
                        <SelectItem key={k.id} value={k.id}>{labelKendaraan(k)} · {k.plat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Kelola daftar kendaraan di menu Kendaraan Saya.</p>
                </div>
              )}
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
                <Label>Mekanik yang Diinginkan</Label>
                <Select
                  value={form.mekanikDiinginkan || "semua"}
                  onValueChange={(v) => setForm({ ...form, mekanikDiinginkan: v === "semua" ? "" : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Mekanik" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua Mekanik</SelectItem>
                    {MEKANIK_DETAIL.map((m) => (
                      <SelectItem key={m.nama} value={m.nama}>{m.nama} — {m.spesialis}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  list="saran-mekanik"
                  value={form.mekanikDiinginkan}
                  onChange={(e) => setForm({ ...form, mekanikDiinginkan: e.target.value })}
                  placeholder="Ketik nama mekanik..."
                  maxLength={60}
                />
                <datalist id="saran-mekanik">
                  {MEKANIK_DETAIL.map((m) => (
                    <option key={m.nama} value={m.nama}>{m.nama} — {m.spesialis}</option>
                  ))}
                </datalist>
                <p className="text-xs text-muted-foreground">
                  Opsional. Admin akan mempertimbangkan permintaan ini saat menugaskan mekanik.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Catatan Tambahan</Label>
                <Textarea value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} placeholder="Opsional" />
              </div>
              <Button type="submit" className="w-full gap-2">
                <CalendarPlus className="size-4" /> Kirim Booking
              </Button>
            </form>
=======
            {kendaraanSaya.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-4">
                <div className="rounded-full bg-amber-100 p-4 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                  <Car className="size-8" />
                </div>
                <div className="space-y-2 max-w-sm">
                  <h3 className="font-semibold text-base text-foreground">
                    Wajib Mengisi Kendaraan Terlebih Dahulu
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Sebelum mengajukan booking servis, Anda diharuskan mendaftarkan minimal 1 kendaraan di menu <strong>Kendaraan Saya</strong> agar riwayat dan data servis tercatat dengan tepat.
                  </p>
                </div>
                <Button asChild className="gap-2">
                  <Link to="/pelanggan/kendaraan">
                    <Car className="size-4" /> Buka Halaman Kendaraan Saya
                  </Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Pilih Cabang Bengkel</Label>
                  <Select
                    value={form.bengkelId}
                    onValueChange={(v) =>
                      setForm({ ...form, bengkelId: v, mekanikDiinginkan: "", mekanikId: "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Cabang Bengkel" />
                    </SelectTrigger>
                    <SelectContent>
                      {bengkel.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label>Pilih Kendaraan Anda <span className="text-destructive">*</span></Label>
                    <Link
                      to="/pelanggan/kendaraan"
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      + Kelola Kendaraan
                    </Link>
                  </div>
                  <Select
                    value={form.vehicleId || kendaraanSaya[0]?.id || ""}
                    onValueChange={(v) => {
                      const k = kendaraanSaya.find((x) => x.id === v);
                      if (k) {
                        setForm({
                          ...form,
                          vehicleId: k.id,
                          kendaraan: labelKendaraan(k),
                          plat: k.plat,
                        });
                        setErr((prev) => {
                          const next = { ...prev };
                          delete next.kendaraan;
                          return next;
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kendaraan yang akan diservis" />
                    </SelectTrigger>
                    <SelectContent>
                      {kendaraanSaya.map((k) => (
                        <SelectItem key={k.id} value={k.id}>
                          {labelKendaraan(k)} · {k.plat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {err.kendaraan && <p className="text-xs text-destructive">{err.kendaraan}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/40 p-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Kendaraan Terpilih</span>
                    <span className="font-semibold text-foreground">
                      {form.kendaraan || (utama ? labelKendaraan(utama) : "—")}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Nomor Polisi</span>
                    <span className="font-semibold text-foreground">
                      {form.plat || utama?.plat || "—"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Jenis Servis</Label>
                  <Select value={form.jenis} onValueChange={(v) => setForm({ ...form, jenis: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis servis" />
                    </SelectTrigger>
                    <SelectContent>
                      {JENIS_SERVIS.map((j) => (
                        <SelectItem key={j} value={j}>
                          {j}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {err.jenis && <p className="text-xs text-destructive">{err.jenis}</p>}
                </div>
                {form.jenis === "Lainnya" && (
                  <div className="space-y-1.5">
                    <Label>Jelaskan jenis servis yang dibutuhkan</Label>
                    <Input
                      value={form.jenisLainnya}
                      onChange={(e) => setForm({ ...form, jenisLainnya: e.target.value })}
                    />
                    {err.jenisLainnya && (
                      <p className="text-xs text-destructive">{err.jenisLainnya}</p>
                    )}
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label>Jelaskan keluhan atau masalah kendaraan Anda</Label>
                  <Textarea
                    value={form.keluhan}
                    onChange={(e) => setForm({ ...form, keluhan: e.target.value })}
                    placeholder="Contoh: Mesin terasa bergetar saat dinyalakan, rem berbunyi, AC kurang dingin, dll."
                  />
                  {err.keluhan && <p className="text-xs text-destructive">{err.keluhan}</p>}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Tanggal Booking</Label>
                    <Input
                      type="date"
                      value={form.tanggal}
                      onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                    />
                    {err.tanggal && <p className="text-xs text-destructive">{err.tanggal}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Waktu Booking</Label>
                    <Input
                      type="time"
                      value={form.waktu}
                      onChange={(e) => setForm({ ...form, waktu: e.target.value })}
                    />
                    {err.waktu && <p className="text-xs text-destructive">{err.waktu}</p>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Preferensi Mekanik (Opsional)</Label>
                  <Select
                    value={
                      form.mekanikId ||
                      (form.mekanikDiinginkan
                        ? mekanik.find((x) => x.nama === form.mekanikDiinginkan)?.id
                        : "") ||
                      "tanpa_preferensi"
                    }
                    onValueChange={(v) => {
                      if (v === "tanpa_preferensi") {
                        setForm((prev) => ({ ...prev, mekanikDiinginkan: "", mekanikId: "" }));
                      } else {
                        const m = mekanik.find((x) => x.id === v || x.nama === v);
                        setForm((prev) => ({
                          ...prev,
                          mekanikDiinginkan: m ? m.nama : "",
                          mekanikId: m ? m.id : v,
                        }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Serahkan kepada bengkel (Tanpa Preferensi)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tanpa_preferensi">
                        Serahkan kepada bengkel (Tanpa Preferensi)
                      </SelectItem>
                      {mekanikTersedia.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.nama} — Spesialisasi: {m.spesialisasi || "Teknisi Umum"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Pilih teknisi yang Anda sukai dari data mekanik kami, atau serahkan kepada bengkel untuk penugasan terbaik.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label>Catatan Tambahan</Label>
                  <Textarea
                    value={form.catatan}
                    onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                    placeholder="Opsional"
                  />
                </div>
                <Button type="submit" className="w-full gap-2">
                  <CalendarPlus className="size-4" /> Kirim Booking
                </Button>
              </form>
            )}
>>>>>>> b897868 (Initial commit - AppBenk)
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Booking Saya</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {milikSaya.length === 0 ? (
<<<<<<< HEAD
              <EmptyState title="Belum ada booking" description="Booking yang Anda buat akan muncul di sini." />
=======
              <EmptyState
                title="Belum ada booking"
                description="Booking yang Anda buat akan muncul di sini."
              />
>>>>>>> b897868 (Initial commit - AppBenk)
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No. Booking</TableHead>
                      <TableHead>Jenis</TableHead>
                      <TableHead>Jadwal</TableHead>
                      <TableHead>Mekanik</TableHead>
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
                        <TableCell className="text-xs text-muted-foreground">
                          <span className="block">Diinginkan: {b.mekanikDiinginkan || "—"}</span>
<<<<<<< HEAD
                          <span className="block">Ditugaskan: {b.mekanikDitugaskan || "Belum ditentukan"}</span>
                        </TableCell>
                        <TableCell>
                          <BookingBadge status={b.status} />
=======
                          <span className="block">
                            Ditugaskan: {b.mekanikDitugaskan || "Belum ditentukan"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <BookingBadge status={b.status} />
                          {b.status === "Diterima" && (
                            <span className="mt-1 block text-xs text-muted-foreground">
                              {b.estimasiSelesai
                                ? `Estimasi selesai: ${new Date(b.estimasiSelesai).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })} WIB`
                                : "Estimasi selesai belum ditentukan."}
                            </span>
                          )}
>>>>>>> b897868 (Initial commit - AppBenk)
                          {b.status === "Ditolak" && b.alasanTolak && (
                            <span className="mt-1 block max-w-56 text-xs text-destructive">
                              Alasan: {b.alasanTolak}
                            </span>
                          )}
                        </TableCell>
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
