import { Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/app-shell";
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
      navigate({ to: "/", replace: true });
    } else if (!izin) {
      navigate({ to: HOME_ROLE[user.role], replace: true });
    }
  }, [user, izin, navigate]);

  if (!user || !izin) return null;

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
