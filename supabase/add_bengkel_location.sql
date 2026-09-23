-- AppBenk — Tambah kolom lokasi ke tabel workshops
-- Jalankan script ini di Supabase SQL Editor

ALTER TABLE workshops
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 7),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(10, 7),
ADD COLUMN IF NOT EXISTS maps_url TEXT,
ADD COLUMN IF NOT EXISTS jam_operasional TEXT DEFAULT 'Senin–Sabtu: 08.00–17.00 WIB',
ADD COLUMN IF NOT EXISTS wa_config JSONB DEFAULT '{}'::jsonb;

-- Update data demo dengan koordinat Yogyakarta
UPDATE workshops
SET 
  latitude = -7.7516,
  longitude = 110.3761,
  maps_url = 'https://maps.google.com/?q=-7.7516,110.3761',
  jam_operasional = 'Senin–Sabtu: 08.00–17.00 WIB'
WHERE latitude IS NULL;

-- Comment: wa_config menyimpan konfigurasi WhatsApp Gateway per bengkel
-- Format: {"provider": "wablas", "token": "...", "enabled": true}
