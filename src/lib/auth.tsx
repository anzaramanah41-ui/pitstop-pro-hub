import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  Car,
  ShoppingCart,
  LifeBuoy,

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
  telepon?: string;
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
    { to: "/pelanggan/kendaraan", label: "Kendaraan Saya", icon: Car },
    { to: "/pelanggan/booking", label: "Booking Servis", icon: CalendarPlus },
    { to: "/pelanggan/status", label: "Status Servis", icon: Activity },
    { to: "/pelanggan/estimasi", label: "Estimasi Servis", icon: Calculator },
    { to: "/pelanggan/pembayaran", label: "Pembayaran", icon: Wallet },
    { to: "/pelanggan/riwayat", label: "Riwayat Servis", icon: History },
    { to: "/pelanggan/cs", label: "Customer Service", icon: LifeBuoy },
    { to: "/profil", label: "Profile", icon: UserCircle2 },
  ],
  admin: [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/booking", label: "Booking Masuk", icon: Inbox },
    { to: "/admin/servis", label: "Operasional Servis", icon: Wrench },
    { to: "/admin/sparepart", label: "Kelola Sparepart", icon: Package },
    { to: "/admin/stok", label: "Pembelian & Stok", icon: ShoppingCart },
    { to: "/admin/laporan", label: "Laporan & Data", icon: FileBarChart },
    { to: "/admin/cs", label: "Customer Service", icon: LifeBuoy },
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

export type NavGroup = { label?: string; items: NavItem[] };

const ITEM_PROFIL: NavItem = { to: "/profil", label: "Profile", icon: UserCircle2 };

export const NAV_GROUPS: Record<Role, NavGroup[]> = {
  pelanggan: [{ items: NAV_ROLE.pelanggan }],
  admin: [{ items: NAV_ROLE.admin }],
  owner: [
    { items: [{ to: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard }] },
    {
      label: "Operasional",
      items: [
        { to: "/admin/booking", label: "Booking Masuk", icon: Inbox },
        { to: "/admin/servis", label: "Operasional Servis", icon: Wrench },
        { to: "/admin/sparepart", label: "Kelola Sparepart", icon: Package },
        { to: "/admin/stok", label: "Pembelian & Stok", icon: ShoppingCart },
      ],
    },
    {
      label: "Laporan",
      items: [
        { to: "/admin/laporan", label: "Laporan & Data", icon: FileBarChart },
        { to: "/owner/servis", label: "Laporan Servis", icon: LineChart },
        { to: "/owner/sparepart", label: "Laporan Sparepart", icon: Package },
        { to: "/owner/pelanggan", label: "Laporan Pelanggan", icon: Users },
        { to: "/owner/keuntungan", label: "Laporan Keuntungan", icon: Crown, premium: true },
      ],
    },
    { label: "Akun", items: [{ to: "/admin/cs", label: "Customer Service", icon: LifeBuoy }, ITEM_PROFIL] },
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

export function bolehAkses(role: Role, pathname: string) {
  return IZIN_ROLE[role].some((p) => pathname === p || pathname.startsWith(p + "/"));
}

const KEY_PREMIUM = "appbenk.premium";

export function inisialDari(nama: string) {
  return nama
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

type HasilDaftar = { ok: true } | { ok: false; error: string };

type AuthCtx = {
  user: SessionUser | null;
  memuat: boolean;
  masuk: (email: string, password: string) => Promise<SessionUser | null>;
  daftar: (input: { nama: string; email: string; telepon: string; password: string }) => Promise<HasilDaftar>;
  keluar: () => Promise<void>;
  aktifkanPremium: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

function bacaPremium(email: string) {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(KEY_PREMIUM);
    return raw ? (JSON.parse(raw) as string[]).includes(email) : false;
  } catch {
    return false;
  }
}

function simpanPremium(email: string) {
  try {
    const raw = window.localStorage.getItem(KEY_PREMIUM);
    const list = raw ? (JSON.parse(raw) as string[]) : [];
    if (!list.includes(email)) window.localStorage.setItem(KEY_PREMIUM, JSON.stringify([...list, email]));
  } catch {
    /* abaikan */
  }
}

/** Ambil profil + peran dari database untuk user yang sedang login. */
async function ambilSesi(userId: string, email: string): Promise<SessionUser | null> {
  const [{ data: profil }, { data: peran }, { data: pelanggan }] = await Promise.all([
    supabase.from("profiles").select("full_name, phone, role").eq("id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
    supabase.from("customers").select("nama").eq("profile_id", userId).maybeSingle(),
  ]);

  const daftarPeran = (peran ?? []).map((r) => r.role as Role);
  const role: Role = daftarPeran.includes("owner")
    ? "owner"
    : daftarPeran.includes("admin")
      ? "admin"
      : daftarPeran.includes("pelanggan")
        ? "pelanggan"
        : ((profil?.role as Role) ?? "pelanggan");

  const nama = profil?.full_name?.trim() || email.split("@")[0] || "Pengguna";
  const sesi: SessionUser = {
    email,
    nama,
    role,
    inisial: inisialDari(nama) || "PL",
    premium: bacaPremium(email),
  };
  if (role === "pelanggan") sesi.pelanggan = pelanggan?.nama ?? nama;
  if (profil?.phone) sesi.telepon = profil.phone;
  return sesi;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [memuat, setMemuat] = useState(true);

  const sinkron = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const s = data.session;
    if (!s?.user?.email) {
      setUser(null);
      setMemuat(false);
      return null;
    }
    const sesi = await ambilSesi(s.user.id, s.user.email);
    setUser(sesi);
    setMemuat(false);
    return sesi;
  }, []);

  useEffect(() => {
    void sinkron();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") void sinkron();
    });
    return () => sub.subscription.unsubscribe();
  }, [sinkron]);

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      memuat,
      masuk: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error || !data.user?.email) return null;
        return await sinkron();
      },
      daftar: async ({ nama, email, telepon, password }) => {
        const surel = email.trim().toLowerCase();
        const { data, error } = await supabase.auth.signUp({
          email: surel,
          password,
          options: { data: { full_name: nama.trim(), phone: telepon.trim() } },
        });
        if (error) {
          const pesan = /already registered|already been registered|User already/i.test(error.message)
            ? "Email sudah terdaftar. Silakan login."
            : error.message;
          return { ok: false, error: pesan };
        }
        const uid = data.user?.id;
        if (uid && data.session) {
          await supabase.from("profiles").upsert({
            id: uid,
            full_name: nama.trim(),
            email: surel,
            phone: telepon.trim(),
            role: "pelanggan",
          });
          await supabase.from("user_roles").insert({ user_id: uid, role: "pelanggan" });
          const { data: adaPelanggan } = await supabase
            .from("customers")
            .select("id")
            .eq("profile_id", uid)
            .maybeSingle();
          if (!adaPelanggan) {
            await supabase.from("customers").insert({
              profile_id: uid,
              nama: nama.trim(),
              email: surel,
              telepon: telepon.trim(),
            });
          }
          await supabase.auth.signOut();
          setUser(null);
        }
        return { ok: true };
      },
      keluar: async () => {
        await supabase.auth.signOut();
        setUser(null);
      },
      aktifkanPremium: () =>
        setUser((u) => {
          if (!u) return u;
          simpanPremium(u.email);
          return { ...u, premium: true };
        }),
    }),
    [user, memuat, sinkron],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}
