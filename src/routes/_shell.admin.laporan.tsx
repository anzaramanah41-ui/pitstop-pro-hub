import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
<<<<<<< HEAD
import { FileBarChart } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStore, rupiah, MEKANIK } from "@/lib/store";
=======
import {
  FileBarChart,
  Calendar,
  RotateCcw,
  ListFilter,
  Wrench,
  Package,
  Layers,
  Users,
} from "lucide-react";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useStore, rupiah, tanggalPanjang } from "@/lib/store";
>>>>>>> b897868 (Initial commit - AppBenk)

export const Route = createFileRoute("/_shell/admin/laporan")({
  head: () => ({
    meta: [
      { title: "Laporan Operasional — AppBenk" },
<<<<<<< HEAD
      { name: "description", content: "Laporan servis harian dan bulanan, performa mekanik, serta pemakaian sparepart bengkel." },
      { property: "og:title", content: "Laporan Operasional — AppBenk" },
      { property: "og:description", content: "Pantau produktivitas bengkel lewat laporan operasional." },
=======
      {
        name: "description",
        content:
          "Laporan servis harian, mingguan, bulanan, tahunan, dan rentang kustom, performa mekanik, serta pemakaian sparepart bengkel.",
      },
      { property: "og:title", content: "Laporan Operasional — AppBenk" },
      {
        property: "og:description",
        content: "Pantau produktivitas dan pendapatan bengkel lewat laporan operasional terpadu.",
      },
>>>>>>> b897868 (Initial commit - AppBenk)
    ],
  }),
  component: LaporanAdmin,
});

<<<<<<< HEAD
function LaporanAdmin() {
  const { servis, sparepart } = useStore();
  const [periode, setPeriode] = useState<"harian" | "bulanan" | "tahunan">("bulanan");
  const [tahun, setTahun] = useState<string>("semua");

  const daftarTahun = useMemo(
    () => Array.from(new Set(servis.map((s) => s.tanggal.slice(0, 4)))).sort((a, b) => b.localeCompare(a)),
    [servis],
  );

  const data = useMemo(() => {
    let list = servis;
    if (tahun !== "semua") list = list.filter((s) => s.tanggal.startsWith(tahun));
    if (periode === "harian") list = list.filter((s) => s.tanggal === "2026-08-18");
    else if (periode === "bulanan") list = list.filter((s) => s.tanggal.startsWith(`${tahun === "semua" ? "2026" : tahun}-08`));
    return list;
  }, [servis, periode, tahun]);

  const labelPeriode = periode === "harian" ? "hari ini" : periode === "bulanan" ? `Agustus ${tahun === "semua" ? "2026" : tahun}` : tahun === "semua" ? "semua tahun" : `Tahun ${tahun}`;

  const omzet = data.reduce((a, s) => a + s.total, 0);
  const selesai = data.filter((s) => ["Selesai", "Selesai Dibayar"].includes(s.status)).length;

  const perMekanik = MEKANIK.map((m) => {
    const list = data.filter((s) => s.mekanik === m);
    return { mekanik: m, jumlah: list.length, nilai: list.reduce((a, s) => a + s.total, 0) };
  }).sort((a, b) => b.jumlah - a.jumlah);

  const partTerlaris = [...sparepart].sort((a, b) => b.terpakai - a.terpakai).slice(0, 6);
=======
type KategoriFilter = "hari" | "minggu" | "bulan" | "tahun" | "kustom" | "semua";
type SubHari = "hari_ini" | "kemarin" | "tanggal_tertentu";
type SubMinggu = "minggu_ini" | "minggu_sebelumnya" | "minggu_tertentu";
type SubBulan = "bulan_ini" | "bulan_sebelumnya" | "bulan_tertentu";
type SubTahun = "tahun_ini" | "tahun_sebelumnya" | "tahun_tertentu";

const BULAN_INDO = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function formatYMD(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatIndoDate(ymd: string): string {
  if (!ymd || ymd.length < 10) return ymd || "—";
  const [y, m, d] = ymd.slice(0, 10).split("-");
  const monthIdx = Number(m) - 1;
  const monthName = BULAN_INDO[monthIdx] || m;
  return `${Number(d)} ${monthName} ${y}`;
}

function getWeekRange(dateStr: string): { awal: string; akhir: string } {
  const parts = dateStr.split("-").map(Number);
  const y = parts[0] ?? 2026;
  const m = (parts[1] ?? 1) - 1;
  const d = parts[2] ?? 1;

  const dt = new Date(Date.UTC(y, m, d));
  const dayOfWeek = dt.getUTCDay(); // 0 = Minggu, 1 = Senin, ...
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const senin = new Date(Date.UTC(y, m, d + diffToMonday));
  const minggu = new Date(Date.UTC(y, m, d + diffToMonday + 6));
  return { awal: formatYMD(senin), akhir: formatYMD(minggu) };
}

function LaporanAdmin() {
  const { user } = useAuth();
  const bengkelAktifId = user?.bengkelId || "bengkel-001";
  const { servis, sparepart, mekanik } = useStore();

  // Reference today date in UTC
  const todayYMD = useMemo(() => {
    const now = new Date();
    return formatYMD(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
  }, []);

  // Filter state
  const [kategori, setKategori] = useState<KategoriFilter>("bulan");

  // Sub options
  const [subHari, setSubHari] = useState<SubHari>("hari_ini");
  const [customHari, setCustomHari] = useState<string>(todayYMD);

  const [subMinggu, setSubMinggu] = useState<SubMinggu>("minggu_ini");
  const [customMingguDate, setCustomMingguDate] = useState<string>(todayYMD);

  const [subBulan, setSubBulan] = useState<SubBulan>("bulan_ini");
  const [customBulan, setCustomBulan] = useState<string>(todayYMD.slice(0, 7));

  const [subTahun, setSubTahun] = useState<SubTahun>("tahun_ini");
  const [customTahun, setCustomTahun] = useState<string>(todayYMD.slice(0, 4));

  const [kustomAwal, setKustomAwal] = useState<string>(todayYMD);
  const [kustomAkhir, setKustomAkhir] = useState<string>(todayYMD);

  // Available distinct years from actual service data
  const daftarTahun = useMemo(() => {
    const years = new Set(servis.map((s) => s.tanggal.slice(0, 4)));
    years.add(todayYMD.slice(0, 4));
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [servis, todayYMD]);

  // Available distinct months from actual service data
  const daftarBulan = useMemo(() => {
    const months = new Set(servis.map((s) => s.tanggal.slice(0, 7)));
    months.add(todayYMD.slice(0, 7));
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [servis, todayYMD]);

  // Compute active date boundary
  const rentang = useMemo(() => {
    const curY = Number(todayYMD.slice(0, 4)) || 2026;
    const curM = Number(todayYMD.slice(5, 7)) || 9;
    const curD = Number(todayYMD.slice(8, 10)) || 7;
    const mZero = curM - 1;

    switch (kategori) {
      case "hari": {
        if (subHari === "hari_ini") {
          return {
            awal: todayYMD,
            akhir: todayYMD,
            label: `Hari Ini (${formatIndoDate(todayYMD)})`,
          };
        }
        if (subHari === "kemarin") {
          const yst = new Date(Date.UTC(curY, mZero, curD - 1));
          const ystStr = formatYMD(yst);
          return {
            awal: ystStr,
            akhir: ystStr,
            label: `Kemarin (${formatIndoDate(ystStr)})`,
          };
        }
        return {
          awal: customHari,
          akhir: customHari,
          label: `Tanggal ${formatIndoDate(customHari)}`,
        };
      }

      case "minggu": {
        if (subMinggu === "minggu_ini") {
          const w = getWeekRange(todayYMD);
          return {
            awal: w.awal,
            akhir: w.akhir,
            label: `Minggu Ini (${formatIndoDate(w.awal)} s/d ${formatIndoDate(w.akhir)})`,
          };
        }
        if (subMinggu === "minggu_sebelumnya") {
          const prevWDate = new Date(Date.UTC(curY, mZero, curD - 7));
          const w = getWeekRange(formatYMD(prevWDate));
          return {
            awal: w.awal,
            akhir: w.akhir,
            label: `Minggu Sebelumnya (${formatIndoDate(w.awal)} s/d ${formatIndoDate(w.akhir)})`,
          };
        }
        const w = getWeekRange(customMingguDate);
        return {
          awal: w.awal,
          akhir: w.akhir,
          label: `Minggu Pilihan (${formatIndoDate(w.awal)} s/d ${formatIndoDate(w.akhir)})`,
        };
      }

      case "bulan": {
        if (subBulan === "bulan_ini") {
          const first = formatYMD(new Date(Date.UTC(curY, mZero, 1)));
          const last = formatYMD(new Date(Date.UTC(curY, mZero + 1, 0)));
          return {
            awal: first,
            akhir: last,
            label: `Bulan Ini (${BULAN_INDO[mZero]} ${curY})`,
          };
        }
        if (subBulan === "bulan_sebelumnya") {
          const prevMDate = new Date(Date.UTC(curY, mZero - 1, 1));
          const prevMZero = prevMDate.getUTCMonth();
          const prevMY = prevMDate.getUTCFullYear();
          const first = formatYMD(new Date(Date.UTC(prevMY, prevMZero, 1)));
          const last = formatYMD(new Date(Date.UTC(prevMY, prevMZero + 1, 0)));
          return {
            awal: first,
            akhir: last,
            label: `Bulan Sebelumnya (${BULAN_INDO[prevMZero]} ${prevMY})`,
          };
        }
        const [byStr, bmStr] = customBulan.split("-");
        const by = Number(byStr) || curY;
        const bm = Number(bmStr) || curM;
        const bIdx = bm - 1;
        const first = formatYMD(new Date(Date.UTC(by, bIdx, 1)));
        const last = formatYMD(new Date(Date.UTC(by, bIdx + 1, 0)));
        return {
          awal: first,
          akhir: last,
          label: `Bulan ${BULAN_INDO[bIdx]} ${by}`,
        };
      }

      case "tahun": {
        if (subTahun === "tahun_ini") {
          return {
            awal: `${curY}-01-01`,
            akhir: `${curY}-12-31`,
            label: `Tahun Ini (${curY})`,
          };
        }
        if (subTahun === "tahun_sebelumnya") {
          return {
            awal: `${curY - 1}-01-01`,
            akhir: `${curY - 1}-12-31`,
            label: `Tahun Sebelumnya (${curY - 1})`,
          };
        }
        const ty = Number(customTahun) || curY;
        return {
          awal: `${ty}-01-01`,
          akhir: `${ty}-12-31`,
          label: `Tahun ${ty}`,
        };
      }

      case "kustom": {
        const awal = kustomAwal <= kustomAkhir ? kustomAwal : kustomAkhir;
        const akhir = kustomAwal <= kustomAkhir ? kustomAkhir : kustomAwal;
        return {
          awal,
          akhir,
          label: `Rentang ${formatIndoDate(awal)} s/d ${formatIndoDate(akhir)}`,
        };
      }

      case "semua":
      default:
        return {
          awal: "1970-01-01",
          akhir: "2099-12-31",
          label: "Semua Waktu",
        };
    }
  }, [
    kategori,
    subHari,
    customHari,
    subMinggu,
    customMingguDate,
    subBulan,
    customBulan,
    subTahun,
    customTahun,
    kustomAwal,
    kustomAkhir,
    todayYMD,
  ]);

  // Deterministic inclusive filtering with workshop isolation
  const data = useMemo(() => {
    const bengkelServis = servis.filter((s) => !s.bengkelId || s.bengkelId === bengkelAktifId);
    if (kategori === "semua") return bengkelServis;
    return bengkelServis.filter((s) => s.tanggal >= rentang.awal && s.tanggal <= rentang.akhir);
  }, [servis, kategori, rentang, bengkelAktifId]);

  const resetFilter = () => {
    setKategori("bulan");
    setSubBulan("bulan_ini");
    setSubHari("hari_ini");
    setCustomHari(todayYMD);
    setSubMinggu("minggu_ini");
    setCustomMingguDate(todayYMD);
    setCustomBulan(todayYMD.slice(0, 7));
    setSubTahun("tahun_ini");
    setCustomTahun(todayYMD.slice(0, 4));
    setKustomAwal(todayYMD);
    setKustomAkhir(todayYMD);
  };

  // Metrics
  const omzet = data.reduce((a, s) => a + (s.total || 0), 0);
  const selesai = data.filter((s) => ["Selesai", "Selesai Dibayar"].includes(s.status)).length;
  const dalamProses = data.filter((s) => ["Diproses", "Menunggu"].includes(s.status)).length;
  const rataRata = data.length > 0 ? Math.round(omzet / data.length) : 0;

  // Mechanic performance dynamically driven by services performed in the filtered period
  const perMekanik = useMemo(() => {
    const listMaster = mekanik.filter((m) => !m.bengkelId || m.bengkelId === bengkelAktifId);
    const mekanikMap = new Map<
      string,
      {
        id: string;
        nama: string;
        spesialisasi: string;
        status: "Aktif" | "Tidak Aktif";
        jumlah: number;
        nilai: number;
      }
    >();

    for (const s of data) {
      const namaMekanik = (s.mekanik || "").trim();
      if (!namaMekanik) continue;

      // Find matching mechanic from current workshop's master list
      const master =
        listMaster.find(
          (m) =>
            (s.mekanikId && m.id === s.mekanikId) ||
            m.nama.trim().toLowerCase() === namaMekanik.toLowerCase(),
        ) ||
        listMaster.find(
          (m) =>
            m.nama.trim().toLowerCase().includes(namaMekanik.toLowerCase()) ||
            namaMekanik.toLowerCase().includes(m.nama.trim().toLowerCase()),
        );

      const key = master ? master.id : `nama-${namaMekanik.toLowerCase()}`;
      const totalServis = Number(s.total || 0);
      const existing = mekanikMap.get(key);

      if (existing) {
        existing.jumlah += 1;
        existing.nilai += totalServis;
      } else {
        mekanikMap.set(key, {
          id: master ? master.id : `hist-${namaMekanik}`,
          nama: master ? master.nama : namaMekanik,
          spesialisasi: master ? master.spesialisasi : "Mekanik Historis",
          status: master ? master.status : "Tidak Aktif",
          jumlah: 1,
          nilai: totalServis,
        });
      }
    }

    return Array.from(mekanikMap.values()).sort(
      (a, b) => b.jumlah - a.jumlah || b.nilai - a.nilai,
    );
  }, [data, mekanik, bengkelAktifId]);

  // Sparepart usage within the filtered servis
  const partTerlaris = useMemo(() => {
    const countMap = new Map<string, number>();
    for (const s of data) {
      if (s.items && Array.isArray(s.items)) {
        for (const item of s.items) {
          countMap.set(item.sparepartId, (countMap.get(item.sparepartId) ?? 0) + item.jumlah);
        }
      }
    }

    if (countMap.size > 0) {
      return sparepart
        .map((p) => ({
          ...p,
          terpakaiPeriode: countMap.get(p.id) ?? 0,
        }))
        .filter((p) => p.terpakaiPeriode > 0)
        .sort((a, b) => b.terpakaiPeriode - a.terpakaiPeriode)
        .slice(0, 8);
    }

    return [...sparepart]
      .sort((a, b) => (b.terpakai || 0) - (a.terpakai || 0))
      .slice(0, 8)
      .map((p) => ({ ...p, terpakaiPeriode: p.terpakai || 0 }));
  }, [data, sparepart]);
>>>>>>> b897868 (Initial commit - AppBenk)

  return (
    <>
      <PageHeader
        title="Laporan Operasional"
<<<<<<< HEAD
        description="Ringkasan servis, performa mekanik, dan pemakaian sparepart."
        action={
          <div className="flex flex-wrap gap-2">
            <Select value={tahun} onValueChange={setTahun}>
              <SelectTrigger className="w-40 bg-card" aria-label="Filter tahun"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Tahun</SelectItem>
                {daftarTahun.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={periode} onValueChange={(v) => setPeriode(v as typeof periode)}>
              <SelectTrigger className="w-40 bg-card" aria-label="Filter periode"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="harian">Harian</SelectItem>
                <SelectItem value="bulanan">Bulanan</SelectItem>
                <SelectItem value="tahunan">Tahunan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Total Servis", String(data.length), "unit pekerjaan"],
          ["Servis Selesai", String(selesai), "sudah rampung"],
          ["Nilai Servis", rupiah(omzet), labelPeriode],
        ].map(([l, v, h]) => (
          <Card key={l} className="border-l-4 border-l-primary">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{l}</p>
              <p className="mt-2 font-display text-2xl font-bold">{v}</p>
              <p className="text-xs text-muted-foreground">{h}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><FileBarChart className="size-4 text-primary" /> Performa Mekanik</CardTitle></CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mekanik</TableHead>
                  <TableHead className="text-right">Servis</TableHead>
                  <TableHead className="text-right">Nilai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {perMekanik.map((m) => (
                  <TableRow key={m.mekanik}>
                    <TableCell className="font-medium">{m.mekanik}</TableCell>
                    <TableCell className="text-right">{m.jumlah}</TableCell>
                    <TableCell className="text-right">{rupiah(m.nilai)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Sparepart Paling Terpakai</CardTitle></CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sparepart</TableHead>
                  <TableHead className="text-right">Terpakai</TableHead>
                  <TableHead className="text-right">Sisa Stok</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partTerlaris.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.nama}</TableCell>
                    <TableCell className="text-right">{p.terpakai}</TableCell>
                    <TableCell className="text-right">
                      <span className={p.stok <= 5 ? "font-semibold text-destructive" : ""}>{p.stok}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
=======
        description="Pantau produktivitas, pendapatan servis, performa mekanik, dan pemakaian sparepart berdasarkan periode tanggal."
      />

      {/* FILTER CONTROL CARD */}
      <Card className="border-primary/20 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-primary" />
              <CardTitle className="text-base">Filter Periode Tanggal</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                {rentang.label}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilter}
                className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-3" /> Reset Filter
              </Button>
            </div>
          </div>
          <CardDescription>
            Pilih interval waktu (Harian, Mingguan, Bulanan, Tahunan, atau Rentang Kustom).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. KATEGORI PERIODE */}
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Kategori Periode</span>
              <Select value={kategori} onValueChange={(v) => setKategori(v as KategoriFilter)}>
                <SelectTrigger className="bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hari">Harian (Per Hari)</SelectItem>
                  <SelectItem value="minggu">Mingguan (Per Minggu)</SelectItem>
                  <SelectItem value="bulan">Bulanan (Per Bulan)</SelectItem>
                  <SelectItem value="tahun">Tahunan (Per Tahun)</SelectItem>
                  <SelectItem value="kustom">Rentang Kustom</SelectItem>
                  <SelectItem value="semua">Semua Waktu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 2. SUB-OPSI HARIAN */}
            {kategori === "hari" && (
              <>
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Pilihan Hari</span>
                  <Select value={subHari} onValueChange={(v) => setSubHari(v as SubHari)}>
                    <SelectTrigger className="bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hari_ini">Hari Ini</SelectItem>
                      <SelectItem value="kemarin">Hari Sebelumnya (Kemarin)</SelectItem>
                      <SelectItem value="tanggal_tertentu">Pilih Tanggal Tertentu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {subHari === "tanggal_tertentu" && (
                  <div className="space-y-1.5 sm:col-span-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Pilih Tanggal
                    </span>
                    <Input
                      type="date"
                      value={customHari}
                      onChange={(e) => setCustomHari(e.target.value)}
                      className="bg-card"
                    />
                  </div>
                )}
              </>
            )}

            {/* 3. SUB-OPSI MINGGUAN */}
            {kategori === "minggu" && (
              <>
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Pilihan Minggu</span>
                  <Select value={subMinggu} onValueChange={(v) => setSubMinggu(v as SubMinggu)}>
                    <SelectTrigger className="bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minggu_ini">Minggu Ini (Senin – Minggu)</SelectItem>
                      <SelectItem value="minggu_sebelumnya">Minggu Sebelumnya</SelectItem>
                      <SelectItem value="minggu_tertentu">Pilih Minggu Tertentu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {subMinggu === "minggu_tertentu" && (
                  <div className="space-y-1.5 sm:col-span-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Tanggal Acuan Minggu (Senin – Minggu)
                    </span>
                    <Input
                      type="date"
                      value={customMingguDate}
                      onChange={(e) => setCustomMingguDate(e.target.value)}
                      className="bg-card"
                    />
                  </div>
                )}
              </>
            )}

            {/* 4. SUB-OPSI BULANAN */}
            {kategori === "bulan" && (
              <>
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Pilihan Bulan</span>
                  <Select value={subBulan} onValueChange={(v) => setSubBulan(v as SubBulan)}>
                    <SelectTrigger className="bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bulan_ini">Bulan Ini</SelectItem>
                      <SelectItem value="bulan_sebelumnya">Bulan Sebelumnya</SelectItem>
                      <SelectItem value="bulan_tertentu">Pilih Bulan Tertentu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {subBulan === "bulan_tertentu" && (
                  <div className="space-y-1.5 sm:col-span-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Pilih Bulan & Tahun
                    </span>
                    <Select value={customBulan} onValueChange={setCustomBulan}>
                      <SelectTrigger className="bg-card">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {daftarBulan.map((b) => {
                          const [y, m] = b.split("-").map(Number);
                          const namaBulan = BULAN_INDO[(m ?? 1) - 1] || b;
                          return (
                            <SelectItem key={b} value={b}>
                              {namaBulan} {y}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            {/* 5. SUB-OPSI TAHUNAN */}
            {kategori === "tahun" && (
              <>
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Pilihan Tahun</span>
                  <Select value={subTahun} onValueChange={(v) => setSubTahun(v as SubTahun)}>
                    <SelectTrigger className="bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tahun_ini">Tahun Ini</SelectItem>
                      <SelectItem value="tahun_sebelumnya">Tahun Sebelumnya</SelectItem>
                      <SelectItem value="tahun_tertentu">Pilih Tahun Tertentu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {subTahun === "tahun_tertentu" && (
                  <div className="space-y-1.5 sm:col-span-2">
                    <span className="text-xs font-medium text-muted-foreground">Pilih Tahun</span>
                    <Select value={customTahun} onValueChange={setCustomTahun}>
                      <SelectTrigger className="bg-card">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {daftarTahun.map((t) => (
                          <SelectItem key={t} value={t}>
                            Tahun {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            {/* 6. RENTANG KUSTOM */}
            {kategori === "kustom" && (
              <>
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Dari Tanggal</span>
                  <Input
                    type="date"
                    value={kustomAwal}
                    onChange={(e) => setKustomAwal(e.target.value)}
                    className="bg-card"
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Sampai Tanggal</span>
                  <Input
                    type="date"
                    value={kustomAkhir}
                    onChange={(e) => setKustomAkhir(e.target.value)}
                    className="bg-card"
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KPI METRIC CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Total Servis
            </p>
            <p className="mt-2 font-display text-2xl font-bold">{data.length}</p>
            <p className="text-xs text-muted-foreground">Unit pekerjaan tercatat</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Servis Selesai
            </p>
            <p className="mt-2 font-display text-2xl font-bold text-success">{selesai}</p>
            <p className="text-xs text-muted-foreground">
              {data.length > 0 ? `${Math.round((selesai / data.length) * 100)}% penyelesaian` : "0%"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Dalam Pengerjaan
            </p>
            <p className="mt-2 font-display text-2xl font-bold text-warning">{dalamProses}</p>
            <p className="text-xs text-muted-foreground">Sedang ditangani mekanik</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Total Nilai Servis (Omzet)
            </p>
            <p className="mt-2 font-display text-2xl font-bold">{rupiah(omzet)}</p>
            <p className="text-xs text-muted-foreground">
              Rata-rata: {rupiah(rataRata)} / servis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* TABS CONTENT: RINGKASAN VS DETAIL SERVIS */}
      <Tabs defaultValue="ringkasan">
        <TabsList className="grid grid-cols-2 sm:w-80">
          <TabsTrigger value="ringkasan" className="gap-2">
            <Layers className="size-4" /> Ringkasan Performa
          </TabsTrigger>
          <TabsTrigger value="rincian" className="gap-2">
            <ListFilter className="size-4" /> Rincian Servis ({data.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: RINGKASAN PERFORMA MEKANIK & SPAREPART */}
        <TabsContent value="ringkasan" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Performa Mekanik */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Wrench className="size-4 text-primary" /> Performa Mekanik Periode Ini
                    </CardTitle>
                    <CardDescription>
                      Kontribusi pengerjaan servis dan nilai rupiah per mekanik bengkel.
                    </CardDescription>
                  </div>
                  <Button asChild variant="outline" size="sm" className="gap-1.5 self-start sm:self-auto">
                    <Link to="/admin/mekanik">
                      <Users className="size-3.5" />
                      Kelola Mekanik
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-0">
                {perMekanik.length === 0 ? (
                  <EmptyState
                    title="Belum ada data mekanik"
                    description="Belum ada mekanik terdaftar atau pengerjaan servis pada periode ini."
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Mekanik</TableHead>
                        <TableHead>Spesialisasi</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Servis</TableHead>
                        <TableHead className="text-right">Total Nilai</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {perMekanik.map((m) => (
                        <TableRow key={m.id || m.nama}>
                          <TableCell className="font-medium">{m.nama}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{m.spesialisasi || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={m.status === "Aktif" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {m.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">{m.jumlah}</TableCell>
                          <TableCell className="text-right font-medium text-foreground">
                            {rupiah(m.nilai)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Sparepart Terlaris */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="size-4 text-primary" /> Sparepart Terpakai Periode Ini
                </CardTitle>
                <CardDescription>
                  Frekuensi konsumsi sparepart bengkel dalam rentang terpilih.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                {partTerlaris.length === 0 ? (
                  <EmptyState
                    title="Belum ada pemakaian sparepart"
                    description="Belum ada sparepart yang digunakan dalam periode terpilih."
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sparepart</TableHead>
                        <TableHead className="text-right">Terpakai</TableHead>
                        <TableHead className="text-right">Sisa Stok</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {partTerlaris.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.nama}</TableCell>
                          <TableCell className="text-right font-semibold text-primary">
                            {p.terpakaiPeriode} {p.satuan}
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={
                                p.stok <= 5
                                  ? "font-semibold text-destructive"
                                  : "text-muted-foreground"
                              }
                            >
                              {p.stok} {p.satuan}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: RINCIAN DAFTAR SERVIS DALAM PERIODE TERPILIH */}
        <TabsContent value="rincian" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileBarChart className="size-4 text-primary" /> Daftar Servis ({rentang.label})
              </CardTitle>
              <CardDescription>
                Daftar lengkap servis operasional yang masuk dalam kriteria filter tanggal.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              {data.length === 0 ? (
                <EmptyState
                  title="Tidak ada servis pada periode ini"
                  description="Coba ubah tanggal pada filter di atas atau pilih rentang waktu yang lebih luas."
                  action={
                    <Button variant="outline" size="sm" onClick={resetFilter} className="mt-2">
                      Kembali ke Bulan Ini
                    </Button>
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No. Servis</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Pelanggan</TableHead>
                        <TableHead>Kendaraan</TableHead>
                        <TableHead>Mekanik</TableHead>
                        <TableHead>Jenis Servis</TableHead>
                        <TableHead className="text-right">Total Biaya</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.nomor}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {tanggalPanjang(s.tanggal)}
                          </TableCell>
                          <TableCell>{s.pelanggan || "Pelanggan Umum"}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {s.kendaraan || "—"} {s.plat ? `(${s.plat})` : ""}
                          </TableCell>
                          <TableCell className="font-medium">{s.mekanik || "—"}</TableCell>
                          <TableCell>{s.jenis || "Servis Reguler"}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {rupiah(s.total)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={s.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
>>>>>>> b897868 (Initial commit - AppBenk)
    </>
  );
}
