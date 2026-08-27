import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  CalendarPlus,
  Activity,
  Calculator,
  Wallet,
  History,
  UserCircle2,
  Inbox,
  Wrench,
  Package,
  FileBarChart,
  LineChart,
  Users,
  Crown,
  type LucideIcon,
} from "lucide-react";

export type Role = "pelanggan" | "admin" | "owner";

export type SessionUser = {
  email: string;
  nama: string;
  role: Role;
  inisial: string;
  /** Nama pelanggan yang dipetakan ke akun ini (khusus role pelanggan). */
  pelanggan?: string;
  premium: boolean;
};

export const AKUN_DEMO: (SessionUser & { password: string })[] = [
  {
    email: "pelanggan@appbenk.test",
    password: "pelanggan123",
    nama: "Budi Santoso",
    role: "pelanggan",
    inisial: "BS",
    pelanggan: "Budi Santoso",
    premium: false,
  },
  {
    email: "admin@appbenk.test",
    password: "admin123",
    nama: "Admin Bengkel",
    role: "admin",
    inisial: "AB",
    premium: false,
  },
  {
    email: "owner@appbenk.test",
    password: "owner123",
    nama: "Owner Bengkel",
    role: "owner",
    inisial: "OW",
    premium: false,
  },
];

export const LABEL_ROLE: Record<Role, string> = {
  pelanggan: "Pelanggan",
  admin: "Admin Bengkel",
  owner: "Owner",
};

export type NavItem = { to: string; label: string; icon: LucideIcon; premium?: boolean };

export const NAV_ROLE: Record<Role, NavItem[]> = {
  pelanggan: [
    { to: "/pelanggan/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/pelanggan/booking", label: "Booking Servis", icon: CalendarPlus },
    { to: "/pelanggan/status", label: "Status Servis", icon: Activity },
    { to: "/pelanggan/estimasi", label: "Estimasi Servis", icon: Calculator },
    { to: "/pelanggan/pembayaran", label: "Pembayaran", icon: Wallet },
    { to: "/pelanggan/riwayat", label: "Riwayat Servis", icon: History },
    { to: "/profil", label: "Profile", icon: UserCircle2 },
  ],
  admin: [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/booking", label: "Booking Masuk", icon: Inbox },
    { to: "/admin/servis", label: "Operasional Servis", icon: Wrench },
    { to: "/admin/sparepart", label: "Kelola Sparepart", icon: Package },
    { to: "/admin/laporan", label: "Laporan & Data", icon: FileBarChart },
    { to: "/profil", label: "Profile", icon: UserCircle2 },
  ],
  owner: [
    { to: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/owner/servis", label: "Laporan Servis", icon: LineChart },
    { to: "/owner/sparepart", label: "Laporan Sparepart", icon: Package },
    { to: "/owner/pelanggan", label: "Laporan Pelanggan", icon: Users },
    { to: "/owner/keuntungan", label: "Laporan Keuntungan", icon: Crown, premium: true },
    { to: "/profil", label: "Profile", icon: UserCircle2 },
  ],
};

export const HOME_ROLE: Record<Role, string> = {
  pelanggan: "/pelanggan/dashboard",
  admin: "/admin/dashboard",
  owner: "/owner/dashboard",
};

/** Prefix rute yang boleh diakses masing-masing role. */
export const IZIN_ROLE: Record<Role, string[]> = {
  pelanggan: ["/pelanggan", "/profil"],
  admin: ["/admin", "/profil"],
  // Owner = Admin Bengkel + Owner
  owner: ["/owner", "/admin", "/profil"],
};

/** Mode tampilan khusus Owner: navigasi Owner atau navigasi Admin Bengkel. */
export type ModeOwner = "owner" | "admin";

const KEY_MODE = "appbenk.mode";

export function bolehAkses(role: Role, pathname: string) {
  return IZIN_ROLE[role].some((p) => pathname === p || pathname.startsWith(p + "/"));
}

const KEY = "appbenk.session";

type AuthCtx = {
  user: SessionUser | null;
  mode: ModeOwner;
  gantiMode: (m: ModeOwner) => void;
  masuk: (email: string, password: string) => SessionUser | null;
  keluar: () => void;
  aktifkanPremium: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as SessionUser) : null;
    } catch {
      return null;
    }
  });

  const [mode, setMode] = useState<ModeOwner>(() => {
    if (typeof window === "undefined") return "owner";
    return window.localStorage.getItem(KEY_MODE) === "admin" ? "admin" : "owner";
  });

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      mode,
      gantiMode: (m) => {
        setMode(m);
        try {
          window.localStorage.setItem(KEY_MODE, m);
        } catch {
          /* abaikan */
        }
      },
      masuk: (email, password) => {
        const found = AKUN_DEMO.find(
          (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password,
        );
        if (!found) return null;
        const { password: _pw, ...session } = found;
        setUser(session);
        try {
          window.localStorage.setItem(KEY, JSON.stringify(session));
        } catch {
          /* abaikan */
        }
        return session;
      },
      keluar: () => {
        setUser(null);
        try {
          window.localStorage.removeItem(KEY);
        } catch {
          /* abaikan */
        }
      },
      aktifkanPremium: () =>
        setUser((u) => {
          if (!u) return u;
          const next = { ...u, premium: true };
          try {
            window.localStorage.setItem(KEY, JSON.stringify(next));
          } catch {
            /* abaikan */
          }
          return next;
        }),
    }),
    [user, mode],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}
