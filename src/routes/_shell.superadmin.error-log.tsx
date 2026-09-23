import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  Terminal,
  RefreshCw,
  Building2,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { systemLogService } from "@/services/appbenk-service";
import type { SystemLogRow, StatusSystemLog } from "@/types/database";

export const Route = createFileRoute("/_shell/superadmin/error-log")({
  head: () => ({
    meta: [
      { title: "Monitor Error Sistem — Super Admin AppBenk" },
      {
        name: "description",
        content: "Pantau kendala teknis dan log sistem integrasi platform AppBenk.",
      },
    ],
  }),
  component: SuperAdminErrorLogPage,
});

function SuperAdminErrorLogPage() {
  const [logs, setLogs] = useState<SystemLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"semua" | StatusSystemLog>("semua");
  const [filterModule, setFilterModule] = useState<string>("semua");

  // Modal Detail Error
  const [selectedLog, setSelectedLog] = useState<SystemLogRow | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const loadLogs = async () => {
    try {
      const data = await systemLogService.getAllLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const modules = useMemo(() => {
    const set = new Set(logs.map((l) => l.module));
    return Array.from(set);
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchSearch =
        l.error_message.toLowerCase().includes(search.toLowerCase()) ||
        l.module.toLowerCase().includes(search.toLowerCase()) ||
        (l.bengkel_nama && l.bengkel_nama.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = filterStatus === "semua" || l.status === filterStatus;
      const matchModule = filterModule === "semua" || l.module === filterModule;

      return matchSearch && matchStatus && matchModule;
    });
  }, [logs, search, filterStatus, filterModule]);

  const handleUpdateStatus = async (logId: string, status: StatusSystemLog) => {
    const ok = await systemLogService.updateLogStatus(logId, status);
    if (ok) {
      toast.success(`Status error diperbarui menjadi ${status}`);
      if (selectedLog && selectedLog.id === logId) {
        setSelectedLog({ ...selectedLog, status });
      }
      loadLogs();
    }
  };

  return (
    <>
      <PageHeader
        title="Monitor Error Sistem"
        description="Pemantauan log kegagalan sistem, integrasi pihak ketiga (Google Maps, Payment Gateway, WhatsApp API), dan investigasi teknis."
        action={
          <Button variant="outline" size="sm" onClick={loadLogs} className="gap-2 text-xs">
            <RefreshCw className="size-3.5" /> Refresh Log
          </Button>
        }
      />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Cari pesan error, modul, bengkel..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
                <SelectTrigger className="w-32 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Status</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Investigasi">Investigasi</SelectItem>
                  <SelectItem value="Selesai">Selesai</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterModule} onValueChange={(v) => setFilterModule(v)}>
                <SelectTrigger className="w-36 text-xs">
                  <SelectValue placeholder="Modul" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Modul</SelectItem>
                  {modules.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 text-xs">
                <TableHead className="font-semibold">Waktu Kejadian</TableHead>
                <TableHead className="font-semibold">Bengkel Terkait</TableHead>
                <TableHead className="font-semibold">Modul</TableHead>
                <TableHead className="font-semibold">Pesan Error</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-xs text-muted-foreground">
                    Tidak ada error sistem yang tercatat.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => {
                  const isOpen = log.status === "Open";
                  const isInvestigasi = log.status === "Investigasi";

                  return (
                    <TableRow key={log.id} className="text-xs">
                      <TableCell className="font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 font-medium">
                          <Building2 className="size-3.5 text-muted-foreground" />
                          <span>{log.bengkel_nama || "AppBenk"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-semibold">
                          {log.module}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate font-medium text-foreground">
                        {log.error_message}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            isOpen
                              ? "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300 animate-pulse"
                              : isInvestigasi
                              ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                              : "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          }`}
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => {
                            setSelectedLog(log);
                            setDetailModalOpen(true);
                          }}
                        >
                          <Eye className="size-3.5 mr-1" /> Investigasi
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* MODAL INVESTIGASI DETAIL ERROR */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Terminal className="size-5 text-rose-600" /> Investigasi Error Sistem
            </DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground text-[10px] uppercase font-semibold">Modul Layanan</p>
                  <p className="mt-1 font-bold text-sm text-foreground">{selectedLog.module}</p>
                  <p className="text-[11px] text-muted-foreground">{selectedLog.bengkel_nama}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground text-[10px] uppercase font-semibold">Waktu Tercatat</p>
                  <p className="mt-1 font-mono text-xs font-semibold">
                    {new Date(selectedLog.created_at).toLocaleString("id-ID")}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="text-muted-foreground text-[11px]">Status:</span>
                    <Badge variant="outline">{selectedLog.status}</Badge>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <p className="font-semibold text-destructive text-xs mb-1">Pesan Error</p>
                <p className="font-mono text-xs text-foreground bg-card p-2 rounded border break-words">
                  {selectedLog.error_message}
                </p>
              </div>

              {selectedLog.stack_trace && (
                <div className="space-y-1">
                  <p className="font-semibold text-xs text-muted-foreground flex items-center gap-1.5">
                    <Terminal className="size-3.5" /> Stack Trace Teknis (Hanya Super Admin)
                  </p>
                  <pre className="max-h-48 overflow-y-auto rounded-lg bg-slate-950 p-3 font-mono text-[11px] text-slate-200">
                    {selectedLog.stack_trace}
                  </pre>
                </div>
              )}

              <div className="border-t pt-3 flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Ubah Status Investigasi:</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={selectedLog.status === "Investigasi" ? "default" : "outline"}
                    className="h-8 text-xs"
                    onClick={() => handleUpdateStatus(selectedLog.id, "Investigasi")}
                  >
                    Investigasi
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedLog.status === "Selesai" ? "default" : "outline"}
                    className="h-8 text-xs text-emerald-600 hover:text-emerald-700"
                    onClick={() => handleUpdateStatus(selectedLog.id, "Selesai")}
                  >
                    <CheckCircle2 className="size-3.5 mr-1" /> Selesai
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

