<<<<<<< HEAD
import { createFileRoute } from "@tanstack/react-router";
import { Calculator } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/lib/auth";
import { useStore, rupiah, tanggalPanjang } from "@/lib/store";
=======
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Calculator,
  Clock,
  Timer,
  CalendarCheck,
  Wrench,
  User,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { PageHeader, EmptyState } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/auth";
import { useStore, rupiah, tanggalPanjang, type Servis, type Booking } from "@/lib/store";
>>>>>>> b897868 (Initial commit - AppBenk)

export const Route = createFileRoute("/_shell/pelanggan/estimasi")({
  head: () => ({
    meta: [
      { title: "Estimasi Servis — AppBenk" },
<<<<<<< HEAD
      { name: "description", content: "Lihat rincian estimasi biaya jasa servis dan sparepart sebelum pengerjaan kendaraan Anda." },
      { property: "og:title", content: "Estimasi Servis — AppBenk" },
      { property: "og:description", content: "Transparansi biaya jasa dan sparepart sebelum servis." },
=======
      {
        name: "description",
        content:
          "Lihat rincian estimasi biaya jasa servis, sparepart, dan perkiraan waktu selesai pengerjaan kendaraan Anda.",
      },
      { property: "og:title", content: "Estimasi Servis — AppBenk" },
      {
        property: "og:description",
        content: "Transparansi biaya jasa, sparepart, dan estimasi waktu selesai servis.",
      },
>>>>>>> b897868 (Initial commit - AppBenk)
    ],
  }),
  component: EstimasiPelanggan,
});

<<<<<<< HEAD
function EstimasiPelanggan() {
  const { user } = useAuth();
  const { servis } = useStore();
=======
function hitungPerkiraanSelesai(s: Servis, bookingList: Booking[]) {
  // 1. Cek apakah servis memiliki estimasiSelesai langsung
  if (s.estimasiSelesai) {
    try {
      const dt = new Date(s.estimasiSelesai);
      if (!isNaN(dt.getTime())) {
        return {
          waktu: dt.toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
          }) + " WIB",
          durasi: s.estimasiWaktu || "± 1.5 Jam",
          keterangan: "Ditetapkan oleh teknisi & sistem bengkel",
          isPasti: true,
        };
      }
    } catch {}
  }

  // 2. Cek apakah ada booking terkait yang punya estimasiSelesai
  const bk = bookingList.find((b) => b.id === s.bookingId || b.nomor === s.bookingId);
  if (bk?.estimasiSelesai) {
    try {
      const dt = new Date(bk.estimasiSelesai);
      if (!isNaN(dt.getTime())) {
        return {
          waktu: dt.toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
          }) + " WIB",
          durasi: s.estimasiWaktu || "± 1 - 2 Jam",
          keterangan: "Sesuai konfirmasi jadwal booking",
          isPasti: true,
        };
      }
    } catch {}
  }

  // 3. Cek estimasiWaktu dari servis
  if (s.estimasiWaktu) {
    return {
      waktu: `${tanggalPanjang(s.tanggal)}, perkiraan ${s.estimasiWaktu}`,
      durasi: s.estimasiWaktu,
      keterangan: "Perkiraan durasi standar servis",
      isPasti: false,
    };
  }

  // 4. Default pintar berdasarkan jenis servis & tanggal pengerjaan
  const jenis = (s.jenis || "").toLowerCase();
  let durasi = "± 1.5 Jam";
  let jamTarget = "16:00";

  if (jenis.includes("ringan") || jenis.includes("oli") || jenis.includes("rem")) {
    durasi = "± 45 - 60 Menit";
    jamTarget = "15:00";
  } else if (jenis.includes("berat") || jenis.includes("turun") || jenis.includes("overhaul")) {
    durasi = "± 1 - 2 Hari Kerja";
    jamTarget = "Besok, 17:00";
  } else if (jenis.includes("tune") || jenis.includes("berkala") || jenis.includes("injeksi")) {
    durasi = "± 1.5 - 2 Jam";
    jamTarget = "16:30";
  }

  return {
    waktu: `${tanggalPanjang(s.tanggal)}, perkiraan selesai pukul ${jamTarget} WIB`,
    durasi,
    keterangan: "Estimasi berdasarkan jenis servis kendaraan",
    isPasti: false,
  };
}

function getTahapPengerjaan(status: string) {
  switch (status) {
    case "Booking":
      return { step: 1, label: "Booking Terdaftar", detail: "Menunggu giliran masuk pit pengerjaan" };
    case "Menunggu":
      return { step: 2, label: "Antrean Pit", detail: "Kendaraan berada di antrean pit teknisi" };
    case "Diproses":
      return { step: 3, label: "Sedang Dikerjakan", detail: "Teknisi sedang melakukan servis & pemasangan part" };
    case "Selesai":
    case "Menunggu Pembayaran":
      return { step: 4, label: "Pengerjaan Selesai", detail: "Pengecekan akhir selesai & kendaraan siap diambil" };
    case "Selesai Dibayar":
      return { step: 5, label: "Selesai & Lunas", detail: "Servis dan pembayaran telah tuntas" };
    default:
      return { step: 2, label: "Dalam Penanganan", detail: "Sedang ditangani oleh bengkel" };
  }
}

function EstimasiPelanggan() {
  const { user } = useAuth();
  const { servis, booking } = useStore();
>>>>>>> b897868 (Initial commit - AppBenk)
  const nama = user?.pelanggan ?? "";
  const daftar = servis.filter((s) => s.pelanggan === nama && s.status !== "Selesai Dibayar");
  const totalSemua = daftar.reduce((a, s) => a + s.total, 0);

  return (
    <>
<<<<<<< HEAD
      <PageHeader title="Estimasi Servis" description="Rincian perkiraan biaya jasa dan sparepart." />
=======
      <PageHeader
        title="Estimasi Servis"
        description="Pantau perkiraan waktu selesai, mekanik penanggung jawab, serta rincian biaya jasa dan sparepart."
      />
>>>>>>> b897868 (Initial commit - AppBenk)

      {daftar.length === 0 ? (
        <Card>
          <CardContent className="p-0">
<<<<<<< HEAD
            <EmptyState icon={<Calculator className="size-8" />} title="Belum ada estimasi" description="Estimasi muncul saat servis sedang berjalan." />
=======
            <EmptyState
              icon={<Calculator className="size-8" />}
              title="Belum ada estimasi servis aktif"
              description="Estimasi biaya dan perkiraan waktu selesai akan tampil otomatis saat kendaraan Anda sedang dalam penanganan bengkel."
            />
>>>>>>> b897868 (Initial commit - AppBenk)
          </CardContent>
        </Card>
      ) : (
        <>
<<<<<<< HEAD
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total Estimasi Aktif</p>
              <p className="mt-2 font-display text-3xl font-bold">{rupiah(totalSemua)}</p>
              <p className="text-xs text-muted-foreground">{daftar.length} servis belum lunas</p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {daftar.map((s) => (
              <Card key={s.id}>
                <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
                  <div>
                    <CardTitle className="text-base">{s.nomor} · {s.jenis}</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {s.kendaraan} · {s.plat} · {tanggalPanjang(s.tanggal)}
                    </p>
                  </div>
                  <StatusBadge status={s.status} />
                </CardHeader>
                <CardContent className="px-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Rincian</TableHead>
                        <TableHead className="text-right">Estimasi Biaya</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Jasa Servis</TableCell>
                        <TableCell className="text-muted-foreground">{s.pekerjaan}</TableCell>
                        <TableCell className="text-right">{rupiah(s.biayaJasa)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Sparepart</TableCell>
                        <TableCell className="text-muted-foreground">{s.sparepart || "—"}</TableCell>
                        <TableCell className="text-right">{rupiah(s.biayaPart)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2} className="font-semibold">Total Estimasi</TableCell>
                        <TableCell className="text-right font-display text-lg font-bold">{rupiah(s.total)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
=======
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Total Estimasi Biaya Aktif
                </p>
                <p className="mt-2 font-display text-2xl font-bold sm:text-3xl">
                  {rupiah(totalSemua)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {daftar.length} servis aktif dalam pengerjaan
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-info">
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Servis Sedang Diproses
                </p>
                <p className="mt-2 font-display text-2xl font-bold sm:text-3xl">
                  {daftar.filter((s) => s.status === "Diproses").length} Unit
                </p>
                <p className="text-xs text-muted-foreground">
                  Dikerjakan langsung oleh tim mekanik profesional
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-warning sm:col-span-2 lg:col-span-1">
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Siap Diambil / Pembayaran
                </p>
                <p className="mt-2 font-display text-2xl font-bold sm:text-3xl">
                  {daftar.filter((s) => ["Selesai", "Menunggu Pembayaran"].includes(s.status)).length} Unit
                </p>
                <p className="text-xs text-muted-foreground">
                  Pengerjaan tuntas dan siap dibawa kembali
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {daftar.map((s) => {
              const estimasi = hitungPerkiraanSelesai(s, booking);
              const tahap = getTahapPengerjaan(s.status);
              const siapBayar = ["Menunggu Pembayaran", "Selesai"].includes(s.status);

              return (
                <Card key={s.id} className="overflow-hidden border-2 shadow-sm transition-all hover:border-primary/40">
                  <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 space-y-0 border-b bg-muted/20 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-bold sm:text-lg">
                          {s.nomor} · {s.jenis}
                        </CardTitle>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {s.kendaraan} · Plat: <span className="font-semibold text-foreground">{s.plat}</span> · Terdaftar: {tanggalPanjang(s.tanggal)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={s.status} />
                      {siapBayar && (
                        <Button asChild size="sm" className="gap-1.5 shadow-sm">
                          <Link to="/pelanggan/pembayaran" search={{ trx: s.noTransaksi }}>
                            Bayar Sekarang <ArrowRight className="size-3.5" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-5 p-5">
                    {/* BANNER ESTIMASI / PERKIRAAN KAPAN SELESAI SERVIS */}
                    <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-sky-500/5 to-primary/10 p-4 sm:p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                          <Clock className="size-4 animate-pulse" />
                          <span>Perkiraan Kapan Selesai Servis</span>
                        </div>
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                          {estimasi.keterangan}
                        </span>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Waktu Selesai */}
                        <div className="rounded-lg border bg-card/80 p-3 shadow-xs">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CalendarCheck className="size-3.5 text-primary" />
                            <span>Target Selesai</span>
                          </div>
                          <p className="mt-1 text-sm font-bold text-foreground">
                            {estimasi.waktu}
                          </p>
                        </div>

                        {/* Durasi Pengerjaan */}
                        <div className="rounded-lg border bg-card/80 p-3 shadow-xs">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Timer className="size-3.5 text-warning" />
                            <span>Estimasi Durasi</span>
                          </div>
                          <p className="mt-1 text-sm font-bold text-foreground">
                            {estimasi.durasi}
                          </p>
                        </div>

                        {/* Mekanik Bertugas */}
                        <div className="rounded-lg border bg-card/80 p-3 shadow-xs">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <User className="size-3.5 text-emerald-600" />
                            <span>Mekanik Bertugas</span>
                          </div>
                          <p className="mt-1 truncate text-sm font-bold text-foreground">
                            {s.mekanik || "Teknisi Ditugaskan"}
                          </p>
                        </div>

                        {/* Status / Tahapan */}
                        <div className="rounded-lg border bg-card/80 p-3 shadow-xs">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Wrench className="size-3.5 text-primary" />
                            <span>Status Pengerjaan</span>
                          </div>
                          <p className="mt-1 truncate text-sm font-bold text-foreground">
                            {tahap.label}
                          </p>
                        </div>
                      </div>

                      {/* STEP TRACKER PENGERJAAN */}
                      <div className="mt-4 pt-4 border-t border-primary/15">
                        <p className="text-xs font-medium text-muted-foreground mb-2.5">
                          Progres Pengerjaan Servis: <span className="font-semibold text-foreground">{tahap.detail}</span>
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { num: 1, label: "Pendaftaran" },
                            { num: 2, label: "Antrean Pit" },
                            { num: 3, label: "Pengerjaan" },
                            { num: 4, label: "Siap Diambil" },
                          ].map((step) => {
                            const isDone = tahap.step > step.num;
                            const isCurrent = tahap.step === step.num;
                            return (
                              <div key={step.num} className="space-y-1.5 text-center">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    isDone
                                      ? "bg-primary"
                                      : isCurrent
                                        ? "bg-primary animate-pulse"
                                        : "bg-muted"
                                  }`}
                                />
                                <span
                                  className={`block text-[11px] font-medium leading-tight truncate ${
                                    isCurrent
                                      ? "font-bold text-primary"
                                      : isDone
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                  }`}
                                >
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* TABEL RINCIAN ESTIMASI BIAYA */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold tracking-tight">Rincian Estimasi Biaya Servis</h4>
                        <span className="text-xs text-muted-foreground">Transparansi Jasa & Suku Cadang</span>
                      </div>

                      <div className="overflow-x-auto rounded-lg border">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/40">
                              <TableHead>Komponen Biaya</TableHead>
                              <TableHead>Keterangan & Rincian</TableHead>
                              <TableHead className="text-right">Perkiraan Biaya</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <Wrench className="size-4 text-primary" />
                                  <span>Jasa Pengerjaan</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {s.pekerjaan || s.jenis || "Pemeriksaan dan perbaikan mekanik"}
                              </TableCell>
                              <TableCell className="text-right font-medium">{rupiah(s.biayaJasa)}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="size-4 text-warning" />
                                  <span>Sparepart / Suku Cadang</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {s.items && s.items.length > 0 ? (
                                  <ul className="list-inside list-disc space-y-0.5">
                                    {s.items.map((i) => (
                                      <li key={i.sparepartId}>
                                        {i.nama} ({i.jumlah}x @ {rupiah(i.harga)})
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  s.sparepart || "Tidak ada penggantian sparepart tambahan"
                                )}
                              </TableCell>
                              <TableCell className="text-right font-medium">{rupiah(s.biayaPart)}</TableCell>
                            </TableRow>
                            <TableRow className="bg-muted/30">
                              <TableCell colSpan={2} className="font-bold">
                                Total Estimasi Biaya
                              </TableCell>
                              <TableCell className="text-right font-display text-lg font-bold text-primary">
                                {rupiah(s.total)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* CATATAN TRANSPARANSI */}
                    <div className="flex items-start gap-2.5 rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                      <AlertCircle className="size-4 shrink-0 text-muted-foreground mt-0.5" />
                      <div>
                        <span className="font-medium text-foreground">Catatan Transparansi Servis:</span> Perkiraan
                        waktu selesai dan estimasi biaya dapat diperbarui apabila teknisi kami menemukan indikasi kerusakan
                        atau komponen lain yang memerlukan pergantian setelah proses pembongkaran. Teknisi akan selalu
                        melakukan konfirmasi terlebih dahulu kepada Anda.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
>>>>>>> b897868 (Initial commit - AppBenk)
          </div>
        </>
      )}
    </>
  );
}
<<<<<<< HEAD
=======

>>>>>>> b897868 (Initial commit - AppBenk)
