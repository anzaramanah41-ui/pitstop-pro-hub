import { useState } from "react";
import { LifeBuoy, MessageSquare, Send, AlertTriangle, Phone } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth, LABEL_ROLE } from "@/lib/auth";
import { useStore, tanggalPanjang, KATEGORI_TIKET, type StatusTiket } from "@/lib/store";

const WARNA: Record<StatusTiket, string> = {
  Menunggu: "bg-warning/15 text-warning-foreground border-warning/40",
  Diproses: "bg-primary/10 text-primary border-primary/40",
  Selesai: "bg-success/15 text-success border-success/40",
};

const KANAL = [
  { icon: Phone, judul: "Hubungi Customer Service", detail: "0800-1234-5678 · Senin–Sabtu, 08.00–17.00" },
  { icon: MessageSquare, judul: "Chat / Pesan", detail: "Kirim pesan lewat formulir di samping" },
  { icon: LifeBuoy, judul: "Kirim Pertanyaan", detail: "Pertanyaan seputar penggunaan aplikasi" },
  { icon: AlertTriangle, judul: "Laporkan Masalah", detail: "Kendala teknis atau bug aplikasi" },
];

export function CustomerServicePage() {
  const { user } = useAuth();
  const { tiket, buatTiket } = useStore();
  const [form, setForm] = useState({ subjek: "", kategori: "", pesan: "" });
  const [err, setErr] = useState<Partial<Record<keyof typeof form, string>>>({});

  const milikSaya = tiket.filter((t) => t.pengirim === (user?.nama ?? ""));

  const kirim = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof err = {};
    if (!form.subjek.trim()) next.subjek = "Subjek wajib diisi.";
    if (!form.kategori) next.kategori = "Pilih kategori masalah.";
    if (!form.pesan.trim()) next.pesan = "Pesan wajib diisi.";
    setErr(next);
    if (Object.keys(next).length) return;

    void (async () => {
      const baru = await buatTiket({
        pengirim: user?.nama ?? "Pengguna",
        peran: user ? LABEL_ROLE[user.role] : "-",
        subjek: form.subjek.trim(),
        kategori: form.kategori,
        pesan: form.pesan.trim(),
      });
      toast.success(`Pesan terkirim — tiket ${baru.nomor}`);
      setForm({ subjek: "", kategori: "", pesan: "" });
    })();
  };

  return (
    <>
      <PageHeader
        title="Customer Service"
        description="Butuh bantuan? Hubungi tim AppBenk untuk mendapatkan bantuan terkait penggunaan aplikasi."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Kanal Bantuan</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {KANAL.map((k) => (
                <div key={k.judul} className="flex items-start gap-3 rounded-md border p-3">
                  <k.icon className="mt-0.5 size-4 text-primary" />
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
              <CardTitle className="text-base">Kirim Pesan</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={kirim} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Subjek</Label>
                  <Input
                    value={form.subjek}
                    maxLength={100}
                    onChange={(e) => setForm({ ...form, subjek: e.target.value })}
                    placeholder="Ringkasan singkat masalah Anda"
                  />
                  {err.subjek && <p className="text-xs text-destructive">{err.subjek}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Kategori Masalah</Label>
                  <Select value={form.kategori} onValueChange={(v) => setForm({ ...form, kategori: v })}>
                    <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                    <SelectContent>
                      {KATEGORI_TIKET.map((k) => (
                        <SelectItem key={k} value={k}>{k}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {err.kategori && <p className="text-xs text-destructive">{err.kategori}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Pesan</Label>
                  <Textarea
                    rows={5}
                    maxLength={1000}
                    value={form.pesan}
                    onChange={(e) => setForm({ ...form, pesan: e.target.value })}
                    placeholder="Jelaskan masalah atau pertanyaan Anda..."
                  />
                  {err.pesan && <p className="text-xs text-destructive">{err.pesan}</p>}
                </div>
                <Button type="submit" className="w-full gap-2">
                  <Send className="size-4" /> Kirim Pesan
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tiket Saya</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {milikSaya.length === 0 ? (
              <EmptyState title="Belum ada tiket" description="Pesan yang Anda kirim akan muncul di sini." />
            ) : (
              milikSaya.map((t) => (
                <div key={t.id} className="space-y-1.5 rounded-md border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold">Ticket #{t.nomor} · {t.subjek}</p>
                    <Badge variant="outline" className={WARNA[t.status]}>{t.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t.kategori} · {tanggalPanjang(t.tanggal)}
                  </p>
                  <p className="text-sm">{t.pesan}</p>
                  {t.balasan && (
                    <p className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                      Balasan tim AppBenk: {t.balasan}
                    </p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
