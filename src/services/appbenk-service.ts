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
  SupplierRow,
  StatusReturDb,
  WorkshopRow,
  WorkshopMemberRow,
  WorkshopPaymentAccountRow,
  PaymentAccountType,
  NotificationLogRow,
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
  async getAll(workshopId?: string): Promise<PelangganRow[]> {
    if (!isSupabaseConfigured()) return [];
    let query = supabase().from("pelanggan").select("*").order("created_at", { ascending: false });
    if (workshopId) {
      query = query.or(`workshop_id.eq.${workshopId},id_bengkel.eq.${workshopId}`);
    }
    const { data, error } = await query;
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
      .maybeSingle();
    if (error) return null;
    return data;
  },

  async create(payload: {
    id_pelanggan?: string;
    workshop_id?: string;
    id_bengkel?: string;
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
        workshop_id: payload.workshop_id ?? payload.id_bengkel ?? "bengkel-001",
        id_bengkel: payload.id_bengkel ?? payload.workshop_id ?? "bengkel-001",
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

  async getAll(workshopId?: string): Promise<KendaraanRow[]> {
    if (!isSupabaseConfigured()) return [];
    let query = supabase().from("kendaraan").select("*").order("created_at", { ascending: false });
    if (workshopId) {
      query = query.or(`workshop_id.eq.${workshopId},id_bengkel.eq.${workshopId}`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },

  async create(payload: {
    id_kendaraan?: string;
    id_pelanggan: string;
    workshop_id?: string;
    id_bengkel?: string;
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
        workshop_id: payload.workshop_id ?? payload.id_bengkel ?? "bengkel-001",
        id_bengkel: payload.id_bengkel ?? payload.workshop_id ?? "bengkel-001",
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
  async getAll(workshopId?: string): Promise<BookingServisRow[]> {
    if (!isSupabaseConfigured()) return [];
    let query = supabase()
      .from("booking_servis")
      .select("*")
      .order("tanggal_booking", { ascending: false });
    if (workshopId) {
      query = query.or(`workshop_id.eq.${workshopId},id_bengkel.eq.${workshopId}`);
    }
    const { data, error } = await query;
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
    workshop_id?: string;
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
    const idBengkel = payload.workshop_id || payload.id_bengkel || "bengkel-001";
    if (!isSupabaseConfigured()) {
      return {
        id_booking: idBooking,
        workshop_id: idBengkel,
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

    // Pastikan pelanggan ada di database Supabase untuk mencegah foreign key error
    try {
      const { data: existPel } = await supabase()
        .from("pelanggan")
        .select("id_pelanggan")
        .eq("id_pelanggan", payload.id_pelanggan)
        .maybeSingle();

      if (!existPel) {
        await supabase()
          .from("pelanggan")
          .insert({
            id_pelanggan: payload.id_pelanggan,
            workshop_id: idBengkel,
            id_bengkel: idBengkel,
            nama: "Pelanggan",
            email: `${payload.id_pelanggan}@appbenk.local`,
          });
      }
    } catch (e) {
      void e;
    }

    // Pastikan kendaraan ada di database Supabase untuk mencegah foreign key error
    try {
      const { data: existKen } = await supabase()
        .from("kendaraan")
        .select("id_kendaraan")
        .eq("id_kendaraan", payload.id_kendaraan)
        .maybeSingle();

      if (!existKen) {
        await supabase().from("kendaraan").insert({
          id_kendaraan: payload.id_kendaraan,
          id_pelanggan: payload.id_pelanggan,
          workshop_id: idBengkel,
          id_bengkel: idBengkel,
          merk: "Kendaraan",
          tipe: "Umum",
          tahun: 2024,
          nopol: "D 1234 BK",
        });
      }
    } catch (e) {
      void e;
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
  async getAll(workshopId?: string): Promise<ServisRow[]> {
    if (!isSupabaseConfigured()) return [];
    let query = supabase().from("servis").select("*").order("created_at", { ascending: false });
    if (workshopId) {
      query = query.eq("id_bengkel", workshopId);
    }
    const { data, error } = await query;
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
    workshop_id?: string | null | undefined;
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
    const idBengkel = payload.id_bengkel || payload.workshop_id || "bengkel-001";

    if (!isSupabaseConfigured()) {
      const jasa = payload.biaya_jasa ?? 0;
      const part = payload.biaya_sparepart ?? 0;
      return {
        id_servis: idServis,
        nomor_servis: payload.nomor_servis,
        id_booking: payload.id_booking ?? null,
        id_pelanggan: payload.id_pelanggan,
        id_kendaraan: payload.id_kendaraan,
        workshop_id: idBengkel,
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
    // Servis table in Supabase has id_bengkel, but does NOT have workshop_id
    const { workshop_id: _wId, ...restPayload } = payload;
    let insertPayload: any = {
      ...restPayload,
      id_servis: idServis,
      id_bengkel: idBengkel,
    };
    const initialRes = await supabase().from("servis").insert(insertPayload).select().single();
    if (
      initialRes.error &&
      (initialRes.error.code === "23505" ||
        initialRes.error.message?.includes("servis_nomor_servis_key"))
    ) {
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
    if (initialRes.error) throw initialRes.error;
    return initialRes.data;
  },

  async update(idServis: string, payload: Partial<ServisRow>): Promise<ServisRow> {
    if (!isSupabaseConfigured()) throw new Error("Supabase tidak aktif");
    const { workshop_id: _wId, ...cleanPayload } = payload as any;
    const { data, error } = await supabase()
      .from("servis")
      .update(cleanPayload)
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
    } catch (e) {
      void e;
    }
    try {
      await supabase().from("pembayaran").delete().eq("id_servis", idServis);
    } catch (e) {
      void e;
    }
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
  async getAll(workshopId?: string): Promise<SparepartRow[]> {
    if (!isSupabaseConfigured()) return [];
    let query = supabase().from("sparepart").select("*").order("id_sparepart", { ascending: true });
    if (workshopId) {
      query = query.or(
        `workshop_id.eq.${workshopId},id_bengkel.eq.${workshopId},workshop_id.is.null`,
      );
    }
    const { data, error } = await query;
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
    workshop_id?: string;
    id_bengkel?: string;
    mekanik?: string;
    keterangan?: string;
  }): Promise<PenggunaanSparepartRow> {
    if (!isSupabaseConfigured()) {
      return {
        id_penggunaan_sparepart: crypto.randomUUID(),
        id_sparepart: payload.id_sparepart,
        id_servis: payload.id_servis,
        workshop_id: payload.workshop_id ?? payload.id_bengkel ?? "bengkel-001",
        id_bengkel: payload.id_bengkel ?? payload.workshop_id ?? "bengkel-001",
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
    workshop_id?: string;
    id_bengkel?: string;
    tanggal?: string;
    status?: "diterima" | "dibatalkan" | "retur";
  }): Promise<PembelianSparepartRow> {
    if (!isSupabaseConfigured()) {
      return {
        id_pembelian_sparepart: crypto.randomUUID(),
        nomor_pembelian: payload.nomor_pembelian,
        id_sparepart: payload.id_sparepart,
        supplier: payload.supplier,
        workshop_id: payload.workshop_id ?? payload.id_bengkel ?? "bengkel-001",
        id_bengkel: payload.id_bengkel ?? payload.workshop_id ?? "bengkel-001",
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

  async getRiwayatStok(idSparepart?: string, workshopId?: string): Promise<RiwayatStokRow[]> {
    if (!isSupabaseConfigured()) return [];
    let query = supabase().from("riwayat_stok").select("*").order("tanggal", { ascending: false });
    if (idSparepart) query = query.eq("id_sparepart", idSparepart);
    if (workshopId) {
      query = query.or(`workshop_id.eq.${workshopId},id_bengkel.eq.${workshopId}`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },

  async getPembelian(workshopId?: string): Promise<PembelianSparepartRow[]> {
    if (!isSupabaseConfigured()) return [];
    let query = supabase()
      .from("pembelian_sparepart")
      .select("*")
      .order("tanggal", { ascending: false });
    if (workshopId) {
      query = query.or(`workshop_id.eq.${workshopId},id_bengkel.eq.${workshopId}`);
    }
    const { data, error } = await query;
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
    workshop_id?: string;
    id_bengkel?: string;
  }): Promise<StokOpnameRow> {
    if (!isSupabaseConfigured()) {
      return {
        id_stok_opname: crypto.randomUUID(),
        workshop_id: payload.workshop_id ?? payload.id_bengkel ?? "bengkel-001",
        id_bengkel: payload.id_bengkel ?? payload.workshop_id ?? "bengkel-001",
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
    id_retur_sparepart?: string;
    nomor_retur?: string;
    workshop_id?: string;
    id_bengkel?: string;
    id_supplier?: string | null;
    supplier?: string;
    id_pembelian_sparepart?: string | null;
    nomor_pembelian?: string;
    id_sparepart: string;
    nama_sparepart?: string;
    jumlah: number;
    harga_satuan?: number;
    total_nilai?: number;
    tanggal?: string;
    alasan: string;
    alasan_detail?: string | null;
    alasan_penolakan?: string | null;
    keterangan?: string | null;
    status?: StatusReturDb;
    stok_dikurangi?: boolean;
    riwayat_stok_id?: string | null;
  }): Promise<ReturSparepartRow> {
    const idRetur = payload.id_retur_sparepart || crypto.randomUUID();
    const tgl = payload.tanggal || new Date().toISOString().slice(0, 10);
    const initialStatus = payload.status ?? "Diajukan";
    const wbId = payload.workshop_id || payload.id_bengkel || "bengkel-001";

    if (!isSupabaseConfigured()) {
      return {
        id_retur_sparepart: idRetur,
        nomor_retur: payload.nomor_retur ?? null,
        workshop_id: wbId,
        id_bengkel: wbId,
        id_supplier: payload.id_supplier ?? null,
        supplier: payload.supplier ?? null,
        id_pembelian_sparepart: payload.id_pembelian_sparepart ?? null,
        nomor_pembelian: payload.nomor_pembelian ?? null,
        id_sparepart: payload.id_sparepart,
        nama_sparepart: payload.nama_sparepart ?? null,
        jumlah: payload.jumlah,
        harga_satuan: payload.harga_satuan ?? 0,
        total_nilai: payload.total_nilai ?? 0,
        tanggal: tgl,
        alasan: payload.alasan,
        alasan_detail: payload.alasan_detail ?? null,
        alasan_penolakan: payload.alasan_penolakan ?? null,
        keterangan: payload.keterangan ?? null,
        status: initialStatus,
        stok_dikurangi: payload.stok_dikurangi ?? false,
        riwayat_stok_id: payload.riwayat_stok_id ?? null,
        created_at: new Date().toISOString(),
      };
    }
    const { data, error } = await supabase()
      .from("retur_sparepart")
      .insert({
        id_retur_sparepart: idRetur,
        nomor_retur: payload.nomor_retur,
        workshop_id: wbId,
        id_bengkel: wbId,
        id_supplier: payload.id_supplier,
        supplier: payload.supplier,
        id_pembelian_sparepart: payload.id_pembelian_sparepart,
        nomor_pembelian: payload.nomor_pembelian,
        id_sparepart: payload.id_sparepart,
        jumlah: payload.jumlah,
        harga_satuan: payload.harga_satuan,
        total_nilai: payload.total_nilai,
        tanggal: tgl,
        alasan: payload.alasan,
        alasan_detail: payload.alasan_detail,
        alasan_penolakan: payload.alasan_penolakan,
        keterangan: payload.keterangan,
        status: initialStatus,
        stok_dikurangi: payload.stok_dikurangi ?? false,
        riwayat_stok_id: payload.riwayat_stok_id,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateStatusRetur(
    idRetur: string,
    status: StatusReturDb,
    alasanPenolakan?: string | null,
    stokDikurangi?: boolean,
    riwayatStokId?: string | null,
  ): Promise<ReturSparepartRow> {
    if (!isSupabaseConfigured()) throw new Error("Supabase tidak aktif");
    const updatePayload: Partial<ReturSparepartRow> = { status };
    if (alasanPenolakan !== undefined) updatePayload.alasan_penolakan = alasanPenolakan;
    if (stokDikurangi !== undefined) updatePayload.stok_dikurangi = stokDikurangi;
    if (riwayatStokId !== undefined) updatePayload.riwayat_stok_id = riwayatStokId;

    const { data, error } = await supabase()
      .from("retur_sparepart")
      .update(updatePayload)
      .eq("id_retur_sparepart", idRetur)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async catatRiwayatStok(payload: {
    id_riwayat_stok?: string;
    id_sparepart: string;
    workshop_id?: string;
    id_bengkel?: string;
    jenis: "masuk" | "keluar" | "Masuk" | "Keluar";
    jumlah: number;
    tanggal?: string;
    keterangan?: string | null;
  }): Promise<RiwayatStokRow> {
    const jenisDb: "masuk" | "keluar" =
      payload.jenis.toLowerCase() === "keluar" ? "keluar" : "masuk";
    const wbId = payload.workshop_id || payload.id_bengkel || "bengkel-001";
    const insertPayload = {
      id_riwayat_stok:
        payload.id_riwayat_stok || `rw-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      id_sparepart: payload.id_sparepart,
      workshop_id: wbId,
      id_bengkel: wbId,
      jenis: jenisDb,
      jumlah: payload.jumlah,
      tanggal: payload.tanggal || new Date().toISOString().slice(0, 10),
      keterangan: payload.keterangan ?? null,
    };
    if (!isSupabaseConfigured()) {
      return {
        ...insertPayload,
        created_at: new Date().toISOString(),
      } as RiwayatStokRow;
    }
    const { data, error } = await supabase()
      .from("riwayat_stok")
      .insert(insertPayload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getRetur(workshopId?: string): Promise<ReturSparepartRow[]> {
    if (!isSupabaseConfigured()) return [];
    let query = supabase()
      .from("retur_sparepart")
      .select("*")
      .order("created_at", { ascending: false });
    if (workshopId) {
      query = query.or(`workshop_id.eq.${workshopId},id_bengkel.eq.${workshopId}`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },
};

// ----------------------------------------------------------------------------
// 6. PEMBAYARAN SERVICE
// ----------------------------------------------------------------------------
const LOCAL_ACCOUNTS_KEY = "appbenk_workshop_payment_accounts";

let isTableAvailable = true;
let isStorageBucketAvailable = true;

function safeUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getLocalAccounts(workshopId?: string): WorkshopPaymentAccountRow[] {
  const wbId = workshopId || "bengkel-001";
  // Default demo accounts for bengkel-001
  const defaults: WorkshopPaymentAccountRow[] = [
    {
      id: "acc-bank-001",
      workshop_id: "bengkel-001",
      id_bengkel: "bengkel-001",
      account_type: "bank_transfer",
      provider: "MANUAL",
      provider_account_id: "bca-001",
      bank_name: "BCA",
      account_number: "8735091234",
      account_holder_name: "PT AppBenk Motor Pusat",
      qr_image_url: null,
      display_name: "Rekening Utama Bengkel (BCA)",
      is_active: true,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "acc-bank-002",
      workshop_id: "bengkel-001",
      id_bengkel: "bengkel-001",
      account_type: "bank_transfer",
      provider: "MANUAL",
      provider_account_id: "mandiri-001",
      bank_name: "Bank Mandiri",
      account_number: "1370019882231",
      account_holder_name: "AppBenk Motor Pusat",
      qr_image_url: null,
      display_name: "Rekening Operasional (Mandiri)",
      is_active: true,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "acc-qris-001",
      workshop_id: "bengkel-001",
      id_bengkel: "bengkel-001",
      account_type: "qris",
      provider: "MANUAL",
      provider_account_id: "qris-001",
      bank_name: null,
      account_number: null,
      account_holder_name: null,
      qr_image_url: null,
      display_name: "QRIS Standar Nasional AppBenk Motor",
      is_active: true,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  let currentList: WorkshopPaymentAccountRow[] = defaults;
  if (typeof window !== "undefined") {
    try {
      const existing = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
      if (existing) {
        const parsed = JSON.parse(existing);
        if (Array.isArray(parsed) && parsed.length > 0) {
          currentList = parsed;
        }
      } else {
        localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(defaults));
      }
    } catch {}

    // Sinkronkan QRIS spesifik dari appbenk_qris_active dan appbenk_qris_image_data jika ada
    try {
      const wsRaw = workshopId ? localStorage.getItem(`appbenk_qris_active_${workshopId}`) : null;
      const wsImg = workshopId ? localStorage.getItem(`appbenk_qris_image_data_${workshopId}`) : null;
      const directQrisRaw = wsRaw || localStorage.getItem("appbenk_qris_active");
      const fallbackImage = wsImg || localStorage.getItem("appbenk_qris_image_data");
      let qrisObj = directQrisRaw ? JSON.parse(directQrisRaw) : null;

      if (!qrisObj && fallbackImage) {
        qrisObj = {
          id: "acc-qris-001",
          workshop_id: wbId,
          id_bengkel: wbId,
          account_type: "qris",
          provider: "MANUAL",
          provider_account_id: "qris-manual",
          qr_image_url: fallbackImage,
          display_name: "QRIS Bengkel",
          is_active: true,
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      } else if (qrisObj && fallbackImage && !qrisObj.qr_image_url) {
        qrisObj.qr_image_url = fallbackImage;
      }

      if (qrisObj) {
        const targetWb = qrisObj.workshop_id || qrisObj.id_bengkel || wbId;
        const withoutQris = currentList.filter(
          (a) => !(a.account_type === "qris" && (a.workshop_id === targetWb || a.id_bengkel === targetWb))
        );
        const existingQris = currentList.find(
          (a) => a.account_type === "qris" && (a.workshop_id === targetWb || a.id_bengkel === targetWb)
        );

        const existingTime = existingQris ? new Date(existingQris.updated_at || existingQris.created_at || 0).getTime() : 0;
        const qrisObjTime = new Date(qrisObj.updated_at || qrisObj.created_at || 0).getTime();

        let mergedQris: WorkshopPaymentAccountRow;
        if (existingQris && existingTime > qrisObjTime && existingQris.qr_image_url) {
          mergedQris = existingQris;
        } else {
          mergedQris = {
            ...(existingQris || defaults.find((d) => d.account_type === "qris")!),
            ...qrisObj,
            account_type: "qris",
            workshop_id: targetWb,
            id_bengkel: targetWb,
          };
        }
        currentList = [...withoutQris, mergedQris];
      }
    } catch {}
  }

  if (workshopId) {
    const filtered = currentList.filter(
      (a) => a.workshop_id === workshopId || a.id_bengkel === workshopId,
    );
    if (filtered.length > 0) return filtered;
  }
  return currentList;
}

export function saveLocalAccount(item: WorkshopPaymentAccountRow) {
  try {
    const list = getLocalAccounts();
    const wbId = item.workshop_id || item.id_bengkel || "bengkel-001";
    if (item.account_type === "qris") {
      // Hapus entri QRIS lama untuk workshop ini dan masukkan entri terbaru
      const withoutQris = list.filter(
        (a) => !(a.account_type === "qris" && (a.workshop_id === wbId || a.id_bengkel === wbId))
      );
      withoutQris.push(item);
      localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(withoutQris));
      localStorage.setItem("appbenk_qris_active", JSON.stringify(item));
      localStorage.setItem(`appbenk_qris_active_${wbId}`, JSON.stringify(item));
      if (item.id_bengkel && item.id_bengkel !== wbId) {
        localStorage.setItem(`appbenk_qris_active_${item.id_bengkel}`, JSON.stringify(item));
      }
      if (item.qr_image_url) {
        localStorage.setItem("appbenk_qris_image_data", item.qr_image_url);
        localStorage.setItem(`appbenk_qris_image_data_${wbId}`, item.qr_image_url);
        if (item.id_bengkel && item.id_bengkel !== wbId) {
          localStorage.setItem(`appbenk_qris_image_data_${item.id_bengkel}`, item.qr_image_url);
        }
      }
    } else {
      const idx = list.findIndex((a) => a.id === item.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...item };
      } else {
        list.push(item);
      }
      localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(list));
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("appbenk_payment_accounts_updated", { detail: item }),
      );
    }
  } catch {}
}

function toggleLocalAccountActive(id: string, isActive: boolean) {
  try {
    const list = getLocalAccounts();
    const acc = list.find((a) => a.id === id);
    if (acc) {
      acc.is_active = isActive;
      acc.updated_at = new Date().toISOString();
      localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(list));
      if (acc.account_type === "qris") {
        const wbId = acc.workshop_id || acc.id_bengkel || "bengkel-001";
        localStorage.setItem("appbenk_qris_active", JSON.stringify(acc));
        localStorage.setItem(`appbenk_qris_active_${wbId}`, JSON.stringify(acc));
        if (acc.id_bengkel && acc.id_bengkel !== wbId) {
          localStorage.setItem(`appbenk_qris_active_${acc.id_bengkel}`, JSON.stringify(acc));
        }
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("appbenk_payment_accounts_updated", { detail: acc }),
        );
      }
    }
  } catch {}
}

function deleteLocalAccount(id: string) {
  try {
    const list = getLocalAccounts();
    const target = list.find((a) => a.id === id);
    const filtered = list.filter((a) => a.id !== id);
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(filtered));
    if (target?.account_type === "qris") {
      const wbId = target.workshop_id || target.id_bengkel || "bengkel-001";
      localStorage.removeItem(`appbenk_qris_active_${wbId}`);
      localStorage.removeItem(`appbenk_qris_image_data_${wbId}`);
      localStorage.removeItem("appbenk_qris_active");
      localStorage.removeItem("appbenk_qris_image_data");
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("appbenk_payment_accounts_updated", { detail: { id, deleted: true } }),
      );
    }
  } catch {}
}

export const workshopPaymentAccountsService = {
  async getAll(workshopId?: string): Promise<WorkshopPaymentAccountRow[]> {
    if (!isSupabaseConfigured() || !isTableAvailable) return getLocalAccounts(workshopId);
    try {
      let query = supabase()
        .from("workshop_payment_accounts")
        .select("*")
        .order("updated_at", { ascending: false });
      if (workshopId) {
        query = query.or(`workshop_id.eq.${workshopId},id_bengkel.eq.${workshopId}`);
      }
      const { data, error } = await query;
      if (error) {
        if (error.code === "PGRST205" || (error as any).code === "42P01") {
          isTableAvailable = false;
        }
        return getLocalAccounts(workshopId);
      }
      if (data && data.length > 0) {
        try {
          localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(data));
        } catch {}
        return data as WorkshopPaymentAccountRow[];
      }
      // Supabase kosong untuk workshopId ini — coba ambil SEMUA akun (cross-workshop fallback)
      if (workshopId) {
        const { data: allData, error: allErr } = await supabase()
          .from("workshop_payment_accounts")
          .select("*")
          .order("updated_at", { ascending: false });
        if (!allErr && allData && allData.length > 0) {
          try {
            localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(allData));
          } catch {}
          return allData as WorkshopPaymentAccountRow[];
        }
      }
      // Fallback ke localStorage (gabungkan dengan data lokal yang ada)
      return getLocalAccounts(workshopId);
    } catch {
      return getLocalAccounts(workshopId);
    }
  },

  async getActive(workshopId?: string): Promise<WorkshopPaymentAccountRow[]> {
    const list = await this.getAll(workshopId);
    return list.filter((a) => a.is_active);
  },

  async saveAccount(account: Partial<WorkshopPaymentAccountRow> & {
    workshop_id: string;
    account_type: PaymentAccountType;
  }): Promise<WorkshopPaymentAccountRow> {
    const wbId = account.workshop_id || "bengkel-001";
    const now = new Date().toISOString();

    const isValidUUID = (id?: string) =>
      typeof id === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

    const hasValidUuid = isValidUUID(account.id);
    const targetId = hasValidUuid ? account.id! : safeUUID();

    const item: WorkshopPaymentAccountRow = {
      id: targetId,
      workshop_id: wbId,
      id_bengkel: wbId,
      account_type: account.account_type,
      provider: account.provider || (account.account_type === "qris" ? "QRIS_MANUAL" : "MANUAL"),
      provider_account_id: account.provider_account_id || (account.account_type === "qris" ? "qris-manual" : "manual"),
      bank_name: account.bank_name ?? null,
      account_number: account.account_number ?? null,
      account_holder_name: account.account_holder_name ?? null,
      qr_image_url: account.qr_image_url ?? null,
      display_name: account.display_name ?? null,
      is_active: account.is_active ?? true,
      status: account.status || "active",
      created_at: account.created_at || now,
      updated_at: now,
    };

    saveLocalAccount(item);

    if (isSupabaseConfigured() && isTableAvailable) {
      try {
        let existingId: string | null = null;

        // Untuk QRIS, cari apakah sudah ada row QRIS di Supabase untuk bengkel ini
        if (account.account_type === "qris") {
          const { data: existingQris, error: selErr } = await supabase()
            .from("workshop_payment_accounts")
            .select("id")
            .eq("account_type", "qris")
            .or(`workshop_id.eq.${wbId},id_bengkel.eq.${wbId}`)
            .limit(1)
            .maybeSingle();

          if (selErr && (selErr.code === "PGRST205" || (selErr as any).code === "42P01")) {
            isTableAvailable = false;
          } else if (existingQris?.id) {
            existingId = existingQris.id;
          }
        } else if (hasValidUuid) {
          existingId = account.id!;
        }

        if (isTableAvailable) {
          if (existingId) {
            item.id = existingId;
            const { data, error } = await supabase()
              .from("workshop_payment_accounts")
              .update(item)
              .eq("id", existingId)
              .select()
              .single();
            if (!error && data) {
              saveLocalAccount(data as WorkshopPaymentAccountRow);
              return data as WorkshopPaymentAccountRow;
            } else if (error && (error.code === "PGRST205" || (error as any).code === "42P01")) {
              isTableAvailable = false;
            }
          } else {
            const { data, error } = await supabase()
              .from("workshop_payment_accounts")
              .insert(item)
              .select()
              .single();
            if (!error && data) {
              saveLocalAccount(data as WorkshopPaymentAccountRow);
              return data as WorkshopPaymentAccountRow;
            } else if (error && (error.code === "PGRST205" || (error as any).code === "42P01")) {
              isTableAvailable = false;
            }
          }
        }
      } catch (err: any) {
        console.warn("Supabase saveAccount fallback to local:", err.message);
      }
    }
    return item;
  },

  async toggleActive(id: string, isActive: boolean): Promise<boolean> {
    toggleLocalAccountActive(id, isActive);
    if (isSupabaseConfigured() && isTableAvailable) {
      try {
        await supabase()
          .from("workshop_payment_accounts")
          .update({ is_active: isActive, updated_at: new Date().toISOString() })
          .eq("id", id);
      } catch {}
    }
    return true;
  },

  async deleteAccount(id: string): Promise<boolean> {
    deleteLocalAccount(id);
    if (isSupabaseConfigured() && isTableAvailable) {
      try {
        await supabase().from("workshop_payment_accounts").delete().eq("id", id);
      } catch {}
    }
    return true;
  },
};

export const storagePaymentService = {
  async uploadQRIS(workshopId: string, file: File): Promise<string> {
    const wbId = workshopId || "bengkel-001";
    const ext = file.name.split(".").pop() || "png";
    const path = `${wbId}/qris/${Date.now()}-${safeUUID().slice(0, 6)}.${ext}`;

    if (isSupabaseConfigured() && isStorageBucketAvailable) {
      try {
        const uploadPromise = supabase()
          .storage
          .from("payment-assets")
          .upload(path, file, { upsert: true, contentType: file.type || "image/png" });

        const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: new Error("Storage timeout") }), 2000),
        );

        const { data, error } = await Promise.race([uploadPromise, timeoutPromise]);

        if (!error && data?.path) {
          const { data: urlData } = supabase()
            .storage
            .from("payment-assets")
            .getPublicUrl(data.path);
          if (urlData?.publicUrl) {
            return urlData.publicUrl;
          }
        } else {
          isStorageBucketAvailable = false;
        }
      } catch (err) {
        isStorageBucketAvailable = false;
        console.warn("Upload payment-assets fallback to optimized data URL:", err);
      }
    }

    // Optimasi gambar ke Data URL dengan background putih (agar PNG transparan tidak menjadi hitam)
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (!dataUrl) {
          resolve("");
          return;
        }
        const img = new Image();
        img.onload = () => {
          const maxDim = 600;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);
            const optimized = canvas.toDataURL("image/jpeg", 0.85);
            resolve(optimized);
          } else {
            resolve(dataUrl);
          }
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  },

  async uploadBuktiPembayaran(workshopId: string, nomorTransaksi: string, file: File): Promise<string> {
    const wbId = workshopId || "bengkel-001";
    const safeTrx = nomorTransaksi.replace(/[^a-zA-Z0-9_-]/g, "_");
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${wbId}/payments/${safeTrx}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase()
          .storage
          .from("payment-assets")
          .upload(path, file, { upsert: true, contentType: file.type });

        if (!error && data?.path) {
          const { data: urlData } = supabase()
            .storage
            .from("payment-assets")
            .getPublicUrl(data.path);
          if (urlData?.publicUrl) {
            return urlData.publicUrl;
          }
        }
      } catch (err) {
        console.warn("Upload storage bukti pembayaran fallback to data URL:", err);
      }
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
};

export const notificationLogService = {
  async log(payload: {
    workshop_id?: string | null;
    id_bengkel?: string | null;
    user_id?: string | null;
    channel?: "EMAIL" | "WHATSAPP" | "IN_APP" | "in_app";
    type: string;
    recipient: string;
    subject?: string | null;
    message: string;
    status?: string;
  }): Promise<NotificationLogRow> {
    const wbId = payload.workshop_id || payload.id_bengkel || "bengkel-001";
    const newLog: NotificationLogRow = {
      id: crypto.randomUUID(),
      workshop_id: wbId,
      id_bengkel: wbId,
      user_id: payload.user_id ?? null,
      channel: payload.channel || "in_app",
      type: payload.type,
      recipient: payload.recipient,
      subject: payload.subject ?? null,
      message: payload.message,
      status: payload.status || "sent",
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase()
          .from("notification_logs")
          .insert(newLog)
          .select()
          .single();
        if (!error && data) return data as NotificationLogRow;
      } catch (err) {
        console.warn("notification_logs insert failed:", err);
      }
    }
    return newLog;
  },

  async getAll(workshopId?: string, userId?: string): Promise<NotificationLogRow[]> {
    if (!isSupabaseConfigured()) return [];
    try {
      let query = supabase().from("notification_logs").select("*").order("created_at", { ascending: false });
      if (workshopId) {
        query = query.or(`workshop_id.eq.${workshopId},id_bengkel.eq.${workshopId}`);
      }
      if (userId) {
        query = query.eq("user_id", userId);
      }
      const { data, error } = await query;
      if (error) return [];
      return (data as NotificationLogRow[]) ?? [];
    } catch {
      return [];
    }
  },
};

export const pembayaranService = {
  async getAll(workshopId?: string): Promise<PembayaranRow[]> {
    if (!isSupabaseConfigured()) return [];
    try {
      let query = supabase().from("pembayaran").select("*").order("created_at", { ascending: false });
      if (workshopId) {
        query = query.or(`workshop_id.eq.${workshopId},id_bengkel.eq.${workshopId}`);
      }
      const { data, error } = await query;
      if (error) {
        const { data: fallbackData } = await supabase().from("pembayaran").select("*").order("created_at", { ascending: false });
        return (fallbackData as PembayaranRow[]) ?? [];
      }
      return (data as PembayaranRow[]) ?? [];
    } catch {
      return [];
    }
  },

  async getByServis(idServis: string): Promise<PembayaranRow | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase()
        .from("pembayaran")
        .select("*")
        .eq("id_servis", idServis)
        .maybeSingle();
      if (error) return null;
      return data as PembayaranRow;
    } catch {
      return null;
    }
  },

  async create(payload: {
    nomor_transaksi: string;
    id_servis: string;
    id_pelanggan: string;
    workshop_id?: string;
    id_bengkel?: string;
    metode_pembayaran: MetodePembayaran;
    jumlah_bayar: number;
    status_pembayaran?: StatusPembayaran;
    bukti_pembayaran?: string;
  }): Promise<PembayaranRow> {
    const wbId = payload.workshop_id || payload.id_bengkel || "bengkel-001";
    if (!isSupabaseConfigured()) {
      return {
        id_pembayaran: crypto.randomUUID(),
        nomor_transaksi: payload.nomor_transaksi,
        id_servis: payload.id_servis,
        id_pelanggan: payload.id_pelanggan,
        workshop_id: wbId,
        id_bengkel: wbId,
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
    const { data, error } = await supabase()
      .from("pembayaran")
      .insert({
        ...payload,
        workshop_id: wbId,
        id_bengkel: wbId,
      })
      .select()
      .single();
    if (error) throw error;
    return data as PembayaranRow;
  },

  async submitPembayaran(
    idServis: string,
    metode: MetodePembayaran,
    buktiUrl?: string,
  ): Promise<PembayaranRow> {
    if (metode === "transfer" && !buktiUrl) {
      throw new Error("Bukti pembayaran transfer bank wajib diunggah.");
    }
    if (metode === "qris" && !buktiUrl) {
      throw new Error("Bukti pembayaran QRIS wajib diunggah.");
    }
    if (metode === "cash") {
      buktiUrl = undefined;
    }

    if (!isSupabaseConfigured()) throw new Error("Supabase tidak aktif");

    // Fetch service info
    const { data: srv } = await supabase()
      .from("servis")
      .select("nomor_servis, id_pelanggan, total_biaya, workshop_id, id_bengkel, pelanggan(nama)")
      .eq("id_servis", idServis)
      .maybeSingle();

    const wbId = srv?.workshop_id || srv?.id_bengkel || "bengkel-001";
    const customerName = (srv?.pelanggan as any)?.nama || "Pelanggan";

    // Duplicate payment protection
    const { data: existing } = await supabase()
      .from("pembayaran")
      .select("*")
      .eq("id_servis", idServis)
      .maybeSingle();

    if (existing?.status_pembayaran === "lunas" || (existing as any)?.status === "Lunas") {
      throw new Error("Pembayaran untuk servis ini sudah lunas. Pembayaran ganda tidak diizinkan.");
    }

    const now = new Date().toISOString();
    let result: PembayaranRow;

    if (existing?.id_pembayaran) {
      const updateData: any = {
        metode_pembayaran: metode,
        tanggal_bayar: now,
        status_pembayaran: "menunggu_verifikasi",
        bukti_pembayaran: buktiUrl ?? null,
        alasan_penolakan: null,
        updated_at: now,
        workshop_id: wbId,
        id_bengkel: wbId,
      };

      let res = await supabase()
        .from("pembayaran")
        .update(updateData)
        .eq("id_pembayaran", existing.id_pembayaran)
        .select()
        .maybeSingle();

      if (res.error) {
        delete updateData.workshop_id;
        delete updateData.id_bengkel;
        res = await supabase()
          .from("pembayaran")
          .update(updateData)
          .eq("id_pembayaran", existing.id_pembayaran)
          .select()
          .single();
      }
      result = res.data as PembayaranRow;
    } else {
      const noTrx = srv?.nomor_servis
        ? `TRX-${srv.nomor_servis.replace("SRV-", "")}`
        : `TRX-${Date.now().toString(36).toUpperCase()}`;

      const insertData: any = {
        id_pembayaran: `pmb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        nomor_transaksi: noTrx,
        id_servis: idServis,
        id_pelanggan: srv?.id_pelanggan || "pelanggan-001",
        workshop_id: wbId,
        id_bengkel: wbId,
        metode_pembayaran: metode,
        tanggal_bayar: now,
        jumlah_bayar: srv?.total_biaya || 0,
        status_pembayaran: "menunggu_verifikasi",
        bukti_pembayaran: buktiUrl ?? null,
        created_at: now,
        updated_at: now,
      };

      let res = await supabase()
        .from("pembayaran")
        .insert(insertData)
        .select()
        .maybeSingle();

      if (res.error) {
        delete insertData.workshop_id;
        delete insertData.id_bengkel;
        res = await supabase()
          .from("pembayaran")
          .insert(insertData)
          .select()
          .single();
      }
      result = res.data as PembayaranRow;
    }

    // Send in-app notification to Admin
    const noTrx = result.nomor_transaksi || srv?.nomor_servis || "TRX";
    let notifSubject = "Pembayaran Menunggu Verifikasi";
    let notifMsg = `Pelanggan ${customerName} telah mengirim pembayaran untuk transaksi ${noTrx}.`;
    if (metode === "qris") {
      notifSubject = "Pembayaran QRIS Menunggu Verifikasi";
      notifMsg = `Pelanggan ${customerName} telah mengirim bukti pembayaran QRIS untuk transaksi ${noTrx}.`;
    } else if (metode === "transfer") {
      notifSubject = "Pembayaran Transfer Menunggu Verifikasi";
      notifMsg = `Pelanggan ${customerName} telah mengirim bukti transfer untuk transaksi ${noTrx}.`;
    } else if (metode === "cash") {
      notifSubject = "Pembayaran Cash Menunggu Verifikasi";
      notifMsg = `Pelanggan ${customerName} telah mengonfirmasi pembayaran secara tunai untuk transaksi ${noTrx}.`;
    }

    try {
      await notificationLogService.log({
        workshop_id: wbId,
        id_bengkel: wbId,
        channel: "in_app",
        type: "pembayaran",
        recipient: "admin",
        subject: notifSubject,
        message: notifMsg,
        status: "sent",
      });
    } catch {}

    return result;
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

    const now = new Date().toISOString();
    const updatePayload: any = {
      status_pembayaran: disetujui ? "lunas" : "ditolak",
      alasan_penolakan: disetujui ? null : (alasan?.trim() ?? null),
      verified_by: verifiedBy ?? null,
      verified_at: now,
      updated_at: now,
    };

    let { data, error } = await supabase()
      .from("pembayaran")
      .update(updatePayload)
      .eq("id_servis", idServis)
      .select()
      .maybeSingle();

    if (error) {
      delete updatePayload.verified_by;
      delete updatePayload.verified_at;
      const res = await supabase()
        .from("pembayaran")
        .update(updatePayload)
        .eq("id_servis", idServis)
        .select()
        .single();
      data = res.data;
    }

    // Jika pembayaran disetujui, otomatis ubah status servis menjadi lunas
    if (disetujui) {
      try {
        await servisService.updateStatus(idServis, "lunas");
      } catch (err) {
        console.warn("Sinkronisasi status servis gagal:", err);
      }
    }

    // Kirim notifikasi ke pelanggan
    try {
      const srv = await servisService.getById(idServis);
      const noTrx = data?.nomor_transaksi || srv?.nomor_servis || "TRX";
      const totalBayar = data?.jumlah_bayar || srv?.total_biaya || 0;
      const notifSubject = disetujui ? "Pembayaran Berhasil Diverifikasi" : "Pembayaran Ditolak";
      const notifMsg = disetujui
        ? `Pembayaran transaksi ${noTrx} sebesar Rp ${totalBayar.toLocaleString("id-ID")} telah diverifikasi oleh Admin.`
        : `Pembayaran transaksi ${noTrx} ditolak. Alasan: ${alasan?.trim() || "Bukti tidak valid"}`;

      await notificationLogService.log({
        workshop_id: srv?.workshop_id || srv?.id_bengkel || "bengkel-001",
        id_bengkel: srv?.id_bengkel || srv?.workshop_id || "bengkel-001",
        channel: "in_app",
        type: "pembayaran",
        recipient: srv?.id_pelanggan || "pelanggan",
        subject: notifSubject,
        message: notifMsg,
        status: "sent",
      });
    } catch {}

    return data as PembayaranRow;
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
    try {
      const { data, error } = await supabase()
        .from("workshops")
        .select("*")
        .order("name", { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((w: WorkshopRow) => ({
          id_bengkel: w.id,
          workshop_id: w.id,
          nama_bengkel: w.name,
          alamat: w.address ?? null,
          no_telepon: w.phone ?? null,
          created_at: w.created_at,
          updated_at: w.updated_at,
        }));
      }
    } catch (e) {
      void e;
      // fallback jika tabel workshops belum ada
    }

    const { data, error } = await supabase()
      .from("bengkel")
      .select("*")
      .order("nama_bengkel", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async getMekanik(idBengkel?: string): Promise<MekanikRow[]> {
    if (!isSupabaseConfigured()) return [];
    let query = supabase().from("mekanik").select("*").order("nama_mekanik", { ascending: true });
    if (idBengkel) {
      query = query.or(`workshop_id.eq.${idBengkel},id_bengkel.eq.${idBengkel}`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },

  async create(payload: {
    id_mekanik?: string;
    workshop_id?: string;
    id_bengkel: string;
    nama_mekanik: string;
    no_telepon?: string | null;
    spesialisasi?: string | null;
    status?: "Aktif" | "Tidak Aktif";
  }): Promise<MekanikRow> {
    const idMekanik =
      payload.id_mekanik || `mk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const wbId = payload.workshop_id || payload.id_bengkel;

    if (!isSupabaseConfigured()) {
      return {
        id_mekanik: idMekanik,
        workshop_id: wbId,
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
        workshop_id: wbId,
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
      .update(payload)
      .eq("id_mekanik", idMekanik)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(idMekanik: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase().from("mekanik").delete().eq("id_mekanik", idMekanik);
    if (error) throw error;
  },
};

// ----------------------------------------------------------------------------
// 9. SUPPLIER SERVICE
// ----------------------------------------------------------------------------
export const supplierService = {
  async getAll(workshopId?: string): Promise<SupplierRow[]> {
    if (!isSupabaseConfigured()) return [];
    let query = supabase().from("supplier").select("*").order("nama_supplier", { ascending: true });
    if (workshopId) {
      query = query.or(`workshop_id.eq.${workshopId},id_bengkel.eq.${workshopId}`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },

  async getById(idSupplier: string): Promise<SupplierRow | null> {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase()
      .from("supplier")
      .select("*")
      .eq("id_supplier", idSupplier)
      .single();
    if (error) return null;
    return data;
  },

  async create(payload: Partial<SupplierRow> & { nama_supplier: string }): Promise<SupplierRow> {
    const idSupplier =
      payload.id_supplier ||
      `sup-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const wbId = payload.workshop_id || payload.id_bengkel || "bengkel-001";
    const newSupplier: SupplierRow = {
      id_supplier: idSupplier,
      workshop_id: wbId,
      id_bengkel: wbId,
      nama_supplier: payload.nama_supplier,
      kontak: payload.kontak ?? null,
      no_telepon: payload.no_telepon ?? null,
      email: payload.email ?? null,
      alamat: payload.alamat ?? null,
      status: payload.status ?? "Aktif",
      created_at: new Date().toISOString(),
    };
    if (!isSupabaseConfigured()) return newSupplier;
    const { data, error } = await supabase().from("supplier").insert(newSupplier).select().single();
    if (error) throw error;
    return data;
  },
};

// ----------------------------------------------------------------------------
// 10. MULTI-TENANT WORKSHOP SERVICE
// ----------------------------------------------------------------------------
export const workshopService = {
  async getAll(): Promise<WorkshopRow[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase()
      .from("workshops")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async getById(id: string): Promise<WorkshopRow | null> {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase()
      .from("workshops")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) return null;
    return data;
  },

  async createWorkshop(payload: {
    id: string;
    name: string;
    code: string;
    owner_id?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    google_place_id?: string | null;
  }): Promise<WorkshopRow> {
    if (!isSupabaseConfigured()) {
      return {
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    const { data, error } = await supabase().from("workshops").insert(payload).select().single();
    if (error) throw error;
    return data;
  },

  async getMembers(workshopId: string): Promise<WorkshopMemberRow[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase()
      .from("workshop_members")
      .select("*")
      .eq("workshop_id", workshopId);
    if (error) throw error;
    return data ?? [];
  },

  async addMember(payload: {
    workshop_id: string;
    user_id: string;
    role: "OWNER" | "ADMIN" | "MECHANIC" | "CUSTOMER";
  }): Promise<WorkshopMemberRow> {
    if (!isSupabaseConfigured()) {
      return {
        id: crypto.randomUUID(),
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    const { data, error } = await supabase()
      .from("workshop_members")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getUserMemberships(userId: string): Promise<WorkshopMemberRow[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase()
      .from("workshop_members")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;
    return data ?? [];
  },

  async getPaymentAccounts(workshopId: string): Promise<WorkshopPaymentAccountRow[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase()
      .from("workshop_payment_accounts")
      .select("*")
      .eq("workshop_id", workshopId);
    if (error) throw error;
    return data ?? [];
  },

  async createPaymentAccount(payload: {
    workshop_id: string;
    provider?: string;
    provider_account_id: string;
    account_type?: PaymentAccountType;
    is_active?: boolean;
  }): Promise<WorkshopPaymentAccountRow> {
    const newAcc: WorkshopPaymentAccountRow = {
      id: crypto.randomUUID(),
      workshop_id: payload.workshop_id,
      id_bengkel: payload.workshop_id,
      account_type: payload.account_type || "bank_transfer",
      provider: payload.provider || "XENDIT",
      provider_account_id: payload.provider_account_id,
      bank_name: null,
      account_number: null,
      account_holder_name: null,
      qr_image_url: null,
      display_name: null,
      status: "active",
      is_active: payload.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (!isSupabaseConfigured()) {
      return newAcc;
    }
    const { data, error } = await supabase()
      .from("workshop_payment_accounts")
      .insert(newAcc)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getNotificationLogs(workshopId?: string): Promise<NotificationLogRow[]> {
    if (!isSupabaseConfigured()) return [];
    let query = supabase()
      .from("notification_logs")
      .select("*")
      .order("created_at", { ascending: false });
    if (workshopId) {
      query = query.eq("workshop_id", workshopId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },

  async createNotificationLog(payload: {
    workshop_id?: string | null;
    user_id?: string | null;
    channel: "EMAIL" | "WHATSAPP" | "IN_APP";
    type: string;
    recipient: string;
    subject?: string | null;
    message: string;
    status?: string;
    provider?: string | null;
    provider_message_id?: string | null;
  }): Promise<NotificationLogRow> {
    const newLog = {
      ...payload,
      status: payload.status || "sent",
      sent_at: new Date().toISOString(),
    };
    if (!isSupabaseConfigured()) {
      return {
        id: crypto.randomUUID(),
        ...newLog,
        created_at: new Date().toISOString(),
      };
    }
    const { data, error } = await supabase()
      .from("notification_logs")
      .insert(newLog)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
