import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth, LABEL_ROLE } from "@/lib/auth";

export const Route = createFileRoute("/_shell/profil")({
  head: () => ({
    meta: [
      { title: "Profil Pengguna — AppBenk" },
      { name: "description", content: "Kelola data profil akun dan keluar dari sesi AppBenk." },
      { property: "og:title", content: "Profil Pengguna — AppBenk" },
      { property: "og:description", content: "Data akun Anda di AppBenk." },
    ],
  }),
  component: ProfilPage,
});

function ProfilPage() {
  const { user, keluar } = useAuth();
  const navigate = useNavigate();
  const [nama, setNama] = useState(user?.nama ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [telepon, setTelepon] = useState("0812-3344-5566");
  const [konfirmasi, setKonfirmasi] = useState(false);

  return (
    <>
      <PageHeader title="Profil Pengguna" description="Informasi akun Anda." />

      <div className="grid max-w-3xl gap-4">
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

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Akun</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted-foreground">Akhiri sesi Anda pada perangkat ini.</p>
            <Button variant="destructive" className="ml-auto gap-2" onClick={() => setKonfirmasi(true)}>
              <LogOut className="size-4" /> Keluar
            </Button>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={konfirmasi} onOpenChange={setKonfirmasi}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Keluar dari AppBenk?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin keluar dari akun Anda?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                keluar();
                navigate({ to: "/login", replace: true });
              }}
            >
              Keluar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
