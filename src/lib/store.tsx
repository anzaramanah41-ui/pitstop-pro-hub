import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Pelanggan = {
  id: string;
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
  /** Hasil pemeriksaan mekanik (ERD: servis.hasil_pemeriksaan). */
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
  { id: "pl-001", nama: "Budi Santoso", email: "budi@mail.test", telepon: "0812-3344-5566", alamat: "Jl. Merdeka No. 12, Bandung", kendaraan: "Honda Beat 2019", plat: "D 1234 ABC" },
  { id: "pl-002", nama: "Siti Rahmawati", email: "siti@mail.test", telepon: "0857-1122-9090", alamat: "Jl. Cihampelas No. 7, Bandung", kendaraan: "Yamaha NMAX 2021", plat: "D 5521 KJ" },
  { id: "pl-003", nama: "Agus Prasetyo", email: "agus@mail.test", telepon: "0813-7788-4455", alamat: "Jl. Sudirman No. 88, Cimahi", kendaraan: "Toyota Avanza 2017", plat: "D 9087 PL" },
  { id: "pl-004", nama: "Dewi Lestari", email: "dewi@mail.test", telepon: "0895-2211-3344", alamat: "Jl. Pasteur No. 45, Bandung", kendaraan: "Honda Vario 160", plat: "D 3311 QW" },
  { id: "pl-005", nama: "Rizky Ramadhan", email: "rizky@mail.test", telepon: "0821-9911-2233", alamat: "Jl. Buah Batu No. 21, Bandung", kendaraan: "Suzuki Satria FU", plat: "D 7742 ZX" },
  { id: "pl-006", nama: "Hendra Wijaya", email: "hendra@mail.test", telepon: "0877-6655-1010", alamat: "Jl. Kopo No. 90, Bandung", kendaraan: "Daihatsu Xenia 2015", plat: "D 6120 MN" },
];

const kendaraanAwal: Kendaraan[] = [
  { id: "kd-001", pelangganId: "pl-001", merk: "Honda", tipe: "Beat", tahun: 2019, plat: "D 1234 ABC", kilometer: 41200 },
  { id: "kd-002", pelangganId: "pl-001", merk: "Honda", tipe: "PCX", tahun: 2022, plat: "D 8890 GH", kilometer: 15600 },
  { id: "kd-003", pelangganId: "pl-002", merk: "Yamaha", tipe: "NMAX", tahun: 2021, plat: "D 5521 KJ", kilometer: 28750 },
  { id: "kd-004", pelangganId: "pl-003", merk: "Toyota", tipe: "Avanza", tahun: 2017, plat: "D 9087 PL", kilometer: 98400 },
  { id: "kd-005", pelangganId: "pl-004", merk: "Honda", tipe: "Vario 160", tahun: 2023, plat: "D 3311 QW", kilometer: 9200 },
  { id: "kd-006", pelangganId: "pl-005", merk: "Suzuki", tipe: "Satria FU", tahun: 2018, plat: "D 7742 ZX", kilometer: 52100 },
  { id: "kd-007", pelangganId: "pl-006", merk: "Daihatsu", tipe: "Xenia", tahun: 2015, plat: "D 6120 MN", kilometer: 132500 },
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
  { id: "sp-001", kode: "SP-001", nama: "Oli Mesin AHM MPX 0.8L", kategori: "Oli", satuan: "Botol", harga: 48000, stok: 34, stokMinimum: 10, terpakai: 22, tanggalUpdate: "2026-08-18" },
  { id: "sp-002", kode: "SP-002", nama: "Busi NGK CPR9EA", kategori: "Mesin", satuan: "Pcs", harga: 27000, stok: 18, stokMinimum: 8, terpakai: 14, tanggalUpdate: "2026-08-18" },
  { id: "sp-003", kode: "SP-003", nama: "Kampas Rem Depan NMAX", kategori: "Rem", satuan: "Set", harga: 95000, stok: 6, stokMinimum: 6, terpakai: 9, tanggalUpdate: "2026-08-17" },
  { id: "sp-004", kode: "SP-004", nama: "Filter Udara Beat", kategori: "Mesin", satuan: "Pcs", harga: 62000, stok: 0, stokMinimum: 5, terpakai: 12, tanggalUpdate: "2026-08-15" },
  { id: "sp-005", kode: "SP-005", nama: "Aki GS Astra NS40", kategori: "Kelistrikan", satuan: "Unit", harga: 610000, stok: 4, stokMinimum: 3, terpakai: 3, tanggalUpdate: "2026-08-10" },
  { id: "sp-006", kode: "SP-006", nama: "Ban Luar IRC 80/90-14", kategori: "Ban", satuan: "Pcs", harga: 215000, stok: 11, stokMinimum: 4, terpakai: 7, tanggalUpdate: "2026-08-12" },
  { id: "sp-007", kode: "SP-007", nama: "Link Stabilizer Avanza", kategori: "Kaki-kaki", satuan: "Pcs", harga: 175000, stok: 8, stokMinimum: 4, terpakai: 5, tanggalUpdate: "2026-08-17" },
  { id: "sp-008", kode: "SP-008", nama: "Freon R134a", kategori: "AC", satuan: "Tabung", harga: 120000, stok: 15, stokMinimum: 5, terpakai: 10, tanggalUpdate: "2026-08-14" },
];

export const SATUAN_PART = ["Pcs", "Botol", "Set", "Unit", "Tabung", "Liter"];

const pembelianAwal: PembelianSparepart[] = [
  { id: uid(), nomor: "PB-2026-0011", sparepartId: "sp-001", supplier: "PT Sinar Pelumas", tanggal: "2026-08-05", jumlah: 24, harga: 41000, total: 984000, status: "Diterima" },
  { id: uid(), nomor: "PB-2026-0010", sparepartId: "sp-003", supplier: "CV Rem Jaya", tanggal: "2026-07-28", jumlah: 10, harga: 78000, total: 780000, status: "Diterima" },
  { id: uid(), nomor: "PB-2026-0009", sparepartId: "sp-006", supplier: "Toko Ban Makmur", tanggal: "2026-07-19", jumlah: 12, harga: 182000, total: 2184000, status: "Diterima" },
];

const riwayatStokAwal: RiwayatStok[] = [
  { id: uid(), sparepartId: "sp-001", jenis: "Masuk", jumlah: 24, tanggal: "2026-08-05", keterangan: "Pembelian PB-2026-0011 · PT Sinar Pelumas" },
  { id: uid(), sparepartId: "sp-001", jenis: "Keluar", jumlah: 1, tanggal: "2026-08-18", keterangan: "Dipakai servis SRV-2026-0148" },
  { id: uid(), sparepartId: "sp-002", jenis: "Keluar", jumlah: 1, tanggal: "2026-08-18", keterangan: "Dipakai servis SRV-2026-0148" },
  { id: uid(), sparepartId: "sp-003", jenis: "Masuk", jumlah: 10, tanggal: "2026-07-28", keterangan: "Pembelian PB-2026-0010 · CV Rem Jaya" },
  { id: uid(), sparepartId: "sp-007", jenis: "Keluar", jumlah: 2, tanggal: "2026-08-17", keterangan: "Dipakai servis SRV-2026-0145" },
];

const penggunaanAwal: PenggunaanSparepart[] = [
  { id: uid(), sparepartId: "sp-002", servisId: "-", servisNomor: "SRV-2026-0148", tanggal: "2026-08-18", jumlah: 1, mekanik: "Joko", keterangan: "Ganti busi" },
  { id: uid(), sparepartId: "sp-001", servisId: "-", servisNomor: "SRV-2026-0148", tanggal: "2026-08-18", jumlah: 1, mekanik: "Joko", keterangan: "Ganti oli mesin" },
  { id: uid(), sparepartId: "sp-007", servisId: "-", servisNomor: "SRV-2026-0145", tanggal: "2026-08-17", jumlah: 2, mekanik: "Rudi", keterangan: "Ganti link stabilizer" },
];

const pembayaranAwal: Pembayaran[] = [
  { id: uid(), servisId: "-", noTransaksi: "TRX-2026-0145", metode: "Transfer Bank", tanggalBayar: "2026-08-17", totalBayar: 480000, status: "Lunas" },
  { id: uid(), servisId: "-", noTransaksi: "TRX-2026-0143", metode: "Cash", tanggalBayar: "2026-08-14", totalBayar: 350000, status: "Lunas" },
  { id: uid(), servisId: "-", noTransaksi: "TRX-2025-0121", metode: "Cash", tanggalBayar: "2025-11-09", totalBayar: 304000, status: "Lunas" },
  { id: uid(), servisId: "-", noTransaksi: "TRX-2025-0118", metode: "QRIS", tanggalBayar: "2025-06-21", totalBayar: 78000, status: "Lunas" },
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
  simpanPelanggan: (p: Omit<Pelanggan, "id"> & { id?: string }) => void;
  hapusPelanggan: (id: string) => void;
  simpanKendaraan: (k: Omit<Kendaraan, "id"> & { id?: string }) => void;
  hapusKendaraan: (id: string) => void;
  simpanServis: (s: Omit<Servis, "id" | "nomor" | "total" | "noTransaksi" | "biayaPart" | "sparepart"> & { id?: string }) => void;
  ubahStatusServis: (id: string, status: StatusServis) => void;
  hapusServis: (id: string) => void;
  simpanSparepart: (s: Omit<Sparepart, "id" | "terpakai" | "tanggalUpdate"> & { id?: string; terpakai?: number }) => void;
  hapusSparepart: (id: string) => void;
  catatPembelian: (p: Omit<PembelianSparepart, "id" | "nomor" | "total" | "status">) => void;
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
  const [kendaraan, setKendaraan] = useState(kendaraanAwal);
  const [servis, setServis] = useState(servisAwal);
  const [sparepart, setSparepart] = useState(sparepartAwal);
  const [booking, setBooking] = useState(bookingAwal);
  const [tiket, setTiket] = useState(tiketAwal);
  const [pembayaran, setPembayaran] = useState(pembayaranAwal);
  const [riwayatStok, setRiwayatStok] = useState(riwayatStokAwal);
  const [pembelian, setPembelian] = useState(pembelianAwal);
  const [penggunaan, setPenggunaan] = useState(penggunaanAwal);

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

      simpanPelanggan: (p) =>
        setPelanggan((list) =>
          p.id ? list.map((x) => (x.id === p.id ? ({ ...x, ...p } as Pelanggan) : x)) : [{ ...p, id: uid() } as Pelanggan, ...list],
        ),
      hapusPelanggan: (id) => {
        setPelanggan((l) => l.filter((x) => x.id !== id));
        setKendaraan((l) => l.filter((x) => x.pelangganId !== id));
      },
      simpanKendaraan: (k) =>
        setKendaraan((list) =>
          k.id ? list.map((x) => (x.id === k.id ? ({ ...x, ...k } as Kendaraan) : x)) : [{ ...k, id: uid() } as Kendaraan, ...list],
        ),
      hapusKendaraan: (id) => setKendaraan((l) => l.filter((x) => x.id !== id)),
      simpanServis: (s) => {
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

        setServis((list) => {
          const total = s.biayaJasa + biayaPart;
          let nomor = lamaServis?.nomor ?? "";
          let hasil: Servis[];
          if (s.id) {
            hasil = list.map((x) => (x.id === s.id ? { ...x, ...s, items, biayaPart, sparepart: ringkas, total } : x));
          } else {
            const seq = 149 + list.length - servisAwal.length;
            nomor = `SRV-2026-${String(seq).padStart(4, "0")}`;
            hasil = [
              { ...s, items, biayaPart, sparepart: ringkas, id: uid(), nomor, total, noTransaksi: `TRX-2026-${String(seq).padStart(4, "0")}` } as Servis,
              ...list,
            ];
          }

          const idServis = s.id ?? hasil[0]?.id ?? "-";
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
              keterangan: d > 0 ? `Dipakai servis ${nomor}` : `Koreksi pemakaian servis ${nomor}`,
            });
            if (d > 0)
              logPakai.push({
                id: uid(),
                sparepartId,
                servisId: idServis,
                servisNomor: nomor,
                tanggal: tgl,
                jumlah: d,
                mekanik: s.mekanik,
                keterangan: s.pekerjaan || s.jenis,
              });
          }
          if (logStok.length) setRiwayatStok((l) => [...logStok, ...l]);
          if (logPakai.length) setPenggunaan((l) => [...logPakai, ...l]);
          return hasil;
        });
      },
      ubahStatusServis: (id, status) => setServis((l) => l.map((x) => (x.id === id ? { ...x, status } : x))),
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
      },

      simpanSparepart: (s) =>
        setSparepart((list) =>
          s.id
            ? list.map((x) => (x.id === s.id ? ({ ...x, ...s, tanggalUpdate: hariIni() } as Sparepart) : x))
            : [{ terpakai: 0, ...s, id: uid(), tanggalUpdate: hariIni() } as Sparepart, ...list],
        ),
      hapusSparepart: (id) => setSparepart((l) => l.filter((x) => x.id !== id)),
      catatPembelian: (p) => {
        const nomor = `PB-2026-${String(12 + pembelian.length - pembelianAwal.length).padStart(4, "0")}`;
        const baru: PembelianSparepart = { ...p, id: uid(), nomor, total: p.jumlah * p.harga, status: "Diterima" };
        setPembelian((l) => [baru, ...l]);
        setSparepart((l) =>
          l.map((sp) => (sp.id === p.sparepartId ? { ...sp, stok: sp.stok + p.jumlah, tanggalUpdate: p.tanggal } : sp)),
        );
        setRiwayatStok((l) => [
          { id: uid(), sparepartId: p.sparepartId, jenis: "Masuk", jumlah: p.jumlah, tanggal: p.tanggal, keterangan: `Pembelian ${nomor} · ${p.supplier}` },
          ...l,
        ]);
      },
      buatBooking: (b) => {
        const baru: Booking = { ...b, id: uid(), nomor: `BK-2026-${String(33 + booking.length - bookingAwal.length).padStart(4, "0")}`, status: "Menunggu Konfirmasi" };
        setBooking((l) => [baru, ...l]);
        return baru;
      },
      ubahStatusBooking: (id, status, alasan) =>
        setBooking((l) =>
          l.map((x) => {
            if (x.id !== id) return x;
            const { alasanTolak, ...rest } = x;
            return status === "Ditolak"
              ? { ...rest, status, alasanTolak: alasan ?? alasanTolak ?? "" }
              : { ...rest, status };
          }),
        ),
      tugaskanMekanikBooking: (id, mekanik) =>
        setBooking((l) => l.map((x) => (x.id === id ? { ...x, mekanikDitugaskan: mekanik } : x))),
      bayarServis: (id, metode) => {
        const target = servis.find((x) => x.id === id);
        const m = metode ?? target?.metodeBayar ?? "Cash";
        setServis((l) => l.map((x) => (x.id === id ? { ...x, status: "Selesai Dibayar" as StatusServis, metodeBayar: m } : x)));
        if (target)
          setPembayaran((l) => [
            { id: uid(), servisId: id, noTransaksi: target.noTransaksi, metode: m, tanggalBayar: hariIni(), totalBayar: target.total, status: "Lunas" },
            ...l.filter((p) => p.servisId !== id),
          ]);
      },
    }),
    [pelanggan, kendaraan, servis, sparepart, booking, tiket, pembayaran, riwayatStok, pembelian, penggunaan],
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
