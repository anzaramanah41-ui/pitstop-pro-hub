-- 20260910_implement_retur_pembelian_supplier.sql
-- Implementasi Sistem Retur Pembelian Sparepart ke Supplier / PT

-- 1. Tabel Supplier
create table if not exists public.supplier (
  id_supplier text primary key,
  id_bengkel text not null default 'bengkel-001',
  nama text not null,
  kontak text,
  telepon text,
  alamat text,
  created_at timestamptz not null default now()
);

-- Index supplier
create index if not exists idx_supplier_bengkel on public.supplier(id_bengkel);
create index if not exists idx_supplier_nama on public.supplier(nama);

-- Seed Supplier Default
insert into public.supplier (id_supplier, id_bengkel, nama, kontak, telepon, alamat)
values
  ('sup-001', 'bengkel-001', 'PT Astra Otoparts', 'Budi Santoso', '08123456789', 'Kawasan Industri Pulogadung, Jakarta'),
  ('sup-002', 'bengkel-001', 'Yamaha Motor Parts', 'Hendra Wijaya', '08129876543', 'Pulo Gadung, Jakarta Timur'),
  ('sup-003', 'bengkel-001', 'Nissin Brake Official', 'Joko Susanto', '08134567890', 'Cikarang Barat, Bekasi'),
  ('sup-004', 'bengkel-001', 'PT Maju Jaya', 'Rudi Hartono', '08122334455', 'Jl. Soekarno Hatta No. 88, Bandung'),
  ('sup-005', 'bengkel-001', 'PT Federal Karyatama', 'Agus Prayitno', '08155667788', 'Cilegon, Banten')
on conflict (id_supplier) do update
set nama = excluded.nama,
    kontak = excluded.kontak,
    telepon = excluded.telepon,
    alamat = excluded.alamat;

-- 2. Tambah kolom id_supplier pada pembelian_sparepart jika belum ada
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'pembelian_sparepart' and column_name = 'id_supplier') then
    alter table public.pembelian_sparepart add column id_supplier text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'pembelian_sparepart' and column_name = 'id_bengkel') then
    alter table public.pembelian_sparepart add column id_bengkel text not null default 'bengkel-001';
  end if;
end $$;

-- Hubungkan id_supplier pada pembelian_sparepart yang sudah ada berdasarkan nama supplier
update public.pembelian_sparepart p
set id_supplier = s.id_supplier
from public.supplier s
where lower(trim(p.supplier)) = lower(trim(s.nama))
  and p.id_supplier is null;

-- 3. Update / Perluas Tabel retur_sparepart
create table if not exists public.retur_sparepart (
  id_retur_sparepart text primary key,
  id_sparepart text not null references public.sparepart(id_sparepart) on delete restrict,
  id_pembelian_sparepart text,
  jumlah integer not null check (jumlah > 0),
  tanggal date not null default current_date,
  alasan text not null,
  status text not null default 'Diajukan',
  created_at timestamptz not null default now()
);

-- Tambah kolom-kolom relasional & audit ke retur_sparepart
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'retur_sparepart' and column_name = 'nomor_retur') then
    alter table public.retur_sparepart add column nomor_retur text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'retur_sparepart' and column_name = 'id_bengkel') then
    alter table public.retur_sparepart add column id_bengkel text not null default 'bengkel-001';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'retur_sparepart' and column_name = 'id_supplier') then
    alter table public.retur_sparepart add column id_supplier text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'retur_sparepart' and column_name = 'supplier') then
    alter table public.retur_sparepart add column supplier text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'retur_sparepart' and column_name = 'nomor_pembelian') then
    alter table public.retur_sparepart add column nomor_pembelian text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'retur_sparepart' and column_name = 'harga_satuan') then
    alter table public.retur_sparepart add column harga_satuan numeric(14,2) not null default 0;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'retur_sparepart' and column_name = 'total_nilai') then
    alter table public.retur_sparepart add column total_nilai numeric(14,2) not null default 0;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'retur_sparepart' and column_name = 'alasan_detail') then
    alter table public.retur_sparepart add column alasan_detail text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'retur_sparepart' and column_name = 'alasan_penolakan') then
    alter table public.retur_sparepart add column alasan_penolakan text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'retur_sparepart' and column_name = 'keterangan') then
    alter table public.retur_sparepart add column keterangan text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'retur_sparepart' and column_name = 'stok_dikurangi') then
    alter table public.retur_sparepart add column stok_dikurangi boolean not null default false;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'retur_sparepart' and column_name = 'riwayat_stok_id') then
    alter table public.retur_sparepart add column riwayat_stok_id text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'retur_sparepart' and column_name = 'updated_at') then
    alter table public.retur_sparepart add column updated_at timestamptz not null default now();
  end if;
end $$;

-- Drop check constraint status lama jika ada dan buat yang baru
alter table public.retur_sparepart drop constraint if exists retur_sparepart_status_check;
alter table public.retur_sparepart add constraint retur_sparepart_status_check
check (status in ('Diajukan', 'Diproses', 'Disetujui', 'Ditolak', 'Barang Dikirim', 'Selesai', 'diproses', 'disetujui', 'ditolak'));

-- Update data retur yang sudah ada agar memiliki nomor_retur default jika null
update public.retur_sparepart
set nomor_retur = 'RET-2026-001',
    nomor_pembelian = 'BL-2026-003',
    supplier = 'Nissin Brake Official',
    id_supplier = 'sup-003',
    harga_satuan = 55000,
    total_nilai = 110000,
    stok_dikurangi = true
where id_retur_sparepart = 'ret-001' and (nomor_retur is null or nomor_retur = '');

-- Buat unique constraint nomor_retur jika belum ada
create unique index if not exists idx_retur_nomor_unique on public.retur_sparepart(nomor_retur) where nomor_retur is not null;
create index if not exists idx_retur_pembelian on public.retur_sparepart(id_pembelian_sparepart);
create index if not exists idx_retur_bengkel on public.retur_sparepart(id_bengkel);
create index if not exists idx_retur_supplier on public.retur_sparepart(id_supplier);

-- RLS Policies
alter table public.supplier enable row level security;
drop policy if exists "allow_all_supplier" on public.supplier;
create policy "allow_all_supplier" on public.supplier for all to anon, authenticated using (true) with check (true);

alter table public.retur_sparepart enable row level security;
drop policy if exists "allow_all_retur" on public.retur_sparepart;
create policy "allow_all_retur" on public.retur_sparepart for all to anon, authenticated using (true) with check (true);

notify pgrst, 'reload schema';

