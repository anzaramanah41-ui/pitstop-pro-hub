import { useEffect, useState, useRef } from "react";
import {
  LifeBuoy,
  MessageSquare,
  Send,
  AlertTriangle,
  Phone,
  Clock,
  CheckCircle2,
  HelpCircle,
  Eye,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth, LABEL_ROLE } from "@/lib/auth";
import { useStore, tanggalPanjang } from "@/lib/store";
import { customerServiceTicketService } from "@/services/appbenk-service";
import type { CSTicketRow, CSMessageRow, StatusCSTicket } from "@/types/database";

const STATUS_BADGES: Record<string, { class: string; label: string }> = {
  Baru: {
    class: "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold",
    label: "Baru",
  },
  Diproses: {
    class: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold",
    label: "Diproses",
  },
  "Menunggu Balasan": {
    class: "border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold",
    label: "Menunggu Balasan",
  },
  Menunggu: {
    class: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold",
    label: "Menunggu",
  },
  Selesai: {
    class: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold",
    label: "Selesai",
  },
};

const KATEGORI_PILIHAN = [
  "Bug / Error",
  "Pembayaran",
  "Booking Servis",
  "Akun / Login",
  "Fitur Aplikasi",
  "Google Maps",
  "Pertanyaan",
  "Lainnya",
];

const KANAL = [
  {
    icon: Phone,
    judul: "Hubungi Customer Service",
    detail: "0800-1234-5678 · Senin–Sabtu, 08.00–17.00 WIB",
  },
  { icon: MessageSquare, judul: "Chat / Tiket Bantuan", detail: "Kirim pesan lewat formulir di samping" },
  { icon: LifeBuoy, judul: "Pertanyaan Operasional", detail: "Konsultasi seputar fitur & panduan aplikasi" },
  { icon: AlertTriangle, judul: "Laporkan Bug / Kendala", detail: "Kendala teknis langsung diteruskan ke tim pengembang" },
];

export function CustomerServicePage() {
  const { user } = useAuth();
  const { bengkelAktif } = useStore();

  const [form, setForm] = useState({ subjek: "", kategori: "", pesan: "" });
  const [err, setErr] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const [myTickets, setMyTickets] = useState<CSTicketRow[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  // Dialog Detail Tiket & Chat
  const [selectedTicket, setSelectedTicket] = useState<CSTicketRow | null>(null);
  const [messages, setMessages] = useState<CSMessageRow[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const loadMyTickets = async () => {
    if (!user) return;
    try {
      const tickets = await customerServiceTicketService.getMyTickets(user.id, user.email);
      setMyTickets(tickets);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    loadMyTickets();
  }, [user]);

  const openTicketDetail = async (ticket: CSTicketRow) => {
    setSelectedTicket(ticket);
    setReplyText("");
    setLoadingMessages(true);
    try {
      const msgs = await customerServiceTicketService.getTicketMessages(ticket.id);
      setMessages(msgs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKirimPesan = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof err = {};
    if (!form.subjek.trim()) next.subjek = "Subjek wajib diisi.";
    if (!form.kategori) next.kategori = "Pilih kategori masalah.";
    if (!form.pesan.trim()) next.pesan = "Pesan wajib diisi.";
    setErr(next);
    if (Object.keys(next).length > 0) return;

    if (!user) {
      toast.error("Silakan login terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await customerServiceTicketService.createTicket({
        userId: user.id,
        userName: user.nama || "Pengguna AppBenk",
        userEmail: user.email || "",
        userRole: user.role,
        bengkelId: bengkelAktif?.id,
        bengkelNama: bengkelAktif?.nama,
        subjek: form.subjek.trim(),
        kategori: form.kategori,
        pesan: form.pesan.trim(),
      });

      toast.success(`Pesan berhasil dikirim — Tiket ${created.ticket_number || "CS-Baru"}`);
      setForm({ subjek: "", kategori: "", pesan: "" });
      loadMyTickets();
    } catch (e: any) {
      toast.error(e?.message || "Gagal mengirim tiket bantuan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendFollowUp = async () => {
    if (!selectedTicket || !replyText.trim() || !user) return;

    setSendingReply(true);
    try {
      await customerServiceTicketService.sendMessage({
        ticketId: selectedTicket.id,
        senderUserId: user.id,
        senderRole: user.role as any,
        senderName: user.nama || "Pengguna",
        message: replyText.trim(),
        updateTicketStatusTo: "Diproses",
      });

      toast.success("Balasan terkirim ke tim AppBenk!");
      setReplyText("");

      const updatedMsgs = await customerServiceTicketService.getTicketMessages(selectedTicket.id);
      setMessages(updatedMsgs);
      loadMyTickets();
    } catch (e: any) {
      toast.error(e?.message || "Gagal mengirim pesan.");
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Customer Service AppBenk"
        description="Pusat bantuan & pelaporan kendala teknis. Ajukan pertanyaan, laporkan bug, atau sampaikan saran langsung ke tim pengelola platform AppBenk."
        action={
          <Button variant="outline" size="sm" onClick={loadMyTickets} className="gap-2 text-xs">
            <RefreshCw className="size-3.5" /> Segarkan
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Kanal Bantuan Resmi</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {KANAL.map((k) => (
                <div key={k.judul} className="flex items-start gap-3 rounded-md border p-3">
                  <k.icon className="mt-0.5 size-4 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">{k.judul}</p>
                    <p className="text-xs text-muted-foreground">{k.detail}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Kirim Tiket Bantuan</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleKirimPesan} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Subjek</Label>
                  <Input
                    value={form.subjek}
                    maxLength={100}
                    onChange={(e) => setForm({ ...form, subjek: e.target.value })}
                    placeholder="Contoh: Kendala pembayaran QRIS / bug peta"
                  />
                  {err.subjek && <p className="text-xs text-destructive">{err.subjek}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label>Kategori Masalah</Label>
                  <Select
                    value={form.kategori}
                    onValueChange={(v) => setForm({ ...form, kategori: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori kendala" />
                    </SelectTrigger>
                    <SelectContent>
                      {KATEGORI_PILIHAN.map((k) => (
                        <SelectItem key={k} value={k}>
                          {k}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {err.kategori && <p className="text-xs text-destructive">{err.kategori}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label>Pesan / Detail Masalah</Label>
                  <Textarea
                    rows={4}
                    maxLength={1000}
                    value={form.pesan}
                    onChange={(e) => setForm({ ...form, pesan: e.target.value })}
                    placeholder="Jelaskan secara detail kendala yang dialami, langkah yang dilakukan, atau pesan error yang muncul..."
                  />
                  {err.pesan && <p className="text-xs text-destructive">{err.pesan}</p>}
                </div>

                <Button type="submit" disabled={submitting} className="w-full gap-2">
                  <Send className="size-4" /> {submitting ? "Mengirim ke CS..." : "Kirim Pesan"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* TIKET SAYA */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Tiket Saya</CardTitle>
            <Badge variant="outline" className="text-xs">
              {myTickets.length} Tiket
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3 flex-1 overflow-y-auto max-h-[680px]">
            {loadingTickets ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                Memuat riwayat tiket...
              </div>
            ) : myTickets.length === 0 ? (
              <EmptyState
                title="Belum ada tiket bantuan"
                description="Tiket bantuan yang Anda kirim akan tersimpan di sini dan langsung ditinjau oleh tim pengelola AppBenk."
              />
            ) : (
              myTickets.map((t) => {
                const badgeInfo = STATUS_BADGES[t.status] || STATUS_BADGES.Baru;
                return (
                  <div
                    key={t.id}
                    onClick={() => openTicketDetail(t)}
                    className="cursor-pointer space-y-2 rounded-lg border p-3.5 transition-colors hover:border-primary/50 hover:bg-muted/30"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10">
                          {t.ticket_number || "CS-0000"}
                        </span>
                        <p className="text-sm font-semibold line-clamp-1">{t.subjek}</p>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${badgeInfo.class}`}>
                        {badgeInfo.label}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{t.kategori}</span>
                      <span>
                        {t.created_at
                          ? new Date(t.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </span>
                    </div>

                    <p className="text-xs text-foreground/80 line-clamp-2 bg-muted/20 p-2 rounded">
                      {t.pesan}
                    </p>

                    <div className="flex items-center justify-end pt-1">
                      <span className="text-[11px] font-medium text-primary flex items-center gap-1 hover:underline">
                        Lihat Percakapan <Eye className="size-3" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* MODAL DETAIL TIKET & CHAT UNTUK PENGGUNA */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
          {selectedTicket && (
            <>
              <div className="border-b p-4 pb-3 bg-muted/20">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                      {selectedTicket.ticket_number || "CS-0000"}
                    </span>
                    <Badge variant="secondary" className="text-[11px]">
                      {selectedTicket.kategori}
                    </Badge>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      STATUS_BADGES[selectedTicket.status]?.class || STATUS_BADGES.Baru.class
                    }`}
                  >
                    {selectedTicket.status}
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm mt-2 text-foreground">{selectedTicket.subjek}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Dikirim pada{" "}
                  {new Date(selectedTicket.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {/* Chat Thread */}
              <div
                ref={chatScrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/30 max-h-[360px]"
              >
                {/* Pesan Awal */}
                <div className="flex flex-col items-start max-w-[85%]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-foreground">Anda</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(selectedTicket.created_at).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-primary/10 text-foreground border border-primary/20 p-3 text-xs leading-relaxed shadow-sm">
                    {selectedTicket.pesan}
                  </div>
                </div>

                {/* Riwayat Balasan */}
                {messages
                  .filter((m) => m.message !== selectedTicket.pesan)
                  .map((m) => {
                    const isMe = m.sender_user_id === user?.id;
                    const isSuperAdmin = m.sender_role === "super_admin";

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? "items-start" : "items-end"} max-w-[85%] ${
                          isMe ? "mr-auto" : "ml-auto"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {!isMe && (
                            <span className="text-xs font-semibold text-foreground">
                              {isSuperAdmin ? "Tim CS AppBenk" : m.sender_name}
                            </span>
                          )}
                          <Badge
                            variant="outline"
                            className={`text-[9px] px-1 py-0 ${
                              isSuperAdmin
                                ? "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                                : ""
                            }`}
                          >
                            {isSuperAdmin ? "Super Admin" : isMe ? "Anda" : m.sender_role}
                          </Badge>
                          {isMe && <span className="text-xs font-semibold text-foreground">Anda</span>}
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(m.created_at).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div
                          className={`rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                            isMe
                              ? "rounded-tl-sm bg-primary/10 border border-primary/20 text-foreground"
                              : "rounded-tr-sm bg-white dark:bg-slate-900 border text-foreground"
                          }`}
                        >
                          {m.message}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Form Balas */}
              <div className="border-t p-3 bg-background space-y-2">
                <Textarea
                  placeholder="Ketik pesan tambahan atau respon untuk CS AppBenk..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={2}
                  className="text-xs resize-none"
                  disabled={sendingReply}
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    className="h-7 text-xs gap-1.5 px-3"
                    disabled={sendingReply || !replyText.trim()}
                    onClick={handleSendFollowUp}
                  >
                    <Send className="size-3" /> {sendingReply ? "Mengirim..." : "Kirim Respon"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
