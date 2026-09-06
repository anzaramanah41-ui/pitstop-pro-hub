export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          alasan_tolak: string | null
          catatan: string
          created_at: string
          customer_id: string | null
          id: string
          jenis: string
          keluhan: string
          kendaraan: string
          mekanik_diinginkan: string | null
          mekanik_ditugaskan: string | null
          nomor: string
          pelanggan_nama: string
          plat: string
          status: string
          tanggal: string
          updated_at: string
          vehicle_id: string | null
          waktu: string
        }
        Insert: {
          alasan_tolak?: string | null
          catatan?: string
          created_at?: string
          customer_id?: string | null
          id?: string
          jenis?: string
          keluhan?: string
          kendaraan?: string
          mekanik_diinginkan?: string | null
          mekanik_ditugaskan?: string | null
          nomor: string
          pelanggan_nama?: string
          plat?: string
          status?: string
          tanggal?: string
          updated_at?: string
          vehicle_id?: string | null
          waktu?: string
        }
        Update: {
          alasan_tolak?: string | null
          catatan?: string
          created_at?: string
          customer_id?: string | null
          id?: string
          jenis?: string
          keluhan?: string
          kendaraan?: string
          mekanik_diinginkan?: string | null
          mekanik_ditugaskan?: string | null
          nomor?: string
          pelanggan_nama?: string
          plat?: string
          status?: string
          tanggal?: string
          updated_at?: string
          vehicle_id?: string | null
          waktu?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          alamat: string
          created_at: string
          email: string
          id: string
          kendaraan: string
          nama: string
          plat: string
          profile_id: string | null
          telepon: string
          updated_at: string
        }
        Insert: {
          alamat?: string
          created_at?: string
          email?: string
          id?: string
          kendaraan?: string
          nama: string
          plat?: string
          profile_id?: string | null
          telepon?: string
          updated_at?: string
        }
        Update: {
          alamat?: string
          created_at?: string
          email?: string
          id?: string
          kendaraan?: string
          nama?: string
          plat?: string
          profile_id?: string | null
          telepon?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          alasan_tolak: string | null
          bukti_url: string | null
          created_at: string
          customer_id: string | null
          id: string
          jumlah: number
          metode: string
          no_transaksi: string
          service_id: string | null
          status: string
          tanggal_bayar: string | null
          updated_at: string
        }
        Insert: {
          alasan_tolak?: string | null
          bukti_url?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          jumlah?: number
          metode?: string
          no_transaksi?: string
          service_id?: string | null
          status?: string
          tanggal_bayar?: string | null
          updated_at?: string
        }
        Update: {
          alasan_tolak?: string | null
          bukti_url?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          jumlah?: number
          metode?: string
          no_transaksi?: string
          service_id?: string | null
          status?: string
          tanggal_bayar?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string
          full_name?: string
          id: string
          phone?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      service_estimates: {
        Row: {
          biaya_jasa: number
          biaya_sparepart: number
          booking_id: string | null
          catatan: string
          created_at: string
          id: string
          service_id: string
          status: string
          total: number
          updated_at: string
        }
        Insert: {
          biaya_jasa?: number
          biaya_sparepart?: number
          booking_id?: string | null
          catatan?: string
          created_at?: string
          id?: string
          service_id: string
          status?: string
          total?: number
          updated_at?: string
        }
        Update: {
          biaya_jasa?: number
          biaya_sparepart?: number
          booking_id?: string | null
          catatan?: string
          created_at?: string
          id?: string
          service_id?: string
          status?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_estimates_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_estimates_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: true
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      service_items: {
        Row: {
          created_at: string
          harga: number
          id: string
          jumlah: number
          nama: string
          service_id: string
          sparepart_id: string | null
        }
        Insert: {
          created_at?: string
          harga?: number
          id?: string
          jumlah?: number
          nama?: string
          service_id: string
          sparepart_id?: string | null
        }
        Update: {
          created_at?: string
          harga?: number
          id?: string
          jumlah?: number
          nama?: string
          service_id?: string
          sparepart_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_items_sparepart_id_fkey"
            columns: ["sparepart_id"]
            isOneToOne: false
            referencedRelation: "spareparts"
            referencedColumns: ["id"]
          },
        ]
      }
      service_orders: {
        Row: {
          biaya_jasa: number
          biaya_part: number
          booking_id: string | null
          catatan: string
          created_at: string
          customer_id: string | null
          estimasi_selesai: string | null
          estimasi_waktu: string | null
          hasil_pemeriksaan: string | null
          id: string
          jenis: string
          keluhan: string
          kendaraan: string
          mekanik: string
          metode_bayar: string | null
          no_transaksi: string
          nomor: string
          pekerjaan: string
          pelanggan_nama: string
          plat: string
          sparepart_ringkas: string
          status: string
          tanggal: string
          total: number
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          biaya_jasa?: number
          biaya_part?: number
          booking_id?: string | null
          catatan?: string
          created_at?: string
          customer_id?: string | null
          estimasi_selesai?: string | null
          estimasi_waktu?: string | null
          hasil_pemeriksaan?: string | null
          id?: string
          jenis?: string
          keluhan?: string
          kendaraan?: string
          mekanik?: string
          metode_bayar?: string | null
          no_transaksi?: string
          nomor: string
          pekerjaan?: string
          pelanggan_nama?: string
          plat?: string
          sparepart_ringkas?: string
          status?: string
          tanggal?: string
          total?: number
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          biaya_jasa?: number
          biaya_part?: number
          booking_id?: string | null
          catatan?: string
          created_at?: string
          customer_id?: string | null
          estimasi_selesai?: string | null
          estimasi_waktu?: string | null
          hasil_pemeriksaan?: string | null
          id?: string
          jenis?: string
          keluhan?: string
          kendaraan?: string
          mekanik?: string
          metode_bayar?: string | null
          no_transaksi?: string
          nomor?: string
          pekerjaan?: string
          pelanggan_nama?: string
          plat?: string
          sparepart_ringkas?: string
          status?: string
          tanggal?: string
          total?: number
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_orders_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      sparepart_purchases: {
        Row: {
          created_at: string
          harga: number
          id: string
          jumlah: number
          nomor: string
          sparepart_id: string
          status: string
          supplier: string
          tanggal: string
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          harga?: number
          id?: string
          jumlah?: number
          nomor: string
          sparepart_id: string
          status?: string
          supplier?: string
          tanggal?: string
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          harga?: number
          id?: string
          jumlah?: number
          nomor?: string
          sparepart_id?: string
          status?: string
          supplier?: string
          tanggal?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sparepart_purchases_sparepart_id_fkey"
            columns: ["sparepart_id"]
            isOneToOne: false
            referencedRelation: "spareparts"
            referencedColumns: ["id"]
          },
        ]
      }
      sparepart_usages: {
        Row: {
          created_at: string
          id: string
          jumlah: number
          keterangan: string
          mekanik: string
          service_id: string | null
          service_nomor: string
          sparepart_id: string
          tanggal: string
        }
        Insert: {
          created_at?: string
          id?: string
          jumlah?: number
          keterangan?: string
          mekanik?: string
          service_id?: string | null
          service_nomor?: string
          sparepart_id: string
          tanggal?: string
        }
        Update: {
          created_at?: string
          id?: string
          jumlah?: number
          keterangan?: string
          mekanik?: string
          service_id?: string | null
          service_nomor?: string
          sparepart_id?: string
          tanggal?: string
        }
        Relationships: [
          {
            foreignKeyName: "sparepart_usages_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sparepart_usages_sparepart_id_fkey"
            columns: ["sparepart_id"]
            isOneToOne: false
            referencedRelation: "spareparts"
            referencedColumns: ["id"]
          },
        ]
      }
      spareparts: {
        Row: {
          created_at: string
          deskripsi: string
          harga: number
          id: string
          kode: string | null
          nama: string
          satuan: string
          stok: number
          stok_minimum: number
          terpakai: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          deskripsi?: string
          harga?: number
          id?: string
          kode?: string | null
          nama: string
          satuan?: string
          stok?: number
          stok_minimum?: number
          terpakai?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          deskripsi?: string
          harga?: number
          id?: string
          kode?: string | null
          nama?: string
          satuan?: string
          stok?: number
          stok_minimum?: number
          terpakai?: number
          updated_at?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          created_at: string
          id: string
          jenis: string
          jumlah: number
          keterangan: string
          sparepart_id: string
          tanggal: string
        }
        Insert: {
          created_at?: string
          id?: string
          jenis: string
          jumlah?: number
          keterangan?: string
          sparepart_id: string
          tanggal?: string
        }
        Update: {
          created_at?: string
          id?: string
          jenis?: string
          jumlah?: number
          keterangan?: string
          sparepart_id?: string
          tanggal?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_sparepart_id_fkey"
            columns: ["sparepart_id"]
            isOneToOne: false
            referencedRelation: "spareparts"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          balasan: string | null
          created_at: string
          id: string
          kategori: string
          nomor: string
          pengirim: string
          peran: string
          pesan: string
          profile_id: string | null
          status: string
          subjek: string
          tanggal: string
          updated_at: string
        }
        Insert: {
          balasan?: string | null
          created_at?: string
          id?: string
          kategori?: string
          nomor: string
          pengirim?: string
          peran?: string
          pesan?: string
          profile_id?: string | null
          status?: string
          subjek?: string
          tanggal?: string
          updated_at?: string
        }
        Update: {
          balasan?: string | null
          created_at?: string
          id?: string
          kategori?: string
          nomor?: string
          pengirim?: string
          peran?: string
          pesan?: string
          profile_id?: string | null
          status?: string
          subjek?: string
          tanggal?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          kilometer: number
          merk: string
          plat: string
          tahun: number
          tipe: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          kilometer?: number
          merk: string
          plat?: string
          tahun?: number
          tipe: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          kilometer?: number
          merk?: string
          plat?: string
          tahun?: number
          tipe?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      owns_customer: { Args: { _customer_id: string }; Returns: boolean }
      owns_service: { Args: { _service_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "pelanggan" | "owner"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "pelanggan", "owner"],
    },
  },
} as const
