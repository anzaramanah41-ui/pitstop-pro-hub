-- 1. Konfirmasi semua user yang sudah terdaftar tapi belum dikonfirmasi
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;

-- 2. Buat fungsi auto confirm
CREATE OR REPLACE FUNCTION public.auto_confirm_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  NEW.email_confirmed_at := coalesce(NEW.email_confirmed_at, now());
  RETURN NEW;
END;
$$;

-- 3. Pasang trigger BEFORE INSERT di auth.users
DROP TRIGGER IF EXISTS trg_auto_confirm_user ON auth.users;
CREATE TRIGGER trg_auto_confirm_user
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.auto_confirm_new_user();

-- 4. Juga pasang trigger auto-create profile & pelanggan saat user baru daftar
CREATE OR REPLACE FUNCTION public.handle_new_registered_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_full_name text;
  v_phone text;
  v_role text;
BEGIN
  v_full_name := coalesce(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  v_phone := NEW.raw_user_meta_data->>'phone';
  v_role := coalesce(NEW.raw_user_meta_data->>'role', 'pelanggan');

  -- Upsert ke profiles
  INSERT INTO public.profiles (id, full_name, email, phone, role)
  VALUES (NEW.id, v_full_name, NEW.email, v_phone, v_role)
  ON CONFLICT (id) DO UPDATE
  SET full_name = excluded.full_name,
      phone = excluded.phone,
      role = excluded.role;

  -- Jika pelanggan, masukkan ke tabel pelanggan
  IF v_role = 'pelanggan' THEN
    INSERT INTO public.pelanggan (id_pelanggan, user_id, nama, email, no_hp)
    VALUES ('pl-' || substr(NEW.id::text, 1, 8), NEW.id, v_full_name, NEW.email, v_phone)
    ON CONFLICT (id_pelanggan) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_handle_new_registered_user ON auth.users;
CREATE TRIGGER trg_handle_new_registered_user
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_registered_user();

NOTIFY pgrst, 'reload schema';

