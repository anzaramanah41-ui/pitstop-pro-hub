import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/_shell/pengaturan")({
  head: () => ({
    meta: [
      { title: "Pengaturan — Bengkel Pitstop" },
      { name: "description", content: "Atur identitas bengkel, profil pengguna, dan preferensi aplikasi." },
      { property: "og:title", content: "Pengaturan — Bengkel Pitstop" },
      { property: "og:description", content: "Identitas bengkel dan preferensi aplikasi." },
    ],
  }),
  component: PengaturanPage,
});

function PengaturanPage() {
  const [nama, setNama] = useState("Bengkel Pitstop");
  const [telepon, setTelepon] = useState("022-7788990");
  const [alamat, setAlamat] = useState("Jl. Soekarno Hatta No. 210, Bandung");
  const [notif, setNotif] = useState(true);

  return (
    <>
      <PageHeader title="Pengaturan" description="Identitas bengkel dan preferensi aplikasi." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Identitas Bengkel</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nama Bengkel</Label>
              <Input value={nama} onChange={(e) => setNama(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Nomor Telepon</Label>
              <Input value={telepon} onChange={(e) => setTelepon(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Alamat</Label>
              <Input value={alamat} onChange={(e) => setAlamat(e.target.value)} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Notifikasi servis selesai</p>
                <p className="text-xs text-muted-foreground">Tampilkan pemberitahuan saat status servis berubah.</p>
              </div>
              <Switch checked={notif} onCheckedChange={setNotif} />
            </div>
            <Button onClick={() => toast.success("Pengaturan disimpan")}>Simpan Perubahan</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Profil Pengguna</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <BrandLogo size={44} />
              <div>
                <p className="font-semibold">Admin Bengkel</p>
                <p className="text-muted-foreground">admin@pitstop.id</p>
              </div>
            </div>
            <Separator />
            <p className="text-muted-foreground">
              Peran: <span className="font-medium text-foreground">Admin</span>
            </p>
            <p className="text-muted-foreground">
              Mode data: <span className="font-medium text-foreground">Demo (mock data)</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
