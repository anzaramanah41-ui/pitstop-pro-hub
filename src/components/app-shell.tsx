import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Wrench,
  Package,
  History,
  Settings,
  LogOut,
  UserCircle2,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/pelanggan", label: "Pelanggan", icon: Users },
  { to: "/servis", label: "Servis", icon: Wrench },
  { to: "/sparepart", label: "Sparepart & Pricelist", icon: Package },
  { to: "/riwayat", label: "Riwayat Servis", icon: History },
  { to: "/pengaturan", label: "Pengaturan", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background lg:flex">
      {open && (
        <button
          aria-label="Tutup menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 border-b border-sidebar-border px-4 py-4">
          <BrandLogo size={38} />
          <div className="leading-tight">
            <p className="font-display text-sm font-bold tracking-tight text-white">BENGKEL PITSTOP</p>
            <p className="text-[11px] text-sidebar-foreground/60">Administrasi Bengkel</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setOpen(false)} aria-label="Tutup">
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="size-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4 text-[11px] text-sidebar-foreground/50">
          Versi 1.0 · Data demo
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur lg:px-6">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Buka menu">
            <Menu className="size-5" />
          </button>
          <p className="truncate font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {nav.find((n) => n.to === pathname)?.label ?? "Bengkel Pitstop"}
          </p>

          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    AD
                  </span>
                  <span className="hidden text-left leading-tight sm:block">
                    <span className="block text-sm font-semibold">Admin Bengkel</span>
                    <span className="block text-[11px] text-muted-foreground">admin@pitstop.id</span>
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate({ to: "/pengaturan" })}>
                  <UserCircle2 className="mr-2 size-4" /> Profil
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate({ to: "/pengaturan" })}>
                  <Settings className="mr-2 size-4" /> Pengaturan
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate({ to: "/" })}>
                  <LogOut className="mr-2 size-4" /> Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 space-y-6 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
