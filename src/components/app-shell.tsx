import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  UserCircle2,
  Menu,
  X,
  Lock,
  Bell,
  CreditCard,
  CheckCheck,
  ExternalLink,
  LogOut,
  CalendarCheck,
  CalendarX,
  CalendarPlus,
  Wrench,
} from "lucide-react";
import { useEffect, useState, useMemo, type ReactNode } from "react";
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
import { LABEL_ROLE, NAV_GROUPS, useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, keluar } = useAuth();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!user) return null;
  const groups = NAV_GROUPS[user.role];
  const nav = groups.flatMap((g) => g.items);
  const { pembayaran, booking } = useStore();
  const pendingPaymentCount = useMemo(() => {
    return pembayaran.filter((p) => p.status === "Menunggu Verifikasi").length;
  }, [pembayaran]);
  const pendingBookingCount = useMemo(() => {
    return booking.filter((b) => b.status === "Menunggu Konfirmasi").length;
  }, [booking]);

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
            <p className="font-display text-sm font-bold tracking-tight text-white">APPBENK</p>
            <p className="text-[11px] text-sidebar-foreground/60">Solusi Servis Kendaraan</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setOpen(false)} aria-label="Tutup">
            <X className="size-5" />
          </button>
        </div>

        <div className="px-4 py-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sidebar-accent px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
            Role · {LABEL_ROLE[user.role]}
          </span>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto p-3 pt-0">
          {groups.map((group, i) => (
            <div key={group.label ?? `g-${i}`} className="space-y-1">
              {group.label && (
                <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/45">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
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
                    <span className="flex-1">{item.label}</span>
                    {item.to === "/admin/pembayaran" && pendingPaymentCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white shadow-xs animate-pulse">
                        {pendingPaymentCount > 9 ? "9+" : pendingPaymentCount}
                      </span>
                    )}
                    {item.to === "/admin/booking" && pendingBookingCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-bold text-white shadow-xs">
                        {pendingBookingCount > 9 ? "9+" : pendingBookingCount}
                      </span>
                    )}
                    {item.premium && !user.premium && <Lock className="size-3.5 opacity-70" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-4 text-[11px] text-sidebar-foreground/50">
          Versi 2.0 · Multi-Tenant SaaS AppBenk
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur lg:px-6">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Buka menu">
            <Menu className="size-5" />
          </button>
          <p className="truncate font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {nav.find((n) => n.to === pathname)?.label ?? "AppBenk"}
          </p>

          <div className="ml-auto flex items-center gap-2">
            <NotificationBell />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {user.inisial}
                  </span>
                  <span className="hidden text-left leading-tight sm:block">
                    <span className="block text-sm font-semibold">{user.nama}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      {LABEL_ROLE[user.role]}
                    </span>
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="leading-tight">
                  Akun Saya
                  <span className="block text-[11px] font-normal text-muted-foreground">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate({ to: "/profil" })}>
                  <UserCircle2 className="mr-2 size-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                  onSelect={async () => {
                    await keluar();
                    navigate({ to: "/login", replace: true });
                  }}
                >
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

function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifikasi, tandaiNotifikasiDibaca, tandaiSemuaNotifikasiDibaca } = useStore();

  if (!user) return null;

  // Filter notifikasi sesuai role user aktif
  const listNotif = notifikasi.filter((n) => {
    if (n.role === "semua") return true;
    if (user.role === "admin" && n.role === "admin") return true;
    if (user.role === "owner" && (n.role === "owner" || n.role === "admin")) return true;
    if (user.role === "pelanggan" && n.role === "pelanggan") {
      // Jika notifikasi memiliki target spesifik (customerId, userId, atau nama)
      if (n.customerId || n.userId || n.pelanggan) {
        const matchesCustomerId = Boolean(n.customerId && user.pelangganId && n.customerId === user.pelangganId);
        const matchesUserId = Boolean(n.userId && user.id && n.userId === user.id);
        const matchesNama = Boolean(
          n.pelanggan &&
            ((user.nama && n.pelanggan.trim().toLowerCase() === user.nama.trim().toLowerCase()) ||
              (user.pelanggan && n.pelanggan.trim().toLowerCase() === user.pelanggan.trim().toLowerCase())),
        );
        return matchesCustomerId || matchesUserId || matchesNama;
      }
      return true;
    }
    return false;
  });
  const unreadCount = listNotif.filter((n) => !n.dibaca).length;

  const handleKlikNotif = (id: string, link?: string, statusBooking?: string, judul?: string) => {
    tandaiNotifikasiDibaca(id);
    let target = link;
    if (user.role === "admin" || user.role === "owner") {
      if (judul && (judul.toLowerCase().includes("pembayaran") || judul.toLowerCase().includes("qris") || judul.toLowerCase().includes("transfer") || judul.toLowerCase().includes("cash"))) {
        target = "/admin/pembayaran?filter=menunggu_verifikasi";
      } else if (judul && (judul.toLowerCase().includes("booking") || judul.toLowerCase().includes("servis masuk"))) {
        target = "/admin/booking";
      } else if (judul && (judul.toLowerCase().includes("stok") || judul.toLowerCase().includes("sparepart"))) {
        target = "/admin/stok";
      }
    } else {
      if (statusBooking === "Diterima" || (judul && judul.toLowerCase().includes("booking diterima"))) {
        target = "/pelanggan/status";
      }
    }
    if (target) {
      navigate({ to: target });
    }
  };

  const getNotifIcon = (n: (typeof listNotif)[number]) => {
    if (n.tipe === "booking") {
      if (n.statusBooking === "Ditolak" || n.judul.toLowerCase().includes("ditolak")) {
        return (
          <div className="mt-0.5 rounded-full bg-destructive/10 p-2 text-destructive shrink-0">
            <CalendarX className="size-4" />
          </div>
        );
      }
      return (
        <div className="mt-0.5 rounded-full bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400 shrink-0">
          <CalendarCheck className="size-4" />
        </div>
      );
    }
    if (n.tipe === "servis") {
      return (
        <div className="mt-0.5 rounded-full bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400 shrink-0">
          <Wrench className="size-4" />
        </div>
      );
    }
    return (
      <div className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary shrink-0">
        <CreditCard className="size-4" />
      </div>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifikasi">
          <Bell className="size-5 text-foreground/80" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 shadow-lg">
        <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/20">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-primary" />
            <span className="font-bold text-sm">Notifikasi Sistem</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-600">
                {unreadCount} Baru
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => tandaiSemuaNotifikasiDibaca(user.role === "owner" ? undefined : user.role)}
              className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline cursor-pointer"
            >
              <CheckCheck className="size-3" /> Tandai dibaca
            </button>
          )}
        </div>

        <div className="max-h-[380px] overflow-y-auto divide-y divide-border/40">
          {listNotif.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              <Bell className="mx-auto size-7 text-muted-foreground/40 mb-2" />
              <p className="font-medium">Belum ada notifikasi baru</p>
              <p className="text-[11px] text-muted-foreground/70">
                Notifikasi pembayaran dan aktivitas akan muncul di sini.
              </p>
            </div>
          ) : (
            listNotif.map((n) => {
              const isUnread = !n.dibaca;
              return (
                <div
                  key={n.id}
                  onClick={() => handleKlikNotif(n.id, n.link, n.statusBooking, n.judul)}
                  className={`flex cursor-pointer items-start gap-3 p-3.5 text-xs transition-colors hover:bg-muted/50 ${
                    isUnread ? "bg-primary/5" : ""
                  }`}
                >
                  {getNotifIcon(n)}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`truncate font-bold ${isUnread ? "text-primary" : "text-foreground"}`}
                      >
                        {n.judul}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(n.waktu).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-muted-foreground leading-relaxed">{n.pesan}</p>
                    {n.link && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                        Buka & Periksa <ExternalLink className="size-3" />
                      </span>
                    )}
                  </div>
                  {isUnread && <span className="size-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                </div>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
