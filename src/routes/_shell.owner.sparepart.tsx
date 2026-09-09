import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
<<<<<<< HEAD
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStore, rupiah } from "@/lib/store";
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
import { useStore, rupiah, KATEGORI_PART } from "@/lib/store";
>>>>>>> b897868 (Initial commit - AppBenk)

export const Route = createFileRoute("/_shell/owner/sparepart")({
  head: () => ({
    meta: [
      { title: "Laporan Sparepart — AppBenk" },
<<<<<<< HEAD
      { name: "description", content: "Laporan pemakaian sparepart, nilai stok tersisa, dan peringatan stok menipis di bengkel." },
=======
      {
        name: "description",
        content:
          "Laporan pemakaian sparepart, nilai stok tersisa, dan peringatan stok menipis di bengkel.",
      },
>>>>>>> b897868 (Initial commit - AppBenk)
      { property: "og:title", content: "Laporan Sparepart — AppBenk" },
      { property: "og:description", content: "Pantau pergerakan dan nilai stok sparepart." },
    ],
  }),
  component: LaporanSparepartOwner,
});

function LaporanSparepartOwner() {
  const { sparepart } = useStore();
<<<<<<< HEAD

  const data = sparepart;
=======
  const [kat, setKat] = useState("semua");

  const data = useMemo(
    () => sparepart.filter((p) => kat === "semua" || p.kategori === kat),
    [sparepart, kat],
  );
>>>>>>> b897868 (Initial commit - AppBenk)
  const nilaiStok = data.reduce((a, p) => a + p.harga * p.stok, 0);
  const nilaiTerpakai = data.reduce((a, p) => a + p.harga * p.terpakai, 0);
  const menipis = sparepart.filter((p) => p.stok <= 5);

  return (
    <>
      <PageHeader
        title="Laporan Sparepart"
        description="Pergerakan stok dan nilai persediaan bengkel."
<<<<<<< HEAD
=======
        action={
          <Select value={kat} onValueChange={setKat}>
            <SelectTrigger className="w-52 bg-card">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua kategori</SelectItem>
              {KATEGORI_PART.map((k) => (
                <SelectItem key={k} value={k}>
                  {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
>>>>>>> b897868 (Initial commit - AppBenk)
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Nilai Stok Tersisa", rupiah(nilaiStok)],
          ["Nilai Sparepart Terpakai", rupiah(nilaiTerpakai)],
          ["Item Stok Menipis", `${menipis.length} item`],
        ].map(([l, v]) => (
          <Card key={l} className="border-l-4 border-l-primary">
            <CardContent className="p-5">
<<<<<<< HEAD
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{l}</p>
=======
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {l}
              </p>
>>>>>>> b897868 (Initial commit - AppBenk)
              <p className="mt-2 font-display text-xl font-bold">{v}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {menipis.length > 0 && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex flex-wrap items-center gap-3 p-4 text-sm">
            <AlertTriangle className="size-5 text-destructive" />
            <span className="font-medium">Perlu restock:</span>
<<<<<<< HEAD
            <span className="text-muted-foreground">{menipis.map((p) => `${p.nama} (${p.stok})`).join(" · ")}</span>
=======
            <span className="text-muted-foreground">
              {menipis.map((p) => `${p.nama} (${p.stok})`).join(" · ")}
            </span>
>>>>>>> b897868 (Initial commit - AppBenk)
          </CardContent>
        </Card>
      )}

      <Card>
<<<<<<< HEAD
        <CardHeader className="pb-3"><CardTitle className="text-base">Detail Pergerakan Sparepart</CardTitle></CardHeader>
=======
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Detail Pergerakan Sparepart</CardTitle>
        </CardHeader>
>>>>>>> b897868 (Initial commit - AppBenk)
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Harga</TableHead>
                  <TableHead className="text-right">Terpakai</TableHead>
                  <TableHead className="text-right">Stok</TableHead>
                  <TableHead className="text-right">Nilai Stok</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((p) => (
                  <TableRow key={p.id}>
<<<<<<< HEAD

                    <TableCell className="font-medium">{p.nama}</TableCell>

                    <TableCell className="text-right">{rupiah(p.harga)}</TableCell>
                    <TableCell className="text-right">{p.terpakai}</TableCell>
                    <TableCell className="text-right">
                      <span className={p.stok <= 5 ? "font-semibold text-destructive" : ""}>{p.stok}</span>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{rupiah(p.harga * p.stok)}</TableCell>
=======
                    <TableCell className="text-muted-foreground">{p.kode}</TableCell>
                    <TableCell className="font-medium">{p.nama}</TableCell>
                    <TableCell className="text-muted-foreground">{p.kategori}</TableCell>
                    <TableCell className="text-right">{rupiah(p.harga)}</TableCell>
                    <TableCell className="text-right">{p.terpakai}</TableCell>
                    <TableCell className="text-right">
                      <span className={p.stok <= 5 ? "font-semibold text-destructive" : ""}>
                        {p.stok}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {rupiah(p.harga * p.stok)}
                    </TableCell>
>>>>>>> b897868 (Initial commit - AppBenk)
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
