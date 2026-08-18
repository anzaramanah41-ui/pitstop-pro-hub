import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, X, Eye, Inbox } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/page-header";
import { SearchBar } from "@/components/search-bar";
import { BookingBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStore, tanggalPanjang, type Booking, type StatusBooking } from "@/lib/store";

const STATUS: StatusBooking[] = ["Menunggu Konfirmasi", "Diterima", "Ditolak"];

export const Route = createFileRoute("/_shell/admin/booking")({
  head: () => ({
    meta: [
      { title: "Booking Masuk — AppBenk" },
      { name: "description", content: "Kelola booking servis dari pelanggan: lihat detail, terima, tolak, atau ubah status booking." },
      { property: "og:title", content: "Booking Masuk — AppBenk" },
      { property: "og:description", content: "Konfirmasi booking pelanggan dengan cepat." },
    ],
  }),
  component: BookingAdmin,
});

function BookingAdmin() {
  const { booking, ubahStatusBooking } = useStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"semua" | StatusBooking>("semua");
  const [detail, setDetail] = useState<Booking | null>(null);

  const data = useMemo(() => {
    const s = q.toLowerCase();
    return booking
      .filter((b) => filter === "semua" || b.status === filter)
      .filter((b) => [b.nomor, b.pelanggan, b.kendaraan, b.plat, b.jenis].some((v) => v.toLowerCase().includes(s)));
  }, [booking, q, filter]);

  return (
    <>
      <PageHeader title="Booking Masuk" description="Konfirmasi permintaan booking servis dari pelanggan." />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <SearchBar value={q} onChange={setQ} placeholder="Cari nomor booking, pelanggan, atau plat..." />
            <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <SelectTrigger className="w-52 bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua status</SelectItem>
                {STATUS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {data.length === 0 ? (
            <EmptyState icon={<Inbox className="size-8" />} title="Tidak ada booking" description="Coba ubah filter atau kata kunci." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Booking</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Kendaraan</TableHead>
                    <TableHead>Jenis Servis</TableHead>
                    <TableHead>Jadwal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.nomor}</TableCell>
                      <TableCell>{b.pelanggan}</TableCell>
                      <TableCell className="text-muted-foreground">{b.kendaraan} · {b.plat}</TableCell>
                      <TableCell>{b.jenis}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {tanggalPanjang(b.tanggal)} · {b.waktu}
                      </TableCell>
                      <TableCell><BookingBadge status={b.status} /></TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" aria-label="Detail" onClick={() => setDetail(b)}>
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Terima booking"
                            disabled={b.status === "Diterima"}
                            onClick={() => {
                              ubahStatusBooking(b.id, "Diterima");
                              toast.success(`Booking ${b.nomor} diterima`);
                            }}
                          >
                            <Check className="size-4 text-success" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Tolak booking"
                            disabled={b.status === "Ditolak"}
                            onClick={() => {
                              ubahStatusBooking(b.id, "Ditolak");
                              toast.info(`Booking ${b.nomor} ditolak`);
                            }}
                          >
                            <X className="size-4 text-destructive" />
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

      <Sheet open={!!detail} onOpenChange={(v) => !v && setDetail(null)}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Detail Booking {detail?.nomor}</SheetTitle>
          </SheetHeader>
          {detail && (
            <div className="space-y-4 px-4 pb-6 text-sm">
              {[
                ["Pelanggan", detail.pelanggan],
                ["Kendaraan", `${detail.kendaraan} · ${detail.plat}`],
                ["Jenis Servis", detail.jenis],
                ["Keluhan", detail.keluhan],
                ["Tanggal", tanggalPanjang(detail.tanggal)],
                ["Waktu", detail.waktu],
                ["Catatan", detail.catatan || "—"],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{k}</p>
                  <p className="mt-0.5">{v}</p>
                </div>
              ))}
              <div>
                <p className="mb-1.5 text-xs uppercase tracking-wide text-muted-foreground">Ubah Status</p>
                <Select
                  value={detail.status}
                  onValueChange={(v) => {
                    ubahStatusBooking(detail.id, v as StatusBooking);
                    setDetail({ ...detail, status: v as StatusBooking });
                    toast.success(`Status booking diperbarui: ${v}`);
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
