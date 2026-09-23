-- ============================================================================
-- MIGRATION: 20260921_manual_payment_system.sql
-- IMPLEMENTASI SISTEM PEMBAYARAN MANUAL APPBENK — QRIS, TRANSFER, DAN CASH
-- ============================================================================

-- 1. Pastikan kolom audit dan multi-tenant tersedia pada tabel public.pembayaran
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'pembayaran' and column_name = 'verified_by'
  ) then
    alter table public.pembayaran add column verified_by uuid references auth.users(id) on delete set null;
  end if;

  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'pembayaran' and column_name = 'verified_at'
  ) then
    alter table public.pembayaran add column verified_at timestamptz;
  end if;

  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'pembayaran' and column_name = 'id_bengkel'
  ) then
    alter table public.pembayaran add column id_bengkel text;
  end if;

  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'pembayaran' and column_name = 'workshop_id'
  ) then
    alter table public.pembayaran add column workshop_id text;
  end if;

  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'pembayaran' and column_name = 'alasan_penolakan'
  ) then
    alter table public.pembayaran add column alasan_penolakan text;
  end if;
end $$;

create index if not exists idx_pembayaran_workshop on public.pembayaran(coalesce(workshop_id, id_bengkel));
create index if not exists idx_pembayaran_status_verif on public.pembayaran(status_pembayaran);

-- 2. Pastikan tabel public.workshop_payment_accounts tersedia
create table if not exists public.workshop_payment_accounts (
  id uuid primary key default gen_random_uuid(),
  workshop_id text not null,
  id_bengkel text,
  account_type text not null default 'bank_transfer',
  provider text not null default 'MANUAL',
  provider_account_id text default 'manual',
  bank_name text,
  account_number text,
  account_holder_name text,
  qr_image_url text,
  display_name text,
  is_active boolean not null default true,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tambahkan kolom jika tabel sudah ada dari migrasi sebelumnya tapi belum lengkap
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'workshop_payment_accounts' and column_name = 'account_type'
  ) then
    alter table public.workshop_payment_accounts add column account_type text not null default 'bank_transfer';
  end if;

  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'workshop_payment_accounts' and column_name = 'id_bengkel'
  ) then
    alter table public.workshop_payment_accounts add column id_bengkel text;
  end if;

  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'workshop_payment_accounts' and column_name = 'bank_name'
  ) then
    alter table public.workshop_payment_accounts add column bank_name text;
  end if;

  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'workshop_payment_accounts' and column_name = 'account_number'
  ) then
    alter table public.workshop_payment_accounts add column account_number text;
  end if;

  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'workshop_payment_accounts' and column_name = 'account_holder_name'
  ) then
    alter table public.workshop_payment_accounts add column account_holder_name text;
  end if;

  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'workshop_payment_accounts' and column_name = 'qr_image_url'
  ) then
    alter table public.workshop_payment_accounts add column qr_image_url text;
  end if;

  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'workshop_payment_accounts' and column_name = 'display_name'
  ) then
    alter table public.workshop_payment_accounts add column display_name text;
  end if;
end $$;

create index if not exists idx_payment_accounts_ws on public.workshop_payment_accounts(coalesce(workshop_id, id_bengkel));

-- 3. Pastikan tabel public.notification_logs tersedia
create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  workshop_id text,
  id_bengkel text,
  user_id uuid references auth.users(id) on delete set null,
  channel text not null default 'in_app',
  type text not null default 'pembayaran',
  recipient text not null default 'admin',
  subject text,
  message text not null,
  status text not null default 'sent',
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'notification_logs' and column_name = 'id_bengkel'
  ) then
    alter table public.notification_logs add column id_bengkel text;
  end if;

  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'notification_logs' and column_name = 'subject'
  ) then
    alter table public.notification_logs add column subject text;
  end if;
end $$;

create index if not exists idx_notif_logs_ws on public.notification_logs(coalesce(workshop_id, id_bengkel));
create index if not exists idx_notif_logs_user on public.notification_logs(user_id);

-- 4. Enable RLS
alter table public.pembayaran enable row level security;
alter table public.workshop_payment_accounts enable row level security;
alter table public.notification_logs enable row level security;

-- 5. RLS Policies
-- A. workshop_payment_accounts
drop policy if exists "payment_accounts_staff_all" on public.workshop_payment_accounts;
create policy "payment_accounts_staff_all" on public.workshop_payment_accounts
  for all to authenticated
  using (
    exists (
      select 1 from public.admin a where a.user_id = auth.uid() and (a.id_bengkel = workshop_payment_accounts.workshop_id or a.id_bengkel = workshop_payment_accounts.id_bengkel)
      union
      select 1 from public.owner o where o.user_id = auth.uid() and (o.id_bengkel = workshop_payment_accounts.workshop_id or o.id_bengkel = workshop_payment_accounts.id_bengkel)
      union
      select 1 from public.workshop_members m where m.user_id = auth.uid() and m.workshop_id = workshop_payment_accounts.workshop_id
    )
  )
  with check (
    exists (
      select 1 from public.admin a where a.user_id = auth.uid() and (a.id_bengkel = workshop_payment_accounts.workshop_id or a.id_bengkel = workshop_payment_accounts.id_bengkel)
      union
      select 1 from public.owner o where o.user_id = auth.uid() and (o.id_bengkel = workshop_payment_accounts.workshop_id or o.id_bengkel = workshop_payment_accounts.id_bengkel)
      union
      select 1 from public.workshop_members m where m.user_id = auth.uid() and m.workshop_id = workshop_payment_accounts.workshop_id
    )
  );

drop policy if exists "payment_accounts_public_read" on public.workshop_payment_accounts;
create policy "payment_accounts_public_read" on public.workshop_payment_accounts
  for select to authenticated
  using (is_active = true);

-- B. notification_logs
drop policy if exists "notif_logs_user_read" on public.notification_logs;
create policy "notif_logs_user_read" on public.notification_logs
  for select to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.admin a where a.user_id = auth.uid() and (a.id_bengkel = notification_logs.workshop_id or a.id_bengkel = notification_logs.id_bengkel)
      union
      select 1 from public.owner o where o.user_id = auth.uid() and (o.id_bengkel = notification_logs.workshop_id or o.id_bengkel = notification_logs.id_bengkel)
    )
  );

drop policy if exists "notif_logs_insert" on public.notification_logs;
create policy "notif_logs_insert" on public.notification_logs
  for insert to authenticated
  with check (true);

-- C. Supabase Storage Bucket: payment-assets
insert into storage.buckets (id, name, public)
values ('payment-assets', 'payment-assets', true)
on conflict (id) do update set public = true;

drop policy if exists "payment_assets_public_read" on storage.objects;
create policy "payment_assets_public_read" on storage.objects
  for select using (bucket_id = 'payment-assets');

drop policy if exists "payment_assets_auth_insert" on storage.objects;
create policy "payment_assets_auth_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'payment-assets');

drop policy if exists "payment_assets_auth_update" on storage.objects;
create policy "payment_assets_auth_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'payment-assets');
