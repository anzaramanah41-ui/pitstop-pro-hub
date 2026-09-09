-- 001_create_users_profiles.sql
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

do $$ begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'pelanggan', 'owner');
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  role public.app_role not null default 'pelanggan',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

