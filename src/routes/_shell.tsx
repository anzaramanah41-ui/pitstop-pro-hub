import { Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { bolehAkses, HOME_ROLE, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_shell")({
  ssr: false,
  component: ShellLayout,
});

function ShellLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const izin = user ? bolehAkses(user.role, pathname) : false;

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login", replace: true });
      return;
    }
    // Role tidak berizin → langsung diarahkan ke dashboard sesuai role
    if (!izin) navigate({ to: HOME_ROLE[user.role], replace: true });
  }, [user, izin, navigate]);

  if (!user) return null;

  if (!izin) {
    return (
      <AppShell>
        <div className="mx-auto flex max-w-md flex-col items-center rounded-xl border bg-card p-8 text-center">
          <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="size-7 text-destructive" />
          </span>
          <h1 className="font-display text-xl font-bold">Akses Ditolak</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>
          <Button
            className="mt-5"
            onClick={() => navigate({ to: HOME_ROLE[user.role], replace: true })}
          >
            Kembali ke Dashboard
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
