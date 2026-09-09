<<<<<<< HEAD
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
=======
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase, type Profile } from "@/lib/supabase";
>>>>>>> b897868 (Initial commit - AppBenk)
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
<<<<<<< HEAD

=======
>>>>>>> b897868 (Initial commit - AppBenk)
  type LucideIcon,
} from "lucide-react";

export type Role = "pelanggan" | "admin" | "owner";

export type SessionUser = {
<<<<<<< HEAD
=======
  /** Stable identity. In production this must be Supabase auth.users.id. */
  id: string;
>>>>>>> b897868 (Initial commit - AppBenk)
  email: string;
  nama: string;
  role: Role;
  inisial: string;
<<<<<<< HEAD
=======
  /** Bengkel identity for multi-bengkel isolation. */
  bengkelId?: string | undefined;
>>>>>>> b897868 (Initial commit - AppBenk)
  /** Nama pelanggan yang dipetakan ke akun ini (khusus role pelanggan). */
  pelanggan?: string;
  telepon?: string;
  premium: boolean;
};

<<<<<<< HEAD
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
=======
/** Public registration creates customer accounts only. Admin/owner identities
 * must be provisioned internally by the connected auth provider. */
export const AKUN_DEMO: (SessionUser & { password: string })[] = [];
>>>>>>> b897868 (Initial commit - AppBenk)

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
<<<<<<< HEAD
=======
    { to: "/admin/mekanik", label: "Kelola Mekanik", icon: Users },
>>>>>>> b897868 (Initial commit - AppBenk)
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
<<<<<<< HEAD
=======
        { to: "/admin/mekanik", label: "Kelola Mekanik", icon: Users },
>>>>>>> b897868 (Initial commit - AppBenk)
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
<<<<<<< HEAD
    { label: "Akun", items: [{ to: "/admin/cs", label: "Customer Service", icon: LifeBuoy }, ITEM_PROFIL] },
=======
    {
      label: "Akun",
      items: [{ to: "/admin/cs", label: "Customer Service", icon: LifeBuoy }, ITEM_PROFIL],
    },
>>>>>>> b897868 (Initial commit - AppBenk)
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
<<<<<<< HEAD
  // Owner = Admin Bengkel + Owner
=======
>>>>>>> b897868 (Initial commit - AppBenk)
  owner: ["/owner", "/admin", "/profil"],
};

export function bolehAkses(role: Role, pathname: string) {
  return IZIN_ROLE[role].some((p) => pathname === p || pathname.startsWith(p + "/"));
}

<<<<<<< HEAD
const KEY_PREMIUM = "appbenk.premium";

=======
>>>>>>> b897868 (Initial commit - AppBenk)
export function inisialDari(nama: string) {
  return nama
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

<<<<<<< HEAD
type HasilDaftar = { ok: true } | { ok: false; error: string };

type AuthCtx = {
  user: SessionUser | null;
  memuat: boolean;
  masuk: (email: string, password: string) => Promise<SessionUser | null>;
  daftar: (input: { nama: string; email: string; telepon: string; password: string }) => Promise<HasilDaftar>;
  keluar: () => Promise<void>;
  aktifkanPremium: () => void;
=======
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
>>>>>>> b897868 (Initial commit - AppBenk)
};

const Ctx = createContext<AuthCtx | null>(null);

<<<<<<< HEAD
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
=======
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
>>>>>>> b897868 (Initial commit - AppBenk)

  const value = useMemo<AuthCtx>(
    () => ({
      user,
<<<<<<< HEAD
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
=======
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
>>>>>>> b897868 (Initial commit - AppBenk)
        setUser(null);
      },
      aktifkanPremium: () =>
        setUser((u) => {
          if (!u) return u;
<<<<<<< HEAD
          simpanPremium(u.email);
          return { ...u, premium: true };
        }),
    }),
    [user, memuat, sinkron],
=======
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
>>>>>>> b897868 (Initial commit - AppBenk)
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}
