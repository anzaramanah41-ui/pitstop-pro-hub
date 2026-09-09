-- 008_create_pembayaran.sql
create table if not exists public.pembayaran (
  id_pembayaran uuid primary key default gen_random_uuid(),
  nomor_transaksi text unique not null,
  id_servis uuid unique not null references public.servis(id_servis) on delete cascade,
  id_pelanggan uuid not null references public.pelanggan(id_pelanggan) on delete restrict,
  metode_pembayaran text not null check (metode_pembayaran in ('cash', 'transfer', 'qris')),
  tanggal_bayar timestamptz,
  jumlah_bayar numeric(14,2) not null default 0 check (jumlah_bayar >= 0),
  status_pembayaran text not null default 'belum_dibayar' check (
    status_pembayaran in ('belum_dibayar', 'menunggu_verifikasi', 'lunas', 'ditolak')
  ),
  bukti_pembayaran text,
  alasan_penolakan text,
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transfer_requires_proof check (
    metode_pembayaran <> 'transfer' or status_pembayaran = 'belum_dibayar' or bukti_pembayaran is not null
  )
);

create index if not exists idx_pembayaran_servis on public.pembayaran(id_servis);
create index if not exists idx_pembayaran_pelanggan on public.pembayaran(id_pelanggan);
create index if not exists idx_pembayaran_status on public.pembayaran(status_pembayaran);

