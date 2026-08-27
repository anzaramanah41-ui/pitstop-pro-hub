import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Repeat2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { useAuth, LABEL_ROLE, HOME_ROLE } from "@/lib/auth";

export const Route = createFileRoute("/_shell/profil")({
  head: () => ({
    meta: [
      { title: "Profil Pengguna — AppBenk" },
      { name: "description", content: "Kelola data profil akun, informasi kontak, dan lihat hak akses sesuai peran pengguna." },
      { property: "og:title", content: "Profil Pengguna — AppBenk" },
      { property: "og:description", content: "Data akun dan hak akses Anda di AppBenk." },
    ],
  }),
  component: ProfilPage,
});

function ProfilPage() {
  const { user, mode, gantiMode } = useAuth();
  const navigate = useNavigate();
  const owner = user?.role === "owner";
  const modeAdmin = owner && mode === "admin";
  const [nama, setNama] = useState(user?.nama ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [telepon, setTelepon] = useState("0812-3344-5566");

  return (
    <>
      <PageHeader title="Profil Pengguna" description="Informasi akun dan hak akses Anda." />

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Data Akun</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="nama">Nama Lengkap</Label>
              <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telepon">Telepon</Label>
              <Input id="telepon" value={telepon} onChange={(e) => setTelepon(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Peran</Label>
              <Input readOnly value={user ? LABEL_ROLE[user.role] : ""} className="bg-muted" />
            </div>
            <div className="sm:col-span-2">
              <Button onClick={() => toast.success("Profil disimpan (mode demo)")}>Simpan Perubahan</Button>
            </div>
          </CardContent>
        </Card>

        {owner && (
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Repeat2 className="size-4 text-primary" /> Mode Tampilan
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-muted-foreground">
                Role: <span className="font-semibold text-foreground">Owner</span> · Saat ini{" "}
                <span className="font-semibold text-foreground">
                  {modeAdmin ? "Mode Admin Bengkel" : "Mode Owner"}
                </span>
              </p>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  const next = modeAdmin ? "owner" : "admin";
                  gantiMode(next);
                  toast.success(next === "admin" ? "Beralih ke Mode Admin Bengkel" : "Beralih ke Mode Owner");
                  navigate({ to: next === "admin" ? HOME_ROLE.admin : HOME_ROLE.owner });
                }}
              >
                <Repeat2 className="size-4" />
                {modeAdmin ? "Switch to Owner Mode" : "Switch to Admin Mode"}
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="size-4 text-primary" /> Hak Akses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(user?.role === "pelanggan"
              ? ["Booking servis kendaraan", "Melihat status & estimasi servis", "Pembayaran servis", "Riwayat servis pribadi"]
              : user?.role === "admin"
                ? ["Konfirmasi booking pelanggan", "Kelola operasional servis", "Kelola sparepart & pricelist", "Laporan operasional bengkel"]
                : [
                    "Semua akses Admin Bengkel (booking, servis, sparepart, laporan)",
                    "Dashboard bisnis menyeluruh",
                    "Laporan servis, sparepart & pelanggan",
                    "Laporan keuntungan (premium · perlu review)",
                  ]
            ).map((h) => (
              <p key={h} className="rounded-md border bg-muted/40 px-3 py-2">{h}</p>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
