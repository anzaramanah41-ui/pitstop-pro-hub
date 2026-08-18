import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Pelanggan = {
  id: string;
  nama: string;
  telepon: string;
  alamat: string;
  kendaraan: string;
  plat: string;
};

export type StatusServis = "Menunggu" | "Diproses" | "Selesai";

export type Servis = {
  id: string;
  nomor: string;
  pelanggan: string;
  kendaraan: string;
  plat: string;
  keluhan: string;
  pekerjaan: string;
  mekanik: string;
  tanggal: string;
  status: StatusServis;
  sparepart: string;
  catatan: string;
  total: number;
};

export type Sparepart = {
  id: string;
  kode: string;
  nama: string;
  kategori: string;
  harga: number;
  stok: number;
};

const uid = () => Math.random().toString(36).slice(2, 9);

const pelangganAwal: Pelanggan[] = [
  { id: uid(), nama: "Budi Santoso", telepon: "0812-3344-5566", alamat: "Jl. Merdeka No. 12, Bandung", kendaraan: "Honda Beat 2019", plat: "D 1234 ABC" },
  { id: uid(), nama: "Siti Rahmawati", telepon: "0857-1122-9090", alamat: "Jl. Cihampelas No. 7, Bandung", kendaraan: "Yamaha NMAX 2021", plat: "D 5521 KJ" },
  { id: uid(), nama: "Agus Prasetyo", telepon: "0813-7788-4455", alamat: "Jl. Sudirman No. 88, Cimahi", kendaraan: "Toyota Avanza 2017", plat: "D 9087 PL" },
  { id: uid(), nama: "Dewi Lestari", telepon: "0895-2211-3344", alamat: "Jl. Pasteur No. 45, Bandung", kendaraan: "Honda Vario 160", plat: "D 3311 QW" },
  { id: uid(), nama: "Rizky Ramadhan", telepon: "0821-9911-2233", alamat: "Jl. Buah Batu No. 21, Bandung", kendaraan: "Suzuki Satria FU", plat: "D 7742 ZX" },
  { id: uid(), nama: "Hendra Wijaya", telepon: "0877-6655-1010", alamat: "Jl. Kopo No. 90, Bandung", kendaraan: "Daihatsu Xenia 2015", plat: "D 6120 MN" },
];

const servisAwal: Servis[] = [
  { id: uid(), nomor: "SRV-2026-0148", pelanggan: "Budi Santoso", kendaraan: "Honda Beat 2019", plat: "D 1234 ABC", keluhan: "Mesin kasar saat langsam", pekerjaan: "Servis ringan + ganti busi", mekanik: "Joko", tanggal: "2026-08-18", status: "Diproses", sparepart: "Busi NGK, Oli Federal 0.8L", catatan: "Disarankan ganti filter udara bulan depan", total: 145000 },
  { id: uid(), nomor: "SRV-2026-0147", pelanggan: "Siti Rahmawati", kendaraan: "Yamaha NMAX 2021", plat: "D 5521 KJ", keluhan: "Rem depan kurang pakem", pekerjaan: "Ganti kampas rem depan", mekanik: "Dedi", tanggal: "2026-08-18", status: "Menunggu", sparepart: "Kampas Rem Depan", catatan: "", total: 210000 },
  { id: uid(), nomor: "SRV-2026-0146", pelanggan: "Agus Prasetyo", kendaraan: "Toyota Avanza 2017", plat: "D 9087 PL", keluhan: "Bunyi pada kaki-kaki", pekerjaan: "Ganti link stabilizer", mekanik: "Rudi", tanggal: "2026-08-17", status: "Selesai", sparepart: "Link Stabilizer x2", catatan: "Sudah test drive, aman", total: 480000 },
  { id: uid(), nomor: "SRV-2026-0145", pelanggan: "Dewi Lestari", kendaraan: "Honda Vario 160", plat: "D 3311 QW", keluhan: "Ganti oli rutin", pekerjaan: "Ganti oli mesin", mekanik: "Joko", tanggal: "2026-08-16", status: "Selesai", sparepart: "Oli AHM MPX 0.8L", catatan: "", total: 65000 },
  { id: uid(), nomor: "SRV-2026-0144", pelanggan: "Rizky Ramadhan", kendaraan: "Suzuki Satria FU", plat: "D 7742 ZX", keluhan: "Rantai kendur dan berisik", pekerjaan: "Setel & lumasi rantai", mekanik: "Dedi", tanggal: "2026-08-15", status: "Selesai", sparepart: "Chain Lube", catatan: "Rantai mulai aus", total: 55000 },
  { id: uid(), nomor: "SRV-2026-0143", pelanggan: "Hendra Wijaya", kendaraan: "Daihatsu Xenia 2015", plat: "D 6120 MN", keluhan: "AC kurang dingin", pekerjaan: "Servis AC + isi freon", mekanik: "Rudi", tanggal: "2026-08-14", status: "Selesai", sparepart: "Freon R134a", catatan: "", total: 350000 },
];

const sparepartAwal: Sparepart[] = [
  { id: uid(), kode: "SP-001", nama: "Oli Mesin AHM MPX 0.8L", kategori: "Oli", harga: 48000, stok: 34 },
  { id: uid(), kode: "SP-002", nama: "Busi NGK CPR9EA", kategori: "Mesin", harga: 27000, stok: 18 },
  { id: uid(), kode: "SP-003", nama: "Kampas Rem Depan NMAX", kategori: "Rem", harga: 95000, stok: 6 },
  { id: uid(), kode: "SP-004", nama: "Filter Udara Beat", kategori: "Mesin", harga: 62000, stok: 0 },
  { id: uid(), kode: "SP-005", nama: "Aki GS Astra NS40", kategori: "Kelistrikan", harga: 610000, stok: 4 },
  { id: uid(), kode: "SP-006", nama: "Ban Luar IRC 80/90-14", kategori: "Ban", harga: 215000, stok: 11 },
  { id: uid(), kode: "SP-007", nama: "Link Stabilizer Avanza", kategori: "Kaki-kaki", harga: 175000, stok: 8 },
  { id: uid(), kode: "SP-008", nama: "Freon R134a", kategori: "AC", harga: 120000, stok: 15 },
];

export const MEKANIK = ["Joko", "Dedi", "Rudi", "Bayu"];

type Store = {
  pelanggan: Pelanggan[];
  servis: Servis[];
  sparepart: Sparepart[];
  simpanPelanggan: (p: Omit<Pelanggan, "id"> & { id?: string }) => void;
  hapusPelanggan: (id: string) => void;
  simpanServis: (s: Omit<Servis, "id" | "nomor"> & { id?: string; nomor?: string }) => void;
  hapusServis: (id: string) => void;
  simpanSparepart: (s: Omit<Sparepart, "id"> & { id?: string }) => void;
  hapusSparepart: (id: string) => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [pelanggan, setPelanggan] = useState(pelangganAwal);
  const [servis, setServis] = useState(servisAwal);
  const [sparepart, setSparepart] = useState(sparepartAwal);

  const value = useMemo<Store>(
    () => ({
      pelanggan,
      servis,
      sparepart,
      simpanPelanggan: (p) =>
        setPelanggan((list) =>
          p.id ? list.map((x) => (x.id === p.id ? ({ ...x, ...p } as Pelanggan) : x)) : [{ ...p, id: uid() } as Pelanggan, ...list],
        ),
      hapusPelanggan: (id) => setPelanggan((l) => l.filter((x) => x.id !== id)),
      simpanServis: (s) =>
        setServis((list) => {
          if (s.id) return list.map((x) => (x.id === s.id ? ({ ...x, ...s } as Servis) : x));
          const nomor = `SRV-2026-${String(149 + list.length - servisAwal.length).padStart(4, "0")}`;
          return [{ ...s, id: uid(), nomor } as Servis, ...list];
        }),
      hapusServis: (id) => setServis((l) => l.filter((x) => x.id !== id)),
      simpanSparepart: (s) =>
        setSparepart((list) =>
          s.id ? list.map((x) => (x.id === s.id ? ({ ...x, ...s } as Sparepart) : x)) : [{ ...s, id: uid() } as Sparepart, ...list],
        ),
      hapusSparepart: (id) => setSparepart((l) => l.filter((x) => x.id !== id)),
    }),
    [pelanggan, servis, sparepart],
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
