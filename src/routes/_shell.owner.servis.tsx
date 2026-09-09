import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
<<<<<<< HEAD
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
>>>>>>> b897868 (Initial commit - AppBenk)
import { useStore, rupiah, tanggalPanjang, JENIS_SERVIS } from "@/lib/store";

export const Route = createFileRoute("/_shell/owner/servis")({
  head: () => ({
    meta: [
      { title: "Laporan Servis — AppBenk" },
<<<<<<< HEAD
      { name: "description", content: "Laporan servis bengkel berdasarkan jenis pekerjaan, nilai transaksi, dan status penyelesaian." },
=======
      {
        name: "description",
        content:
          "Laporan servis bengkel berdasarkan jenis pekerjaan, nilai transaksi, dan status penyelesaian.",
      },
>>>>>>> b897868 (Initial commit - AppBenk)
      { property: "og:title", content: "Laporan Servis — AppBenk" },
      { property: "og:description", content: "Analisis jenis servis paling menguntungkan." },
    ],
  }),
  component: LaporanServisOwner,
});

function LaporanServisOwner() {
  const { servis } = useStore();
  const [jenis, setJenis] = useState("semua");

<<<<<<< HEAD
  const data = useMemo(() => servis.filter((s) => jenis === "semua" || s.jenis === jenis), [servis, jenis]);
=======
  const data = useMemo(
    () => servis.filter((s) => jenis === "semua" || s.jenis === jenis),
    [servis, jenis],
  );
>>>>>>> b897868 (Initial commit - AppBenk)

  const perJenis = JENIS_SERVIS.map((j) => {
    const list = servis.filter((s) => s.jenis === j);
    return { j, jumlah: list.length, nilai: list.reduce((a, s) => a + s.total, 0) };
  })
    .filter((x) => x.jumlah > 0)
    .sort((a, b) => b.nilai - a.nilai);

  return (
    <>
      <PageHeader
        title="Laporan Servis"
        description="Distribusi pekerjaan dan nilai servis bengkel."
        action={
          <Select value={jenis} onValueChange={setJenis}>
<<<<<<< HEAD
            <SelectTrigger className="w-52 bg-card"><SelectValue placeholder="Jenis servis" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua jenis</SelectItem>
              {JENIS_SERVIS.map((j) => (
                <SelectItem key={j} value={j}>{j}</SelectItem>
=======
            <SelectTrigger className="w-52 bg-card">
              <SelectValue placeholder="Jenis servis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua jenis</SelectItem>
              {JENIS_SERVIS.map((j) => (
                <SelectItem key={j} value={j}>
                  {j}
                </SelectItem>
>>>>>>> b897868 (Initial commit - AppBenk)
              ))}
            </SelectContent>
          </Select>
        }
      />

      <Card>
<<<<<<< HEAD
        <CardHeader className="pb-3"><CardTitle className="text-base">Ringkasan per Jenis Servis</CardTitle></CardHeader>
=======
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ringkasan per Jenis Servis</CardTitle>
        </CardHeader>
>>>>>>> b897868 (Initial commit - AppBenk)
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {perJenis.map((x) => (
            <div key={x.j} className="rounded-md border p-4">
              <p className="text-sm font-semibold">{x.j}</p>
              <p className="mt-1 font-display text-xl font-bold">{rupiah(x.nilai)}</p>
              <p className="text-xs text-muted-foreground">{x.jumlah} pekerjaan</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
<<<<<<< HEAD
        <CardHeader className="pb-3"><CardTitle className="text-base">Detail Servis</CardTitle></CardHeader>
=======
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Detail Servis</CardTitle>
        </CardHeader>
>>>>>>> b897868 (Initial commit - AppBenk)
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Servis</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Mekanik</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.nomor}</TableCell>
<<<<<<< HEAD
                    <TableCell className="whitespace-nowrap text-muted-foreground">{tanggalPanjang(s.tanggal)}</TableCell>
                    <TableCell>{s.pelanggan}</TableCell>
                    <TableCell>{s.jenis}</TableCell>
                    <TableCell>{s.mekanik}</TableCell>
                    <TableCell><StatusBadge status={s.status} /></TableCell>
=======
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {tanggalPanjang(s.tanggal)}
                    </TableCell>
                    <TableCell>{s.pelanggan}</TableCell>
                    <TableCell>{s.jenis}</TableCell>
                    <TableCell>{s.mekanik}</TableCell>
                    <TableCell>
                      <StatusBadge status={s.status} />
                    </TableCell>
>>>>>>> b897868 (Initial commit - AppBenk)
                    <TableCell className="text-right font-semibold">{rupiah(s.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
