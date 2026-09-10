import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  isSupabaseConfigured,
  pelangganService,
  kendaraanService,
  bookingService,
  servisService,
  sparepartService,
  pembayaranService,
  mekanikService,
  supabase,
} from "@/services/appbenk-service";

export type Bengkel = {
  id: string;
  nama: string;
  alamat: string;
  telepon: string;
};

export type Mekanik = {
  id: string;
  bengkelId: string;
  nama: string;
  telepon: string;
  spesialisasi: string;
  status: "Aktif" | "Tidak Aktif";
  createdAt: string;
};

export type Pelanggan = {
  id: string;
  userId?: string | undefined;
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
  "Booking" | "Menunggu" | "Diproses" | "Selesai" | "Menunggu Pembayaran" | "Selesai Dibayar";

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
  bookingId?: string | undefined;
  pelanggan: string;
  telepon?: string | undefined;
  bengkelId?: string | undefined;
  mekanikId?: string | undefined;
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
  /** Hasil pemeriksaan mekanik (ERD: servis.hasil_pemeriksaan). */
  hasilPemeriksaan?: string;
  /** Estimasi biaya awal sebelum pengerjaan. */
  estimasiBiaya?: number | undefined;
  /** Estimasi waktu pengerjaan, contoh "2 jam". */
  estimasiWaktu?: string | undefined;
  /** Estimasi tanggal/jam selesai pengerjaan. */
  estimasiSelesai?: string | undefined;
  tanggalMulai?: string | undefined;
  tanggalSelesai?: string | undefined;
};

/** Entitas Pembayaran / Transaksi (1 servis : 1 pembayaran). */
export type Pembayaran = {
  id: string;
  servisId: string;
  noTransaksi: string;
  metode: MetodeBayar;
  tanggalBayar: string;
  totalBayar: number;
  status: "Belum Dibayar" | "Menunggu Verifikasi" | "Lunas" | "Bukti Ditolak";
  /** Object URL until a managed object-storage backend is connected. */
  buktiUrl?: string;
  alasanTolak?: string;
  verifiedAt?: string;
  verifiedBy?: string;
};

export type Notifikasi = {
  id: string;
  role: "admin" | "owner" | "pelanggan" | "semua";
  tipe: "pembayaran" | "booking" | "servis" | "sistem";
  judul: string;
  pesan: string;
  waktu: string;
  dibaca: boolean;
  link?: string | undefined;
  servisId?: string | undefined;
  noTransaksi?: string | undefined;
  pelanggan?: string | undefined;
  total?: number | undefined;
  buktiUrl?: string | undefined;
};

export type StatusBooking = "Menunggu Konfirmasi" | "Diterima" | "Ditolak";

export type Booking = {
  id: string;
  nomor: string;
  pelanggan: string;
  /** Customer identity; never authorize customer data from display name. */
  customerId?: string;
  vehicleId?: string;
  bengkelId?: string | undefined;
  mekanikId?: string | undefined;
  kendaraan: string;
  plat: string;
  jenis: string;
  keluhan: string;
  tanggal: string;
  waktu: string;
  catatan: string;
  /** Mekanik yang diinginkan pelanggan (opsional). */
  mekanikDiinginkan?: string | undefined;
  /** Mekanik yang ditugaskan admin (opsional). */
  mekanikDitugaskan?: string | undefined;
  /** Alasan penolakan booking oleh admin. */
  alasanTolak?: string | undefined;
  /** ISO local date-time assigned by admin after approval. */
  estimasiSelesai?: string | undefined;
  status: StatusBooking;
};

export type Sparepart = {
  id: string;
  kode: string;
  nama: string;
  kategori: string;
  satuan: string;
  harga: number;
  stok: number;
  stokMinimum: number;
  terpakai: number;
  tanggalUpdate: string;
};

export type StatusStok = "Habis" | "Menipis" | "Aman";

export const statusStok = (sp: Sparepart): StatusStok =>
  sp.stok === 0 ? "Habis" : sp.stok <= sp.stokMinimum ? "Menipis" : "Aman";

/** Log pergerakan stok (ERD: riwayat_stok). */
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

/** Entitas Stok Opname */
export type StokOpname = {
  id: string;
  tanggal: string;
  keterangan: string;
  totalItem: number;
  selisihTotal: number;
};

/** Entitas Retur Sparepart */
export type ReturSparepart = {
  id: string;
  sparepartId: string;
  pembelianId?: string | null;
  jumlah: number;
  tanggal: string;
  alasan: string;
  status: "Diproses" | "Disetujui" | "Ditolak";
};

/** Entitas Laporan Ringkasan Stok */
export type LaporanRingkasanStok = {
  id: string;
  sparepartId: string;
  stokAwal: number;
  stokMasuk: number;
  stokKeluar: number;
  stokAkhir: number;
  periode: string;
};

export const JENIS_SERVIS = [
  "Servis Berkala",
  "Servis Mesin",
  "Servis Rem",
  "Servis AC",
  "Servis Kelistrikan",
  "Ganti Oli",
  "Pemeriksaan Kendaraan",
  "Lainnya",
];

const uid = () => Math.random().toString(36).slice(2, 9);

const pelangganAwal: Pelanggan[] = [
  {
    id: "pl-001",
    nama: "Budi Santoso",
    email: "budi@mail.test",
    telepon: "0812-3344-5566",
    alamat: "Jl. Merdeka No. 12, Bandung",
    kendaraan: "Honda Beat 2019",
    plat: "D 1234 ABC",
  },
  {
    id: "pl-002",
    nama: "Siti Rahmawati",
    email: "siti@mail.test",
    telepon: "0857-1122-9090",
    alamat: "Jl. Cihampelas No. 7, Bandung",
    kendaraan: "Yamaha NMAX 2021",
    plat: "D 5521 KJ",
  },
  {
    id: "pl-003",
    nama: "Agus Prasetyo",
    email: "agus@mail.test",
    telepon: "0813-7788-4455",
    alamat: "Jl. Sudirman No. 88, Cimahi",
    kendaraan: "Toyota Avanza 2017",
    plat: "D 9087 PL",
  },
  {
    id: "pl-004",
    nama: "Dewi Lestari",
    email: "dewi@mail.test",
    telepon: "0895-2211-3344",
    alamat: "Jl. Pasteur No. 45, Bandung",
    kendaraan: "Honda Vario 160",
    plat: "D 3311 QW",
  },
  {
    id: "pl-005",
    nama: "Rizky Ramadhan",
    email: "rizky@mail.test",
    telepon: "0821-9911-2233",
    alamat: "Jl. Buah Batu No. 21, Bandung",
    kendaraan: "Suzuki Satria FU",
    plat: "D 7742 ZX",
  },
  {
    id: "pl-006",
    nama: "Hendra Wijaya",
    email: "hendra@mail.test",
    telepon: "0877-6655-1010",
    alamat: "Jl. Kopo No. 90, Bandung",
    kendaraan: "Daihatsu Xenia 2015",
    plat: "D 6120 MN",
  },
];

const kendaraanAwal: Kendaraan[] = [
  {
    id: "kd-001",
    pelangganId: "pl-001",
    merk: "Honda",
    tipe: "Beat",
    tahun: 2019,
    plat: "D 1234 ABC",
    kilometer: 41200,
  },
  {
    id: "kd-002",
    pelangganId: "pl-001",
    merk: "Honda",
    tipe: "PCX",
    tahun: 2022,
    plat: "D 8890 GH",
    kilometer: 15600,
  },
  {
    id: "kd-003",
    pelangganId: "pl-002",
    merk: "Yamaha",
    tipe: "NMAX",
    tahun: 2021,
    plat: "D 5521 KJ",
    kilometer: 28750,
  },
  {
    id: "kd-004",
    pelangganId: "pl-003",
    merk: "Toyota",
    tipe: "Avanza",
    tahun: 2017,
    plat: "D 9087 PL",
    kilometer: 98400,
  },
  {
    id: "kd-005",
    pelangganId: "pl-004",
    merk: "Honda",
    tipe: "Vario 160",
    tahun: 2023,
    plat: "D 3311 QW",
    kilometer: 9200,
  },
  {
    id: "kd-006",
    pelangganId: "pl-005",
    merk: "Suzuki",
    tipe: "Satria FU",
    tahun: 2018,
    plat: "D 7742 ZX",
    kilometer: 52100,
  },
  {
    id: "kd-007",
    pelangganId: "pl-006",
    merk: "Daihatsu",
    tipe: "Xenia",
    tahun: 2015,
    plat: "D 6120 MN",
    kilometer: 132500,
  },
];

const mkServis = (s: Omit<Servis, "id" | "total" | "items"> & { items?: ItemPart[] }): Servis => ({
  items: [],
  ...s,
  id: uid(),
  total: s.biayaJasa + s.biayaPart,
});

const servisAwal: Servis[] = [
  mkServis({
    nomor: "SRV-2026-0148",
    pelanggan: "Budi Santoso",
    kendaraan: "Honda Beat 2019",
    plat: "D 1234 ABC",
    jenis: "Servis Ringan",
    keluhan: "Mesin kasar saat langsam",
    pekerjaan: "Servis ringan + ganti busi",
    mekanik: "Joko",
    tanggal: "2026-08-18",
    status: "Diproses",
    sparepart: "Busi NGK, Oli Federal 0.8L",
    catatan: "Disarankan ganti filter udara bulan depan",
    items: [
      { sparepartId: "sp-002", kode: "SP-002", nama: "Busi NGK CPR9EA", harga: 27000, jumlah: 1 },
      {
        sparepartId: "sp-001",
        kode: "SP-001",
        nama: "Oli Mesin AHM MPX 0.8L",
        harga: 48000,
        jumlah: 1,
      },
    ],
    biayaJasa: 70000,
    biayaPart: 75000,
    noTransaksi: "TRX-2026-0148",
  }),
  mkServis({
    nomor: "SRV-2026-0147",
    pelanggan: "Siti Rahmawati",
    kendaraan: "Yamaha NMAX 2021",
    plat: "D 5521 KJ",
    jenis: "Perbaikan Rem",
    keluhan: "Rem depan kurang pakem",
    pekerjaan: "Ganti kampas rem depan",
    mekanik: "Dedi",
    tanggal: "2026-08-18",
    status: "Menunggu",
    sparepart: "Kampas Rem Depan",
    catatan: "",
    items: [
      {
        sparepartId: "sp-003",
        kode: "SP-003",
        nama: "Kampas Rem Depan NMAX",
        harga: 95000,
        jumlah: 1,
      },
    ],
    biayaJasa: 60000,
    biayaPart: 95000,
    noTransaksi: "TRX-2026-0147",
  }),
  mkServis({
    nomor: "SRV-2026-0146",
    pelanggan: "Budi Santoso",
    kendaraan: "Honda Beat 2019",
    plat: "D 1234 ABC",
    jenis: "Ganti Oli",
    keluhan: "Ganti oli rutin bulanan",
    pekerjaan: "Ganti oli mesin",
    mekanik: "Joko",
    tanggal: "2026-08-12",
    status: "Menunggu Pembayaran",
    sparepart: "Oli AHM MPX 0.8L",
    catatan: "",
    items: [
      {
        sparepartId: "sp-001",
        kode: "SP-001",
        nama: "Oli Mesin AHM MPX 0.8L",
        harga: 48000,
        jumlah: 1,
      },
    ],
    biayaJasa: 25000,
    biayaPart: 48000,
    noTransaksi: "TRX-2026-0146",
  }),
  mkServis({
    nomor: "SRV-2026-0145",
    pelanggan: "Agus Prasetyo",
    kendaraan: "Toyota Avanza 2017",
    plat: "D 9087 PL",
    jenis: "Kaki-kaki",
    keluhan: "Bunyi pada kaki-kaki",
    pekerjaan: "Ganti link stabilizer",
    mekanik: "Rudi",
    tanggal: "2026-08-17",
    status: "Selesai Dibayar",
    sparepart: "Link Stabilizer x2",
    catatan: "Sudah test drive, aman",
    items: [
      {
        sparepartId: "sp-007",
        kode: "SP-007",
        nama: "Link Stabilizer Avanza",
        harga: 175000,
        jumlah: 2,
      },
    ],
    biayaJasa: 130000,
    biayaPart: 350000,
    noTransaksi: "TRX-2026-0145",
  }),
  mkServis({
    nomor: "SRV-2026-0144",
    pelanggan: "Budi Santoso",
    kendaraan: "Honda Beat 2019",
    plat: "D 1234 ABC",
    jenis: "Servis Ringan",
    keluhan: "Rantai kendur dan berisik",
    pekerjaan: "Setel & lumasi rantai",
    mekanik: "Dedi",
    tanggal: "2026-07-28",
    status: "Selesai Dibayar",
    sparepart: "Chain Lube",
    catatan: "Rantai mulai aus",
    biayaJasa: 35000,
    biayaPart: 20000,
    noTransaksi: "TRX-2026-0144",
  }),
  mkServis({
    nomor: "SRV-2026-0143",
    pelanggan: "Hendra Wijaya",
    kendaraan: "Daihatsu Xenia 2015",
    plat: "D 6120 MN",
    jenis: "Servis AC",
    keluhan: "AC kurang dingin",
    pekerjaan: "Servis AC + isi freon",
    mekanik: "Rudi",
    tanggal: "2026-08-14",
    status: "Selesai Dibayar",
    sparepart: "Freon R134a",
    catatan: "",
    items: [
      { sparepartId: "sp-008", kode: "SP-008", nama: "Freon R134a", harga: 120000, jumlah: 1 },
    ],
    biayaJasa: 230000,
    biayaPart: 120000,
    noTransaksi: "TRX-2026-0143",
  }),
  mkServis({
    nomor: "SRV-2025-0121",
    pelanggan: "Budi Santoso",
    kendaraan: "Honda Beat 2019",
    plat: "D 1234 ABC",
    jenis: "Servis Besar",
    keluhan: "Tarikan berat",
    pekerjaan: "Overhaul ringan mesin",
    mekanik: "Joko",
    tanggal: "2025-11-09",
    status: "Selesai Dibayar",
    sparepart: "Busi NGK",
    catatan: "",
    items: [
      { sparepartId: "sp-002", kode: "SP-002", nama: "Busi NGK CPR9EA", harga: 27000, jumlah: 2 },
    ],
    biayaJasa: 250000,
    biayaPart: 54000,
    noTransaksi: "TRX-2025-0121",
    metodeBayar: "Cash",
  }),
  mkServis({
    nomor: "SRV-2025-0118",
    pelanggan: "Siti Rahmawati",
    kendaraan: "Yamaha NMAX 2021",
    plat: "D 5521 KJ",
    jenis: "Ganti Oli",
    keluhan: "Servis rutin",
    pekerjaan: "Ganti oli mesin",
    mekanik: "Bayu",
    tanggal: "2025-06-21",
    status: "Selesai Dibayar",
    sparepart: "Oli AHM MPX",
    catatan: "",
    items: [
      {
        sparepartId: "sp-001",
        kode: "SP-001",
        nama: "Oli Mesin AHM MPX 0.8L",
        harga: 48000,
        jumlah: 1,
      },
    ],
    biayaJasa: 30000,
    biayaPart: 48000,
    noTransaksi: "TRX-2025-0118",
    metodeBayar: "QRIS",
  }),
];

const bookingAwal: Booking[] = [
  {
    id: uid(),
    nomor: "BK-2026-0032",
    pelanggan: "Budi Santoso",
    kendaraan: "Honda Beat 2019",
    plat: "D 1234 ABC",
    jenis: "Servis Besar",
    keluhan: "Tarikan berat & boros bensin",
    tanggal: "2026-08-20",
    waktu: "09:00",
    catatan: "Mohon dikerjakan pagi",
    mekanikDiinginkan: "Joko",
    status: "Menunggu Konfirmasi",
  },
  {
    id: uid(),
    nomor: "BK-2026-0031",
    pelanggan: "Dewi Lestari",
    kendaraan: "Honda Vario 160",
    plat: "D 3311 QW",
    jenis: "Ganti Oli",
    keluhan: "Ganti oli rutin",
    tanggal: "2026-08-19",
    waktu: "13:00",
    catatan: "",
    status: "Menunggu Konfirmasi",
  },
  {
    id: uid(),
    nomor: "BK-2026-0030",
    pelanggan: "Siti Rahmawati",
    kendaraan: "Yamaha NMAX 2021",
    plat: "D 5521 KJ",
    jenis: "Perbaikan Rem",
    keluhan: "Rem depan kurang pakem",
    tanggal: "2026-08-18",
    waktu: "10:30",
    catatan: "",
    mekanikDiinginkan: "Dedi",
    mekanikDitugaskan: "Dedi",
    status: "Diterima",
  },
  {
    id: uid(),
    nomor: "BK-2026-0029",
    pelanggan: "Rizky Ramadhan",
    kendaraan: "Suzuki Satria FU",
    plat: "D 7742 ZX",
    jenis: "Kelistrikan",
    keluhan: "Lampu utama mati",
    tanggal: "2026-08-16",
    waktu: "15:00",
    catatan: "",
    status: "Ditolak",
    alasanTolak: "Jadwal servis pada tanggal tersebut sudah penuh. Silakan pilih tanggal lain.",
  },
];

const sparepartAwal: Sparepart[] = [
  {
    id: "sp-001",
    kode: "SP-001",
    nama: "Oli Mesin AHM MPX 0.8L",
    kategori: "Pelumas",
    satuan: "Botol",
    harga: 48000,
    stok: 34,
    stokMinimum: 10,
    terpakai: 22,
    tanggalUpdate: "2026-08-18",
  },
  {
    id: "sp-002",
    kode: "SP-002",
    nama: "Busi NGK CPR9EA",
    kategori: "Pengapian",
    satuan: "Pcs",
    harga: 27000,
    stok: 18,
    stokMinimum: 8,
    terpakai: 14,
    tanggalUpdate: "2026-08-18",
  },
  {
    id: "sp-003",
    kode: "SP-003",
    nama: "Kampas Rem Depan NMAX",
    kategori: "Pengereman",
    satuan: "Set",
    harga: 95000,
    stok: 6,
    stokMinimum: 6,
    terpakai: 9,
    tanggalUpdate: "2026-08-17",
  },
  {
    id: "sp-004",
    kode: "SP-004",
    nama: "Filter Udara Beat",
    kategori: "Filter",
    satuan: "Pcs",
    harga: 62000,
    stok: 0,
    stokMinimum: 5,
    terpakai: 12,
    tanggalUpdate: "2026-08-15",
  },
  {
    id: "sp-005",
    kode: "SP-005",
    nama: "Aki GS Astra NS40",
    kategori: "Kelistrikan",
    satuan: "Unit",
    harga: 610000,
    stok: 4,
    stokMinimum: 3,
    terpakai: 3,
    tanggalUpdate: "2026-08-10",
  },
  {
    id: "sp-006",
    kode: "SP-006",
    nama: "Ban Luar IRC 80/90-14",
    kategori: "Ban",
    satuan: "Pcs",
    harga: 215000,
    stok: 11,
    stokMinimum: 4,
    terpakai: 7,
    tanggalUpdate: "2026-08-12",
  },
  {
    id: "sp-007",
    kode: "SP-007",
    nama: "Link Stabilizer Avanza",
    kategori: "Kaki-kaki",
    satuan: "Pcs",
    harga: 175000,
    stok: 8,
    stokMinimum: 4,
    terpakai: 5,
    tanggalUpdate: "2026-08-17",
  },
  {
    id: "sp-008",
    kode: "SP-008",
    nama: "Freon R134a",
    kategori: "AC",
    satuan: "Tabung",
    harga: 120000,
    stok: 15,
    stokMinimum: 5,
    terpakai: 10,
    tanggalUpdate: "2026-08-14",
  },
];

export const SATUAN_PART = ["Pcs", "Botol", "Set", "Unit", "Tabung", "Liter"];

export const bengkelAwal: Bengkel[] = [
  {
    id: "bengkel-001",
    nama: "AppBenk Motor Pusat",
    alamat: "Jl. Riau No. 45, Bandung",
    telepon: "022-7102938",
  },
  {
    id: "bengkel-002",
    nama: "AppBenk Motor Cabang Timur",
    alamat: "Jl. Soekarno Hatta No. 120, Bandung",
    telepon: "022-7561234",
  },
];

export const mekanikAwal: Mekanik[] = [
  {
    id: "mk-001",
    bengkelId: "bengkel-001",
    nama: "Andi Pratamant",
    telepon: "08123456781",
    spesialisasi: "Mesin",
    status: "Aktif",
    createdAt: "2026-09-01",
  },
  {
    id: "mk-002",
    bengkelId: "bengkel-001",
    nama: "Budi Santoso",
    telepon: "08123456782",
    spesialisasi: "Kelistrikan",
    status: "Aktif",
    createdAt: "2026-09-01",
  },
  {
    id: "mk-1788834282861-xg0i",
    bengkelId: "bengkel-001",
    nama: "budi",
    telepon: "09876355",
    spesialisasi: "Kaki-kaki",
    status: "Aktif",
    createdAt: "2026-09-01",
  },
  {
    id: "mk-1788834361513-fs2d",
    bengkelId: "bengkel-001",
    nama: "amba tuner",
    telepon: "0887656776656",
    spesialisasi: "Bor up",
    status: "Aktif",
    createdAt: "2026-09-01",
  },
  {
    id: "mk-005",
    bengkelId: "bengkel-002",
    nama: "Deni Kurniawan",
    telepon: "08139988771",
    spesialisasi: "AC",
    status: "Aktif",
    createdAt: "2026-09-01",
  },
  {
    id: "mk-006",
    bengkelId: "bengkel-002",
    nama: "Eko Prasetyo",
    telepon: "08139988772",
    spesialisasi: "Kaki-kaki",
    status: "Aktif",
    createdAt: "2026-09-01",
  },
];

const pembelianAwal: PembelianSparepart[] = [
  {
    id: uid(),
    nomor: "PB-2026-0011",
    sparepartId: "sp-001",
    supplier: "PT Sinar Pelumas",
    tanggal: "2026-08-05",
    jumlah: 24,
    harga: 41000,
    total: 984000,
    status: "Diterima",
  },
  {
    id: uid(),
    nomor: "PB-2026-0010",
    sparepartId: "sp-003",
    supplier: "CV Rem Jaya",
    tanggal: "2026-07-28",
    jumlah: 10,
    harga: 78000,
    total: 780000,
    status: "Diterima",
  },
  {
    id: uid(),
    nomor: "PB-2026-0009",
    sparepartId: "sp-006",
    supplier: "Toko Ban Makmur",
    tanggal: "2026-07-19",
    jumlah: 12,
    harga: 182000,
    total: 2184000,
    status: "Diterima",
  },
];

const riwayatStokAwal: RiwayatStok[] = [
  {
    id: uid(),
    sparepartId: "sp-001",
    jenis: "Masuk",
    jumlah: 24,
    tanggal: "2026-08-05",
    keterangan: "Pembelian PB-2026-0011 · PT Sinar Pelumas",
  },
  {
    id: uid(),
    sparepartId: "sp-001",
    jenis: "Keluar",
    jumlah: 1,
    tanggal: "2026-08-18",
    keterangan: "Dipakai servis SRV-2026-0148",
  },
  {
    id: uid(),
    sparepartId: "sp-002",
    jenis: "Keluar",
    jumlah: 1,
    tanggal: "2026-08-18",
    keterangan: "Dipakai servis SRV-2026-0148",
  },
  {
    id: uid(),
    sparepartId: "sp-003",
    jenis: "Masuk",
    jumlah: 10,
    tanggal: "2026-07-28",
    keterangan: "Pembelian PB-2026-0010 · CV Rem Jaya",
  },
  {
    id: uid(),
    sparepartId: "sp-007",
    jenis: "Keluar",
    jumlah: 2,
    tanggal: "2026-08-17",
    keterangan: "Dipakai servis SRV-2026-0145",
  },
];

const penggunaanAwal: PenggunaanSparepart[] = [
  {
    id: uid(),
    sparepartId: "sp-002",
    servisId: "-",
    servisNomor: "SRV-2026-0148",
    tanggal: "2026-08-18",
    jumlah: 1,
    mekanik: "Joko",
    keterangan: "Ganti busi",
  },
  {
    id: uid(),
    sparepartId: "sp-001",
    servisId: "-",
    servisNomor: "SRV-2026-0148",
    tanggal: "2026-08-18",
    jumlah: 1,
    mekanik: "Joko",
    keterangan: "Ganti oli mesin",
  },
  {
    id: uid(),
    sparepartId: "sp-007",
    servisId: "-",
    servisNomor: "SRV-2026-0145",
    tanggal: "2026-08-17",
    jumlah: 2,
    mekanik: "Rudi",
    keterangan: "Ganti link stabilizer",
  },
];

const pembayaranAwal: Pembayaran[] = [
  {
    id: uid(),
    servisId: "-",
    noTransaksi: "TRX-2026-0145",
    metode: "Transfer Bank",
    tanggalBayar: "2026-08-17",
    totalBayar: 480000,
    status: "Lunas",
  },
  {
    id: uid(),
    servisId: "-",
    noTransaksi: "TRX-2026-0143",
    metode: "Cash",
    tanggalBayar: "2026-08-14",
    totalBayar: 350000,
    status: "Lunas",
  },
  {
    id: uid(),
    servisId: "-",
    noTransaksi: "TRX-2025-0121",
    metode: "Cash",
    tanggalBayar: "2025-11-09",
    totalBayar: 304000,
    status: "Lunas",
  },
  {
    id: uid(),
    servisId: "-",
    noTransaksi: "TRX-2025-0118",
    metode: "QRIS",
    tanggalBayar: "2025-06-21",
    totalBayar: 78000,
    status: "Lunas",
  },
];

const stokOpnameAwal: StokOpname[] = [
  {
    id: uid(),
    tanggal: "2026-08-30",
    keterangan: "Pemeriksaan stok fisik bulanan",
    totalItem: 8,
    selisihTotal: 0,
  },
];

const returAwal: ReturSparepart[] = [
  {
    id: uid(),
    sparepartId: "sp-004",
    jumlah: 2,
    tanggal: "2026-08-16",
    alasan: "Kemasan filter udara rusak dari supplier",
    status: "Disetujui",
  },
];

const laporanRingkasanAwal: LaporanRingkasanStok[] = [
  {
    id: uid(),
    sparepartId: "sp-001",
    stokAwal: 11,
    stokMasuk: 24,
    stokKeluar: 1,
    stokAkhir: 34,
    periode: "2026-08",
  },
  {
    id: uid(),
    sparepartId: "sp-002",
    stokAwal: 20,
    stokMasuk: 0,
    stokKeluar: 2,
    stokAkhir: 18,
    periode: "2026-08",
  },
  {
    id: uid(),
    sparepartId: "sp-003",
    stokAwal: 7,
    stokMasuk: 0,
    stokKeluar: 1,
    stokAkhir: 6,
    periode: "2026-08",
  },
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
  {
    id: uid(),
    nomor: "CS-001",
    pengirim: "Budi Santoso",
    peran: "Pelanggan",
    subjek: "Tidak dapat melakukan booking",
    kategori: "Booking",
    pesan: "Saat menekan Kirim Booking, jadwal tidak tersimpan.",
    tanggal: "2026-08-29",
    status: "Diproses",
    balasan: "Tim kami sedang memeriksa kendala ini.",
  },
  {
    id: uid(),
    nomor: "CS-002",
    pengirim: "Admin Bengkel",
    peran: "Admin Bengkel",
    subjek: "Laporan stok tidak sinkron",
    kategori: "Sparepart",
    pesan: "Stok sparepart pada laporan berbeda dengan katalog.",
    tanggal: "2026-08-27",
    status: "Selesai",
    balasan: "Sudah diperbaiki pada pembaruan terakhir.",
  },
];

export const KATEGORI_PART: string[] = [
  "Pelumas",
  "Pengereman",
  "Pengapian",
  "Filter",
  "Mesin",
  "Kelistrikan",
  "Kaki-kaki",
  "AC",
  "Ban",
  "Umum",
];

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

const hariIni = () => new Date().toISOString().slice(0, 10);

type Store = {
  pelanggan: Pelanggan[];
  kendaraan: Kendaraan[];
  servis: Servis[];
  sparepart: Sparepart[];
  booking: Booking[];
  pembayaran: Pembayaran[];
  riwayatStok: RiwayatStok[];
  pembelian: PembelianSparepart[];
  penggunaan: PenggunaanSparepart[];
  stokOpname: StokOpname[];
  returSparepart: ReturSparepart[];
  laporanRingkasanStok: LaporanRingkasanStok[];
  bengkel: Bengkel[];
  mekanik: Mekanik[];
  simpanPelanggan: (p: Omit<Pelanggan, "id"> & { id?: string }) => void;
  hapusPelanggan: (id: string) => void;
  simpanKendaraan: (k: Omit<Kendaraan, "id"> & { id?: string }) => void;
  hapusKendaraan: (id: string) => void;
  simpanServis: (
    s: Omit<Servis, "id" | "nomor" | "total" | "noTransaksi" | "biayaPart" | "sparepart"> & {
      id?: string;
      nomor?: string;
    },
  ) => Promise<void>;
  ubahStatusServis: (id: string, status: StatusServis) => void;
  hapusServis: (id: string) => void;
  simpanSparepart: (
    s: Omit<Sparepart, "id" | "terpakai" | "tanggalUpdate"> & { id?: string; terpakai?: number },
  ) => void;
  hapusSparepart: (id: string) => void;
  catatPembelian: (p: Omit<PembelianSparepart, "id" | "nomor" | "total" | "status">) => void;
  ubahPembelian: (id: string, p: Partial<PembelianSparepart>) => Promise<void>;
  hapusPembelian: (id: string) => Promise<void>;
  simpanMekanik: (m: Omit<Mekanik, "id" | "createdAt"> & { id?: string }) => Promise<void>;
  ubahStatusMekanik: (id: string, status: "Aktif" | "Tidak Aktif") => Promise<void>;
  hapusMekanik: (id: string) => Promise<{ success: boolean; message?: string }>;
  refreshMekanik: () => Promise<void>;
  refreshKendaraan: () => Promise<void>;
  refreshBooking: () => Promise<void>;
  refreshServis: () => Promise<void>;
  buatBooking: (b: Omit<Booking, "id" | "nomor" | "status">) => Booking;
  ubahStatusBooking: (id: string, status: StatusBooking, alasan?: string) => void;
  tugaskanMekanikBooking: (id: string, mekanik: string) => void;
  aturEstimasiBooking: (id: string, estimasiSelesai: string) => void;
  ajukanPembayaran: (id: string, metode: MetodeBayar, buktiUrl?: string) => void;
  verifikasiPembayaran: (
    servisId: string,
    disetujui: boolean,
    alasan?: string,
    verifier?: string,
  ) => void;
  catatStokOpname: (so: Omit<StokOpname, "id">) => void;
  catatReturSparepart: (r: Omit<ReturSparepart, "id">) => void;
  tiket: Tiket[];
  buatTiket: (t: Omit<Tiket, "id" | "nomor" | "status" | "tanggal">) => Tiket;
  notifikasi: Notifikasi[];
  tambahNotifikasi: (n: Omit<Notifikasi, "id" | "waktu" | "dibaca">) => void;
  tandaiNotifikasiDibaca: (id: string) => void;
  tandaiSemuaNotifikasiDibaca: (role?: string) => void;
  hapusNotifikasi: (id: string) => void;
};

const StoreContext = createContext<Store | null>(null);

const bacaData = <T,>(kunci: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(window.localStorage.getItem(`appbenk.data.${kunci}`) ?? "") as T;
  } catch {
    return fallback;
  }
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [pelanggan, setPelanggan] = useState(() => bacaData("pelanggan", pelangganAwal));
  const [kendaraan, setKendaraan] = useState(() => bacaData("kendaraan", kendaraanAwal));
  const [servis, setServis] = useState(() => bacaData("servis", servisAwal));
  const [sparepart, setSparepart] = useState(() => bacaData("sparepart", sparepartAwal));
  const [booking, setBooking] = useState(() => bacaData("booking", bookingAwal));
  const [tiket, setTiket] = useState(tiketAwal);
  const [pembayaran, setPembayaran] = useState(() => bacaData("pembayaran", pembayaranAwal));
  const [riwayatStok, setRiwayatStok] = useState(riwayatStokAwal);
  const [pembelian, setPembelian] = useState(pembelianAwal);
  const [penggunaan, setPenggunaan] = useState(penggunaanAwal);
  const [stokOpname, setStokOpname] = useState(() => bacaData("stokOpname", stokOpnameAwal));
  const [returSparepart, setReturSparepart] = useState(() => bacaData("returSparepart", returAwal));
  const [laporanRingkasanStok, setLaporanRingkasanStok] = useState(() =>
    bacaData("laporanRingkasanStok", laporanRingkasanAwal),
  );
  const [bengkel, setBengkel] = useState<Bengkel[]>(() => bacaData("bengkel", bengkelAwal));
  const [mekanik, setMekanik] = useState<Mekanik[]>(() => bacaData("mekanik", mekanikAwal));

  useEffect(() => {
    window.localStorage.setItem("appbenk.data.pelanggan", JSON.stringify(pelanggan));
  }, [pelanggan]);
  useEffect(() => {
    window.localStorage.setItem("appbenk.data.kendaraan", JSON.stringify(kendaraan));
  }, [kendaraan]);
  useEffect(() => {
    window.localStorage.setItem("appbenk.data.servis", JSON.stringify(servis));
  }, [servis]);
  useEffect(() => {
    window.localStorage.setItem("appbenk.data.sparepart", JSON.stringify(sparepart));
  }, [sparepart]);
  useEffect(() => {
    window.localStorage.setItem("appbenk.data.booking", JSON.stringify(booking));
  }, [booking]);
  useEffect(() => {
    window.localStorage.setItem("appbenk.data.pembayaran", JSON.stringify(pembayaran));
  }, [pembayaran]);
  useEffect(() => {
    window.localStorage.setItem("appbenk.data.stokOpname", JSON.stringify(stokOpname));
  }, [stokOpname]);
  useEffect(() => {
    window.localStorage.setItem("appbenk.data.returSparepart", JSON.stringify(returSparepart));
  }, [returSparepart]);
  useEffect(() => {
    window.localStorage.setItem(
      "appbenk.data.laporanRingkasanStok",
      JSON.stringify(laporanRingkasanStok),
    );
  }, [laporanRingkasanStok]);
  useEffect(() => {
    window.localStorage.setItem("appbenk.data.bengkel", JSON.stringify(bengkel));
  }, [bengkel]);
  useEffect(() => {
    window.localStorage.setItem("appbenk.data.mekanik", JSON.stringify(mekanik));
  }, [mekanik]);

  const [notifikasi, setNotifikasi] = useState<Notifikasi[]>(() =>
    bacaData("notifikasi", [
      {
        id: "notif-001",
        role: "admin",
        tipe: "pembayaran",
        judul: "Sistem Pembayaran AppBenk",
        pesan: "Sistem notifikasi pembayaran QRIS dan transfer telah siap menerima konfirmasi pelanggan.",
        waktu: new Date().toISOString(),
        dibaca: false,
      },
    ]),
  );

  useEffect(() => {
    window.localStorage.setItem("appbenk.data.notifikasi", JSON.stringify(notifikasi));
  }, [notifikasi]);

  const tambahNotifikasi = (n: Omit<Notifikasi, "id" | "waktu" | "dibaca">) => {
    const baru: Notifikasi = {
      ...n,
      id: uid(),
      waktu: new Date().toISOString(),
      dibaca: false,
    };
    setNotifikasi((prev) => [baru, ...prev]);
  };

  const tandaiNotifikasiDibaca = (id: string) => {
    setNotifikasi((prev) =>
      prev.map((item) => (item.id === id ? { ...item, dibaca: true } : item)),
    );
  };

  const tandaiSemuaNotifikasiDibaca = (role?: string) => {
    setNotifikasi((prev) =>
      prev.map((item) =>
        !role || item.role === role || item.role === "semua" ? { ...item, dibaca: true } : item,
      ),
    );
  };

  const hapusNotifikasi = (id: string) => {
    setNotifikasi((prev) => prev.filter((item) => item.id !== id));
  };

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    Promise.allSettled([
      pelangganService.getAll(),
      kendaraanService.getAll(),
      sparepartService.getAll(),
      bookingService.getAll(),
      servisService.getAll(),
      pembayaranService.getAll(),
      sparepartService.getPembelian(),
      sparepartService.getPenggunaan(),
      sparepartService.getRiwayatStok(),
      sparepartService.getRetur(),
      mekanikService.getBengkel(),
      mekanikService.getMekanik(),
      supabase().from("detail_servis").select("*"),
    ])
      .then(([pRes, kRes, spRes, bkRes, srvRes, pemRes, beliRes, pakaiRes, riwRes, returRes, bklRes, mekRes, detRes]) => {
        let listPelanggan: Pelanggan[] = [];
        if (pRes.status === "fulfilled" && pRes.value.length > 0) {
          listPelanggan = pRes.value.map((p) => ({
            id: p.id_pelanggan,
            userId: p.user_id ?? undefined,
            nama: p.nama,
            email: p.email,
            telepon: p.no_hp ?? "",
            alamat: p.alamat ?? "",
            kendaraan: "",
            plat: "",
          }));
          setPelanggan(listPelanggan);
        }

        let listKendaraan: Kendaraan[] = [];
        if (kRes.status === "fulfilled" && kRes.value.length > 0) {
          listKendaraan = kRes.value.map((k) => ({
            id: k.id_kendaraan,
            pelangganId: k.id_pelanggan,
            merk: k.merk,
            tipe: k.tipe,
            tahun: k.tahun,
            plat: k.nopol,
            kilometer: 0,
          }));
          setKendaraan(listKendaraan);
        }

        if (spRes.status === "fulfilled" && spRes.value.length > 0) {
          setSparepart(
            spRes.value.map((sp) => {
              let kat = sp.kategori;
              if (kat === "Oli") kat = "Pelumas";
              if (kat === "Rem") kat = "Pengereman";
              return {
                id: sp.id_sparepart,
                kode: sp.id_sparepart,
                nama: sp.nama_sparepart,
                kategori: kat,
                satuan: sp.satuan,
                harga: Number(sp.harga),
                stok: sp.stok_tersedia,
                stokMinimum: sp.stok_minimum,
                terpakai: 0,
                tanggalUpdate: sp.tanggal_update ? sp.tanggal_update.slice(0, 10) : hariIni(),
              };
            }),
          );
        }

        if (bkRes.status === "fulfilled" && bkRes.value.length > 0) {
          setBooking(
            bkRes.value.map((b) => {
              const pel = listPelanggan.find((p) => p.id === b.id_pelanggan);
              const ken = listKendaraan.find((k) => k.id === b.id_kendaraan);
              return {
                id: b.id_booking,
                nomor: b.nomor_booking,
                pelanggan: pel?.nama ?? "Pelanggan",
                customerId: b.id_pelanggan,
                vehicleId: b.id_kendaraan,
                bengkelId: b.id_bengkel ?? "bengkel-001",
                mekanikId: b.id_mekanik ?? undefined,
                kendaraan: ken?.tipe ?? "Kendaraan",
                plat: ken?.plat ?? "",
                jenis: b.jenis_servis,
                keluhan: b.keluhan,
                tanggal: b.tanggal_booking,
                waktu: b.waktu_booking,
                catatan: "",
                mekanikDiinginkan: b.mekanik_diinginkan ?? undefined,
                status:
                  b.status_booking === "disetujui"
                    ? "Diterima"
                    : b.status_booking === "ditolak"
                      ? "Ditolak"
                      : "Menunggu Konfirmasi",
              };
            }),
          );
        }

        if (srvRes.status === "fulfilled" && srvRes.value.length > 0) {
          const detList: any[] =
            detRes && detRes.status === "fulfilled" && (detRes.value as any).data
              ? (detRes.value as any).data
              : [];
          const spList: any[] = spRes && spRes.status === "fulfilled" ? (spRes.value as any) : [];

          setServis(
            srvRes.value.map((s) => {
              const pel = listPelanggan.find((p) => p.id === s.id_pelanggan);
              const ken = listKendaraan.find((k) => k.id === s.id_kendaraan);
              const st: StatusServis =
                s.status_servis === "diproses"
                  ? "Diproses"
                  : s.status_servis === "selesai"
                    ? "Selesai"
                    : s.status_servis === "menunggu_pembayaran"
                      ? "Menunggu Pembayaran"
                      : s.status_servis === "lunas"
                        ? "Selesai Dibayar"
                        : "Menunggu";

              const srvDetails = detList.filter((d: any) => d.id_servis === s.id_servis);
              const items: ItemPart[] = srvDetails.map((d: any) => {
                const sp = spList.find((x: any) => x.id_sparepart === d.id_sparepart);
                return {
                  sparepartId: d.id_sparepart || d.id_detail || d.id_detail_servis,
                  kode: sp?.id_sparepart || d.id_sparepart || "-",
                  nama: sp?.nama_sparepart || d.keterangan || "Sparepart",
                  harga: Number(d.harga || d.harga_satuan || sp?.harga || 0),
                  jumlah: Number(d.jumlah || d.qty || 1),
                };
              });
              const ringkas = items.map((i) => `${i.nama} (${i.jumlah}x)`).join(", ");
              const totalPartCalc = items.reduce((sum, i) => sum + i.harga * i.jumlah, 0);

              return {
                id: s.id_servis,
                nomor: s.nomor_servis,
                bookingId: s.id_booking ?? undefined,
                pelanggan: pel?.nama ?? "Pelanggan",
                kendaraan: ken ? `${ken.merk} ${ken.tipe} ${ken.tahun}`.trim() : "Kendaraan",
                plat: ken?.plat || "",
                bengkelId: s.id_bengkel ?? "bengkel-001",
                mekanikId: s.id_mekanik ?? undefined,
                jenis: s.jenis_servis ?? "Servis Umum",
                keluhan: s.keluhan ?? "",
                pekerjaan: s.pekerjaan || s.catatan || s.jenis_servis || "",
                mekanik: s.mekanik ?? "Andi",
                tanggal: s.tanggal_servis || (s.created_at ? s.created_at.slice(0, 10) : hariIni()),
                status: st,
                sparepart: ringkas,
                items: items,
                catatan: s.catatan ?? "",
                biayaJasa: Number(s.biaya_jasa || 0),
                biayaPart: Number(s.biaya_sparepart || totalPartCalc || 0),
                total: Number(s.total_biaya || 0),
                noTransaksi: `TRX-${s.nomor_servis.replace("SRV-", "")}`,
                estimasiBiaya: s.estimasi_biaya ? Number(s.estimasi_biaya) : undefined,
                estimasiWaktu: s.estimasi_waktu ?? undefined,
                estimasiSelesai: s.estimasi_selesai ?? undefined,
                tanggalMulai: s.tanggal_mulai ?? undefined,
                tanggalSelesai: s.tanggal_selesai ?? undefined,
              };
            }),
          );
        }

        if (bklRes.status === "fulfilled" && bklRes.value.length > 0) {
          setBengkel(
            bklRes.value.map((b) => ({
              id: b.id_bengkel,
              nama: b.nama_bengkel,
              alamat: b.alamat ?? "",
              telepon: b.no_telepon ?? "",
            })),
          );
        }

        if (mekRes.status === "fulfilled" && mekRes.value.length > 0) {
          setMekanik(
            mekRes.value.map((m) => ({
              id: m.id_mekanik,
              bengkelId: m.id_bengkel,
              nama: m.nama_mekanik,
              telepon: m.no_telepon ?? "",
              spesialisasi: m.spesialisasi ?? "Umum",
              status: m.status,
              createdAt: m.created_at ? m.created_at.slice(0, 10) : hariIni(),
            })),
          );
        }

        if (pemRes.status === "fulfilled" && pemRes.value.length > 0) {
          setPembayaran(
            pemRes.value.map((p) => {
              const st =
                p.status_pembayaran === "lunas"
                  ? "Lunas"
                  : p.status_pembayaran === "menunggu_verifikasi"
                    ? "Menunggu Verifikasi"
                    : p.status_pembayaran === "ditolak"
                      ? "Bukti Ditolak"
                      : "Belum Dibayar";
              const met: MetodeBayar =
                p.metode_pembayaran === "qris"
                  ? "QRIS"
                  : p.metode_pembayaran === "transfer"
                    ? "Transfer Bank"
                    : "Cash";
              return {
                id: p.id_pembayaran,
                servisId: p.id_servis,
                noTransaksi: p.nomor_transaksi,
                metode: met,
                tanggalBayar: p.tanggal_bayar ? p.tanggal_bayar.slice(0, 10) : hariIni(),
                totalBayar: Number(p.jumlah_bayar || 0),
                status: st,
                ...(p.bukti_pembayaran ? { buktiUrl: p.bukti_pembayaran } : {}),
                ...(p.alasan_penolakan ? { alasanTolak: p.alasan_penolakan } : {}),
                ...(p.verified_at ? { verifiedAt: p.verified_at } : {}),
                ...(p.verified_by ? { verifiedBy: p.verified_by } : {}),
              };
            }),
          );
        }

        if (beliRes.status === "fulfilled" && beliRes.value.length > 0) {
          setPembelian(
            beliRes.value.map((b) => ({
              id: b.id_pembelian_sparepart || (b as any).id_pembelian || uid(),
              nomor: b.nomor_pembelian,
              sparepartId: b.id_sparepart,
              supplier: b.supplier,
              tanggal: b.tanggal,
              jumlah: b.jumlah,
              harga: Number(b.harga || 0),
              total: Number(b.total || 0),
              status: "Diterima",
            })),
          );
        }

        if (riwRes.status === "fulfilled" && riwRes.value.length > 0) {
          setRiwayatStok(
            riwRes.value.map((r) => ({
              id: r.id_riwayat_stok || (r as any).id_riwayat || uid(),
              sparepartId: r.id_sparepart,
              jenis: (r.jenis === "keluar" || (r as any).tipe === "keluar") ? "Keluar" : "Masuk",
              jumlah: r.jumlah || (r as any).qty || 1,
              tanggal: r.tanggal ? r.tanggal.slice(0, 10) : hariIni(),
              keterangan: r.keterangan || "",
            })),
          );
        }

        if (pakaiRes.status === "fulfilled" && pakaiRes.value.length > 0) {
          setPenggunaan(
            pakaiRes.value.map((p) => ({
              id: p.id_penggunaan_sparepart || (p as any).id_penggunaan || uid(),
              sparepartId: p.id_sparepart,
              servisId: p.id_servis,
              servisNomor: p.id_servis,
              tanggal: p.tanggal,
              jumlah: p.jumlah || (p as any).qty || 1,
              mekanik: p.mekanik || "",
              keterangan: p.keterangan || "",
            })),
          );
        }

        if (returRes.status === "fulfilled" && returRes.value.length > 0) {
          setReturSparepart(
            returRes.value.map((r) => ({
              id: r.id_retur_sparepart,
              sparepartId: r.id_sparepart,
              pembelianId: r.id_pembelian_sparepart ?? null,
              jumlah: r.jumlah,
              tanggal: r.tanggal,
              alasan: r.alasan,
              status:
                (r.status as string) === "disetujui" || (r.status as string) === "Disetujui"
                  ? "Disetujui"
                  : (r.status as string) === "ditolak" || (r.status as string) === "Ditolak"
                    ? "Ditolak"
                    : "Diproses",
            })),
          );
        }
      })
      .catch(() => {});
  }, []);

  const value = useMemo<Store>(
    () => ({
      pelanggan,
      kendaraan,
      servis,
      sparepart,
      booking,
      tiket,
      pembayaran,
      riwayatStok,
      pembelian,
      penggunaan,
      stokOpname,
      returSparepart,
      laporanRingkasanStok,
      bengkel,
      mekanik,
      buatTiket: (t) => {
        const baru: Tiket = {
          ...t,
          id: uid(),
          nomor: `CS-${String(tiket.length + 1).padStart(3, "0")}`,
          tanggal: hariIni(),
          status: "Menunggu",
        };
        setTiket((l) => [baru, ...l]);
        return baru;
      },

      simpanPelanggan: (p) => {
        const id = p.id || uid();
        setPelanggan((list) =>
          p.id
            ? list.map((x) => (x.id === p.id ? ({ ...x, ...p } as Pelanggan) : x))
            : [{ ...p, id } as Pelanggan, ...list],
        );
        if (isSupabaseConfigured()) {
          if (p.id) {
            pelangganService
              .update(p.id, { nama: p.nama, email: p.email, no_hp: p.telepon, alamat: p.alamat })
              .catch(() => {});
          } else {
            pelangganService
              .create({ nama: p.nama, email: p.email, no_hp: p.telepon, alamat: p.alamat })
              .catch(() => {});
          }
        }
      },
      hapusPelanggan: (id) => {
        setPelanggan((l) => l.filter((x) => x.id !== id));
        setKendaraan((l) => l.filter((x) => x.pelangganId !== id));
        if (isSupabaseConfigured()) {
          pelangganService.delete(id).catch(() => {});
        }
      },
      simpanKendaraan: (k) => {
        const isExisting = Boolean(k.id && kendaraan.some((x) => x.id === k.id));
        const id =
          k.id || `kd-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        setKendaraan((list) =>
          isExisting
            ? list.map((x) => (x.id === k.id ? ({ ...x, ...k } as Kendaraan) : x))
            : [{ ...k, id } as Kendaraan, ...list],
        );
        if (isSupabaseConfigured()) {
          if (isExisting && k.id) {
            kendaraanService
              .update(k.id, {
                merk: k.merk,
                tipe: k.tipe,
                tahun: k.tahun,
                nopol: k.plat,
              })
              .catch((err) => console.error("Error updating kendaraan:", err));
          } else {
            kendaraanService
              .create({
                id_kendaraan: id,
                id_pelanggan: k.pelangganId,
                merk: k.merk,
                tipe: k.tipe,
                tahun: k.tahun,
                nopol: k.plat,
                kilometer: k.kilometer,
              })
              .then((created) => {
                if (created?.id_kendaraan && created.id_kendaraan !== id) {
                  setKendaraan((list) =>
                    list.map((x) => (x.id === id ? { ...x, id: created.id_kendaraan } : x)),
                  );
                }
              })
              .catch((err) => console.error("Error creating kendaraan:", err));
          }
        }
      },
      hapusKendaraan: (id) => {
        setKendaraan((l) => l.filter((x) => x.id !== id));
        if (isSupabaseConfigured()) {
          kendaraanService.delete(id).catch(() => {});
        }
      },
      simpanServis: async (s) => {
        const items = s.items ?? [];
        const lamaServis = s.id ? servis.find((x) => x.id === s.id) : undefined;
        const lama = lamaServis?.items ?? [];
        setSparepart((list) => terapkanSelisih(list, lama, items));
        const biayaPart = totalItem(items);
        const ringkas = ringkasanItem(items);
        const tgl = s.tanggal || hariIni();

        // Catat log riwayat stok & penggunaan sparepart untuk selisih pemakaian.
        const delta = new Map<string, number>();
        for (const i of lama) delta.set(i.sparepartId, (delta.get(i.sparepartId) ?? 0) - i.jumlah);
        for (const i of items) delta.set(i.sparepartId, (delta.get(i.sparepartId) ?? 0) + i.jumlah);

        let finalNomor = lamaServis?.nomor || s.nomor || "";

        setServis((list) => {
          const total = s.biayaJasa + biayaPart;
          let nomor = lamaServis?.nomor || s.nomor || "";
          if (s.id) {
            const foundInList = list.find((x) => x.id === s.id);
            if (!nomor && foundInList?.nomor) nomor = foundInList.nomor;
            finalNomor = nomor;
            return list.map((x) =>
              x.id === s.id
                ? {
                    ...x,
                    ...s,
                    nomor: x.nomor || nomor,
                    items,
                    biayaPart,
                    sparepart: ringkas,
                    total,
                  }
                : x,
            );
          } else {
            nomor = generateNextNomorServis(list);
            finalNomor = nomor;
            const seqSuffix = nomor.replace("SRV-", "");
            return [
              {
                ...s,
                items,
                biayaPart,
                sparepart: ringkas,
                id: uid(),
                nomor,
                total,
                noTransaksi: `TRX-${seqSuffix}`,
              } as Servis,
              ...list,
            ];
          }
        });

        const idServis = s.id ?? uid();
        const logStok: RiwayatStok[] = [];
        const logPakai: PenggunaanSparepart[] = [];
        for (const [sparepartId, d] of delta) {
          if (!d) continue;
          logStok.push({
            id: uid(),
            sparepartId,
            jenis: d > 0 ? "Keluar" : "Masuk",
            jumlah: Math.abs(d),
            tanggal: tgl,
            keterangan: d > 0 ? `Dipakai servis ${finalNomor}` : `Koreksi pemakaian servis ${finalNomor}`,
          });
          if (d > 0)
            logPakai.push({
              id: uid(),
              sparepartId,
              servisId: idServis,
              servisNomor: finalNomor,
              tanggal: tgl,
              jumlah: d,
              mekanik: s.mekanik,
              keterangan: s.pekerjaan || s.jenis,
            });
        }
        if (logStok.length) setRiwayatStok((l) => [...logStok, ...l]);
        if (logPakai.length) setPenggunaan((l) => [...logPakai, ...l]);

        if (isSupabaseConfigured()) {
          try {
            // 1. Cari atau buat/update pelanggan di Supabase
            const existingPel = await pelangganService.getAll();
            let p = existingPel.find(
              (x) => x.nama.toLowerCase() === s.pelanggan.trim().toLowerCase(),
            );
            if (!p) {
              const safeSlug =
                s.pelanggan.toLowerCase().replace(/[^a-z0-9]/g, "_") || "customer";
              const randomEmail = `${safeSlug}_${Date.now().toString(36)}@appbenk.local`;
              p = await pelangganService.create({
                nama: s.pelanggan.trim(),
                email: randomEmail,
                ...(s.telepon ? { no_hp: s.telepon } : {}),
                alamat: "Pendaftaran langsung operasional servis",
              });
            } else if (s.telepon && p.no_hp !== s.telepon) {
              await pelangganService.update(p.id_pelanggan, { no_hp: s.telepon }).catch(() => {});
            }

            // 2. Cari atau buat/update kendaraan di Supabase
            const existingKen = await kendaraanService.getByPelanggan(p.id_pelanggan);
            let k = existingKen.find(
              (x) =>
                (s.plat && x.nopol.toLowerCase() === s.plat.trim().toLowerCase()) ||
                x.tipe.toLowerCase() === s.kendaraan.trim().toLowerCase(),
            );
            if (!k) {
              const merk = s.kendaraan.trim().split(" ")[0] || "Motor";
              k = await kendaraanService.create({
                id_pelanggan: p.id_pelanggan,
                merk,
                tipe: s.kendaraan || "Kendaraan",
                tahun: 2023,
                nopol: s.plat || "D 0000 XX",
              });
            }

            // 3. Konversi status ke format DB
            const dbStatus =
              s.status === "Menunggu"
                ? "menunggu"
                : s.status === "Diproses"
                  ? "diproses"
                  : s.status === "Selesai"
                    ? "selesai"
                    : s.status === "Menunggu Pembayaran"
                      ? "menunggu_pembayaran"
                      : "lunas";

            const selectedMekanik = mekanik.find((m) => m.nama === s.mekanik);
            const idMekanik = s.mekanikId || selectedMekanik?.id || undefined;
            const total = s.biayaJasa + biayaPart;

            // 4. Periksa apakah ini EDIT terhadap servis yang sudah ada di Supabase
            let isExisting = false;
            if (s.id) {
              const existingServis = await servisService.getById(s.id).catch(() => null);
              if (existingServis) {
                isExisting = true;
              }
            }

            if (isExisting && s.id) {
              // UPDATE SERVIS
              await servisService.update(s.id, {
                id_pelanggan: p.id_pelanggan,
                id_kendaraan: k.id_kendaraan,
                id_bengkel: s.bengkelId || "bengkel-001",
                id_mekanik: idMekanik ?? null,
                mekanik: s.mekanik,
                jenis_servis: s.jenis,
                keluhan: s.keluhan,
                pekerjaan: s.pekerjaan || s.catatan,
                biaya_jasa: s.biayaJasa,
                biaya_sparepart: biayaPart,
                total_biaya: total,
                status_servis: dbStatus as any,
                tanggal_servis: tgl,
                catatan: s.catatan || s.pekerjaan,
                estimasi_waktu: s.estimasiWaktu ?? null,
                estimasi_selesai: s.estimasiSelesai ?? null,
              });

              // Update detail servis: hapus detail lama lalu masukkan yang baru
              try {
                await supabase().from("detail_servis").delete().eq("id_servis", s.id);
              } catch {}
              if (items.length > 0) {
                for (const it of items) {
                  await servisService
                    .addDetailServis({
                      id_servis: s.id,
                      id_sparepart: it.sparepartId,
                      jumlah: it.jumlah,
                      harga: it.harga,
                      keterangan: it.nama,
                    })
                    .catch(() => {});
                }
              }
            } else {
              // CREATE SERVIS BARU
              const createdServis = await servisService.create({
                id_servis: s.id,
                id_bengkel: s.bengkelId || "bengkel-001",
                id_mekanik: idMekanik,
                nomor_servis: finalNomor,
                id_pelanggan: p.id_pelanggan,
                id_kendaraan: k.id_kendaraan,
                mekanik: s.mekanik,
                jenis_servis: s.jenis,
                keluhan: s.keluhan,
                pekerjaan: s.pekerjaan || s.catatan,
                biaya_jasa: s.biayaJasa,
                biaya_sparepart: biayaPart,
                total_biaya: total,
                status_servis: dbStatus as any,
                tanggal_servis: tgl,
                catatan: s.catatan || s.pekerjaan,
                estimasi_waktu: s.estimasiWaktu ?? null,
                estimasi_selesai: s.estimasiSelesai ?? null,
              });

              if (createdServis?.id_servis && items.length > 0) {
                for (const it of items) {
                  await servisService
                    .addDetailServis({
                      id_servis: createdServis.id_servis,
                      id_sparepart: it.sparepartId,
                      jumlah: it.jumlah,
                      harga: it.harga,
                      keterangan: it.nama,
                    })
                    .catch(() => {});
                }
              }
            }
          } catch (err) {
            console.error("Gagal sinkronisasi servis ke Supabase:", err);
            throw err;
          }
        }
      },
      ubahStatusServis: (id, status) => {
        setServis((l) => l.map((x) => (x.id === id ? { ...x, status } : x)));
        if (isSupabaseConfigured()) {
          const dbStatus =
            status === "Menunggu"
              ? "menunggu"
              : status === "Diproses"
                ? "diproses"
                : status === "Selesai"
                  ? "selesai"
                  : status === "Menunggu Pembayaran"
                    ? "menunggu_pembayaran"
                    : "lunas";
          servisService.updateStatus(id, dbStatus).catch(() => {});
        }
      },
      hapusServis: (id) => {
        const lama = servis.find((x) => x.id === id);
        setSparepart((list) => terapkanSelisih(list, lama?.items ?? [], []));
        if (lama?.items.length)
          setRiwayatStok((l) => [
            ...lama.items.map((i) => ({
              id: uid(),
              sparepartId: i.sparepartId,
              jenis: "Masuk" as const,
              jumlah: i.jumlah,
              tanggal: hariIni(),
              keterangan: `Pembatalan servis ${lama.nomor}`,
            })),
            ...l,
          ]);
        setPenggunaan((l) => l.filter((x) => x.servisId !== id));
        setServis((l) => l.filter((x) => x.id !== id));
        if (isSupabaseConfigured()) {
          servisService.delete(id).catch(() => {});
        }
      },

      simpanSparepart: (s) => {
        const kodeBaru = s.kode?.trim() || generateNextKodeSparepart(sparepart);
        const spId = s.id || kodeBaru.toLowerCase();

        setSparepart((list) =>
          s.id
            ? list.map((x) =>
                x.id === s.id
                  ? ({ ...x, ...s, kode: s.kode || x.kode, tanggalUpdate: hariIni() } as Sparepart)
                  : x,
              )
            : [
                ...list,
                {
                  terpakai: 0,
                  ...s,
                  id: spId,
                  kode: kodeBaru,
                  tanggalUpdate: hariIni(),
                } as Sparepart,
              ],
        );

        if (isSupabaseConfigured()) {
          if (s.id) {
            sparepartService
              .update(s.id, {
                nama_sparepart: s.nama,
                kategori: s.kategori,
                satuan: s.satuan,
                harga: s.harga,
                stok_tersedia: s.stok,
                stok_minimum: s.stokMinimum,
              })
              .catch((err) => console.error("Error update sparepart Supabase:", err));
          } else {
            sparepartService
              .create({
                id_sparepart: spId,
                nama_sparepart: s.nama,
                kategori: s.kategori,
                satuan: s.satuan,
                harga: s.harga,
                stok_tersedia: s.stok,
                stok_minimum: s.stokMinimum,
                status_stok:
                  s.stok === 0 ? "habis" : s.stok <= s.stokMinimum ? "menipis" : "tersedia",
                tanggal_update: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .catch((err) => console.error("Error create sparepart Supabase:", err));
          }
        }
      },
      hapusSparepart: (id) => {
        setSparepart((l) => l.filter((x) => x.id !== id));
        if (isSupabaseConfigured()) {
          sparepartService.delete(id).catch(() => {});
        }
      },
      catatPembelian: (p) => {
        let finalPartId = p.sparepartId.trim();
        const existing = sparepart.find(
          (sp) =>
            sp.id.toLowerCase() === finalPartId.toLowerCase() ||
            sp.kode.toLowerCase() === finalPartId.toLowerCase() ||
            sp.nama.toLowerCase() === finalPartId.toLowerCase(),
        );

        if (existing) {
          finalPartId = existing.id;
        } else if (finalPartId) {
          // Buat sparepart baru jika admin mengetik part baru secara manual
          const generatedCode = finalPartId.toUpperCase().startsWith("SP-")
            ? finalPartId.toUpperCase()
            : `SP-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
          const newPart: Sparepart = {
            id: finalPartId,
            kode: generatedCode,
            nama: finalPartId,
            kategori: "Umum",
            satuan: "Pcs",
            harga: p.harga,
            stok: p.jumlah,
            stokMinimum: 5,
            terpakai: 0,
            tanggalUpdate: p.tanggal,
          };
          setSparepart((l) => [newPart, ...l]);
          if (isSupabaseConfigured()) {
            sparepartService
              .create({
                id_sparepart: finalPartId,
                nama_sparepart: finalPartId,
                kategori: "Umum",
                satuan: "Pcs",
                harga: p.harga,
                stok_tersedia: p.jumlah,
                stok_minimum: 5,
                status_stok: "tersedia",
                tanggal_update: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              } as any)
              .catch(() => {});
          }
        }

        const nomor = `PB-2026-${String(12 + pembelian.length - pembelianAwal.length).padStart(4, "0")}`;
        const baru: PembelianSparepart = {
          ...p,
          sparepartId: finalPartId,
          id: uid(),
          nomor,
          total: p.jumlah * p.harga,
          status: "Diterima",
        };
        setPembelian((l) => [baru, ...l]);
        setSparepart((l) =>
          l.map((sp) =>
            sp.id === finalPartId
              ? { ...sp, stok: sp.stok + p.jumlah, tanggalUpdate: p.tanggal }
              : sp,
          ),
        );
        setRiwayatStok((l) => [
          {
            id: uid(),
            sparepartId: finalPartId,
            jenis: "Masuk",
            jumlah: p.jumlah,
            tanggal: p.tanggal,
            keterangan: `Pembelian ${nomor} · ${p.supplier}`,
          },
          ...l,
        ]);
        if (isSupabaseConfigured()) {
          sparepartService
            .catatPembelian({
              nomor_pembelian: nomor,
              id_sparepart: finalPartId,
              supplier: p.supplier,
              tanggal: p.tanggal,
              jumlah: p.jumlah,
              harga: p.harga,
              total: p.jumlah * p.harga,
            })
            .catch(() => {});
        }
      },

      ubahPembelian: async (id, p) => {
        const lama = pembelian.find((x) => x.id === id);
        if (!lama) return;

        const targetPartId = p.sparepartId ? p.sparepartId.trim() : lama.sparepartId;
        const newJumlah = p.jumlah ?? lama.jumlah;
        const newHarga = p.harga ?? lama.harga;
        const newSupplier = p.supplier ?? lama.supplier;
        const newTanggal = p.tanggal ?? lama.tanggal;
        const newTotal = newJumlah * newHarga;

        // Penyesuaian stok sparepart
        if (targetPartId === lama.sparepartId) {
          const diff = newJumlah - lama.jumlah;
          setSparepart((list) =>
            list.map((sp) =>
              sp.id === targetPartId
                ? { ...sp, stok: Math.max(0, sp.stok + diff), tanggalUpdate: newTanggal }
                : sp,
            ),
          );
          if (isSupabaseConfigured() && diff !== 0) {
            const spObj = sparepart.find((x) => x.id === targetPartId);
            if (spObj) {
              sparepartService
                .update(targetPartId, { stok_tersedia: Math.max(0, spObj.stok + diff) })
                .catch(() => {});
            }
          }
        } else {
          // Sparepart berubah: kurangi part lama, tambah part baru
          setSparepart((list) =>
            list.map((sp) => {
              if (sp.id === lama.sparepartId) {
                return { ...sp, stok: Math.max(0, sp.stok - lama.jumlah) };
              }
              if (sp.id === targetPartId) {
                return { ...sp, stok: sp.stok + newJumlah, tanggalUpdate: newTanggal };
              }
              return sp;
            }),
          );
        }

        // Update riwayat stok
        setRiwayatStok((list) =>
          list.map((r) =>
            r.keterangan.includes(lama.nomor)
              ? {
                  ...r,
                  sparepartId: targetPartId,
                  jumlah: newJumlah,
                  tanggal: newTanggal,
                  keterangan: `Pembelian ${lama.nomor} · ${newSupplier}`,
                }
              : r,
          ),
        );

        // Update state pembelian
        setPembelian((list) =>
          list.map((x) =>
            x.id === id
              ? {
                  ...x,
                  sparepartId: targetPartId,
                  supplier: newSupplier,
                  tanggal: newTanggal,
                  jumlah: newJumlah,
                  harga: newHarga,
                  total: newTotal,
                }
              : x,
          ),
        );

        if (isSupabaseConfigured()) {
          sparepartService
            .updatePembelian(id, {
              id_sparepart: targetPartId,
              supplier: newSupplier,
              tanggal: newTanggal,
              jumlah: newJumlah,
              harga: newHarga,
              total: newTotal,
            })
            .catch((err) => console.error("Error updating pembelian in Supabase:", err));
        }
      },

      hapusPembelian: async (id) => {
        const lama = pembelian.find((x) => x.id === id);
        if (!lama) return;

        // Rollback stok sparepart (kurangi jumlah yang pernah dibeli)
        setSparepart((list) =>
          list.map((sp) =>
            sp.id === lama.sparepartId
              ? { ...sp, stok: Math.max(0, sp.stok - lama.jumlah) }
              : sp,
          ),
        );

        // Hapus pembelian dari state
        setPembelian((list) => list.filter((x) => x.id !== id));

        // Bersihkan riwayat stok pembelian tersebut
        setRiwayatStok((list) => list.filter((r) => !r.keterangan.includes(lama.nomor)));

        if (isSupabaseConfigured()) {
          const spObj = sparepart.find((x) => x.id === lama.sparepartId);
          if (spObj) {
            sparepartService
              .update(lama.sparepartId, { stok_tersedia: Math.max(0, spObj.stok - lama.jumlah) })
              .catch(() => {});
          }
          sparepartService
            .deletePembelian(id)
            .catch((err) => console.error("Error deleting pembelian in Supabase:", err));
        }
      },

      simpanMekanik: async (m) => {
        if (m.id) {
          setMekanik((list) =>
            list.map((x) => (x.id === m.id ? { ...x, ...m } : x)),
          );
          if (isSupabaseConfigured()) {
            await mekanikService.update(m.id, {
              nama_mekanik: m.nama,
              no_telepon: m.telepon || null,
              spesialisasi: m.spesialisasi || null,
              status: m.status,
            });
          }
        } else {
          const newId = `mk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          const baru: Mekanik = {
            id: newId,
            bengkelId: m.bengkelId || "bengkel-001",
            nama: m.nama,
            telepon: m.telepon || "",
            spesialisasi: m.spesialisasi || "Umum",
            status: m.status || "Aktif",
            createdAt: hariIni(),
          };
          setMekanik((list) => [baru, ...list]);
          if (isSupabaseConfigured()) {
            const dbRes = await mekanikService.create({
              id_mekanik: newId,
              id_bengkel: m.bengkelId || "bengkel-001",
              nama_mekanik: m.nama,
              no_telepon: m.telepon || null,
              spesialisasi: m.spesialisasi || null,
              status: m.status || "Aktif",
            });
            if (dbRes?.id_mekanik) {
              setMekanik((list) =>
                list.map((x) => (x.id === newId ? { ...x, id: dbRes.id_mekanik } : x)),
              );
            }
          }
        }
      },

      ubahStatusMekanik: async (id, status) => {
        setMekanik((list) =>
          list.map((x) => (x.id === id ? { ...x, status } : x)),
        );
        if (isSupabaseConfigured()) {
          await mekanikService.update(id, { status });
        }
      },

      hapusMekanik: async (id) => {
        const target = mekanik.find((x) => x.id === id);
        if (!target) return { success: false, message: "Mekanik tidak ditemukan." };

        // Cek apakah mekanik sedang menangani servis aktif yang belum selesai
        const ongoingCount = servis.filter(
          (s) =>
            (s.status === "Diproses" || s.status === "Menunggu") &&
            (s.mekanik === target.nama || s.mekanikId === id),
        ).length;

        if (ongoingCount > 0) {
          return {
            success: false,
            message: `Mekanik ${target.nama} sedang menangani ${ongoingCount} pekerjaan servis aktif. Harap selesaikan atau alihkan servis sebelum menghapus.`,
          };
        }

        // Hapus langsung dari state lokal
        setMekanik((list) => list.filter((x) => x.id !== id));

        // Hapus langsung dari database Supabase
        if (isSupabaseConfigured()) {
          await mekanikService.delete(id);
        }

        return {
          success: true,
          message: `Mekanik ${target.nama} berhasil dihapus dari database.`,
        };
      },

      refreshMekanik: async () => {
        if (!isSupabaseConfigured()) return;
        const res = await mekanikService.getMekanik();
        if (res.length > 0) {
          setMekanik(
            res.map((m) => ({
              id: m.id_mekanik,
              bengkelId: m.id_bengkel,
              nama: m.nama_mekanik,
              telepon: m.no_telepon ?? "",
              spesialisasi: m.spesialisasi ?? "Umum",
              status: m.status,
              createdAt: m.created_at ? m.created_at.slice(0, 10) : hariIni(),
            })),
          );
        }
      },
      refreshKendaraan: async () => {
        if (!isSupabaseConfigured()) return;
        const res = await kendaraanService.getAll();
        if (res.length > 0) {
          setKendaraan(
            res.map((k) => ({
              id: k.id_kendaraan,
              pelangganId: k.id_pelanggan,
              merk: k.merk,
              tipe: k.tipe,
              tahun: k.tahun,
              plat: k.nopol,
              kilometer: 0,
            })),
          );
        }
      },
      refreshBooking: async () => {
        if (!isSupabaseConfigured()) return;
        const [bkRes, pelRes, kenRes] = await Promise.all([
          bookingService.getAll(),
          pelangganService.getAll(),
          kendaraanService.getAll(),
        ]);
        if (bkRes.length > 0) {
          setBooking(
            bkRes.map((b) => {
              const pel = pelRes.find((p) => p.id_pelanggan === b.id_pelanggan);
              const ken = kenRes.find((k) => k.id_kendaraan === b.id_kendaraan);
              return {
                id: b.id_booking,
                nomor: b.nomor_booking,
                pelanggan: pel?.nama ?? "Pelanggan",
                customerId: b.id_pelanggan,
                vehicleId: b.id_kendaraan,
                bengkelId: b.id_bengkel ?? "bengkel-001",
                mekanikId: b.id_mekanik ?? undefined,
                kendaraan: ken ? `${ken.merk} ${ken.tipe} ${ken.tahun}` : "Kendaraan",
                plat: ken?.nopol ?? "",
                jenis: b.jenis_servis,
                keluhan: b.keluhan,
                tanggal: b.tanggal_booking,
                waktu: b.waktu_booking,
                catatan: "",
                mekanikDiinginkan: b.mekanik_diinginkan ?? undefined,
                status:
                  b.status_booking === "disetujui"
                    ? "Diterima"
                    : b.status_booking === "ditolak"
                      ? "Ditolak"
                      : "Menunggu Konfirmasi",
                alasanTolak: b.alasan_penolakan ?? undefined,
              };
            }),
          );
        }
      },
      refreshServis: async () => {
        if (!isSupabaseConfigured()) return;
        try {
          const [srvRes, pelRes, kenRes, detRes, spRes] = await Promise.all([
            servisService.getAll(),
            pelangganService.getAll(),
            kendaraanService.getAll(),
            supabase().from("detail_servis").select("*"),
            sparepartService.getAll(),
          ]);
          if (srvRes.length > 0) {
            const detList: any[] = (detRes && (detRes as any).data) ? (detRes as any).data : [];
            const spList: any[] = spRes ?? [];
            const mappedServis: Servis[] = srvRes.map((s: any) => {
              const pel = pelRes.find((p: any) => p.id_pelanggan === s.id_pelanggan);
              const ken = kenRes.find((k: any) => k.id_kendaraan === s.id_kendaraan);
              const st: StatusServis =
                s.status_servis === "diproses"
                  ? "Diproses"
                  : s.status_servis === "selesai"
                    ? "Selesai"
                    : s.status_servis === "menunggu_pembayaran"
                      ? "Menunggu Pembayaran"
                      : s.status_servis === "lunas"
                        ? "Selesai Dibayar"
                        : "Menunggu";

              const srvDetails = detList.filter((d: any) => d.id_servis === s.id_servis);
              const items: ItemPart[] = srvDetails.map((d: any) => {
                const sp = spList.find((x: any) => x.id_sparepart === d.id_sparepart);
                return {
                  sparepartId: d.id_sparepart || d.id_detail || d.id_detail_servis,
                  kode: sp?.id_sparepart || d.id_sparepart || "-",
                  nama: sp?.nama_sparepart || d.keterangan || "Sparepart",
                  harga: Number(d.harga || d.harga_satuan || sp?.harga || 0),
                  jumlah: Number(d.jumlah || d.qty || 1),
                };
              });
              const ringkas = items.map((i) => `${i.nama} (${i.jumlah}x)`).join(", ");
              const totalPartCalc = items.reduce((sum, i) => sum + i.harga * i.jumlah, 0);

              return {
                id: s.id_servis,
                nomor: s.nomor_servis,
                bookingId: s.id_booking ?? undefined,
                pelanggan: pel?.nama ?? "Pelanggan",
                kendaraan: ken ? `${ken.merk} ${ken.tipe} ${ken.tahun}`.trim() : "Kendaraan",
                plat: ken?.nopol || "",
                bengkelId: s.id_bengkel ?? "bengkel-001",
                mekanikId: s.id_mekanik ?? undefined,
                jenis: s.jenis_servis ?? "Servis Umum",
                keluhan: s.keluhan ?? "",
                pekerjaan: s.pekerjaan || s.catatan || s.jenis_servis || "",
                mekanik: s.mekanik ?? "Andi",
                tanggal: s.tanggal_servis || (s.created_at ? s.created_at.slice(0, 10) : hariIni()),
                status: st,
                sparepart: ringkas,
                items: items,
                catatan: s.catatan ?? "",
                biayaJasa: Number(s.biaya_jasa || 0),
                biayaPart: Number(s.biaya_sparepart || totalPartCalc || 0),
                total: Number(s.total_biaya || 0),
                noTransaksi: `TRX-${s.nomor_servis.replace("SRV-", "")}`,
                estimasiBiaya: s.estimasi_biaya ? Number(s.estimasi_biaya) : undefined,
                estimasiWaktu: s.estimasi_waktu ?? undefined,
                estimasiSelesai: s.estimasi_selesai ?? undefined,
                tanggalMulai: s.tanggal_mulai ?? undefined,
                tanggalSelesai: s.tanggal_selesai ?? undefined,
              };
            });

            setServis((currentLocal) => {
              // Pertahankan servis lokal yang baru dibuat / belum tercakup di response Supabase
              const localOnly = currentLocal.filter(
                (loc) =>
                  !mappedServis.some(
                    (sb) =>
                      sb.id === loc.id ||
                      sb.nomor === loc.nomor ||
                      (loc.bookingId && sb.bookingId === loc.bookingId),
                  ),
              );
              return [...localOnly, ...mappedServis];
            });
          }
        } catch (err) {
          console.error("Gagal refresh servis:", err);
        }
      },
      buatBooking: (b) => {
        const idBooking = `bk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        const seq = 1 + booking.length;
        const nomor = `BK-2026-${String(seq).padStart(4, "0")}`;
        const baru: Booking = {
          ...b,
          id: idBooking,
          nomor,
          status: "Menunggu Konfirmasi",
        };
        setBooking((l) => [baru, ...l]);
        if (isSupabaseConfigured() && b.customerId && b.vehicleId) {
          bookingService
            .create({
              id_booking: idBooking,
              id_bengkel: b.bengkelId || "bengkel-001",
              nomor_booking: baru.nomor,
              id_pelanggan: b.customerId,
              id_kendaraan: b.vehicleId,
              tanggal_booking: b.tanggal,
              waktu_booking: b.waktu,
              jenis_servis: b.jenis,
              keluhan: b.keluhan,
              mekanik_diinginkan: b.mekanikDiinginkan,
              id_mekanik: b.mekanikId ?? null,
            })
            .then((created) => {
              if (created?.id_booking && created.id_booking !== idBooking) {
                setBooking((l) =>
                  l.map((x) => (x.id === idBooking ? { ...x, id: created.id_booking } : x)),
                );
              }
            })
            .catch((err) => {
              console.error("Gagal simpan booking ke Supabase:", err);
            });
        }
        return baru;
      },
      ubahStatusBooking: (id, status, alasan) => {
        setBooking((l) =>
          l.map((x) => {
            if (x.id !== id) return x;
            const { alasanTolak, ...rest } = x;
            return status === "Ditolak"
              ? { ...rest, status, alasanTolak: alasan ?? alasanTolak ?? "" }
              : { ...rest, status };
          }),
        );

        if (status === "Diterima") {
          const targetBooking = booking.find((x) => x.id === id);
          if (targetBooking) {
            // Cek apakah sudah ada servis untuk booking ini (cegah duplikasi)
            const sudahAda = servis.some((s) => s.bookingId === id);

            if (!sudahAda) {
              const nomorServis = generateNextNomorServis(servis);
              const srvId = `srv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
              const bengkelId = targetBooking.bengkelId || "bengkel-001";

              // Tentukan mekanik: penugasan resmi -> preferensi pelanggan -> mekanik aktif bengkel -> "Andi"
              let namaMekanik = targetBooking.mekanikDitugaskan || targetBooking.mekanikDiinginkan;
              let targetMekanikId = targetBooking.mekanikId;

              if (!namaMekanik) {
                const mkAktif = mekanik.find(
                  (m) => (!m.bengkelId || m.bengkelId === bengkelId) && m.status === "Aktif",
                );
                if (mkAktif) {
                  namaMekanik = mkAktif.nama;
                  targetMekanikId = mkAktif.id;
                } else {
                  namaMekanik = "Andi";
                }
              } else if (!targetMekanikId) {
                const mkFound = mekanik.find(
                  (m) => m.nama.toLowerCase() === namaMekanik!.toLowerCase(),
                );
                if (mkFound) targetMekanikId = mkFound.id;
              }

              const servisBaru: Servis = {
                id: srvId,
                nomor: nomorServis,
                bookingId: targetBooking.id,
                pelanggan: targetBooking.pelanggan,
                bengkelId: bengkelId,
                mekanikId: targetMekanikId,
                kendaraan: targetBooking.kendaraan,
                plat: targetBooking.plat,
                jenis: targetBooking.jenis,
                keluhan: targetBooking.keluhan,
                pekerjaan: targetBooking.jenis,
                mekanik: namaMekanik,
                tanggal: targetBooking.tanggal || hariIni(),
                status: "Menunggu",
                sparepart: "",
                items: [],
                catatan: targetBooking.catatan
                  ? `[Booking ${targetBooking.nomor}] ${targetBooking.catatan}`
                  : `[Booking ${targetBooking.nomor}] ${targetBooking.keluhan}`,
                biayaJasa: 0,
                biayaPart: 0,
                total: 0,
                noTransaksi: `TRX-${nomorServis.replace("SRV-", "")}`,
                estimasiWaktu: "1 - 2 Jam",
                estimasiSelesai: targetBooking.estimasiSelesai,
              };

              // Masukkan langsung ke operasional servis di state lokal & localStorage
              setServis((prev) => (prev.some((s) => s.bookingId === id) ? prev : [servisBaru, ...prev]));
              try {
                const currentSaved = JSON.parse(window.localStorage.getItem("appbenk.data.servis") || "[]");
                if (!currentSaved.some((s: any) => s.id === srvId || s.bookingId === targetBooking.id)) {
                  window.localStorage.setItem("appbenk.data.servis", JSON.stringify([servisBaru, ...currentSaved]));
                }
              } catch {}

              if (isSupabaseConfigured()) {
                (async () => {
                  try {
                    let idPel = targetBooking.customerId;
                    if (!idPel) {
                      const existingPel = await pelangganService.getAll();
                      let p = existingPel.find(
                        (x) =>
                          x.nama.toLowerCase() === targetBooking.pelanggan.trim().toLowerCase(),
                      );
                      if (!p) {
                        const safeSlug =
                          targetBooking.pelanggan.toLowerCase().replace(/[^a-z0-9]/g, "_") ||
                          "customer";
                        const randomEmail = `${safeSlug}_${Date.now().toString(36)}@appbenk.local`;
                        p = await pelangganService.create({
                          nama: targetBooking.pelanggan.trim(),
                          email: randomEmail,
                          alamat: "Booking online",
                        });
                      }
                      idPel = p.id_pelanggan;
                    }

                    let idKen = targetBooking.vehicleId;
                    if (!idKen) {
                      const existingKen = await kendaraanService.getByPelanggan(idPel);
                      let k = existingKen.find(
                        (x) =>
                          (targetBooking.plat &&
                            x.nopol.toLowerCase() === targetBooking.plat.trim().toLowerCase()) ||
                          x.tipe.toLowerCase() === targetBooking.kendaraan.trim().toLowerCase(),
                      );
                      if (!k) {
                        const merk = targetBooking.kendaraan.trim().split(" ")[0] || "Motor";
                        k = await kendaraanService.create({
                          id_pelanggan: idPel,
                          merk,
                          tipe: targetBooking.kendaraan || "Kendaraan",
                          tahun: 2023,
                          nopol: targetBooking.plat || "D 0000 XX",
                        });
                      }
                      idKen = k.id_kendaraan;
                    }

                    const dbRes = await servisService.create({
                      id_servis: srvId,
                      nomor_servis: nomorServis,
                      id_booking: targetBooking.id,
                      id_bengkel: bengkelId,
                      id_pelanggan: idPel,
                      id_kendaraan: idKen,
                      id_mekanik: targetMekanikId || undefined,
                      mekanik: namaMekanik,
                      jenis_servis: targetBooking.jenis,
                      keluhan: targetBooking.keluhan,
                      catatan: servisBaru.catatan,
                      status_servis: "menunggu",
                      biaya_jasa: 0,
                      biaya_sparepart: 0,
                      total_biaya: 0,
                      tanggal_mulai: targetBooking.tanggal || hariIni(),
                      estimasi_waktu: "1 - 2 Jam",
                      estimasi_selesai: targetBooking.estimasiSelesai ?? null,
                    });

                    if (dbRes) {
                      setServis((list) =>
                        list.map((x) =>
                          x.id === srvId
                            ? {
                                ...x,
                                id: dbRes.id_servis,
                                nomor: dbRes.nomor_servis,
                                noTransaksi: `TRX-${dbRes.nomor_servis.replace("SRV-", "")}`,
                              }
                            : x,
                        ),
                      );
                    }
                  } catch (err) {
                    console.error("Gagal buat servis otomatis dari booking ke Supabase:", err);
                  }
                })();
              }
            }
          }
        }

        if (isSupabaseConfigured()) {
          const dbStatus =
            status === "Diterima"
              ? "disetujui"
              : status === "Ditolak"
                ? "ditolak"
                : "menunggu_konfirmasi";
          bookingService.updateStatus(id, dbStatus, alasan).catch(() => {});
        }
      },
      tugaskanMekanikBooking: (id, mekanik) =>
        setBooking((l) => l.map((x) => (x.id === id ? { ...x, mekanikDitugaskan: mekanik } : x))),
      aturEstimasiBooking: (id, estimasiSelesai) =>
        setBooking((l) => l.map((x) => (x.id === id ? { ...x, estimasiSelesai } : x))),
      ajukanPembayaran: (id, metode, buktiUrl) => {
        const target = servis.find((x) => x.id === id);
        if (!target) return;
        setServis((l) => l.map((x) => (x.id === id ? { ...x, metodeBayar: metode } : x)));
        if (target)
          setPembayaran((l) => [
            {
              id: uid(),
              servisId: id,
              noTransaksi: target.noTransaksi,
              metode,
              tanggalBayar: hariIni(),
              totalBayar: target.total,
              status: "Menunggu Verifikasi",
              ...(buktiUrl ? { buktiUrl } : {}),
            } as Pembayaran,
            ...l.filter((p) => p.servisId !== id),
          ]);

        const isCashMethod = metode === "Cash";
        // Kirim Notifikasi Pembayaran ke Admin
        tambahNotifikasi({
          role: "admin",
          tipe: "pembayaran",
          judul: isCashMethod
            ? `Pembayaran Tunai (Cash) - ${target.noTransaksi}`
            : `Pembayaran ${metode} Baru Masuk`,
          pesan: isCashMethod
            ? `${target.pelanggan} memilih pembayaran tunai di kasir untuk ${target.noTransaksi} (${rupiah(target.total)}). Silakan terima uang tunai di meja kasir dan konfirmasi.`
            : `${target.pelanggan} telah mengunggah bukti pembayaran ${metode} untuk ${target.noTransaksi} (${rupiah(target.total)}). Silakan periksa dan verifikasi.`,
          link: `/admin/servis?trx=${target.noTransaksi}`,
          servisId: id,
          noTransaksi: target.noTransaksi,
          pelanggan: target.pelanggan,
          total: target.total,
          buktiUrl,
        });

        if (isSupabaseConfigured()) {
          const m = metode === "Cash" ? "cash" : metode === "QRIS" ? "qris" : "transfer";
          pembayaranService.submitPembayaran(id, m, buktiUrl).catch(() => {});
        }
      },
      verifikasiPembayaran: (servisId, disetujui, alasan, verifier) => {
        if (!disetujui && !alasan?.trim()) return;
        const targetServis = servis.find((s) => s.id === servisId);
        setPembayaran((l) =>
          l.map((p) => {
            if (p.servisId !== servisId) return p;
            if (disetujui) {
              const { alasanTolak, ...rest } = p;
              return {
                ...rest,
                status: "Lunas",
                verifiedAt: new Date().toISOString(),
                ...(verifier ? { verifiedBy: verifier } : {}),
              } as Pembayaran;
            } else {
              const { verifiedAt, verifiedBy, ...rest } = p;
              return {
                ...rest,
                status: "Bukti Ditolak",
                ...(alasan?.trim() ? { alasanTolak: alasan.trim() } : {}),
              } as Pembayaran;
            }
          }),
        );
        if (disetujui)
          setServis((l) =>
            l.map((s) => (s.id === servisId ? { ...s, status: "Selesai Dibayar" } : s)),
          );

        // Kirim notifikasi status balik ke pelanggan
        if (targetServis) {
          tambahNotifikasi({
            role: "pelanggan",
            tipe: "pembayaran",
            judul: disetujui ? "Pembayaran Telah Diverifikasi (Lunas)" : "Bukti Pembayaran Ditolak",
            pesan: disetujui
              ? `Pembayaran Anda untuk ${targetServis.noTransaksi} telah disetujui admin. Nota resmi kini dapat diunduh.`
              : `Bukti pembayaran untuk ${targetServis.noTransaksi} ditolak: ${alasan || "Bukti tidak sesuai"}. Silakan upload ulang.`,
            link: `/pelanggan/pembayaran?trx=${targetServis.noTransaksi}`,
            servisId,
            noTransaksi: targetServis.noTransaksi,
            pelanggan: targetServis.pelanggan,
            total: targetServis.total,
          });
        }

        if (isSupabaseConfigured()) {
          pembayaranService
            .verifikasiPembayaran(servisId, disetujui, alasan, verifier)
            .catch(() => {});
        }
      },
      catatStokOpname: (so) => {
        const baru: StokOpname = { ...so, id: uid() };
        setStokOpname((l) => [baru, ...l]);
        if (isSupabaseConfigured()) {
          sparepartService
            .catatStokOpname({
              keterangan: so.keterangan,
              total_item: so.totalItem,
              selisih_total: so.selisihTotal,
            })
            .catch(() => {});
        }
      },
      catatReturSparepart: (r) => {
        let finalPartId = r.sparepartId.trim();
        const existing = sparepart.find(
          (sp) =>
            sp.id.toLowerCase() === finalPartId.toLowerCase() ||
            sp.kode.toLowerCase() === finalPartId.toLowerCase() ||
            sp.nama.toLowerCase() === finalPartId.toLowerCase(),
        );

        if (existing) {
          finalPartId = existing.id;
        } else if (finalPartId) {
          const generatedCode = finalPartId.toUpperCase().startsWith("SP-")
            ? finalPartId.toUpperCase()
            : `SP-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
          const newPart: Sparepart = {
            id: finalPartId,
            kode: generatedCode,
            nama: finalPartId,
            kategori: "Umum",
            satuan: "Pcs",
            harga: 0,
            stok: 0,
            stokMinimum: 5,
            terpakai: 0,
            tanggalUpdate: r.tanggal,
          };
          setSparepart((l) => [newPart, ...l]);
          if (isSupabaseConfigured()) {
            sparepartService
              .create({
                id_sparepart: finalPartId,
                nama_sparepart: finalPartId,
                kategori: "Umum",
                satuan: "Pcs",
                harga: 0,
                stok_tersedia: 0,
                stok_minimum: 5,
                status_stok: "habis",
                tanggal_update: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              } as any)
              .catch(() => {});
          }
        }

        const baru: ReturSparepart = { ...r, sparepartId: finalPartId, id: uid() };
        setReturSparepart((l) => [baru, ...l]);

        const currentStock = existing ? existing.stok : 0;
        const newStock = Math.max(0, currentStock - r.jumlah);

        setSparepart((l) =>
          l.map((sp) =>
            sp.id === finalPartId
              ? { ...sp, stok: newStock, tanggalUpdate: r.tanggal }
              : sp,
          ),
        );

        setRiwayatStok((l) => [
          {
            id: uid(),
            sparepartId: finalPartId,
            jenis: "Keluar",
            jumlah: r.jumlah,
            tanggal: r.tanggal,
            keterangan: `Retur Supplier · ${r.alasan}`,
          },
          ...l,
        ]);

        if (isSupabaseConfigured()) {
          sparepartService
            .catatRetur({
              id_sparepart: finalPartId,
              id_pembelian_sparepart: r.pembelianId ?? null,
              jumlah: r.jumlah,
              alasan: r.alasan,
              status:
                r.status === "Disetujui"
                  ? "disetujui"
                  : r.status === "Ditolak"
                    ? "ditolak"
                    : "diproses",
            })
            .catch(() => {});

          sparepartService
            .update(finalPartId, {
              stok_tersedia: newStock,
              status_stok: newStock <= 0 ? "habis" : newStock <= 5 ? "menipis" : "tersedia",
            })
            .catch(() => {});
        }
      },
      notifikasi,
      tambahNotifikasi,
      tandaiNotifikasiDibaca,
      tandaiSemuaNotifikasiDibaca,
      hapusNotifikasi,
    }),
    [
      pelanggan,
      kendaraan,
      servis,
      sparepart,
      booking,
      tiket,
      pembayaran,
      riwayatStok,
      pembelian,
      penggunaan,
      stokOpname,
      returSparepart,
      laporanRingkasanStok,
      bengkel,
      mekanik,
      notifikasi,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore harus dipakai di dalam StoreProvider");
  return ctx;
}

export const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export const tanggalPanjang = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/** Menghasilkan kode sparepart berurutan otomatis (contoh: SP-001 -> SP-002, SP-004 -> SP-005, SP-008 -> SP-009). */
export function generateNextKodeSparepart(list: Array<{ kode?: string | null }>): string {
  let maxNum = 0;
  for (const item of list) {
    if (!item.kode) continue;
    const match = item.kode.match(/SP[-_]?(\d+)/i) || item.kode.match(/(\d+)/);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }
  const nextNum = maxNum + 1;
  return `SP-${String(nextNum).padStart(3, "0")}`;
}

/** Menghasilkan nomor transaksi servis berurutan otomatis (contoh: SRV-2026-0001, SRV-2026-0002, SRV-2026-0011). */
export function generateNextNomorServis(list: Array<{ nomor?: string | null }>): string {
  let maxNum = 0;
  for (const item of list) {
    if (!item.nomor) continue;
    const parts = item.nomor.split("-");
    const lastPart = parts[parts.length - 1] ?? "";
    const num = parseInt(lastPart, 10);
    if (!isNaN(num) && num > maxNum) {
      maxNum = num;
    }
  }
  const nextNum = maxNum + 1;
  return `SRV-2026-${String(nextNum).padStart(4, "0")}`;
}

