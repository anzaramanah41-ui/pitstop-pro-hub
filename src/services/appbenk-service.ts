import { supabase } from "@/lib/supabase";
export { supabase };
import type {
  PelangganRow,
  KendaraanRow,
  BookingServisRow,
  ServisRow,
  PembayaranRow,
  DetailServisRow,
  SparepartRow,
  PenggunaanSparepartRow,
  PembelianSparepartRow,
  RiwayatStokRow,
  StokOpnameRow,
  ReturSparepartRow,
  LaporanRingkasanStokRow,
  AdminRow,
  OwnerRow,
  BengkelRow,
  MekanikRow,
  StatusBooking,
  StatusServis,
  StatusPembayaran,
  MetodePembayaran,
} from "@/types/database";

/**
 * Check whether Supabase environment variables are properly defined.
 */
export function isSupabaseConfigured(): boolean {
  const url = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
  const key = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;
  return Boolean(
    url && key && !url.includes("YOUR_PROJECT_REF") && !key.includes("YOUR_SUPABASE_ANON_KEY"),
  );
}

// ----------------------------------------------------------------------------
// 1. PELANGGAN SERVICE
// ----------------------------------------------------------------------------
export const pelangganService = {
  async getAll(): Promise<PelangganRow[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase()
      .from("pelanggan")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getById(idPelanggan: string): Promise<PelangganRow | null> {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase()
      .from("pelanggan")
      .select("*")
      .eq("id_pelanggan", idPelanggan)
      .single();
    if (error) return null;
    return data;
  },

  async getByUserId(userId: string): Promise<PelangganRow | null> {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase()
      .from("pelanggan")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (error) return null;
    return data;
  },

  async create(payload: {
    id_pelanggan?: string;
    nama: string;
    email: string;
    no_hp?: string;
    alamat?: string;
    user_id?: string;
  }): Promise<PelangganRow> {
    const idPelanggan =
      payload.id_pelanggan ||
      `pl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    if (!isSupabaseConfigured()) {
      return {
        id_pelanggan: idPelanggan,
        user_id: payload.user_id ?? null,
        nama: payload.nama,
        email: payload.email,
        no_hp: payload.no_hp ?? null,
        alamat: payload.alamat ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    const { data, error } = await supabase()
      .from("pelanggan")
      .insert({
        id_pelanggan: idPelanggan,
        ...payload,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(idPelanggan: string, payload: Partial<PelangganRow>): Promise<PelangganRow> {
    if (!isSupabaseConfigured()) throw new Error("Supabase tidak aktif");
    const { data, error } = await supabase()
      .from("pelanggan")
      .update(payload)
      .eq("id_pelanggan", idPelanggan)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(idPelanggan: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase().from("pelanggan").delete().eq("id_pelanggan", idPelanggan);
    if (error) throw error;
  },
};

// ----------------------------------------------------------------------------
// 2. KENDARAAN SERVICE
// ----------------------------------------------------------------------------
export const kendaraanService = {
  async getByPelanggan(idPelanggan: string): Promise<KendaraanRow[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase()
      .from("kendaraan")
      .select("*")
      .eq("id_pelanggan", idPelanggan)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getAll(): Promise<KendaraanRow[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase()
      .from("kendaraan")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async create(payload: {
    id_kendaraan?: string;
    id_pelanggan: string;
    merk: string;
    tipe: string;
    tahun: number;
    nopol: string;
    kilometer?: number;
  }): Promise<KendaraanRow> {
    const idKendaraan =
      payload.id_kendaraan ||
      `kd-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    if (!isSupabaseConfigured()) {
      return {
        id_kendaraan: idKendaraan,
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    const { data, error } = await supabase()
      .from("kendaraan")
      .insert({
        id_kendaraan: idKendaraan,
        ...payload,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(idKendaraan: string, payload: Partial<KendaraanRow>): Promise<KendaraanRow> {
    if (!isSupabaseConfigured()) throw new Error("Supabase tidak aktif");
    const { data, error } = await supabase()
      .from("kendaraan")
      .update(payload)
      .eq("id_kendaraan", idKendaraan)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(idKendaraan: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase().from("kendaraan").delete().eq("id_kendaraan", idKendaraan);
    if (error) throw error;
  },
};

// ----------------------------------------------------------------------------
// 3. BOOKING SERVIS SERVICE
// ----------------------------------------------------------------------------
export const bookingService = {
  async getAll(): Promise<BookingServisRow[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase()
      .from("booking_servis")
      .select("*")
      .order("tanggal_booking", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getByPelanggan(idPelanggan: string): Promise<BookingServisRow[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase()
      .from("booking_servis")
      .select("*")
      .eq("id_pelanggan", idPelanggan)
      .order("tanggal_booking", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async create(payload: {
    id_booking?: string;
    id_bengkel?: string;
    nomor_booking: string;
    id_pelanggan: string;
    id_kendaraan: string;
    tanggal_booking: string;
    waktu_booking: string;
    jenis_servis: string;
    keluhan: string;
    mekanik_diinginkan?: string | undefined;
    id_mekanik?: string | null | undefined;
  }): Promise<BookingServisRow> {
    const idBooking =
      payload.id_booking ||
      `bk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const idBengkel = payload.id_bengkel || "bengkel-001";
    if (!isSupabaseConfigured()) {
      return {
        id_booking: idBooking,
        id_bengkel: idBengkel,
        nomor_booking: payload.nomor_booking,
        id_pelanggan: payload.id_pelanggan,
        id_kendaraan: payload.id_kendaraan,
        tanggal_booking: payload.tanggal_booking,
        waktu_booking: payload.waktu_booking,
        jenis_servis: payload.jenis_servis,
        keluhan: payload.keluhan,
        id_mekanik: payload.id_mekanik ?? null,
        mekanik_diinginkan: payload.mekanik_diinginkan ?? null,
        status_booking: "menunggu_konfirmasi",
        alasan_penolakan: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    const { data, error } = await supabase()
      .from("booking_servis")
      .insert({
        id_booking: idBooking,
        id_bengkel: idBengkel,
        ...payload,
        status_booking: "menunggu_konfirmasi",
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateStatus(
    idBooking: string,
    status: StatusBooking,
    alasanPenolakan?: string,
  ): Promise<BookingServisRow> {
    if (!isSupabaseConfigured()) throw new Error("Supabase tidak aktif");
    const updateData: Partial<BookingServisRow> = { status_booking: status };
    if (status === "ditolak") {
      if (!alasanPenolakan?.trim()) {
        throw new Error("Alasan penolakan wajib diisi ketika booking ditolak.");
      }
      updateData.alasan_penolakan = alasanPenolakan.trim();
    }
    const { data, error } = await supabase()
      .from("booking_servis")
      .update(updateData)
      .eq("id_booking", idBooking)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ----------------------------------------------------------------------------
// 4. SERVIS SERVICE
// ----------------------------------------------------------------------------
export const servisService = {
  async getAll(): Promise<ServisRow[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase()
      .from("servis")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getById(idServis: string): Promise<ServisRow | null> {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase()
      .from("servis")
      .select("*")
      .eq("id_servis", idServis)
      .single();
    if (error) return null;
    return data;
  },

  async create(payload: {
    id_servis?: string | undefined;
    id_bengkel?: string | null | undefined;
    id_mekanik?: string | null | undefined;
    nomor_servis: string;
    id_booking?: string | null | undefined;
    id_pelanggan: string;
    id_kendaraan: string;
    mekanik?: string | null | undefined;
    jenis_servis?: string | null | undefined;
    keluhan?: string | null | undefined;
    pekerjaan?: string | null | undefined;
    hasil_pemeriksaan?: string | null | undefined;
    estimasi_biaya?: number | undefined;
    estimasi_waktu?: string | null | undefined;
    biaya_jasa?: number | undefined;
    biaya_sparepart?: number | undefined;
    total_biaya?: number | undefined;
    status_servis?: StatusServis | undefined;
    tanggal_servis?: string | null | undefined;
    tanggal_mulai?: string | null | undefined;
    estimasi_selesai?: string | null | undefined;
    tanggal_selesai?: string | null | undefined;
    catatan?: string | null | undefined;
  }): Promise<ServisRow> {
    const idServis =
      payload.id_servis ||
      `srv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const idBengkel = payload.id_bengkel || "bengkel-001";

    if (!isSupabaseConfigured()) {
      const jasa = payload.biaya_jasa ?? 0;
      const part = payload.biaya_sparepart ?? 0;
      return {
        id_servis: idServis,
        nomor_servis: payload.nomor_servis,
        id_booking: payload.id_booking ?? null,
        id_pelanggan: payload.id_pelanggan,
        id_kendaraan: payload.id_kendaraan,
        id_bengkel: idBengkel,
        id_mekanik: payload.id_mekanik ?? null,
        mekanik: payload.mekanik ?? null,
        jenis_servis: payload.jenis_servis ?? null,
        keluhan: payload.keluhan ?? null,
        pekerjaan: payload.pekerjaan ?? null,
        hasil_pemeriksaan: payload.hasil_pemeriksaan ?? null,
        estimasi_biaya: payload.estimasi_biaya ?? 0,
        estimasi_waktu: payload.estimasi_waktu ?? null,
        biaya_jasa: jasa,
        biaya_sparepart: part,
        total_biaya: payload.total_biaya ?? jasa + part,
        status_servis: payload.status_servis ?? "menunggu",
        tanggal_servis: payload.tanggal_servis ?? null,
        tanggal_mulai: payload.tanggal_mulai ?? null,
        estimasi_selesai: payload.estimasi_selesai ?? null,
        tanggal_selesai: payload.tanggal_selesai ?? null,
        catatan: payload.catatan ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    let insertPayload = {
      id_servis: idServis,
      id_bengkel: idBengkel,
      ...payload,
    };
    let { data, error } = await supabase().from("servis").insert(insertPayload).select().single();
    if (error && (error.code === "23505" || error.message?.includes("servis_nomor_servis_key"))) {
      // Recovery otomatis jika nomor servis mengalami tabrakan sequence
      const { data: existingRows } = await supabase().from("servis").select("nomor_servis");
      let maxNum = 0;
      if (existingRows) {
        for (const r of existingRows) {
          if (!r.nomor_servis) continue;
          const parts = r.nomor_servis.split("-");
          const num = parseInt(parts[parts.length - 1], 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      }
      const nextNomor = `SRV-2026-${String(maxNum + 1).padStart(4, "0")}`;
      insertPayload = { ...insertPayload, nomor_servis: nextNomor };
      const retryRes = await supabase().from("servis").insert(insertPayload).select().single();
      if (retryRes.error) throw retryRes.error;
      return retryRes.data;
    }
    if (error) throw error;
    return data;
  },

  async update(idServis: string, payload: Partial<ServisRow>): Promise<ServisRow> {
    if (!isSupabaseConfigured()) throw new Error("Supabase tidak aktif");
    const { data, error } = await supabase()
      .from("servis")
      .update(payload)
      .eq("id_servis", idServis)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateStatus(idServis: string, status: StatusServis): Promise<ServisRow> {
    return this.update(idServis, { status_servis: status });
  },

  async delete(idServis: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase().from("detail_servis").delete().eq("id_servis", idServis);
    } catch {}
    try {
      await supabase().from("pembayaran").delete().eq("id_servis", idServis);
    } catch {}
    const { error } = await supabase().from("servis").delete().eq("id_servis", idServis);
    if (error) throw error;
  },

  async getDetailServis(idServis: string): Promise<DetailServisRow[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase()
      .from("detail_servis")
      .select("*")
      .eq("id_servis", idServis);
    if (error) throw error;
    return data ?? [];
  },

  async addDetailServis(payload: {
    id_servis: string;
    id_sparepart?: string;
    jumlah: number;
    keterangan?: string;
    harga: number;
  }): Promise<DetailServisRow> {
    const idDetail = `dt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    if (!isSupabaseConfigured()) {
      return {
        id_detail_servis: idDetail,
        id_servis: payload.id_servis,
        id_sparepart: payload.id_sparepart ?? null,
        jumlah: payload.jumlah,
        keterangan: payload.keterangan ?? null,
        harga: payload.harga,
        created_at: new Date().toISOString(),
      };
    }
    const { data, error } = await supabase()
      .from("detail_servis")
      .insert({
        id_detail: idDetail,
        id_detail_servis: idDetail,
        id_servis: payload.id_servis,
        id_sparepart: payload.id_sparepart ?? null,
        jumlah: payload.jumlah,
        qty: payload.jumlah,
        harga: payload.harga,
        harga_satuan: payload.harga,
        subtotal: payload.harga * payload.jumlah,
        keterangan: payload.keterangan ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ----------------------------------------------------------------------------
// 5. SPAREPART & STOK SERVICE
// ----------------------------------------------------------------------------
export const sparepartService = {
  async getAll(): Promise<SparepartRow[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase()
      .from("sparepart")
      .select("*")
      .order("id_sparepart", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async create(payload: SparepartRow): Promise<SparepartRow> {
    if (!isSupabaseConfigured()) return payload;
    const { data, error } = await supabase().from("sparepart").insert(payload).select().single();
    if (error) throw error;
    return data;
  },

  async update(idSparepart: string, payload: Partial<SparepartRow>): Promise<SparepartRow> {
    if (!isSupabaseConfigured()) throw new Error("Supabase tidak aktif");
    const { data, error } = await supabase()
      .from("sparepart")
      .update(payload)
      .eq("id_sparepart", idSparepart)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(idSparepart: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase().from("sparepart").delete().eq("id_sparepart", idSparepart);
    if (error) throw error;
  },

  // Penggunaan sparepart (otomatis mengurangi stok via trigger)
  async catatPenggunaan(payload: {
    id_sparepart: string;
    id_servis: string;
    jumlah: number;
    mekanik?: string;
    keterangan?: string;
  }): Promise<PenggunaanSparepartRow> {
    if (!isSupabaseConfigured()) {
      return {
        id_penggunaan_sparepart: crypto.randomUUID(),
        id_sparepart: payload.id_sparepart,
        id_servis: payload.id_servis,
        tanggal: new Date().toISOString().slice(0, 10),
        jumlah: payload.jumlah,
        mekanik: payload.mekanik ?? null,
        keterangan: payload.keterangan ?? null,
        created_at: new Date().toISOString(),
      };
    }
    const { data, error } = await supabase()
      .from("penggunaan_sparepart")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Pembelian sparepart (otomatis menambah stok via trigger saat status 'diterima')
  async catatPembelian(payload: {
    nomor_pembelian: string;
    id_sparepart: string;
    supplier: string;
    jumlah: number;
    harga: number;
    total: number;
    tanggal?: string;
    status?: "diterima" | "dibatalkan" | "retur";
  }): Promise<PembelianSparepartRow> {
    if (!isSupabaseConfigured()) {
      return {
        id_pembelian_sparepart: crypto.randomUUID(),
        nomor_pembelian: payload.nomor_pembelian,
        id_sparepart: payload.id_sparepart,
        supplier: payload.supplier,
        tanggal: payload.tanggal ?? new Date().toISOString().slice(0, 10),
        jumlah: payload.jumlah,
        harga: payload.harga,
        total: payload.total,
        status: payload.status ?? "diterima",
        created_at: new Date().toISOString(),
      };
    }
    const { data, error } = await supabase()
      .from("pembelian_sparepart")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getRiwayatStok(idSparepart?: string): Promise<RiwayatStokRow[]> {
    if (!isSupabaseConfigured()) return [];
    let query = supabase().from("riwayat_stok").select("*").order("tanggal", { ascending: false });
    if (idSparepart) query = query.eq("id_sparepart", idSparepart);
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },

  async getPembelian(): Promise<PembelianSparepartRow[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase()
      .from("pembelian_sparepart")
      .select("*")
      .order("tanggal", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async updatePembelian(
    idPembelian: string,
    payload: Partial<PembelianSparepartRow>,
  ): Promise<PembelianSparepartRow> {
    if (!isSupabaseConfigured()) throw new Error("Supabase tidak aktif");
    const { data, error } = await supabase()
      .from("pembelian_sparepart")
      .update(payload)
      .eq("id_pembelian_sparepart", idPembelian)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deletePembelian(idPembelian: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase()
      .from("pembelian_sparepart")
      .delete()
      .eq("id_pembelian_sparepart", idPembelian);
    if (error) throw error;
  },

  async getPenggunaan(): Promise<PenggunaanSparepartRow[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase()
      .from("penggunaan_sparepart")
      .select("*")
      .order("tanggal", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async catatStokOpname(payload: {
    keterangan: string;
    total_item: number;
    selisih_total: number;
  }): Promise<StokOpnameRow> {
    if (!isSupabaseConfigured()) {
      return {
        id_stok_opname: crypto.randomUUID(),
        tanggal: new Date().toISOString().slice(0, 10),
        keterangan: payload.keterangan,
        total_item: payload.total_item,
        selisih_total: payload.selisih_total,
        created_at: new Date().toISOString(),
      };
    }
    const { data, error } = await supabase().from("stok_opname").insert(payload).select().single();
    if (error) throw error;
    return data;
  },

  async catatRetur(payload: {
    id_sparepart: string;
    id_pembelian_sparepart?: string | null;
    jumlah: number;
    alasan: string;
    status?: "diproses" | "disetujui" | "ditolak";
  }): Promise<ReturSparepartRow> {
    if (!isSupabaseConfigured()) {
      return {
        id_retur_sparepart: crypto.randomUUID(),
        id_pembelian_sparepart: payload.id_pembelian_sparepart ?? null,
        id_sparepart: payload.id_sparepart,
        jumlah: payload.jumlah,
        tanggal: new Date().toISOString().slice(0, 10),
        alasan: payload.alasan,
        status: payload.status ?? "diproses",
        created_at: new Date().toISOString(),
      };
    }
    const { data, error } = await supabase()
      .from("retur_sparepart")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getRetur(): Promise<ReturSparepartRow[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase()
      .from("retur_sparepart")
      .select("*")
      .order("tanggal", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};

// ----------------------------------------------------------------------------
// 6. PEMBAYARAN SERVICE
// ----------------------------------------------------------------------------
export const pembayaranService = {
  async getAll(): Promise<PembayaranRow[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase()
      .from("pembayaran")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getByServis(idServis: string): Promise<PembayaranRow | null> {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase()
      .from("pembayaran")
      .select("*")
      .eq("id_servis", idServis)
      .single();
    if (error) return null;
    return data;
  },

  async create(payload: {
    nomor_transaksi: string;
    id_servis: string;
    id_pelanggan: string;
    metode_pembayaran: MetodePembayaran;
    jumlah_bayar: number;
    status_pembayaran?: StatusPembayaran;
    bukti_pembayaran?: string;
  }): Promise<PembayaranRow> {
    if (!isSupabaseConfigured()) {
      return {
        id_pembayaran: crypto.randomUUID(),
        nomor_transaksi: payload.nomor_transaksi,
        id_servis: payload.id_servis,
        id_pelanggan: payload.id_pelanggan,
        metode_pembayaran: payload.metode_pembayaran,
        tanggal_bayar: new Date().toISOString(),
        jumlah_bayar: payload.jumlah_bayar,
        status_pembayaran: payload.status_pembayaran ?? "belum_dibayar",
        bukti_pembayaran: payload.bukti_pembayaran ?? null,
        alasan_penolakan: null,
        verified_by: null,
        verified_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    const { data, error } = await supabase().from("pembayaran").insert(payload).select().single();
    if (error) throw error;
    return data;
  },

  async submitPembayaran(
    idServis: string,
    metode: MetodePembayaran,
    buktiUrl?: string,
  ): Promise<PembayaranRow> {
    if (metode === "transfer" && !buktiUrl) {
      throw new Error("Bukti pembayaran transfer wajib diunggah.");
    }
    if (!isSupabaseConfigured()) throw new Error("Supabase tidak aktif");

    const updatePayload: Partial<PembayaranRow> = {
      metode_pembayaran: metode,
      tanggal_bayar: new Date().toISOString(),
      status_pembayaran: "menunggu_verifikasi",
      bukti_pembayaran: buktiUrl ?? null,
    };

    const { data: existing } = await supabase()
      .from("pembayaran")
      .select("id_pembayaran")
      .eq("id_servis", idServis)
      .maybeSingle();

    if (existing?.id_pembayaran) {
      const { data, error } = await supabase()
        .from("pembayaran")
        .update(updatePayload)
        .eq("id_servis", idServis)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data: srv } = await supabase()
        .from("servis")
        .select("nomor_servis, id_pelanggan, total_biaya")
        .eq("id_servis", idServis)
        .maybeSingle();

      const { data, error } = await supabase()
        .from("pembayaran")
        .insert({
          id_pembayaran: `pmb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          nomor_transaksi: srv?.nomor_servis
            ? `TRX-${srv.nomor_servis.replace("SRV-", "")}`
            : `TRX-${Date.now().toString(36).toUpperCase()}`,
          id_servis: idServis,
          id_pelanggan: srv?.id_pelanggan || "pelanggan-001",
          metode_pembayaran: metode,
          tanggal_bayar: new Date().toISOString(),
          jumlah_bayar: srv?.total_biaya || 0,
          status_pembayaran: "menunggu_verifikasi",
          bukti_pembayaran: buktiUrl ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  async verifikasiPembayaran(
    idServis: string,
    disetujui: boolean,
    alasan?: string,
    verifiedBy?: string,
  ): Promise<PembayaranRow> {
    if (!disetujui && !alasan?.trim()) {
      throw new Error("Alasan penolakan bukti pembayaran wajib diisi.");
    }
    if (!isSupabaseConfigured()) throw new Error("Supabase tidak aktif");

    const updatePayload: Partial<PembayaranRow> = {
      status_pembayaran: disetujui ? "lunas" : "ditolak",
      alasan_penolakan: disetujui ? null : (alasan?.trim() ?? null),
      verified_by: verifiedBy ?? null,
      verified_at: new Date().toISOString(),
    };

    const { data, error } = await supabase()
      .from("pembayaran")
      .update(updatePayload)
      .eq("id_servis", idServis)
      .select()
      .single();
    if (error) throw error;

    // Jika pembayaran lunas, ubah status servis menjadi lunas
    if (disetujui) {
      await servisService.updateStatus(idServis, "lunas");
    }

    return data;
  },
};

// ----------------------------------------------------------------------------
// 7. ADMIN & OWNER SERVICE
// ----------------------------------------------------------------------------
export const roleService = {
  async getAdmin(userId: string): Promise<AdminRow | null> {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase()
      .from("admin")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (error) return null;
    return data;
  },

  async getOwner(userId: string): Promise<OwnerRow | null> {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase()
      .from("owner")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (error) return null;
    return data;
  },

  async getAllAdmins(): Promise<AdminRow[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase().from("admin").select("*");
    if (error) throw error;
    return data ?? [];
  },
};

// ----------------------------------------------------------------------------
// 8. MASTER MEKANIK & BENGKEL SERVICE
// ----------------------------------------------------------------------------
export const mekanikService = {
  async getBengkel(): Promise<BengkelRow[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase()
      .from("bengkel")
      .select("*")
      .order("nama_bengkel", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async getMekanik(idBengkel?: string): Promise<MekanikRow[]> {
    if (!isSupabaseConfigured()) return [];
    let query = supabase()
      .from("mekanik")
      .select("*")
      .order("nama_mekanik", { ascending: true });
    if (idBengkel) {
      query = query.eq("id_bengkel", idBengkel);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },

  async create(payload: {
    id_mekanik?: string;
    id_bengkel: string;
    nama_mekanik: string;
    no_telepon?: string | null;
    spesialisasi?: string | null;
    status?: "Aktif" | "Tidak Aktif";
  }): Promise<MekanikRow> {
    const idMekanik =
      payload.id_mekanik ||
      `mk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    if (!isSupabaseConfigured()) {
      return {
        id_mekanik: idMekanik,
        id_bengkel: payload.id_bengkel,
        nama_mekanik: payload.nama_mekanik,
        no_telepon: payload.no_telepon ?? null,
        spesialisasi: payload.spesialisasi ?? null,
        status: payload.status ?? "Aktif",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    const { data, error } = await supabase()
      .from("mekanik")
      .insert({
        id_mekanik: idMekanik,
        id_bengkel: payload.id_bengkel,
        nama_mekanik: payload.nama_mekanik,
        no_telepon: payload.no_telepon ?? null,
        spesialisasi: payload.spesialisasi ?? null,
        status: payload.status ?? "Aktif",
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(idMekanik: string, payload: Partial<MekanikRow>): Promise<MekanikRow> {
    if (!isSupabaseConfigured()) throw new Error("Supabase tidak aktif");
    const { data, error } = await supabase()
      .from("mekanik")
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq("id_mekanik", idMekanik)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(idMekanik: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase()
      .from("mekanik")
      .delete()
      .eq("id_mekanik", idMekanik);
    if (error) throw error;
  },
};

