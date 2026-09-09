-- 015_create_admin_owner.sql
create table if not exists public.admin (
  id_admin uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  nama text not null,
  email text not null unique,
  no_hp text,
  status text not null default 'aktif' check (status in ('aktif', 'nonaktif')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.owner (
  id_owner uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  nama text not null,
  email text not null unique,
  no_hp text,
  status text not null default 'aktif' check (status in ('aktif', 'nonaktif')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_admin_user_id on public.admin(user_id);
create index if not exists idx_owner_user_id on public.owner(user_id);

