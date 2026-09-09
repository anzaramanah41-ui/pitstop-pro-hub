-- 004_create_booking_servis.sql
create table if not exists public.booking_servis (
  id_booking uuid primary key default gen_random_uuid(),
  nomor_booking text unique not null,
  id_pelanggan uuid not null references public.pelanggan(id_pelanggan) on delete cascade,
  id_kendaraan uuid not null references public.kendaraan(id_kendaraan) on delete restrict,
  tanggal_booking date not null,
  waktu_booking time not null,
  jenis_servis text not null,
  keluhan text not null,
  mekanik_diinginkan text,
  status_booking text not null default 'menunggu_konfirmasi' check (
    status_booking in (
      'menunggu_konfirmasi',
      'disetujui',
      'ditolak',
      'menunggu_servis',
      'sedang_dikerjakan',
      'selesai',
      'menunggu_pembayaran',
      'lunas'
    )
  ),
  alasan_penolakan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rejected_booking_requires_reason check (
    status_booking <> 'ditolak' or nullif(trim(alasan_penolakan), '') is not null
  )
);

create index if not exists idx_booking_pelanggan on public.booking_servis(id_pelanggan);
create index if not exists idx_booking_kendaraan on public.booking_servis(id_kendaraan);
create index if not exists idx_booking_status on public.booking_servis(status_booking);
create index if not exists idx_booking_tanggal on public.booking_servis(tanggal_booking);

