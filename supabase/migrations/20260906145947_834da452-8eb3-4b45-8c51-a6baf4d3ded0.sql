ALTER TABLE public.spareparts ADD COLUMN IF NOT EXISTS kode text;

WITH urut AS (
  SELECT id, row_number() OVER (ORDER BY created_at, nama) AS n
  FROM public.spareparts
)
UPDATE public.spareparts s
SET kode = 'SP-' || lpad(urut.n::text, 3, '0')
FROM urut
WHERE urut.id = s.id;

CREATE UNIQUE INDEX IF NOT EXISTS spareparts_kode_key ON public.spareparts (kode);

CREATE OR REPLACE FUNCTION public.set_sparepart_kode()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE next_n integer;
BEGIN
  IF NEW.kode IS NULL OR NEW.kode = '' THEN
    SELECT COALESCE(MAX(NULLIF(regexp_replace(kode, '\D', '', 'g'), '')::int), 0) + 1
      INTO next_n FROM public.spareparts;
    NEW.kode := 'SP-' || lpad(next_n::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_spareparts_kode ON public.spareparts;
CREATE TRIGGER trg_spareparts_kode BEFORE INSERT ON public.spareparts
FOR EACH ROW EXECUTE FUNCTION public.set_sparepart_kode();

ALTER TABLE public.service_orders ADD COLUMN IF NOT EXISTS estimasi_selesai timestamp with time zone;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS alasan_tolak text;