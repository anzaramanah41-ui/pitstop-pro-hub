INSERT INTO public.profiles (id, full_name, email, phone, role)
SELECT 
  id, 
  coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  email,
  raw_user_meta_data->>'phone',
  coalesce(raw_user_meta_data->>'role', 'pelanggan')::public.app_role
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET full_name = excluded.full_name,
    email = excluded.email,
    role = excluded.role;

INSERT INTO public.pelanggan (id_pelanggan, user_id, nama, email, no_hp)
SELECT 
  'pl-' || substr(id::text, 1, 8),
  id,
  coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  email,
  raw_user_meta_data->>'phone'
FROM auth.users
WHERE coalesce(raw_user_meta_data->>'role', 'pelanggan') = 'pelanggan'
ON CONFLICT (id_pelanggan) DO NOTHING;

NOTIFY pgrst, 'reload schema';

