-- Buat tabel retur_sparepart jika belum ada
create table if not exists public.retur_sparepart (
  id_retur_sparepart text primary key,
  id_sparepart text not null references public.sparepart(id_sparepart) on delete cascade,
  id_pembelian_sparepart text,
  jumlah integer not null check (jumlah > 0),
  tanggal date not null default current_date,
  alasan text not null,
  status text not null default 'Diproses' check (status in ('Diproses', 'Disetujui', 'Ditolak')),
  created_at timestamptz not null default now()
);

-- RLS Policy
alter table public.retur_sparepart enable row level security;
drop policy if exists "allow_all" on public.retur_sparepart;
create policy "allow_all" on public.retur_sparepart for all to anon, authenticated using (true) with check (true);

-- Insert 1 contoh data pengembalian nyata awal jika belum ada
insert into public.retur_sparepart (id_retur_sparepart, id_sparepart, jumlah, tanggal, alasan, status)
values ('ret-001', 'sp-004', 2, current_date - interval '3 days', 'Kemasan kampas rem rusak dari supplier', 'Disetujui')
on conflict (id_retur_sparepart) do nothing;

notify pgrst, 'reload schema';

