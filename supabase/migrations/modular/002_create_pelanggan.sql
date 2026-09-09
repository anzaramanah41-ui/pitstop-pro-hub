-- 002_create_pelanggan.sql
create table if not exists public.pelanggan (
  id_pelanggan uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  nama text not null,
  no_hp text,
  email text not null unique,
  password text,
  alamat text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pelanggan_email on public.pelanggan(email);
create index if not exists idx_pelanggan_user_id on public.pelanggan(user_id);

