/**
 * TypeScript definitions for AppBenk Database (15 Entities)
 * Sistem Bengkel Terpadu
 */

export type StatusBooking =
  | "menunggu_konfirmasi"
  | "disetujui"
  | "ditolak"
  | "menunggu_servis"
  | "sedang_dikerjakan"
  | "selesai"
  | "menunggu_pembayaran"
  | "lunas";

export type StatusServis = "menunggu" | "diproses" | "selesai" | "menunggu_pembayaran" | "lunas";

export type StatusPembayaran = "belum_dibayar" | "menunggu_verifikasi" | "lunas" | "ditolak";

export type MetodePembayaran = "cash" | "transfer" | "qris";

export type StatusStok = "tersedia" | "menipis" | "habis";

export type JenisRiwayatStok = "masuk" | "keluar" | "penyesuaian";

export interface BengkelRow {
  id_bengkel: string;
  nama_bengkel: string;
  alamat: string | null;
  no_telepon: string | null;
  created_at: string;
  updated_at: string;
}

export interface MekanikRow {
  id_mekanik: string;
  id_bengkel: string;
  nama_mekanik: string;
  no_telepon: string | null;
  spesialisasi: string | null;
  status: "Aktif" | "Tidak Aktif";
  created_at: string;
  updated_at: string;
}

export interface PelangganRow {
  id_pelanggan: string;
  user_id: string | null;
  nama: string;
  no_hp: string | null;
  email: string;
  password?: string | null;
  alamat: string | null;
  created_at: string;
  updated_at: string;
}

export interface KendaraanRow {
  id_kendaraan: string;
  id_pelanggan: string;
  merk: string;
  tipe: string;
  tahun: number;
  nopol: string;
  created_at: string;
  updated_at: string;
}

export interface BookingServisRow {
  id_booking: string;
  nomor_booking: string;
  id_pelanggan: string;
  id_kendaraan: string;
  id_bengkel?: string | null;
  tanggal_booking: string;
  waktu_booking: string;
  jenis_servis: string;
  keluhan: string;
  id_mekanik?: string | null;
  mekanik_diinginkan: string | null;
  status_booking: StatusBooking;
  alasan_penolakan: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServisRow {
  id_servis: string;
  nomor_servis: string;
  id_booking: string | null;
  id_pelanggan: string;
  id_kendaraan: string;
  id_bengkel?: string | null;
  id_mekanik?: string | null;
  mekanik: string | null;
  jenis_servis: string | null;
  keluhan: string | null;
  pekerjaan?: string | null;
  hasil_pemeriksaan: string | null;
  estimasi_biaya: number;
  estimasi_waktu: string | null;
  biaya_jasa: number;
  biaya_sparepart: number;
  total_biaya: number;
  status_servis: StatusServis;
  tanggal_servis?: string | null;
  tanggal_mulai: string | null;
  estimasi_selesai: string | null;
  tanggal_selesai: string | null;
  catatan: string | null;
  created_at: string;
  updated_at: string;
}

export interface PembayaranRow {
  id_pembayaran: string;
  nomor_transaksi: string;
  id_servis: string;
  id_pelanggan: string;
  metode_pembayaran: MetodePembayaran;
  tanggal_bayar: string | null;
  jumlah_bayar: number;
  status_pembayaran: StatusPembayaran;
  bukti_pembayaran: string | null;
  alasan_penolakan: string | null;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DetailServisRow {
  id_detail_servis: string;
  id_servis: string;
  id_sparepart: string | null;
  jumlah: number;
  keterangan: string | null;
  harga: number;
  created_at: string;
}

export interface SparepartRow {
  id_sparepart: string;
  nama_sparepart: string;
  kategori: string;
  satuan: string;
  harga: number;
  stok_tersedia: number;
  stok_minimum: number;
  status_stok: StatusStok;
  tanggal_update: string;
  created_at: string;
  updated_at: string;
}

export interface PenggunaanSparepartRow {
  id_penggunaan_sparepart: string;
  id_sparepart: string;
  id_servis: string;
  tanggal: string;
  jumlah: number;
  mekanik: string | null;
  keterangan: string | null;
  created_at: string;
}

export interface PembelianSparepartRow {
  id_pembelian_sparepart: string;
  nomor_pembelian: string;
  id_sparepart: string;
  supplier: string;
  tanggal: string;
  jumlah: number;
  harga: number;
  total: number;
  status: "diterima" | "dibatalkan" | "retur";
  created_at: string;
}

export interface RiwayatStokRow {
  id_riwayat_stok: string;
  id_sparepart: string;
  jenis: JenisRiwayatStok;
  jumlah: number;
  tanggal: string;
  keterangan: string | null;
  created_at: string;
}

export interface StokOpnameRow {
  id_stok_opname: string;
  tanggal: string;
  keterangan: string | null;
  total_item: number;
  selisih_total: number;
  created_at: string;
}

export interface ReturSparepartRow {
  id_retur_sparepart: string;
  id_pembelian_sparepart: string | null;
  id_sparepart: string;
  jumlah: number;
  tanggal: string;
  alasan: string;
  status: "diproses" | "disetujui" | "ditolak";
  created_at: string;
}

export interface LaporanRingkasanStokRow {
  id_ringkasan_stok: string;
  id_sparepart: string;
  stok_awal: number;
  stok_masuk: number;
  stok_keluar: number;
  stok_akhir: number;
  periode: string;
  created_at: string;
}

export interface AdminRow {
  id_admin: string;
  user_id: string;
  id_bengkel?: string | null;
  nama: string;
  email: string;
  no_hp: string | null;
  status: "aktif" | "nonaktif";
  created_at: string;
  updated_at: string;
}

export interface OwnerRow {
  id_owner: string;
  user_id: string;
  id_bengkel?: string | null;
  nama: string;
  email: string;
  no_hp: string | null;
  status: "aktif" | "nonaktif";
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      pelanggan: {
        Row: PelangganRow;
        Insert: Partial<PelangganRow> & { nama: string; email: string };
        Update: Partial<PelangganRow>;
      };
      kendaraan: {
        Row: KendaraanRow;
        Insert: Partial<KendaraanRow> & {
          id_pelanggan: string;
          merk: string;
          tipe: string;
          tahun: number;
          nopol: string;
        };
        Update: Partial<KendaraanRow>;
      };
      booking_servis: {
        Row: BookingServisRow;
        Insert: Partial<BookingServisRow> & {
          nomor_booking: string;
          id_pelanggan: string;
          id_kendaraan: string;
          tanggal_booking: string;
          waktu_booking: string;
          jenis_servis: string;
          keluhan: string;
        };
        Update: Partial<BookingServisRow>;
      };
      servis: {
        Row: ServisRow;
        Insert: Partial<ServisRow> & {
          nomor_servis: string;
          id_pelanggan: string;
          id_kendaraan: string;
        };
        Update: Partial<ServisRow>;
      };
      pembayaran: {
        Row: PembayaranRow;
        Insert: Partial<PembayaranRow> & {
          nomor_transaksi: string;
          id_servis: string;
          id_pelanggan: string;
          metode_pembayaran: MetodePembayaran;
        };
        Update: Partial<PembayaranRow>;
      };
      detail_servis: {
        Row: DetailServisRow;
        Insert: Partial<DetailServisRow> & { id_servis: string; harga: number; jumlah: number };
        Update: Partial<DetailServisRow>;
      };
      sparepart: {
        Row: SparepartRow;
        Insert: SparepartRow;
        Update: Partial<SparepartRow>;
      };
      penggunaan_sparepart: {
        Row: PenggunaanSparepartRow;
        Insert: Partial<PenggunaanSparepartRow> & {
          id_sparepart: string;
          id_servis: string;
          jumlah: number;
        };
        Update: Partial<PenggunaanSparepartRow>;
      };
      pembelian_sparepart: {
        Row: PembelianSparepartRow;
        Insert: Partial<PembelianSparepartRow> & {
          nomor_pembelian: string;
          id_sparepart: string;
          supplier: string;
          jumlah: number;
          harga: number;
          total: number;
        };
        Update: Partial<PembelianSparepartRow>;
      };
      riwayat_stok: {
        Row: RiwayatStokRow;
        Insert: Partial<RiwayatStokRow> & {
          id_sparepart: string;
          jenis: JenisRiwayatStok;
          jumlah: number;
        };
        Update: Partial<RiwayatStokRow>;
      };
      stok_opname: {
        Row: StokOpnameRow;
        Insert: Partial<StokOpnameRow>;
        Update: Partial<StokOpnameRow>;
      };
      retur_sparepart: {
        Row: ReturSparepartRow;
        Insert: Partial<ReturSparepartRow> & {
          id_sparepart: string;
          jumlah: number;
          alasan: string;
        };
        Update: Partial<ReturSparepartRow>;
      };
      laporan_ringkasan_stok: {
        Row: LaporanRingkasanStokRow;
        Insert: Partial<LaporanRingkasanStokRow> & { id_sparepart: string; periode: string };
        Update: Partial<LaporanRingkasanStokRow>;
      };
      admin: {
        Row: AdminRow;
        Insert: Partial<AdminRow> & { user_id: string; nama: string; email: string };
        Update: Partial<AdminRow>;
      };
      owner: {
        Row: OwnerRow;
        Insert: Partial<OwnerRow> & { user_id: string; nama: string; email: string };
        Update: Partial<OwnerRow>;
      };
      bengkel: {
        Row: BengkelRow;
        Insert: Partial<BengkelRow> & { id_bengkel: string; nama_bengkel: string };
        Update: Partial<BengkelRow>;
      };
      mekanik: {
        Row: MekanikRow;
        Insert: Partial<MekanikRow> & { nama_mekanik: string; id_bengkel: string };
        Update: Partial<MekanikRow>;
      };
    };
  };
}
