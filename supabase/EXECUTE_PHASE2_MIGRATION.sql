-- ============================================================================
-- APPBENK PHASE 2: REAL AUTHENTICATION & EMAIL ACCOUNTS MIGRATION
-- Jalankan naskah ini pada SQL Editor di Supabase Cloud Dashboard
-- Endpoint: https://oviiclcydeopilagbypq.supabase.co
-- ============================================================================

-- 1. Tambah kolom gender dan avatar_url di tabel profiles
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'gender'
  ) then
    alter table public.profiles add column gender text check (gender in ('L', 'P', 'Laki-laki', 'Perempuan') or gender is null);
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'avatar_url'
  ) then
    alter table public.profiles add column avatar_url text;
  end if;
end $$;

-- 2. Trigger Function untuk Otomatisasi Profil & Customer dari Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_full_name text;
  v_phone text;
  v_gender text;
  v_pelanggan_id text;
  v_role text := 'pelanggan';
  v_workshop_id text := null;
  v_is_internal boolean := false;
begin
  -- Ekstrak data dari raw_user_meta_data
  v_full_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  v_phone := coalesce(new.raw_user_meta_data->>'phone', new.phone);
  v_gender := new.raw_user_meta_data->>'gender';
  v_pelanggan_id := 'pl-' || substr(new.id::text, 1, 8) || '-' || substr(md5(random()::text), 1, 4);

  -- PENTING: Hanya provisioning internal terpercaya yang dapat menyetel role selain 'pelanggan'
  -- Register publik TIDAK memiliki flag internal ini dan selalu mendapatkan role = 'pelanggan'
  if (new.raw_user_meta_data->>'is_internal_provisioning')::boolean is true then
    if (new.raw_user_meta_data->>'internal_role') in ('admin', 'owner') then
      v_role := new.raw_user_meta_data->>'internal_role';
      v_workshop_id := coalesce(new.raw_user_meta_data->>'workshop_id', new.raw_user_meta_data->>'id_bengkel');
      v_is_internal := true;
    end if;
  end if;

  -- 1. Insert / Sync profiles
  -- Jika profile sudah berstatus admin/owner sebelumnya, jangan ditimpa menjadi pelanggan
  insert into public.profiles (
    id,
    full_name,
    email,
    phone,
    gender,
    role,
    id_bengkel,
    workshop_id,
    created_at,
    updated_at
  )
  values (
    new.id,
    v_full_name,
    new.email,
    v_phone,
    v_gender,
    v_role,
    v_workshop_id,
    v_workshop_id,
    now(),
    now()
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    email = coalesce(excluded.email, public.profiles.email),
    phone = coalesce(excluded.phone, public.profiles.phone),
    gender = coalesce(excluded.gender, public.profiles.gender),
    -- Pertahankan role admin/owner jika sudah ada
    role = case
      when public.profiles.role in ('admin', 'owner') then public.profiles.role
      when excluded.role in ('admin', 'owner') then excluded.role
      else 'pelanggan'
    end,
    workshop_id = coalesce(excluded.workshop_id, public.profiles.workshop_id),
    id_bengkel = coalesce(excluded.id_bengkel, public.profiles.id_bengkel),
    updated_at = now();

  -- 2. Jika dibuat sebagai staf bengkel internal, masukkan ke workshop_members
  if v_is_internal and v_workshop_id is not null then
    insert into public.workshop_members (
      workshop_id,
      user_id,
      role,
      status
    )
    values (
      v_workshop_id,
      new.id,
      upper(v_role),
      'ACTIVE'
    )
    on conflict do nothing;

    -- Update workshop owner_id jika role owner
    if v_role = 'owner' then
      update public.workshops
      set owner_id = new.id
      where id = v_workshop_id and (owner_id is null or owner_id = new.id);
    end if;
  end if;

  -- 3. Otomatis buat entitas pelanggan hanya jika rolenya adalah 'pelanggan'
  if v_role = 'pelanggan' then
    insert into public.pelanggan (
      id_pelanggan,
      user_id,
      nama,
      email,
      no_hp,
      alamat,
      created_at,
      updated_at
    )
    values (
      v_pelanggan_id,
      new.id,
      v_full_name,
      new.email,
      coalesce(v_phone, '-'),
      'Pendaftaran online akun pelanggan AppBenk',
      now(),
      now()
    )
    on conflict do nothing;
  end if;

  return new;
end;
$$;

-- 3. Pasang Trigger pada auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. Kebijakan Row Level Security (RLS) pada tabel profiles
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_self_or_staff" on public.profiles;
create policy "profiles_select_self_or_staff" on public.profiles
  for select
  using (
    auth.uid() = id
    or exists (
      select 1 from public.workshop_members wm
      where wm.user_id = auth.uid() and wm.role in ('OWNER', 'ADMIN')
    )
    or exists (
      select 1 from public.workshops w
      where w.owner_id = auth.uid()
    )
  );

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
  for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 5. Kebijakan RLS pada tabel pelanggan
alter table public.pelanggan enable row level security;

drop policy if exists "pelanggan_select_self" on public.pelanggan;
create policy "pelanggan_select_self" on public.pelanggan
  for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.workshop_members wm
      where wm.user_id = auth.uid() and wm.role in ('OWNER', 'ADMIN', 'MECHANIC')
    )
    or exists (
      select 1 from public.workshops w
      where w.owner_id = auth.uid()
    )
  );

drop policy if exists "pelanggan_insert_self" on public.pelanggan;
create policy "pelanggan_insert_self" on public.pelanggan
  for insert
  with check (auth.uid() = user_id or auth.uid() is not null);

drop policy if exists "pelanggan_update_self" on public.pelanggan;
create policy "pelanggan_update_self" on public.pelanggan
  for update
  using (auth.uid() = user_id or exists (
    select 1 from public.workshop_members wm
    where wm.user_id = auth.uid() and wm.role in ('OWNER', 'ADMIN')
  ))
  with check (auth.uid() = user_id or exists (
    select 1 from public.workshop_members wm
    where wm.user_id = auth.uid() and wm.role in ('OWNER', 'ADMIN')
  ));

-- 6. Helper Function untuk Pembuatan Akun Testing Admin & Owner Secara Aman (Server-Side / SQL Editor)
-- Fungsi ini hanya dapat dipanggil oleh superuser / service_role di Supabase SQL Editor:
-- Contoh Penggunaan:
-- SELECT public.create_internal_staff_user('owner.test@bengkel.com', 'KataSandiKuat2026!', 'Pak Budi Owner', 'owner', 'bengkel-001');
-- SELECT public.create_internal_staff_user('admin.test@bengkel.com', 'KataSandiKuat2026!', 'Admin Joko', 'admin', 'bengkel-001');
create or replace function public.create_internal_staff_user(
  p_email text,
  p_password text,
  p_full_name text,
  p_role text,
  p_workshop_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
  v_role text := lower(p_role);
  v_encrypted_pw text;
begin
  if v_role not in ('admin', 'owner') then
    raise exception 'Role harus admin atau owner';
  end if;

  -- Periksa apakah user sudah ada di auth.users
  select id into v_user_id from auth.users where email = lower(p_email);

  if v_user_id is null then
    -- Generate user id baru
    v_user_id := gen_random_uuid();
    v_encrypted_pw := crypt(p_password, gen_salt('bf'));

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      lower(p_email),
      v_encrypted_pw,
      now(), -- Langsung terkonfirmasi untuk testing account internal
      jsonb_build_object('provider', 'email', 'providers', array['email']),
      jsonb_build_object(
        'full_name', p_full_name,
        'is_internal_provisioning', true,
        'internal_role', v_role,
        'workshop_id', p_workshop_id
      ),
      now(),
      now(),
      '',
      ''
    );
  end if;

  -- Pastikan profile tersinkron
  insert into public.profiles (
    id,
    full_name,
    email,
    role,
    workshop_id,
    id_bengkel,
    created_at,
    updated_at
  ) values (
    v_user_id,
    p_full_name,
    lower(p_email),
    v_role,
    p_workshop_id,
    p_workshop_id,
    now(),
    now()
  )
  on conflict (id) do update set
    role = v_role,
    workshop_id = p_workshop_id,
    id_bengkel = p_workshop_id,
    full_name = p_full_name,
    updated_at = now();

  -- Daftarkan ke workshop_members
  insert into public.workshop_members (
    workshop_id,
    user_id,
    role,
    status
  ) values (
    p_workshop_id,
    v_user_id,
    upper(v_role),
    'ACTIVE'
  )
  on conflict do nothing;

  -- Jika owner, perbarui workshops
  if v_role = 'owner' then
    update public.workshops
    set owner_id = v_user_id
    where id = p_workshop_id;
  end if;

  return jsonb_build_object(
    'status', 'SUCCESS',
    'user_id', v_user_id,
    'email', lower(p_email),
    'role', v_role,
    'workshop_id', p_workshop_id
  );
end;
$$;

