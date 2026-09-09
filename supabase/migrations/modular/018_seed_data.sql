-- 018_seed_data.sql
-- Development seed data for testing

-- Pelanggan
insert into public.pelanggan (id_pelanggan, nama, email, no_hp, alamat)
values
  ('11111111-1111-1111-1111-111111111111', 'Budi Santoso', 'budi@mail.test', '0812-3344-5566', 'Jl. Merdeka No. 12, Bandung'),
  ('22222222-2222-2222-2222-222222222222', 'Siti Rahmawati', 'siti@mail.test', '0857-1122-9090', 'Jl. Cihampelas No. 7, Bandung'),
  ('33333333-3333-3333-3333-333333333333', 'Agus Prasetyo', 'agus@mail.test', '0813-7788-4455', 'Jl. Sudirman No. 88, Cimahi')
on conflict (email) do nothing;

-- Kendaraan
insert into public.kendaraan (id_kendaraan, id_pelanggan, merk, tipe, tahun, nopol)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Honda', 'Beat', 2019, 'D 1234 ABC'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Honda', 'Vario 160', 2023, 'B 1234 XYZ'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Yamaha', 'NMAX', 2021, 'D 5521 KJ'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 'Toyota', 'Avanza', 2017, 'D 9087 PL')
on conflict do nothing;

-- Sparepart & Stok
insert into public.sparepart (id_sparepart, nama_sparepart, kategori, satuan, harga, stok_tersedia, stok_minimum, status_stok)
values
  ('SP-001', 'Oli Mesin AHM MPX 0.8L', 'Oli', 'Botol', 48000, 34, 10, 'tersedia'),
  ('SP-002', 'Busi NGK CPR9EA', 'Mesin', 'Pcs', 27000, 18, 8, 'tersedia'),
  ('SP-003', 'Kampas Rem Depan NMAX', 'Rem', 'Set', 95000, 6, 6, 'menipis'),
  ('SP-004', 'Filter Udara Beat', 'Mesin', 'Pcs', 62000, 0, 5, 'habis'),
  ('SP-005', 'Aki GS Astra NS40', 'Kelistrikan', 'Unit', 610000, 4, 3, 'tersedia'),
  ('SP-006', 'Ban Luar IRC 80/90-14', 'Ban', 'Pcs', 215000, 11, 4, 'tersedia')
on conflict (id_sparepart) do nothing;

-- Booking Servis
insert into public.booking_servis (
  id_booking, nomor_booking, id_pelanggan, id_kendaraan, tanggal_booking, waktu_booking, jenis_servis, keluhan, mekanik_diinginkan, status_booking
) values (
  'e1111111-1111-1111-1111-111111111111',
  'BK-2026-0032',
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  current_date + interval '1 day',
  '09:00',
  'Servis Ringan',
  'Mesin bergetar saat tarikan awal dan ganti oli rutin',
  'Joko',
  'menunggu_konfirmasi'
), (
  'e2222222-2222-2222-2222-222222222222',
  'BK-2026-0031',
  '22222222-2222-2222-2222-222222222222',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  current_date,
  '10:30',
  'Perbaikan Rem',
  'Rem depan kurang pakem dan berdecit',
  'Dedi',
  'disetujui'
) on conflict (nomor_booking) do nothing;

-- Servis
insert into public.servis (
  id_servis, nomor_servis, id_booking, id_pelanggan, id_kendaraan, mekanik, jenis_servis, keluhan, hasil_pemeriksaan, estimasi_biaya, estimasi_waktu, biaya_jasa, biaya_sparepart, total_biaya, status_servis, tanggal_mulai, estimasi_selesai
) values (
  'f1111111-1111-1111-1111-111111111111',
  'SRV-2026-0147',
  'e2222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Dedi',
  'Perbaikan Rem',
  'Rem depan kurang pakem dan berdecit',
  'Kampas rem depan menipis dan perlu diganti',
  155000,
  '1 jam',
  60000,
  95000,
  155000,
  'menunggu_pembayaran',
  now() - interval '2 hours',
  now() + interval '1 hour'
) on conflict (nomor_servis) do nothing;

-- Detail Servis
insert into public.detail_servis (
  id_servis, id_sparepart, jumlah, keterangan, harga
) values (
  'f1111111-1111-1111-1111-111111111111',
  'SP-003',
  1,
  'Ganti kampas rem depan NMAX',
  95000
) on conflict do nothing;

-- Pembayaran
insert into public.pembayaran (
  id_pembayaran, nomor_transaksi, id_servis, id_pelanggan, metode_pembayaran, tanggal_bayar, jumlah_bayar, status_pembayaran
) values (
  '91111111-1111-1111-1111-111111111111',
  'TRX-2026-0147',
  'f1111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'transfer',
  now(),
  155000,
  'menunggu_verifikasi'
) on conflict (nomor_transaksi) do nothing;

-- Pembelian Sparepart
insert into public.pembelian_sparepart (
  id_pembelian_sparepart, nomor_pembelian, id_sparepart, supplier, tanggal, jumlah, harga, total, status
) values (
  '81111111-1111-1111-1111-111111111111',
  'PB-2026-0011',
  'SP-001',
  'PT Sinar Pelumas',
  current_date - interval '10 days',
  24,
  41000,
  984000,
  'diterima'
) on conflict (nomor_pembelian) do nothing;

-- Riwayat Stok
insert into public.riwayat_stok (
  id_sparepart, jenis, jumlah, tanggal, keterangan
) values
  ('SP-001', 'masuk', 24, now() - interval '10 days', 'Pembelian PB-2026-0011 · PT Sinar Pelumas'),
  ('SP-001', 'keluar', 1, now() - interval '2 days', 'Dipakai servis SRV-2026-0146'),
  ('SP-003', 'keluar', 1, now() - interval '1 hour', 'Dipakai servis SRV-2026-0147')
on conflict do nothing;

-- Stok Opname
insert into public.stok_opname (
  tanggal, keterangan, total_item, selisih_total
) values (
  current_date - interval '5 days',
  'Stok opname rutin akhir bulan gudang utama',
  6,
  0
) on conflict do nothing;

-- Laporan Ringkasan Stok
insert into public.laporan_ringkasan_stok (
  id_sparepart, stok_awal, stok_masuk, stok_keluar, stok_akhir, periode
) values
  ('SP-001', 11, 24, 1, 34, '2026-08'),
  ('SP-002', 20, 0, 2, 18, '2026-08'),
  ('SP-003', 7, 0, 1, 6, '2026-08')
on conflict do nothing;

