import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Pelanggan = {
  id: string;
  nama: string;
  telepon: string;
  alamat: string;
  kendaraan: string;
  plat: string;
};

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
  kode: string;
  nama: string;
  harga: number;
  jumlah: number;
};

export type MetodeBayar = "Cash" | "Transfer Bank" | "QRIS";

export type Servis = {
  id: string;
  nomor: string;
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
};


export type StatusBooking = "Menunggu Konfirmasi" | "Diterima" | "Ditolak";

export type Booking = {
  id: string;
  nomor: string;
  pelanggan: string;
  kendaraan: string;
  plat: string;
  jenis: string;
  keluhan: string;
  tanggal: string;
  waktu: string;
  catatan: string;
  /** Mekanik yang diinginkan pelanggan (opsional). */
  mekanikDiinginkan?: string;
  /** Mekanik yang ditugaskan admin (opsional). */
  mekanikDitugaskan?: string;
  /** Alasan penolakan booking oleh admin. */
  alasanTolak?: string;
  status: StatusBooking;
};

export type Sparepart = {
  id: string;
  kode: string;
  nama: string;
  kategori: string;
  harga: number;
  stok: number;
  terpakai: number;
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

const uid = () => Math.random().toString(36).slice(2, 9);

const pelangganAwal: Pelanggan[] = [
  { id: uid(), nama: "Budi Santoso", telepon: "0812-3344-5566", alamat: "Jl. Merdeka No. 12, Bandung", kendaraan: "Honda Beat 2019", plat: "D 1234 ABC" },
  { id: uid(), nama: "Siti Rahmawati", telepon: "0857-1122-9090", alamat: "Jl. Cihampelas No. 7, Bandung", kendaraan: "Yamaha NMAX 2021", plat: "D 5521 KJ" },
  { id: uid(), nama: "Agus Prasetyo", telepon: "0813-7788-4455", alamat: "Jl. Sudirman No. 88, Cimahi", kendaraan: "Toyota Avanza 2017", plat: "D 9087 PL" },
  { id: uid(), nama: "Dewi Lestari", telepon: "0895-2211-3344", alamat: "Jl. Pasteur No. 45, Bandung", kendaraan: "Honda Vario 160", plat: "D 3311 QW" },
  { id: uid(), nama: "Rizky Ramadhan", telepon: "0821-9911-2233", alamat: "Jl. Buah Batu No. 21, Bandung", kendaraan: "Suzuki Satria FU", plat: "D 7742 ZX" },
  { id: uid(), nama: "Hendra Wijaya", telepon: "0877-6655-1010", alamat: "Jl. Kopo No. 90, Bandung", kendaraan: "Daihatsu Xenia 2015", plat: "D 6120 MN" },
];

const mkServis = (s: Omit<Servis, "id" | "total" | "items"> & { items?: ItemPart[] }): Servis => ({
  items: [],
  ...s,
  id: uid(),
  total: s.biayaJasa + s.biayaPart,
});


const servisAwal: Servis[] = [
  mkServis({ nomor: "SRV-2026-0148", pelanggan: "Budi Santoso", kendaraan: "Honda Beat 2019", plat: "D 1234 ABC", jenis: "Servis Ringan", keluhan: "Mesin kasar saat langsam", pekerjaan: "Servis ringan + ganti busi", mekanik: "Joko", tanggal: "2026-08-18", status: "Diproses", sparepart: "Busi NGK, Oli Federal 0.8L", catatan: "Disarankan ganti filter udara bulan depan", items: [{ sparepartId: "sp-002", kode: "SP-002", nama: "Busi NGK CPR9EA", harga: 27000, jumlah: 1 }, { sparepartId: "sp-001", kode: "SP-001", nama: "Oli Mesin AHM MPX 0.8L", harga: 48000, jumlah: 1 }], biayaJasa: 70000, biayaPart: 75000, noTransaksi: "TRX-2026-0148" }),
  mkServis({ nomor: "SRV-2026-0147", pelanggan: "Siti Rahmawati", kendaraan: "Yamaha NMAX 2021", plat: "D 5521 KJ", jenis: "Perbaikan Rem", keluhan: "Rem depan kurang pakem", pekerjaan: "Ganti kampas rem depan", mekanik: "Dedi", tanggal: "2026-08-18", status: "Menunggu", sparepart: "Kampas Rem Depan", catatan: "", items: [{ sparepartId: "sp-003", kode: "SP-003", nama: "Kampas Rem Depan NMAX", harga: 95000, jumlah: 1 }], biayaJasa: 60000, biayaPart: 95000, noTransaksi: "TRX-2026-0147" }),
  mkServis({ nomor: "SRV-2026-0146", pelanggan: "Budi Santoso", kendaraan: "Honda Beat 2019", plat: "D 1234 ABC", jenis: "Ganti Oli", keluhan: "Ganti oli rutin bulanan", pekerjaan: "Ganti oli mesin", mekanik: "Joko", tanggal: "2026-08-12", status: "Menunggu Pembayaran", sparepart: "Oli AHM MPX 0.8L", catatan: "", items: [{ sparepartId: "sp-001", kode: "SP-001", nama: "Oli Mesin AHM MPX 0.8L", harga: 48000, jumlah: 1 }], biayaJasa: 25000, biayaPart: 48000, noTransaksi: "TRX-2026-0146" }),
  mkServis({ nomor: "SRV-2026-0145", pelanggan: "Agus Prasetyo", kendaraan: "Toyota Avanza 2017", plat: "D 9087 PL", jenis: "Kaki-kaki", keluhan: "Bunyi pada kaki-kaki", pekerjaan: "Ganti link stabilizer", mekanik: "Rudi", tanggal: "2026-08-17", status: "Selesai Dibayar", sparepart: "Link Stabilizer x2", catatan: "Sudah test drive, aman", items: [{ sparepartId: "sp-007", kode: "SP-007", nama: "Link Stabilizer Avanza", harga: 175000, jumlah: 2 }], biayaJasa: 130000, biayaPart: 350000, noTransaksi: "TRX-2026-0145" }),
  mkServis({ nomor: "SRV-2026-0144", pelanggan: "Budi Santoso", kendaraan: "Honda Beat 2019", plat: "D 1234 ABC", jenis: "Servis Ringan", keluhan: "Rantai kendur dan berisik", pekerjaan: "Setel & lumasi rantai", mekanik: "Dedi", tanggal: "2026-07-28", status: "Selesai Dibayar", sparepart: "Chain Lube", catatan: "Rantai mulai aus", biayaJasa: 35000, biayaPart: 20000, noTransaksi: "TRX-2026-0144" }),
  mkServis({ nomor: "SRV-2026-0143", pelanggan: "Hendra Wijaya", kendaraan: "Daihatsu Xenia 2015", plat: "D 6120 MN", jenis: "Servis AC", keluhan: "AC kurang dingin", pekerjaan: "Servis AC + isi freon", mekanik: "Rudi", tanggal: "2026-08-14", status: "Selesai Dibayar", sparepart: "Freon R134a", catatan: "", items: [{ sparepartId: "sp-008", kode: "SP-008", nama: "Freon R134a", harga: 120000, jumlah: 1 }], biayaJasa: 230000, biayaPart: 120000, noTransaksi: "TRX-2026-0143" }),
  mkServis({ nomor: "SRV-2025-0121", pelanggan: "Budi Santoso", kendaraan: "Honda Beat 2019", plat: "D 1234 ABC", jenis: "Servis Besar", keluhan: "Tarikan berat", pekerjaan: "Overhaul ringan mesin", mekanik: "Joko", tanggal: "2025-11-09", status: "Selesai Dibayar", sparepart: "Busi NGK", catatan: "", items: [{ sparepartId: "sp-002", kode: "SP-002", nama: "Busi NGK CPR9EA", harga: 27000, jumlah: 2 }], biayaJasa: 250000, biayaPart: 54000, noTransaksi: "TRX-2025-0121", metodeBayar: "Cash" }),
  mkServis({ nomor: "SRV-2025-0118", pelanggan: "Siti Rahmawati", kendaraan: "Yamaha NMAX 2021", plat: "D 5521 KJ", jenis: "Ganti Oli", keluhan: "Servis rutin", pekerjaan: "Ganti oli mesin", mekanik: "Bayu", tanggal: "2025-06-21", status: "Selesai Dibayar", sparepart: "Oli AHM MPX", catatan: "", items: [{ sparepartId: "sp-001", kode: "SP-001", nama: "Oli Mesin AHM MPX 0.8L", harga: 48000, jumlah: 1 }], biayaJasa: 30000, biayaPart: 48000, noTransaksi: "TRX-2025-0118", metodeBayar: "QRIS" }),
];

const bookingAwal: Booking[] = [
  { id: uid(), nomor: "BK-2026-0032", pelanggan: "Budi Santoso", kendaraan: "Honda Beat 2019", plat: "D 1234 ABC", jenis: "Servis Besar", keluhan: "Tarikan berat & boros bensin", tanggal: "2026-08-20", waktu: "09:00", catatan: "Mohon dikerjakan pagi", mekanikDiinginkan: "Joko", status: "Menunggu Konfirmasi" },
  { id: uid(), nomor: "BK-2026-0031", pelanggan: "Dewi Lestari", kendaraan: "Honda Vario 160", plat: "D 3311 QW", jenis: "Ganti Oli", keluhan: "Ganti oli rutin", tanggal: "2026-08-19", waktu: "13:00", catatan: "", status: "Menunggu Konfirmasi" },
  { id: uid(), nomor: "BK-2026-0030", pelanggan: "Siti Rahmawati", kendaraan: "Yamaha NMAX 2021", plat: "D 5521 KJ", jenis: "Perbaikan Rem", keluhan: "Rem depan kurang pakem", tanggal: "2026-08-18", waktu: "10:30", catatan: "", mekanikDiinginkan: "Dedi", mekanikDitugaskan: "Dedi", status: "Diterima" },
  { id: uid(), nomor: "BK-2026-0029", pelanggan: "Rizky Ramadhan", kendaraan: "Suzuki Satria FU", plat: "D 7742 ZX", jenis: "Kelistrikan", keluhan: "Lampu utama mati", tanggal: "2026-08-16", waktu: "15:00", catatan: "", status: "Ditolak", alasanTolak: "Jadwal servis pada tanggal tersebut sudah penuh. Silakan pilih tanggal lain." },
];


const sparepartAwal: Sparepart[] = [
  { id: "sp-001", kode: "SP-001", nama: "Oli Mesin AHM MPX 0.8L", kategori: "Oli", harga: 48000, stok: 34, terpakai: 22 },
  { id: "sp-002", kode: "SP-002", nama: "Busi NGK CPR9EA", kategori: "Mesin", harga: 27000, stok: 18, terpakai: 14 },
  { id: "sp-003", kode: "SP-003", nama: "Kampas Rem Depan NMAX", kategori: "Rem", harga: 95000, stok: 6, terpakai: 9 },
  { id: "sp-004", kode: "SP-004", nama: "Filter Udara Beat", kategori: "Mesin", harga: 62000, stok: 0, terpakai: 12 },
  { id: "sp-005", kode: "SP-005", nama: "Aki GS Astra NS40", kategori: "Kelistrikan", harga: 610000, stok: 4, terpakai: 3 },
  { id: "sp-006", kode: "SP-006", nama: "Ban Luar IRC 80/90-14", kategori: "Ban", harga: 215000, stok: 11, terpakai: 7 },
  { id: "sp-007", kode: "SP-007", nama: "Link Stabilizer Avanza", kategori: "Kaki-kaki", harga: 175000, stok: 8, terpakai: 5 },
  { id: "sp-008", kode: "SP-008", nama: "Freon R134a", kategori: "AC", harga: 120000, stok: 15, terpakai: 10 },
];

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

const tiketAwal: Tiket[] = [
  { id: uid(), nomor: "CS-001", pengirim: "Budi Santoso", peran: "Pelanggan", subjek: "Tidak dapat melakukan booking", kategori: "Booking", pesan: "Saat menekan Kirim Booking, jadwal tidak tersimpan.", tanggal: "2026-08-29", status: "Diproses", balasan: "Tim kami sedang memeriksa kendala ini." },
  { id: uid(), nomor: "CS-002", pengirim: "Admin Bengkel", peran: "Admin Bengkel", subjek: "Laporan stok tidak sinkron", kategori: "Sparepart", pesan: "Stok sparepart pada laporan berbeda dengan katalog.", tanggal: "2026-08-27", status: "Selesai", balasan: "Sudah diperbaiki pada pembaruan terakhir." },
];

export const KATEGORI_PART = ["Oli", "Mesin", "Rem", "Kelistrikan", "Ban", "Kaki-kaki", "AC"];

export const totalItem = (items: ItemPart[]) => items.reduce((a, i) => a + i.harga * i.jumlah, 0);

export const ringkasanItem = (items: ItemPart[]) =>
  items.map((i) => `${i.nama} x${i.jumlah}`).join(", ");

/** Terapkan selisih pemakaian sparepart lama → baru ke stok (simulasi). */
function terapkanSelisih(list: Sparepart[], lama: ItemPart[], baru: ItemPart[]): Sparepart[] {
  const delta = new Map<string, number>();
  for (const i of lama) delta.set(i.sparepartId, (delta.get(i.sparepartId) ?? 0) - i.jumlah);
  for (const i of baru) delta.set(i.sparepartId, (delta.get(i.sparepartId) ?? 0) + i.jumlah);
  return list.map((sp) => {
    const d = delta.get(sp.id);
    if (!d) return sp;
    return { ...sp, stok: Math.max(0, sp.stok - d), terpakai: Math.max(0, sp.terpakai + d) };
  });
}


type Store = {
  pelanggan: Pelanggan[];
  servis: Servis[];
  sparepart: Sparepart[];
  booking: Booking[];
  simpanPelanggan: (p: Omit<Pelanggan, "id"> & { id?: string }) => void;
  hapusPelanggan: (id: string) => void;
  simpanServis: (s: Omit<Servis, "id" | "nomor" | "total" | "noTransaksi" | "biayaPart" | "sparepart"> & { id?: string }) => void;
  ubahStatusServis: (id: string, status: StatusServis) => void;
  hapusServis: (id: string) => void;
  simpanSparepart: (s: Omit<Sparepart, "id" | "terpakai"> & { id?: string; terpakai?: number }) => void;
  hapusSparepart: (id: string) => void;
  buatBooking: (b: Omit<Booking, "id" | "nomor" | "status">) => Booking;
  ubahStatusBooking: (id: string, status: StatusBooking, alasan?: string) => void;
  tugaskanMekanikBooking: (id: string, mekanik: string) => void;
  bayarServis: (id: string, metode?: MetodeBayar) => void;
  tiket: Tiket[];
  buatTiket: (t: Omit<Tiket, "id" | "nomor" | "status" | "tanggal">) => Tiket;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [pelanggan, setPelanggan] = useState(pelangganAwal);
  const [servis, setServis] = useState(servisAwal);
  const [sparepart, setSparepart] = useState(sparepartAwal);
  const [booking, setBooking] = useState(bookingAwal);
  const [tiket, setTiket] = useState(tiketAwal);

  const value = useMemo<Store>(
    () => ({
      pelanggan,
      servis,
      sparepart,
      booking,
      tiket,
      buatTiket: (t) => {
        const baru: Tiket = {
          ...t,
          id: uid(),
          nomor: `CS-${String(tiket.length + 1).padStart(3, "0")}`,
          tanggal: new Date().toISOString().slice(0, 10),
          status: "Menunggu",
        };
        setTiket((l) => [baru, ...l]);
        return baru;
      },

      simpanPelanggan: (p) =>
        setPelanggan((list) =>
          p.id ? list.map((x) => (x.id === p.id ? ({ ...x, ...p } as Pelanggan) : x)) : [{ ...p, id: uid() } as Pelanggan, ...list],
        ),
      hapusPelanggan: (id) => setPelanggan((l) => l.filter((x) => x.id !== id)),
      simpanServis: (s) => {
        const items = s.items ?? [];
        const lama = s.id ? (servis.find((x) => x.id === s.id)?.items ?? []) : [];
        setSparepart((list) => terapkanSelisih(list, lama, items));
        const biayaPart = totalItem(items);
        const ringkas = ringkasanItem(items);
        setServis((list) => {
          const total = s.biayaJasa + biayaPart;
          if (s.id) return list.map((x) => (x.id === s.id ? { ...x, ...s, items, biayaPart, sparepart: ringkas, total } : x));
          const seq = 149 + list.length - servisAwal.length;
          const nomor = `SRV-2026-${String(seq).padStart(4, "0")}`;
          return [
            { ...s, items, biayaPart, sparepart: ringkas, id: uid(), nomor, total, noTransaksi: `TRX-2026-${String(seq).padStart(4, "0")}` } as Servis,
            ...list,
          ];
        });
      },
      ubahStatusServis: (id, status) => setServis((l) => l.map((x) => (x.id === id ? { ...x, status } : x))),
      hapusServis: (id) => {
        const lama = servis.find((x) => x.id === id)?.items ?? [];
        setSparepart((list) => terapkanSelisih(list, lama, []));
        setServis((l) => l.filter((x) => x.id !== id));
      },

      simpanSparepart: (s) =>
        setSparepart((list) =>
          s.id
            ? list.map((x) => (x.id === s.id ? ({ ...x, ...s } as Sparepart) : x))
            : [{ terpakai: 0, ...s, id: uid() } as Sparepart, ...list],
        ),
      hapusSparepart: (id) => setSparepart((l) => l.filter((x) => x.id !== id)),
      buatBooking: (b) => {
        const baru: Booking = { ...b, id: uid(), nomor: `BK-2026-${String(33 + booking.length - bookingAwal.length).padStart(4, "0")}`, status: "Menunggu Konfirmasi" };
        setBooking((l) => [baru, ...l]);
        return baru;
      },
      ubahStatusBooking: (id, status) => setBooking((l) => l.map((x) => (x.id === id ? { ...x, status } : x))),
      bayarServis: (id, metode) =>
        setServis((l) => l.map((x) => {
          if (x.id !== id) return x;
          const m = metode ?? x.metodeBayar;
          return { ...x, status: "Selesai Dibayar" as StatusServis, ...(m ? { metodeBayar: m } : {}) };
        })),

    }),
    [pelanggan, servis, sparepart, booking],
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
  new Date(iso + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
