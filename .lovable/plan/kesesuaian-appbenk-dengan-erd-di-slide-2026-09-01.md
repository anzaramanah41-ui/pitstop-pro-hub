# Kesesuaian AppBenk dengan ERD di Slide

Jawaban singkat: **sebagian sesuai, belum sepenuhnya.** Aplikasi saat ini memakai data mock di `src/lib/store.tsx` dengan struktur yang disederhanakan — beberapa entitas ERD digabung jadi satu, dan beberapa entitas belum ada sama sekali.

## Sudah sesuai

<<<<<<< HEAD
| Entitas ERD | Status di aplikasi |
|---|---|
| Pelanggan | Ada (nama, telepon, alamat) |
| Booking Servis | Ada (tanggal, waktu, keluhan, status, mekanik diinginkan/ditugaskan, alasan tolak) |
| Servis | Ada (jenis, keluhan, pekerjaan, mekanik, status, biaya) |
| Detail Servis | Ada sebagai `items` di dalam servis (sparepart, jumlah, harga satuan) |
| Sparepart & Stok | Ada (kode, nama, kategori, harga, stok, terpakai) |
| Pembayaran | Ada, tetapi menempel di record servis (metode bayar, status, nota) |
| Admin & Owner | Ada sebagai peran login mock, bukan data |
=======
| Entitas ERD      | Status di aplikasi                                                                 |
| ---------------- | ---------------------------------------------------------------------------------- |
| Pelanggan        | Ada (nama, telepon, alamat)                                                        |
| Booking Servis   | Ada (tanggal, waktu, keluhan, status, mekanik diinginkan/ditugaskan, alasan tolak) |
| Servis           | Ada (jenis, keluhan, pekerjaan, mekanik, status, biaya)                            |
| Detail Servis    | Ada sebagai `items` di dalam servis (sparepart, jumlah, harga satuan)              |
| Sparepart & Stok | Ada (kode, nama, kategori, harga, stok, terpakai)                                  |
| Pembayaran       | Ada, tetapi menempel di record servis (metode bayar, status, nota)                 |
| Admin & Owner    | Ada sebagai peran login mock, bukan data                                           |
>>>>>>> b897868 (Initial commit - AppBenk)

## Belum sesuai / belum ada

- **Kendaraan** belum jadi entitas terpisah. Sekarang kendaraan hanya 2 teks di data pelanggan, jadi 1 pelanggan = 1 kendaraan. ERD meminta 1 pelanggan bisa punya banyak kendaraan (merk, tipe, tahun, kilometer).
- **Pembayaran & Transaksi** belum jadi record sendiri (tidak ada tanggal bayar, bukti bayar, id transaksi terpisah dari servis).
- **Riwayat Stok** (log masuk/keluar sparepart) belum ada — stok hanya ditambah/dikurangi tanpa jejak.
- **Pembelian Sparepart** dari supplier belum ada.
- **Penggunaan Sparepart** sebagai log tersendiri (per servis, per mekanik, per tanggal) belum ada.
- **Stok Opname, Retur Sparepart, Laporan Ringkasan Stok** (slide Atribut) belum ada sama sekali.
- **Atribut sparepart** kurang: satuan, stok minimum, status stok, tanggal update.
- **Atribut booking/servis** kurang: hasil pemeriksaan, estimasi biaya, estimasi waktu.
- **Riwayat Servis** belum jadi entitas; halaman riwayat hanya memfilter data servis.
- **Akun pelanggan** (email, password) belum tersimpan di data pelanggan — login masih mock terpisah.

## Usulan langkah berikutnya (pilih salah satu)

1. **Selaraskan mock store dengan ERD** — pecah `Pelanggan` → `Pelanggan` + `Kendaraan`, tambah entitas `Pembayaran`, `RiwayatStok`, `PembelianSparepart`, `PenggunaanSparepart`, plus atribut yang kurang, dan tambahkan halaman/menu pendukung (Kendaraan Saya, Pembelian Sparepart, Riwayat Stok). Masih tanpa database.
2. **Lanjut ke database (Lovable Cloud)** — implementasikan seluruh tabel ERD langsung sebagai skema nyata beserta relasinya, lalu sambungkan UI yang sudah ada.

Catatan teknis: opsi 1 hanya menyentuh `src/lib/store.tsx` dan route terkait; opsi 2 mengganti sumber data seluruh aplikasi, jadi sebaiknya store diselaraskan dulu agar migrasi lebih mudah.
