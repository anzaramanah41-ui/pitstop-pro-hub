-- 005_create_servis.sql
create table if not exists public.servis (
  id_servis uuid primary key default gen_random_uuid(),
  nomor_servis text unique not null,
  id_booking uuid unique references public.booking_servis(id_booking) on delete set null,
  id_pelanggan uuid not null references public.pelanggan(id_pelanggan) on delete restrict,
  id_kendaraan uuid not null references public.kendaraan(id_kendaraan) on delete restrict,
  mekanik text,
  jenis_servis text,
  keluhan text,
  hasil_pemeriksaan text,
  estimasi_biaya numeric(14,2) not null default 0 check (estimasi_biaya >= 0),
  estimasi_waktu text,
  biaya_jasa numeric(14,2) not null default 0 check (biaya_jasa >= 0),
  biaya_sparepart numeric(14,2) not null default 0 check (biaya_sparepart >= 0),
  total_biaya numeric(14,2) not null default 0 check (total_biaya >= 0),
  status_servis text not null default 'menunggu' check (
    status_servis in ('menunggu', 'diproses', 'selesai', 'menunggu_pembayaran', 'lunas')
  ),
  tanggal_mulai timestamptz,
  estimasi_selesai timestamptz,
  tanggal_selesai timestamptz,
  catatan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_servis_booking on public.servis(id_booking);
create index if not exists idx_servis_pelanggan on public.servis(id_pelanggan);
create index if not exists idx_servis_status on public.servis(status_servis);
create index if not exists idx_servis_estimasi on public.servis(estimasi_selesai);

