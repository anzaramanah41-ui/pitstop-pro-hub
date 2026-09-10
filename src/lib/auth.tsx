import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase, type Profile } from "@/lib/supabase";
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
  /** Stable identity. In production this must be Supabase auth.users.id. */
  id: string;
  email: string;
  nama: string;
  role: Role;
  inisial: string;
  /** Bengkel identity for multi-bengkel isolation. */
  bengkelId?: string | undefined;
  /** Nama pelanggan yang dipetakan ke akun ini (khusus role pelanggan). */
  pelanggan?: string;
  telepon?: string;
  premium: boolean;
};

/** Public registration creates customer accounts only. Admin/owner identities
 * must be provisioned internally by the connected auth provider. */
export const AKUN_DEMO: (SessionUser & { password: string })[] = [];

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
    { to: "/admin/mekanik", label: "Kelola Mekanik", icon: Users },
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
        { to: "/admin/mekanik", label: "Kelola Mekanik", icon: Users },
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
    {
      label: "Akun",
      items: [{ to: "/admin/cs", label: "Customer Service", icon: LifeBuoy }, ITEM_PROFIL],
    },
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
  owner: ["/owner", "/admin", "/profil"],
};

export function bolehAkses(role: Role, pathname: string) {
  return IZIN_ROLE[role].some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function inisialDari(nama: string) {
  return nama
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

type AuthCtx = {
  user: SessionUser | null;
  loading: boolean;
  masuk: (email: string, password: string) => Promise<{ user?: SessionUser; error?: string }>;
  daftar: (input: {
    nama: string;
    email: string;
    telepon: string;
    password: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  keluar: () => Promise<void>;
  aktifkanPremium: () => void;
  kirimKodeResetPassword: (email: string) => Promise<{ ok: boolean; error?: string }>;
  verifikasiDanUbahPassword: (
    email: string,
    token: string,
    passwordBaru: string,
  ) => Promise<{ ok: boolean; error?: string }>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (id: string): Promise<SessionUser | null> => {
    const client = supabase();
    const { data, error } = await client
      .from("profiles")
      .select("id, full_name, email, phone, role, id_bengkel")
      .eq("id", id)
      .single<Profile>();

    if (!error && data) {
      const payload: SessionUser = {
        id: data.id,
        nama: data.full_name,
        email: data.email,
        role: data.role,
        bengkelId: data.id_bengkel ?? (data.role === "admin" || data.role === "owner" ? "bengkel-001" : undefined),
        inisial: inisialDari(data.full_name),
        premium: false,
        ...(data.phone ? { telepon: data.phone } : {}),
        ...(data.role === "pelanggan" ? { pelanggan: data.full_name } : {}),
      };
      return payload;
    }

    // Fallback mandiri jika profile belum terbuat
    try {
      const { data: sessionData } = await client.auth.getUser();
      const authUser = sessionData?.user;
      if (authUser && authUser.id === id && authUser.email) {
        const rawRole = authUser.user_metadata?.["role"] as Role | undefined;
        const metaRole: Role = rawRole && ["admin", "owner", "pelanggan"].includes(rawRole) ? rawRole : "pelanggan";
        const metaName: string = authUser.user_metadata?.["full_name"] || authUser.email.split("@")[0] || "User";
        const metaPhone: string | null = authUser.user_metadata?.["phone"] ?? null;
        const metaBengkel: string | null = (authUser.user_metadata?.["id_bengkel"] as string) ?? (metaRole === "admin" || metaRole === "owner" ? "bengkel-001" : null);

        const { data: created, error: insertErr } = await client
          .from("profiles")
          .upsert({
            id: authUser.id,
            full_name: metaName,
            email: authUser.email,
            phone: metaPhone,
            role: metaRole,
            id_bengkel: metaBengkel,
          })
          .select("id, full_name, email, phone, role, id_bengkel")
          .single<Profile>();

        if (!insertErr && created) {
          const payload: SessionUser = {
            id: created.id,
            nama: created.full_name,
            email: created.email,
            role: created.role,
            bengkelId: created.id_bengkel ?? (created.role === "admin" || created.role === "owner" ? "bengkel-001" : undefined),
            inisial: inisialDari(created.full_name),
            premium: false,
            ...(created.phone ? { telepon: created.phone } : {}),
            ...(created.role === "pelanggan" ? { pelanggan: created.full_name } : {}),
          };
          return payload;
        }
      }
    } catch {
      // abaikan error fallback
    }

    return null;
  };

  useEffect(() => {
    let live = true;
    const client = supabase();
    client.auth.getSession().then(async ({ data }) => {
      if (live && data.session) setUser(await loadProfile(data.session.user.id));
      if (live) setLoading(false);
    });
    const { data: listener } = client.auth.onAuthStateChange(async (_event, session) => {
      if (!live) return;
      setUser(session ? await loadProfile(session.user.id) : null);
      setLoading(false);
    });
    return () => {
      live = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      loading,
      masuk: async (email, password) => {
        const { data, error } = await supabase().auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error || !data.user) return { error: error?.message ?? "Login gagal." };
        const sessionUser = await loadProfile(data.user.id);
        if (!sessionUser) {
          await supabase().auth.signOut();
          return { error: "Profil akun tidak ditemukan. Hubungi administrator." };
        }
        setUser(sessionUser);
        return { user: sessionUser };
      },
      daftar: async ({ nama, email, telepon, password }) => {
        const { error } = await supabase().auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: nama.trim(), phone: telepon.trim() } },
        });
        return error ? { ok: false, error: error.message } : { ok: true };
      },
      keluar: async () => {
        await supabase().auth.signOut();
        setUser(null);
      },
      aktifkanPremium: () =>
        setUser((u) => {
          if (!u) return u;
          const next = { ...u, premium: true };
          return next;
        }),
      kirimKodeResetPassword: async (email: string) => {
        const cleanEmail = email.trim();
        const { error } = await supabase().auth.resetPasswordForEmail(cleanEmail);
        if (error) {
          let msg = error.message;
          if (
            msg.toLowerCase().includes("email_address_invalid") ||
            msg.toLowerCase().includes("is invalid")
          ) {
            msg = "Format alamat email tidak dapat dikirimi kode oleh penyedia auth. Pastikan menggunakan email aktif terdaftar.";
          } else if (msg.toLowerCase().includes("rate limit")) {
            msg = "Terlalu banyak permintaan kirim kode. Silakan tunggu beberapa saat.";
          }
          return { ok: false, error: msg };
        }
        return { ok: true };
      },
      verifikasiDanUbahPassword: async (email: string, token: string, passwordBaru: string) => {
        const cleanEmail = email.trim();
        const cleanToken = token.trim();
        const { error: verifyErr } = await supabase().auth.verifyOtp({
          email: cleanEmail,
          token: cleanToken,
          type: "recovery",
        });
        if (verifyErr) {
          let msg = verifyErr.message;
          if (msg.toLowerCase().includes("expired") || msg.toLowerCase().includes("invalid")) {
            msg = "Kode verifikasi salah atau telah kadaluarsa. Silakan periksa email Anda kembali.";
          }
          return { ok: false, error: msg };
        }

        const { error: updateErr } = await supabase().auth.updateUser({
          password: passwordBaru,
        });
        if (updateErr) {
          return { ok: false, error: updateErr.message };
        }

        // Keluar dari sesi recovery agar pengguna login secara bersih
        await supabase().auth.signOut();
        setUser(null);
        return { ok: true };
      },
    }),
    [user, loading],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}
