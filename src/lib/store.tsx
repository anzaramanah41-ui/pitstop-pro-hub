import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Pelanggan = {
  id: string;
  profileId?: string | null;
  nama: string;
  email: string;
  telepon: string;
  alamat: string;
  /** Kendaraan utama (ringkasan). Detail lengkap ada di entitas Kendaraan. */
  kendaraan: string;
  plat: string;
};

/** Entitas Kendaraan (1 pelanggan : N kendaraan). */
export type Kendaraan = {
  id: string;
  pelangganId: string;
  merk: string;
  tipe: string;
  tahun: number;
  plat: string;
  kilometer: number;
};

/** Label ringkas kendaraan, dipakai pada booking & servis. */
export const labelKendaraan = (k: Kendaraan) => `${k.merk} ${k.tipe} ${k.tahun}`;

export type StatusServis =
  | "Booking"
  | "Menunggu"
  | "Diproses"
  | "Selesai"
  | "Menunggu Pembayaran"
  | "Selesai Dibayar";

export const URUTAN_STATUS: StatusServis[] = [
  "Booking",
  "Menunggu",
  "Diproses",
  "Selesai",
  "Menunggu Pembayaran",
  "Selesai Dibayar",
];

export type ItemPart = {
  sparepartId: string;
  nama: string;
  harga: number;
  jumlah: number;
};

export type MetodeBayar = "Cash" | "Transfer Bank" | "QRIS";

export type Servis = {
  id: string;
  nomor: string;
  pelangganId?: string | null;
  pelanggan: string;
  kendaraan: string;
  plat: string;
  jenis: string;
  keluhan: string;
  pekerjaan: string;
  mekanik: string;
  tanggal: string;
  status: StatusServis;
  sparepart: string;
  items: ItemPart[];
  catatan: string;
  biayaJasa: number;
  biayaPart: number;
  total: number;
  noTransaksi: string;
  metodeBayar?: MetodeBayar;
  /** Hasil pemeriksaan mekanik. */
  hasilPemeriksaan?: string;
  /** Estimasi biaya awal sebelum pengerjaan. */
  estimasiBiaya?: number;
  /** Estimasi waktu pengerjaan, contoh "2 jam". */
  estimasiWaktu?: string;
};

/** Entitas Pembayaran / Transaksi (1 servis : 1 pembayaran). */
export type Pembayaran = {
  id: string;
  servisId: string;
  noTransaksi: string;
  metode: MetodeBayar;
  tanggalBayar: string;
  totalBayar: number;
  status: "Lunas" | "Belum Lunas";
};

/** Estimasi biaya servis (tabel service_estimates). */
export type EstimasiServis = {
  id: string;
  servisId: string;
  biayaJasa: number;
  biayaSparepart: number;
  total: number;
  status: string;
  catatan: string;
};

export type StatusBooking = "Menunggu Konfirmasi" | "Diterima" | "Ditolak";

export type Booking = {
  id: string;
  nomor: string;
  pelangganId?: string | null;
  pelanggan: string;
  kendaraan: string;
  plat: string;
  jenis: string;
  keluhan: string;
  tanggal: string;
  waktu: string;
  catatan: string;
  mekanikDiinginkan?: string;
  mekanikDitugaskan?: string;
  alasanTolak?: string;
  status: StatusBooking;
};

export type Sparepart = {
  id: string;
  nama: string;
  satuan: string;
  harga: number;
  stok: number;
  stokMinimum: number;
  terpakai: number;
  deskripsi: string;
  tanggalUpdate: string;
};

export type StatusStok = "Habis" | "Menipis" | "Aman";

export const statusStok = (sp: Sparepart): StatusStok =>
  sp.stok === 0 ? "Habis" : sp.stok <= sp.stokMinimum ? "Menipis" : "Aman";

/** Log pergerakan stok (stock_movements). */
export type RiwayatStok = {
  id: string;
  sparepartId: string;
  jenis: "Masuk" | "Keluar";
  jumlah: number;
  tanggal: string;
  keterangan: string;
};

/** Pembelian sparepart dari supplier. */
export type PembelianSparepart = {
  id: string;
  nomor: string;
  sparepartId: string;
  supplier: string;
  tanggal: string;
  jumlah: number;
  harga: number;
  total: number;
  status: "Diterima";
};

/** Pemakaian sparepart pada sebuah servis. */
export type PenggunaanSparepart = {
  id: string;
  sparepartId: string;
  servisId: string;
  servisNomor: string;
  tanggal: string;
  jumlah: number;
  mekanik: string;
  keterangan: string;
};

export const JENIS_SERVIS = [
  "Servis Ringan",
  "Servis Besar",
  "Ganti Oli",
  "Perbaikan Rem",
  "Kelistrikan",
  "Servis AC",
  "Kaki-kaki",
];

export const SATUAN_PART = ["Pcs", "Botol", "Set", "Unit", "Tabung", "Liter"];

export const MEKANIK = ["Joko", "Dedi", "Rudi", "Bayu"];

/** Daftar mekanik beserta spesialisasi untuk saran saat booking. */
export const MEKANIK_DETAIL: { nama: string; spesialis: string }[] = [
  { nama: "Joko", spesialis: "Mekanik Mesin" },
  { nama: "Dedi", spesialis: "Mekanik Rem & Kaki-kaki" },
  { nama: "Rudi", spesialis: "Mekanik AC & Kelistrikan" },
  { nama: "Bayu", spesialis: "Mekanik Umum" },
];

export type StatusTiket = "Menunggu" | "Diproses" | "Selesai";

export const KATEGORI_TIKET = [
  "Booking",
  "Servis",
  "Pembayaran",
  "Sparepart",
  "Akun",
  "Masalah Teknis",
  "Lainnya",
];

export type Tiket = {
  id: string;
  nomor: string;
  pengirim: string;
  peran: string;
  subjek: string;
  kategori: string;
  pesan: string;
  tanggal: string;
  status: StatusTiket;
  balasan?: string;
};

export const totalItem = (items: ItemPart[]) => items.reduce((a, i) => a + i.harga * i.jumlah, 0);

export const ringkasanItem = (items: ItemPart[]) =>
  items.map((i) => `${i.nama} x${i.jumlah}`).join(", ");

const hariIni = () => new Date().toISOString().slice(0, 10);

const nomorBerikut = (list: { nomor: string }[], prefix: string, mulai: number) => {
  const angka = list
    .map((x) => Number(x.nomor.split("-").pop()))
    .filter((n) => Number.isFinite(n)) as number[];
  const next = Math.max(mulai - 1, ...(angka.length ? angka : [0])) + 1;
  return `${prefix}-${String(next).padStart(4, "0")}`;
};

// ============ MAPPER ============
type Row = Record<string, any>;

const keServis = (r: Row, items: ItemPart[]): Servis => ({
  id: r.id,
  nomor: r.nomor,
  pelangganId: r.customer_id,
  pelanggan: r.pelanggan_nama ?? "",
  kendaraan: r.kendaraan ?? "",
  plat: r.plat ?? "",
  jenis: r.jenis ?? "",
  keluhan: r.keluhan ?? "",
  pekerjaan: r.pekerjaan ?? "",
  mekanik: r.mekanik ?? "",
  tanggal: r.tanggal ?? "",
  status: (r.status ?? "Menunggu") as StatusServis,
  sparepart: r.sparepart_ringkas ?? "",
  items,
  catatan: r.catatan ?? "",
  biayaJasa: r.biaya_jasa ?? 0,
  biayaPart: r.biaya_part ?? 0,
  total: r.total ?? 0,
  noTransaksi: r.no_transaksi ?? "",
  ...(r.metode_bayar ? { metodeBayar: r.metode_bayar as MetodeBayar } : {}),
  ...(r.hasil_pemeriksaan ? { hasilPemeriksaan: r.hasil_pemeriksaan as string } : {}),
  ...(r.estimasi_waktu ? { estimasiWaktu: r.estimasi_waktu as string } : {}),
});

const keBooking = (r: Row): Booking => ({
  id: r.id,
  nomor: r.nomor,
  pelangganId: r.customer_id,
  pelanggan: r.pelanggan_nama ?? "",
  kendaraan: r.kendaraan ?? "",
  plat: r.plat ?? "",
  jenis: r.jenis ?? "",
  keluhan: r.keluhan ?? "",
  tanggal: r.tanggal ?? "",
  waktu: r.waktu ?? "",
  catatan: r.catatan ?? "",
  ...(r.mekanik_diinginkan ? { mekanikDiinginkan: r.mekanik_diinginkan as string } : {}),
  ...(r.mekanik_ditugaskan ? { mekanikDitugaskan: r.mekanik_ditugaskan as string } : {}),
  ...(r.alasan_tolak ? { alasanTolak: r.alasan_tolak as string } : {}),
  status: (r.status ?? "Menunggu Konfirmasi") as StatusBooking,
});

const kePart = (r: Row): Sparepart => ({
  id: r.id,
  nama: r.nama,
  satuan: r.satuan ?? "Pcs",
  harga: r.harga ?? 0,
  stok: r.stok ?? 0,
  stokMinimum: r.stok_minimum ?? 0,
  terpakai: r.terpakai ?? 0,
  deskripsi: r.deskripsi ?? "",
  tanggalUpdate: (r.updated_at ?? r.created_at ?? "").slice(0, 10),
});

type Store = {
  siap: boolean;
  muatUlang: () => Promise<void>;
  pelanggan: Pelanggan[];
  kendaraan: Kendaraan[];
  servis: Servis[];
  sparepart: Sparepart[];
  booking: Booking[];
  pembayaran: Pembayaran[];
  estimasi: EstimasiServis[];
  riwayatStok: RiwayatStok[];
  pembelian: PembelianSparepart[];
  penggunaan: PenggunaanSparepart[];
  tiket: Tiket[];
  simpanPelanggan: (p: Omit<Pelanggan, "id"> & { id?: string }) => Promise<void>;
  hapusPelanggan: (id: string) => Promise<void>;
  simpanKendaraan: (k: Omit<Kendaraan, "id"> & { id?: string }) => Promise<void>;
  hapusKendaraan: (id: string) => Promise<void>;
  simpanServis: (
    s: Omit<Servis, "id" | "nomor" | "total" | "noTransaksi" | "biayaPart" | "sparepart"> & { id?: string },
  ) => Promise<void>;
  ubahStatusServis: (id: string, status: StatusServis) => Promise<void>;
  hapusServis: (id: string) => Promise<void>;
  simpanSparepart: (s: Omit<Sparepart, "id" | "terpakai" | "tanggalUpdate"> & { id?: string; terpakai?: number }) => Promise<void>;
  hapusSparepart: (id: string) => Promise<void>;
  catatPembelian: (p: Omit<PembelianSparepart, "id" | "nomor" | "total" | "status">) => Promise<void>;
  buatBooking: (b: Omit<Booking, "id" | "nomor" | "status">) => Promise<Booking>;
  ubahStatusBooking: (id: string, status: StatusBooking, alasan?: string) => Promise<void>;
  tugaskanMekanikBooking: (id: string, mekanik: string) => Promise<void>;
  bayarServis: (id: string, metode?: MetodeBayar) => Promise<void>;
  buatTiket: (t: Omit<Tiket, "id" | "nomor" | "status" | "tanggal">) => Promise<Tiket>;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [siap, setSiap] = useState(false);
  const [pelanggan, setPelanggan] = useState<Pelanggan[]>([]);
  const [kendaraan, setKendaraan] = useState<Kendaraan[]>([]);
  const [servis, setServis] = useState<Servis[]>([]);
  const [sparepart, setSparepart] = useState<Sparepart[]>([]);
  const [booking, setBooking] = useState<Booking[]>([]);
  const [pembayaran, setPembayaran] = useState<Pembayaran[]>([]);
  const [estimasi, setEstimasi] = useState<EstimasiServis[]>([]);
  const [riwayatStok, setRiwayatStok] = useState<RiwayatStok[]>([]);
  const [pembelian, setPembelian] = useState<PembelianSparepart[]>([]);
  const [penggunaan, setPenggunaan] = useState<PenggunaanSparepart[]>([]);
  const [tiket, setTiket] = useState<Tiket[]>([]);

  const muatUlang = useCallback(async () => {
    const { data: sesi } = await supabase.auth.getSession();
    if (!sesi.session) {
      setSiap(true);
      return;
    }
    const [c, v, sp, so, si, bk, pay, est, mv, pb, us, tk] = await Promise.all([
      supabase.from("customers").select("*").order("nama"),
      supabase.from("vehicles").select("*"),
      supabase.from("spareparts").select("*").order("nama"),
      supabase.from("service_orders").select("*").order("tanggal", { ascending: false }),
      supabase.from("service_items").select("*"),
      supabase.from("bookings").select("*").order("tanggal", { ascending: false }),
      supabase.from("payments").select("*").order("tanggal_bayar", { ascending: false }),
      supabase.from("service_estimates").select("*"),
      supabase.from("stock_movements").select("*").order("tanggal", { ascending: false }),
      supabase.from("sparepart_purchases").select("*").order("tanggal", { ascending: false }),
      supabase.from("sparepart_usages").select("*").order("tanggal", { ascending: false }),
      supabase.from("support_tickets").select("*").order("created_at", { ascending: false }),
    ]);

    setPelanggan(
      (c.data ?? []).map((r: Row) => ({
        id: r.id,
        profileId: r.profile_id,
        nama: r.nama,
        email: r.email ?? "",
        telepon: r.telepon ?? "",
        alamat: r.alamat ?? "",
        kendaraan: r.kendaraan ?? "",
        plat: r.plat ?? "",
      })),
    );
    setKendaraan(
      (v.data ?? []).map((r: Row) => ({
        id: r.id,
        pelangganId: r.customer_id,
        merk: r.merk,
        tipe: r.tipe,
        tahun: r.tahun,
        plat: r.plat ?? "",
        kilometer: r.kilometer ?? 0,
      })),
    );
    setSparepart((sp.data ?? []).map(kePart));
    const itemsPer = new Map<string, ItemPart[]>();
    for (const r of (si.data ?? []) as Row[]) {
      const arr = itemsPer.get(r.service_id) ?? [];
      arr.push({ sparepartId: r.sparepart_id ?? "", nama: r.nama, harga: r.harga, jumlah: r.jumlah });
      itemsPer.set(r.service_id, arr);
    }
    setServis((so.data ?? []).map((r: Row) => keServis(r, itemsPer.get(r.id) ?? [])));
    setBooking((bk.data ?? []).map(keBooking));
    setPembayaran(
      (pay.data ?? []).map((r: Row) => ({
        id: r.id,
        servisId: r.service_id ?? "-",
        noTransaksi: r.no_transaksi ?? "",
        metode: (r.metode ?? "Cash") as MetodeBayar,
        tanggalBayar: r.tanggal_bayar ?? "",
        totalBayar: r.jumlah ?? 0,
        status: (r.status ?? "Belum Lunas") as "Lunas" | "Belum Lunas",
      })),
    );
    setEstimasi(
      (est.data ?? []).map((r: Row) => ({
        id: r.id,
        servisId: r.service_id,
        biayaJasa: r.biaya_jasa ?? 0,
        biayaSparepart: r.biaya_sparepart ?? 0,
        total: r.total ?? 0,
        status: r.status ?? "",
        catatan: r.catatan ?? "",
      })),
    );
    setRiwayatStok(
      (mv.data ?? []).map((r: Row) => ({
        id: r.id,
        sparepartId: r.sparepart_id,
        jenis: (r.jenis ?? "Masuk") as "Masuk" | "Keluar",
        jumlah: r.jumlah ?? 0,
        tanggal: r.tanggal ?? "",
        keterangan: r.keterangan ?? "",
      })),
    );
    setPembelian(
      (pb.data ?? []).map((r: Row) => ({
        id: r.id,
        nomor: r.nomor,
        sparepartId: r.sparepart_id,
        supplier: r.supplier ?? "",
        tanggal: r.tanggal ?? "",
        jumlah: r.jumlah ?? 0,
        harga: r.harga ?? 0,
        total: r.total ?? 0,
        status: "Diterima" as const,
      })),
    );
    setPenggunaan(
      (us.data ?? []).map((r: Row) => ({
        id: r.id,
        sparepartId: r.sparepart_id,
        servisId: r.service_id ?? "-",
        servisNomor: r.service_nomor ?? "",
        tanggal: r.tanggal ?? "",
        jumlah: r.jumlah ?? 0,
        mekanik: r.mekanik ?? "",
        keterangan: r.keterangan ?? "",
      })),
    );
    setTiket(
      (tk.data ?? []).map((r: Row) => ({
        id: r.id,
        nomor: r.nomor,
        pengirim: r.pengirim ?? "",
        peran: r.peran ?? "",
        subjek: r.subjek ?? "",
        kategori: r.kategori ?? "",
        pesan: r.pesan ?? "",
        tanggal: r.tanggal ?? "",
        status: (r.status ?? "Menunggu") as StatusTiket,
        ...(r.balasan ? { balasan: r.balasan as string } : {}),
      })),
    );
    setSiap(true);
  }, []);

  useEffect(() => {
    void muatUlang();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") void muatUlang();
    });
    return () => sub.subscription.unsubscribe();
  }, [muatUlang]);

  /** Sinkronkan stok & log setelah pemakaian sparepart berubah pada sebuah servis. */
  const terapkanStok = useCallback(
    async (lama: ItemPart[], baru: ItemPart[], konteks: { servisId: string; nomor: string; tanggal: string; mekanik: string; keterangan: string }) => {
      const delta = new Map<string, number>();
      for (const i of lama) delta.set(i.sparepartId, (delta.get(i.sparepartId) ?? 0) - i.jumlah);
      for (const i of baru) delta.set(i.sparepartId, (delta.get(i.sparepartId) ?? 0) + i.jumlah);
      for (const [sparepartId, d] of delta) {
        if (!d || !sparepartId) continue;
        const sp = sparepart.find((x) => x.id === sparepartId);
        if (sp) {
          await supabase
            .from("spareparts")
            .update({ stok: Math.max(0, sp.stok - d), terpakai: Math.max(0, sp.terpakai + d) })
            .eq("id", sparepartId);
        }
        await supabase.from("stock_movements").insert({
          sparepart_id: sparepartId,
          jenis: d > 0 ? "Keluar" : "Masuk",
          jumlah: Math.abs(d),
          tanggal: konteks.tanggal,
          keterangan: d > 0 ? `Dipakai servis ${konteks.nomor}` : `Koreksi pemakaian servis ${konteks.nomor}`,
        });
        if (d > 0) {
          await supabase.from("sparepart_usages").insert({
            sparepart_id: sparepartId,
            service_id: konteks.servisId,
            service_nomor: konteks.nomor,
            tanggal: konteks.tanggal,
            jumlah: d,
            mekanik: konteks.mekanik,
            keterangan: konteks.keterangan,
          });
        }
      }
    },
    [sparepart],
  );

  const value = useMemo<Store>(
    () => ({
      siap,
      muatUlang,
      pelanggan,
      kendaraan,
      servis,
      sparepart,
      booking,
      pembayaran,
      estimasi,
      riwayatStok,
      pembelian,
      penggunaan,
      tiket,

      simpanPelanggan: async (p) => {
        const payload = {
          nama: p.nama,
          email: p.email,
          telepon: p.telepon,
          alamat: p.alamat,
          kendaraan: p.kendaraan,
          plat: p.plat,
        };
        if (p.id) await supabase.from("customers").update(payload).eq("id", p.id);
        else await supabase.from("customers").insert(payload);
        await muatUlang();
      },
      hapusPelanggan: async (id) => {
        await supabase.from("customers").delete().eq("id", id);
        await muatUlang();
      },
      simpanKendaraan: async (k) => {
        const payload = {
          customer_id: k.pelangganId,
          merk: k.merk,
          tipe: k.tipe,
          tahun: k.tahun,
          plat: k.plat,
          kilometer: k.kilometer,
        };
        if (k.id) await supabase.from("vehicles").update(payload).eq("id", k.id);
        else await supabase.from("vehicles").insert(payload);
        await muatUlang();
      },
      hapusKendaraan: async (id) => {
        await supabase.from("vehicles").delete().eq("id", id);
        await muatUlang();
      },

      simpanServis: async (s) => {
        const items = s.items ?? [];
        const lamaServis = s.id ? servis.find((x) => x.id === s.id) : undefined;
        const biayaPart = totalItem(items);
        const total = s.biayaJasa + biayaPart;
        const tgl = s.tanggal || hariIni();
        const nomor = lamaServis?.nomor ?? nomorBerikut(servis, "SRV-2026", 149);
        const pelangganRow = pelanggan.find((p) => p.nama === s.pelanggan);
        const payload: Row = {
          nomor,
          customer_id: pelangganRow?.id ?? null,
          pelanggan_nama: s.pelanggan,
          kendaraan: s.kendaraan,
          plat: s.plat,
          jenis: s.jenis,
          keluhan: s.keluhan,
          pekerjaan: s.pekerjaan,
          mekanik: s.mekanik,
          tanggal: tgl,
          status: s.status,
          catatan: s.catatan ?? "",
          hasil_pemeriksaan: s.hasilPemeriksaan ?? null,
          estimasi_waktu: s.estimasiWaktu ?? null,
          sparepart_ringkas: ringkasanItem(items),
          biaya_jasa: s.biayaJasa,
          biaya_part: biayaPart,
          total,
          metode_bayar: s.metodeBayar ?? null,
        };

        let servisId = s.id ?? "";
        if (s.id) {
          await supabase.from("service_orders").update(payload).eq("id", s.id);
        } else {
          const { data } = await supabase
            .from("service_orders")
            .insert({ ...payload, no_transaksi: nomor.replace("SRV", "TRX") })
            .select("id")
            .single();
          servisId = data?.id ?? "";
        }

        if (servisId) {
          await supabase.from("service_items").delete().eq("service_id", servisId);
          if (items.length) {
            await supabase.from("service_items").insert(
              items.map((i) => ({
                service_id: servisId,
                sparepart_id: i.sparepartId || null,
                nama: i.nama,
                harga: i.harga,
                jumlah: i.jumlah,
              })),
            );
          }
          // Estimasi biaya servis
          await supabase.from("service_estimates").upsert(
            {
              service_id: servisId,
              biaya_jasa: s.biayaJasa,
              biaya_sparepart: biayaPart,
              total,
              status: lamaServis ? "Diperbarui" : "Menunggu Konfirmasi",
              catatan: s.catatan ?? "",
            },
            { onConflict: "service_id" },
          );
          await terapkanStok(lamaServis?.items ?? [], items, {
            servisId,
            nomor,
            tanggal: tgl,
            mekanik: s.mekanik,
            keterangan: s.pekerjaan || s.jenis,
          });
        }
        await muatUlang();
      },
      ubahStatusServis: async (id, status) => {
        await supabase.from("service_orders").update({ status }).eq("id", id);
        await muatUlang();
      },
      hapusServis: async (id) => {
        const lama = servis.find((x) => x.id === id);
        if (lama?.items.length) {
          for (const i of lama.items) {
            const sp = sparepart.find((x) => x.id === i.sparepartId);
            if (sp)
              await supabase
                .from("spareparts")
                .update({ stok: sp.stok + i.jumlah, terpakai: Math.max(0, sp.terpakai - i.jumlah) })
                .eq("id", sp.id);
            await supabase.from("stock_movements").insert({
              sparepart_id: i.sparepartId,
              jenis: "Masuk",
              jumlah: i.jumlah,
              tanggal: hariIni(),
              keterangan: `Pembatalan servis ${lama.nomor}`,
            });
          }
        }
        await supabase.from("service_orders").delete().eq("id", id);
        await muatUlang();
      },

      simpanSparepart: async (s) => {
        const payload = {
          nama: s.nama,
          satuan: s.satuan,
          harga: s.harga,
          stok: s.stok,
          stok_minimum: s.stokMinimum,
          deskripsi: s.deskripsi ?? "",
        };
        if (s.id) await supabase.from("spareparts").update(payload).eq("id", s.id);
        else await supabase.from("spareparts").insert({ ...payload, terpakai: s.terpakai ?? 0 });
        await muatUlang();
      },
      hapusSparepart: async (id) => {
        await supabase.from("spareparts").delete().eq("id", id);
        await muatUlang();
      },
      catatPembelian: async (p) => {
        const nomor = nomorBerikut(pembelian, "PB-2026", 12);
        await supabase.from("sparepart_purchases").insert({
          nomor,
          sparepart_id: p.sparepartId,
          supplier: p.supplier,
          tanggal: p.tanggal,
          jumlah: p.jumlah,
          harga: p.harga,
          total: p.jumlah * p.harga,
          status: "Diterima",
        });
        const sp = sparepart.find((x) => x.id === p.sparepartId);
        if (sp) await supabase.from("spareparts").update({ stok: sp.stok + p.jumlah }).eq("id", sp.id);
        await supabase.from("stock_movements").insert({
          sparepart_id: p.sparepartId,
          jenis: "Masuk",
          jumlah: p.jumlah,
          tanggal: p.tanggal,
          keterangan: `Pembelian ${nomor} · ${p.supplier}`,
        });
        await muatUlang();
      },

      buatBooking: async (b) => {
        const nomor = nomorBerikut(booking, "BK-2026", 33);
        const pelangganRow =
          pelanggan.find((p) => p.id === b.pelangganId) ?? pelanggan.find((p) => p.nama === b.pelanggan);
        const kendaraanRow = kendaraan.find((k) => k.plat === b.plat && k.pelangganId === pelangganRow?.id);
        const { data } = await supabase
          .from("bookings")
          .insert({
            nomor,
            customer_id: pelangganRow?.id ?? null,
            vehicle_id: kendaraanRow?.id ?? null,
            pelanggan_nama: b.pelanggan,
            kendaraan: b.kendaraan,
            plat: b.plat,
            jenis: b.jenis,
            keluhan: b.keluhan,
            tanggal: b.tanggal,
            waktu: b.waktu,
            catatan: b.catatan ?? "",
            mekanik_diinginkan: b.mekanikDiinginkan || null,
            status: "Menunggu Konfirmasi",
          })
          .select("*")
          .single();
        await muatUlang();
        return data ? keBooking(data as Row) : { ...b, id: "", nomor, status: "Menunggu Konfirmasi" };
      },
      ubahStatusBooking: async (id, status, alasan) => {
        await supabase
          .from("bookings")
          .update({ status, alasan_tolak: status === "Ditolak" ? (alasan ?? "") : null })
          .eq("id", id);
        await muatUlang();
      },
      tugaskanMekanikBooking: async (id, mekanik) => {
        await supabase.from("bookings").update({ mekanik_ditugaskan: mekanik }).eq("id", id);
        await muatUlang();
      },

      bayarServis: async (id, metode) => {
        const target = servis.find((x) => x.id === id);
        const m = metode ?? target?.metodeBayar ?? "Cash";
        await supabase
          .from("service_orders")
          .update({ status: "Selesai Dibayar", metode_bayar: m })
          .eq("id", id);
        if (target) {
          await supabase.from("payments").delete().eq("service_id", id);
          await supabase.from("payments").insert({
            service_id: id,
            customer_id: target.pelangganId ?? null,
            no_transaksi: target.noTransaksi,
            jumlah: target.total,
            metode: m,
            status: "Lunas",
            tanggal_bayar: hariIni(),
          });
        }
        await muatUlang();
      },

      buatTiket: async (t) => {
        const { data: sesi } = await supabase.auth.getSession();
        const nomor = `CS-${String(tiket.length + 1).padStart(3, "0")}`;
        const { data } = await supabase
          .from("support_tickets")
          .insert({
            nomor,
            profile_id: sesi.session?.user.id ?? null,
            pengirim: t.pengirim,
            peran: t.peran,
            subjek: t.subjek,
            kategori: t.kategori,
            pesan: t.pesan,
            tanggal: hariIni(),
            status: "Menunggu",
          })
          .select("*")
          .single();
        await muatUlang();
        return {
          id: data?.id ?? "",
          nomor,
          pengirim: t.pengirim,
          peran: t.peran,
          subjek: t.subjek,
          kategori: t.kategori,
          pesan: t.pesan,
          tanggal: hariIni(),
          status: "Menunggu",
        };
      },
    }),
    [siap, muatUlang, pelanggan, kendaraan, servis, sparepart, booking, pembayaran, estimasi, riwayatStok, pembelian, penggunaan, tiket, terapkanStok],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore harus dipakai di dalam StoreProvider");
  return ctx;
}

export const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export const tanggalPanjang = (iso: string) =>
  iso ? new Date(iso + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—";
