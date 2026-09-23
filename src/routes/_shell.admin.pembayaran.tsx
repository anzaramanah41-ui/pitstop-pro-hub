import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Wallet,
  QrCode,
  Building2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Eye,
  Clock,
  Banknote,
  Maximize2,
  Download,
  AlertCircle,
  Filter,
  Search,
  FileText,
  Check,
  ExternalLink,
  RefreshCw,
  Phone,
  Mail,
  User,
  Car,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/page-header";
import { SearchBar } from "@/components/search-bar";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/auth";
import { useStore, rupiah, tanggalPanjang, type Pembayaran, type Servis } from "@/lib/store";

export const Route = createFileRoute("/_shell/admin/pembayaran")({
  validateSearch: (search: Record<string, unknown>): { filter?: string; trx?: string } => {
    const res: { filter?: string; trx?: string } = {};
    if (typeof search["filter"] === "string") res.filter = search["filter"];
    if (typeof search["trx"] === "string") res.trx = search["trx"];
    return res;
  },
  head: () => ({
    meta: [
      { title: "Verifikasi Pembayaran — AppBenk" },
      {
        name: "description",
        content: "Daftar dan verifikasi transaksi pembayaran manual QRIS, Transfer, dan Cash oleh Admin Bengkel.",
      },
    ],
  }),
  component: AdminPembayaranPage,
});

type FilterType = "semua" | "menunggu_verifikasi" | "lunas" | "ditolak" | "cash" | "transfer" | "qris";

function AdminPembayaranPage() {
  const { user } = useAuth();
  const search = Route.useSearch();
  const { servis, pembayaran, verifikasiPembayaran, pelanggan, kendaraan } = useStore();

  const workshopId = user?.bengkelId || user?.workshopId || "bengkel-001";

  // State
  const [filter, setFilter] = useState<FilterType>(() => {
    const f = search.filter?.toLowerCase();
    if (f === "menunggu_verifikasi" || f === "lunas" || f === "ditolak" || f === "cash" || f === "transfer" || f === "qris") {
      return f;
    }
    return "semua";
  });
  const [cari, setCari] = useState(search.trx || "");

  // Modal Verifikasi / Detail
  const [selectedPmb, setSelectedPmb] = useState<Pembayaran | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [alasanPenolakan, setAlasanPenolakan] = useState("");
  const [zoomProof, setZoomProof] = useState<string | null>(null);

  // Auto-open if search.trx is present
  useEffect(() => {
    if (search.trx) {
      const match = pembayaran.find((p) => p.noTransaksi === search.trx);
      if (match) {
        setSelectedPmb(match);
        setDetailModalOpen(true);
      }
    }
  }, [search.trx, pembayaran]);

  // Sync filter with URL if needed
  useEffect(() => {
    if (search.filter) {
      const f = search.filter.toLowerCase();
      if (["semua", "menunggu_verifikasi", "lunas", "ditolak", "cash", "transfer", "qris"].includes(f)) {
        setFilter(f as FilterType);
      }
    }
  }, [search.filter]);

  // Filter servis berdasarkan bengkel (Multi-tenant isolation)
  const workshopServis = useMemo(() => {
    return servis.filter((s) => !s.bengkelId || s.bengkelId === workshopId);
  }, [servis, workshopId]);

  const workshopServisIds = useMemo(() => {
    return new Set(workshopServis.map((s) => s.id));
  }, [workshopServis]);

  // Filter pembayaran milik bengkel aktif
  const listPembayaran = useMemo(() => {
    return pembayaran.filter((p) => workshopServisIds.has(p.servisId));
  }, [pembayaran, workshopServisIds]);

  // Perhitungan badge status
  const counts = useMemo(() => {
    return {
      semua: listPembayaran.length,
      menunggu_verifikasi: listPembayaran.filter((p) => p.status === "Menunggu Verifikasi").length,
      lunas: listPembayaran.filter((p) => p.status === "Lunas").length,
      ditolak: listPembayaran.filter((p) => p.status === "Bukti Ditolak").length,
      cash: listPembayaran.filter((p) => p.metode === "Cash").length,
      transfer: listPembayaran.filter((p) => p.metode === "Transfer Bank").length,
      qris: listPembayaran.filter((p) => p.metode === "QRIS").length,
    };
  }, [listPembayaran]);

  // Filter and search
  const filteredData = useMemo(() => {
    let result = listPembayaran;

    if (filter === "menunggu_verifikasi") {
      result = result.filter((p) => p.status === "Menunggu Verifikasi");
    } else if (filter === "lunas") {
      result = result.filter((p) => p.status === "Lunas");
    } else if (filter === "ditolak") {
      result = result.filter((p) => p.status === "Bukti Ditolak");
    } else if (filter === "cash") {
      result = result.filter((p) => p.metode === "Cash");
    } else if (filter === "transfer") {
      result = result.filter((p) => p.metode === "Transfer Bank");
    } else if (filter === "qris") {
      result = result.filter((p) => p.metode === "QRIS");
    }

    if (cari.trim()) {
      const q = cari.toLowerCase().trim();
      result = result.filter((p) => {
        const srv = workshopServis.find((s) => s.id === p.servisId);
        return (
          p.noTransaksi.toLowerCase().includes(q) ||
          srv?.nomor.toLowerCase().includes(q) ||
          srv?.pelanggan.toLowerCase().includes(q) ||
          srv?.plat.toLowerCase().includes(q) ||
          srv?.kendaraan.toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [listPembayaran, filter, cari, workshopServis]);

  // Selected Service detail
  const currentServis = useMemo(() => {
    if (!selectedPmb) return null;
    return workshopServis.find((s) => s.id === selectedPmb.servisId) || null;
  }, [selectedPmb, workshopServis]);

  // Selected Customer detail
  const currentCustomer = useMemo(() => {
    if (!currentServis) return null;
    return pelanggan.find((c) => c.nama.toLowerCase() === currentServis.pelanggan.toLowerCase()) || null;
  }, [currentServis, pelanggan]);

  const handleOpenPeriksa = (pmb: Pembayaran) => {
    setSelectedPmb(pmb);
    setAlasanPenolakan("");
    setDetailModalOpen(true);
  };

  const handleApprove = () => {
    if (!selectedPmb) return;
    verifikasiPembayaran(selectedPmb.servisId, true, undefined, user?.nama || "Admin");
    toast.success(`Pembayaran transaksi ${selectedPmb.noTransaksi} berhasil disetujui (Lunas).`);
    setConfirmApproveOpen(false);
    setDetailModalOpen(false);
  };

  const handleReject = () => {
    if (!selectedPmb) return;
    if (!alasanPenolakan.trim()) {
      toast.error("Alasan penolakan pembayaran wajib diisi.");
      return;
    }
    verifikasiPembayaran(selectedPmb.servisId, false, alasanPenolakan.trim(), user?.nama || "Admin");
    toast.info(`Pembayaran transaksi ${selectedPmb.noTransaksi} telah ditolak.`);
    setRejectModalOpen(false);
    setDetailModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verifikasi Pembayaran Bengkel"
        description="Kelola dan lakukan persetujuan manual (manual approval) untuk pembayaran QRIS, Transfer Bank, dan Cash."
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border bg-muted/30 p-1.5">
          <Button
            variant={filter === "semua" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("semua")}
            className="h-8 gap-1.5 text-xs font-medium"
          >
            Semua
            <Badge variant={filter === "semua" ? "secondary" : "outline"} className="text-[10px] px-1.5">
              {counts.semua}
            </Badge>
          </Button>
          <Button
            variant={filter === "menunggu_verifikasi" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("menunggu_verifikasi")}
            className="h-8 gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400"
          >
            <Clock className="size-3.5" />
            Menunggu Verifikasi
            <Badge variant="destructive" className="text-[10px] px-1.5">
              {counts.menunggu_verifikasi}
            </Badge>
          </Button>
          <Button
            variant={filter === "lunas" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("lunas")}
            className="h-8 gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
          >
            <CheckCircle2 className="size-3.5" />
            Lunas
            <Badge variant={filter === "lunas" ? "secondary" : "outline"} className="text-[10px] px-1.5">
              {counts.lunas}
            </Badge>
          </Button>
          <Button
            variant={filter === "ditolak" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("ditolak")}
            className="h-8 gap-1.5 text-xs font-medium text-destructive"
          >
            <XCircle className="size-3.5" />
            Ditolak
            <Badge variant={filter === "ditolak" ? "secondary" : "outline"} className="text-[10px] px-1.5">
              {counts.ditolak}
            </Badge>
          </Button>
          <div className="h-4 w-px bg-border mx-1 hidden sm:block" />
          <Button
            variant={filter === "qris" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("qris")}
            className="h-8 gap-1 text-xs"
          >
            <QrCode className="size-3.5" /> QRIS ({counts.qris})
          </Button>
          <Button
            variant={filter === "transfer" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("transfer")}
            className="h-8 gap-1 text-xs"
          >
            <Building2 className="size-3.5" /> Transfer ({counts.transfer})
          </Button>
          <Button
            variant={filter === "cash" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("cash")}
            className="h-8 gap-1 text-xs"
          >
            <Banknote className="size-3.5" /> Cash ({counts.cash})
          </Button>
        </div>

        <div className="w-full sm:w-72">
          <SearchBar
            value={cari}
            onChange={setCari}
            placeholder="Cari transaksi, servis, pelanggan..."
          />
        </div>
      </div>

      {/* Tabel Pembayaran */}
      <Card>
        <CardContent className="p-0">
          {filteredData.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<Wallet className="size-12 stroke-[1.5] text-muted-foreground" />}
                title="Tidak Ada Data Transaksi"
                description={
                  cari
                    ? `Tidak ditemukan transaksi pembayaran yang sesuai dengan kata kunci "${cari}".`
                    : "Belum ada transaksi pembayaran pada kategori filter yang dipilih."
                }
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Nomor Transaksi</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Kendaraan</TableHead>
                  <TableHead>Nomor Servis</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((pmb) => {
                  const srv = workshopServis.find((s) => s.id === pmb.servisId);
                  const isPending = pmb.status === "Menunggu Verifikasi";
                  const isLunas = pmb.status === "Lunas";
                  const isDitolak = pmb.status === "Bukti Ditolak";

                  return (
                    <TableRow key={pmb.id} className={isPending ? "bg-amber-500/5 font-medium" : ""}>
                      <TableCell className="font-mono font-bold text-xs">
                        {pmb.noTransaksi}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-foreground block">
                          {srv?.pelanggan || "—"}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {srv?.jenis || "Servis"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="block text-xs font-medium">
                          {srv?.kendaraan || "Kendaraan"}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground uppercase">
                          {srv?.plat || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {srv?.nomor || "—"}
                      </TableCell>
                      <TableCell>
                        {pmb.metode === "QRIS" && (
                          <Badge variant="outline" className="gap-1 border-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-950/30">
                            <QrCode className="size-3" /> QRIS
                          </Badge>
                        )}
                        {pmb.metode === "Transfer Bank" && (
                          <Badge variant="outline" className="gap-1 border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/30">
                            <Building2 className="size-3" /> Transfer
                          </Badge>
                        )}
                        {pmb.metode === "Cash" && (
                          <Badge variant="outline" className="gap-1 border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30">
                            <Banknote className="size-3" /> Cash
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-bold text-sm text-foreground">
                        {rupiah(pmb.totalBayar)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {tanggalPanjang(pmb.tanggalBayar)}
                      </TableCell>
                      <TableCell>
                        {isPending && (
                          <Badge className="bg-amber-500 hover:bg-amber-600 text-white gap-1 animate-pulse">
                            <Clock className="size-3" /> Menunggu Verifikasi
                          </Badge>
                        )}
                        {isLunas && (
                          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
                            <CheckCircle2 className="size-3" /> Lunas
                          </Badge>
                        )}
                        {isDitolak && (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="size-3" /> Ditolak
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isPending ? (
                          <Button
                            size="sm"
                            onClick={() => handleOpenPeriksa(pmb)}
                            className="gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs"
                          >
                            <ShieldCheck className="size-3.5" />
                            Periksa
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenPeriksa(pmb)}
                            className="gap-1.5 text-xs"
                          >
                            <Eye className="size-3.5" />
                            Detail
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── DETAIL VERIFIKASI ADMIN DIALOG ────────────────────────── */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              Detail Verifikasi Pembayaran
            </DialogTitle>
          </DialogHeader>

          {selectedPmb && currentServis && (
            <div className="space-y-6 py-2 text-sm">
              {/* Status Header Banner */}
              <div className="flex items-center justify-between rounded-xl border p-3.5 bg-muted/30">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                    Status Pembayaran
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    {selectedPmb.status === "Menunggu Verifikasi" && (
                      <Badge className="bg-amber-500 text-white gap-1">
                        <Clock className="size-3" /> Menunggu Verifikasi Admin
                      </Badge>
                    )}
                    {selectedPmb.status === "Lunas" && (
                      <Badge className="bg-emerald-600 text-white gap-1">
                        <CheckCircle2 className="size-3" /> Pembayaran Lunas
                      </Badge>
                    )}
                    {selectedPmb.status === "Bukti Ditolak" && (
                      <Badge variant="destructive" className="gap-1">
                        <XCircle className="size-3" /> Pembayaran Ditolak
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      Tanggal: {tanggalPanjang(selectedPmb.tanggalBayar)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                    Total Pembayaran
                  </span>
                  <span className="font-extrabold text-lg text-primary">
                    {rupiah(selectedPmb.totalBayar)}
                  </span>
                </div>
              </div>

              {/* Data Pelanggan & Servis */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border p-3.5 bg-card space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <User className="size-3.5 text-primary" /> Informasi Pelanggan
                  </h4>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-sm text-foreground">{currentServis.pelanggan}</p>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Mail className="size-3" /> {currentCustomer?.email || "email@pelanggan.com"}
                    </p>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Phone className="size-3" /> {currentCustomer?.telepon || "—"}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border p-3.5 bg-card space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Car className="size-3.5 text-primary" /> Kendaraan & Servis
                  </h4>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-sm text-foreground">{currentServis.kendaraan}</p>
                    <p className="font-mono text-muted-foreground">Plat: {currentServis.plat}</p>
                    <p className="text-muted-foreground">No. Servis: <span className="font-mono">{currentServis.nomor}</span></p>
                  </div>
                </div>
              </div>

              {/* Rincian Transaksi */}
              <div className="rounded-xl border p-3.5 space-y-2 bg-muted/10">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Nomor Transaksi:</span>
                    <span className="font-mono font-bold text-foreground text-sm">{selectedPmb.noTransaksi}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Metode Pembayaran:</span>
                    <span className="font-semibold text-foreground text-sm flex items-center gap-1 mt-0.5">
                      {selectedPmb.metode === "QRIS" && <QrCode className="size-4 text-purple-600" />}
                      {selectedPmb.metode === "Transfer Bank" && <Building2 className="size-4 text-blue-600" />}
                      {selectedPmb.metode === "Cash" && <Banknote className="size-4 text-emerald-600" />}
                      {selectedPmb.metode}
                    </span>
                  </div>
                </div>

                {selectedPmb.verifiedBy && (
                  <div className="pt-2 border-t text-[11px] text-muted-foreground flex items-center justify-between">
                    <span>Diverifikasi oleh: <strong className="text-foreground">{selectedPmb.verifiedBy}</strong></span>
                    {selectedPmb.verifiedAt && <span>Waktu: {new Date(selectedPmb.verifiedAt).toLocaleString("id-ID")}</span>}
                  </div>
                )}

                {selectedPmb.alasanTolak && (
                  <div className="pt-2 border-t text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg">
                    <strong>Alasan Penolakan:</strong> {selectedPmb.alasanTolak}
                  </div>
                )}
              </div>

              {/* Bukti Pembayaran / Cash Info */}
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                  Bukti Pembayaran Pelanggan
                </Label>

                {selectedPmb.metode === "Cash" ? (
                  <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-950 dark:text-emerald-200">
                    <div className="flex items-start gap-3">
                      <Banknote className="size-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-sm">Pembayaran Tunai di Bengkel (Cash)</p>
                        <p className="text-xs mt-1 text-emerald-800 dark:text-emerald-300">
                          Pelanggan memilih bayar tunai langsung di kasir bengkel. Bukti transfer tidak diperlukan.
                          Pastikan uang tunai sejumlah <strong>{rupiah(selectedPmb.totalBayar)}</strong> telah Anda terima di meja kasir sebelum menekan tombol Setujui Pembayaran.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : selectedPmb.buktiUrl ? (
                  <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
                    <div className="relative group max-h-[360px] overflow-hidden rounded-lg border bg-white flex items-center justify-center p-2">
                      <img
                        src={selectedPmb.buktiUrl}
                        alt="Bukti Pembayaran"
                        className="max-h-[340px] w-auto object-contain rounded-md"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Klik perbesar untuk melihat detail struk transfer</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setZoomProof(selectedPmb.buktiUrl || null)}
                        className="gap-1.5 h-7 text-xs"
                      >
                        <Maximize2 className="size-3.5" /> Perbesar Bukti
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">
                    <AlertCircle className="size-6 mx-auto mb-2 text-amber-500 opacity-70" />
                    Pelanggan belum mengunggah bukti pembayaran.
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2 border-t pt-4">
            {selectedPmb?.status === "Menunggu Verifikasi" ? (
              <>
                <Button
                  variant="destructive"
                  onClick={() => setRejectModalOpen(true)}
                  className="gap-1.5 flex-1"
                >
                  <XCircle className="size-4" /> Tolak Pembayaran
                </Button>
                <Button
                  onClick={() => setConfirmApproveOpen(true)}
                  className="gap-1.5 flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="size-4" /> Setujui Pembayaran
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setDetailModalOpen(false)} className="w-full">
                Tutup
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── KONFIRMASI APPROVAL DIALOG ────────────────────────────── */}
      <Dialog open={confirmApproveOpen} onOpenChange={setConfirmApproveOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="size-5" />
              Konfirmasi Persetujuan Pembayaran
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground space-y-2">
            <p>
              Apakah Anda yakin pembayaran ini valid dan ingin menyetujui transaksi{" "}
              <strong className="text-foreground">{selectedPmb?.noTransaksi}</strong> sejumlah{" "}
              <strong className="text-foreground">{rupiah(selectedPmb?.totalBayar || 0)}</strong>?
            </p>
            <p className="text-xs text-muted-foreground bg-muted p-2.5 rounded-lg">
              ⚠️ Setelah disetujui, status pembayaran akan menjadi <strong>Lunas</strong>, status servis akan otomatis diperbarui menjadi <strong>Lunas</strong>, dan notifikasi konfirmasi resmi akan dikirim ke pelanggan.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmApproveOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleApprove} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
              <Check className="size-4" /> Ya, Setujui Transaksi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DIALOG PENOLAKAN PEMBAYARAN ───────────────────────────── */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="size-5" />
              Tolak Pembayaran Pelanggan
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 text-sm">
            <p className="text-muted-foreground text-xs">
              Silakan tuliskan alasan penolakan pembayaran transaksi <strong>{selectedPmb?.noTransaksi}</strong>. Alasan ini akan dikirimkan kepada pelanggan agar dapat melakukan pembayaran ulang.
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="alasan_penolakan" className="font-semibold text-xs text-foreground">
                Alasan Penolakan (Wajib Diisi) *
              </Label>
              <Textarea
                id="alasan_penolakan"
                placeholder="Contoh: Nominal transfer kurang dari total tagihan, bukti transfer buram/tidak terbaca, atau nomor rekening tujuan salah."
                rows={3}
                value={alasanPenolakan}
                onChange={(e) => setAlasanPenolakan(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!alasanPenolakan.trim()}
              className="gap-1.5"
            >
              <XCircle className="size-4" /> Konfirmasi Penolakan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL ZOOM BUKTI PEMBAYARAN ───────────────────────────── */}
      <Dialog open={Boolean(zoomProof)} onOpenChange={(open) => !open && setZoomProof(null)}>
        <DialogContent className="max-w-3xl p-3">
          <DialogHeader className="px-2 pb-2">
            <DialogTitle className="text-sm font-semibold">Tampilan Pembesar Bukti Pembayaran</DialogTitle>
          </DialogHeader>
          {zoomProof && (
            <div className="flex items-center justify-center p-2 bg-black/5 rounded-lg max-h-[80vh] overflow-auto">
              <img src={zoomProof} alt="Bukti Pembayaran Full" className="max-h-[75vh] w-auto object-contain rounded-md" />
            </div>
          )}
          <DialogFooter className="p-2">
            <Button variant="outline" size="sm" onClick={() => setZoomProof(null)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
