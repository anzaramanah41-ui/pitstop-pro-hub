-- AppBenk database + RBAC. Run in the target Supabase project once.
-- Admin/owner accounts are provisioned internally by updating profiles.role,
-- never through the public registration form.

create type public.app_role as enum ('admin', 'pelanggan', 'owner');
create type public.booking_status as enum ('menunggu_konfirmasi', 'disetujui', 'ditolak');
create type public.service_status as enum ('menunggu', 'diproses', 'selesai', 'menunggu_pembayaran', 'lunas');
create type public.payment_status as enum ('belum_dibayar', 'menunggu_verifikasi', 'lunas', 'bukti_ditolak');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  role public.app_role not null default 'pelanggan',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, phone, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.email,
          new.raw_user_meta_data->>'phone', 'pelanggan');
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create table public.vehicles (
  id uuid primary key default gen_random_uuid(), customer_id uuid not null references public.profiles(id) on delete cascade,
  name text not null, plate_number text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.bookings (
  id uuid primary key default gen_random_uuid(), customer_id uuid not null references public.profiles(id), vehicle_id uuid references public.vehicles(id),
  service_type text not null, booking_date date not null, booking_time time not null, complaint text not null, notes text,
  status public.booking_status not null default 'menunggu_konfirmasi', rejection_reason text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint rejected_booking_has_reason check (status <> 'ditolak' or nullif(trim(rejection_reason), '') is not null)
);
create table public.services (
  id uuid primary key default gen_random_uuid(), booking_id uuid unique references public.bookings(id), customer_id uuid not null references public.profiles(id), vehicle_id uuid references public.vehicles(id),
  status public.service_status not null default 'menunggu', complaint text not null, action_taken text, labor_cost numeric(14,2) not null default 0, sparepart_cost numeric(14,2) not null default 0,
  service_date date, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.service_estimates (
  id uuid primary key default gen_random_uuid(), service_id uuid references public.services(id), booking_id uuid references public.bookings(id),
  labor_cost numeric(14,2) not null default 0, sparepart_cost numeric(14,2) not null default 0, total_cost numeric(14,2) generated always as (labor_cost + sparepart_cost) stored,
  status text not null default 'menunggu', notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint estimate_target check (service_id is not null or booking_id is not null)
);
create table public.payments (
  id uuid primary key default gen_random_uuid(), customer_id uuid not null references public.profiles(id), service_id uuid references public.services(id), booking_id uuid references public.bookings(id),
  amount numeric(14,2) not null check (amount >= 0), payment_method text not null, status public.payment_status not null default 'belum_dibayar', proof_url text, paid_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.spareparts (
  id uuid primary key default gen_random_uuid(), nama_sparepart text not null, harga numeric(14,2) not null check (harga >= 0), stok integer not null default 0 check (stok >= 0), satuan text not null, deskripsi text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.stock_movements (
  id uuid primary key default gen_random_uuid(), sparepart_id uuid not null references public.spareparts(id), transaction_type text not null check (transaction_type in ('masuk', 'keluar')),
  quantity integer not null check (quantity > 0), stock_before integer not null, stock_after integer not null, notes text, changed_by uuid references public.profiles(id), created_at timestamptz not null default now()
);

create or replace function public.has_role(required public.app_role[])
returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = any(required)); $$;

alter table public.profiles enable row level security; alter table public.vehicles enable row level security; alter table public.bookings enable row level security; alter table public.services enable row level security; alter table public.service_estimates enable row level security; alter table public.payments enable row level security; alter table public.spareparts enable row level security; alter table public.stock_movements enable row level security;
create policy "profile own read" on public.profiles for select using (id = auth.uid());
create policy "profile operational read" on public.profiles for select using (public.has_role(array['admin','owner']::public.app_role[]));
create policy "vehicles own" on public.vehicles for all using (customer_id = auth.uid()) with check (customer_id = auth.uid());
create policy "bookings customer read" on public.bookings for select using (customer_id = auth.uid());
create policy "bookings customer create" on public.bookings for insert with check (customer_id = auth.uid());
create policy "bookings operational" on public.bookings for all using (public.has_role(array['admin','owner']::public.app_role[])) with check (public.has_role(array['admin','owner']::public.app_role[]));
create policy "services customer read" on public.services for select using (customer_id = auth.uid());
create policy "services operational" on public.services for all using (public.has_role(array['admin','owner']::public.app_role[])) with check (public.has_role(array['admin','owner']::public.app_role[]));
create policy "estimates customer read" on public.service_estimates for select using (exists (select 1 from public.services s where s.id = service_id and s.customer_id = auth.uid()) or exists (select 1 from public.bookings b where b.id = booking_id and b.customer_id = auth.uid()));
create policy "estimates operational" on public.service_estimates for all using (public.has_role(array['admin','owner']::public.app_role[])) with check (public.has_role(array['admin','owner']::public.app_role[]));
create policy "payments customer own" on public.payments for all using (customer_id = auth.uid()) with check (customer_id = auth.uid());
create policy "payments operational" on public.payments for all using (public.has_role(array['admin','owner']::public.app_role[])) with check (public.has_role(array['admin','owner']::public.app_role[]));
create policy "spareparts operational" on public.spareparts for all using (public.has_role(array['admin','owner']::public.app_role[])) with check (public.has_role(array['admin','owner']::public.app_role[]));
create policy "stock operational" on public.stock_movements for all using (public.has_role(array['admin','owner']::public.app_role[])) with check (public.has_role(array['admin','owner']::public.app_role[]));
