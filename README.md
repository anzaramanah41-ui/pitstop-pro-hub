# Pitstop Manager

Build Project Prompt — Bengkel Pitstop

1. Product Name

Bengkel Pitstop

Bengkel Pitstop adalah aplikasi administrasi bengkel berbasis web yang dirancang untuk membantu bengkel mengelola data pelanggan, data servis, sparepart, pricelist, dan riwayat servis secara digital.

<<<<<<< HEAD




=======
>>>>>>> b897868 (Initial commit - AppBenk)
2. Vision Statement

"Menjadi solusi administrasi bengkel yang sederhana, cepat, dan mudah digunakan sehingga bengkel dapat mengelola data pelanggan, servis, dan sparepart secara digital serta meningkatkan kualitas pelayanan kepada pelanggan."

Aplikasi harus memiliki karakter:

Sederhana

Cepat

Mudah digunakan

Terstruktur

Profesional

Cocok untuk operasional bengkel sehari-hari

<<<<<<< HEAD




=======
>>>>>>> b897868 (Initial commit - AppBenk)
3. Target Users

A. Admin Bengkel

Admin merupakan pengguna yang bertanggung jawab terhadap administrasi bengkel.

Kebutuhan utama:

Mengelola data pelanggan

Mengelola data servis

Mengelola data sparepart

Mengelola pricelist

Mencari data pelanggan

Melihat riwayat servis kendaraan

Melihat informasi servis secara terstruktur

B. Mekanik

Mekanik merupakan pengguna yang menangani proses servis kendaraan.

Kebutuhan utama:

Melihat data kendaraan/pelanggan

Melihat informasi servis

Mencatat keluhan atau pekerjaan servis

Melihat riwayat servis kendaraan

Melihat sparepart yang tersedia dan pricelist

<<<<<<< HEAD




=======
>>>>>>> b897868 (Initial commit - AppBenk)
4. Product Description

Bengkel Pitstop merupakan aplikasi administrasi bengkel berbasis web yang menggantikan proses pencatatan manual menggunakan buku.

Saat ini proses administrasi bengkel masih dilakukan secara manual sehingga pencatatan pelanggan, keluhan servis, dan riwayat servis membutuhkan waktu dan berpotensi menimbulkan kesalahan. Bengkel juga belum memiliki daftar harga sparepart yang terdokumentasi dengan baik.

Aplikasi Bengkel Pitstop bertujuan membuat proses tersebut menjadi digital.

Sistem harus memungkinkan pengguna untuk mengelola:

Data pelanggan

Data kendaraan

Data servis

Keluhan servis

Riwayat servis

Data sparepart

Pricelist sparepart

Transaksi/informasi servis

Dengan aplikasi ini, proses pencatatan harus terasa lebih cepat dan terorganisir, serta pengguna dapat menemukan riwayat servis dengan lebih mudah.

<<<<<<< HEAD




=======
>>>>>>> b897868 (Initial commit - AppBenk)
5. MVP Scope

Untuk tahap pertama, bangun interface dan struktur aplikasi berdasarkan fitur MVP berikut:

1. Login

Buat halaman login untuk pengguna aplikasi.

Untuk tahap ini, jangan membuat backend authentication atau database. Gunakan mock/static interaction jika diperlukan agar flow UI dapat didemonstrasikan.

2. Dashboard

Buat dashboard utama setelah pengguna masuk.

Dashboard harus memberikan gambaran singkat mengenai kondisi operasional bengkel, misalnya:

Total pelanggan

Total kendaraan

Servis hari ini

Servis yang sedang diproses

Total sparepart

Aktivitas servis terbaru

Gunakan dummy/mock data untuk kebutuhan tampilan.

3. Data Pelanggan

Buat halaman untuk mengelola data pelanggan.

Tampilan minimal:

Daftar pelanggan

Search pelanggan

Filter bila diperlukan

Detail pelanggan

Tombol tambah pelanggan

Tombol edit

Tombol hapus

Informasi pelanggan dapat mencakup:

Nama pelanggan

Nomor telepon

Alamat

Kendaraan yang dimiliki

Gunakan mock data terlebih dahulu.

4. Data Servis

Buat halaman untuk pencatatan dan pengelolaan servis.

Informasi yang dapat ditampilkan:

Nomor servis

Nama pelanggan

Kendaraan

Keluhan

Tanggal servis

Status servis

Mekanik

Sparepart yang digunakan

Catatan servis

Gunakan status yang mudah dipahami seperti:

Menunggu

Diproses

Selesai

Gunakan mock data.

5. Data Sparepart & Pricelist

Buat halaman katalog sparepart.

Tampilan minimal:

Nama sparepart

Kode sparepart

Kategori

Harga

Stok/status ketersediaan

Sediakan:

Search

Filter kategori

Tambah sparepart

Edit sparepart

Hapus sparepart

Gunakan mock data dan jangan membuat database pada tahap ini.

6. Riwayat Servis

Buat halaman untuk melihat riwayat servis.

Pengguna dapat mencari berdasarkan:

Nama pelanggan

Kendaraan

Nomor servis

Tanggal servis

Detail riwayat harus dapat menampilkan:

Informasi pelanggan

Informasi kendaraan

Keluhan

Pekerjaan/perbaikan

Sparepart yang digunakan

Mekanik

Tanggal servis

Status servis

Tujuannya agar pengguna dapat menemukan riwayat servis kendaraan dengan cepat.

<<<<<<< HEAD




=======
>>>>>>> b897868 (Initial commit - AppBenk)
6. Application Structure

Buat struktur navigasi utama sebagai berikut:

Login

↓

Dashboard

Sidebar navigation:

Dashboard

Pelanggan

Servis

Sparepart & Pricelist

Riwayat Servis

Pengaturan

Tambahkan profile/user menu pada bagian header.

Navigation harus konsisten pada seluruh halaman aplikasi.

<<<<<<< HEAD




=======
>>>>>>> b897868 (Initial commit - AppBenk)
7. UI/UX Direction

Buat desain yang terlihat seperti aplikasi administrasi bengkel modern, bukan website company profile.

Prioritaskan:

Kemudahan penggunaan

Kecepatan menemukan informasi

Tampilan data yang rapi

Hierarki informasi yang jelas

Navigasi sederhana

Responsive design

Desktop-first karena aplikasi akan banyak digunakan untuk administrasi bengkel

Gunakan:

Dashboard cards

Data tables

Search bar

Filter

Modal/dialog untuk form sederhana

Detail page/drawer bila sesuai

Badge untuk status

Empty state

Loading state

Confirmation dialog untuk aksi penting

Toast notification untuk feedback UI

Jangan membuat desain terlalu kompleks.

<<<<<<< HEAD




=======
>>>>>>> b897868 (Initial commit - AppBenk)
8. Visual Design

Gunakan visual identity yang sesuai dengan nama Bengkel Pitstop.

Gaya desain:

Modern

Profesional

Clean

Tegas

Praktis

Automotive-inspired

Gunakan kombinasi warna yang memberikan kesan:

Profesional

Teknologi

Otomotif

Kecepatan

Kepercayaan

Gunakan typography yang mudah dibaca.

Pastikan contrast dan accessibility cukup baik.

Gunakan icon yang relevan untuk:

Dashboard

Pelanggan

Kendaraan

Servis

Sparepart

Riwayat

Settings

<<<<<<< HEAD




=======
>>>>>>> b897868 (Initial commit - AppBenk)
9. Dashboard UX

Dashboard harus menjadi halaman yang paling informatif secara visual.

Buat layout dengan:

Summary Cards

Total Pelanggan

Total Kendaraan

Servis Hari Ini

Servis Berjalan

Total Sparepart

Recent Service

Tampilkan tabel/list servis terbaru dengan:

Nomor servis

Pelanggan

Kendaraan

Mekanik

Status

Tanggal

Quick Actions

Sediakan shortcut:

Tambah Pelanggan

Buat Servis

Tambah Sparepart

Lihat Riwayat

Semua data pada tahap ini menggunakan mock data.

<<<<<<< HEAD




=======
>>>>>>> b897868 (Initial commit - AppBenk)
10. Data Table UX

Semua halaman yang memiliki daftar data harus memiliki pengalaman tabel yang konsisten.

Gunakan:

Search

Pagination bila diperlukan

Sorting bila relevan

Filter

Action menu

Contoh action:

Lihat

Edit

Hapus

Pastikan tabel tetap mudah digunakan pada ukuran layar desktop yang berbeda.

<<<<<<< HEAD




=======
>>>>>>> b897868 (Initial commit - AppBenk)
11. Forms

Buat form yang sederhana dan mudah dipahami.

Gunakan label yang jelas dan validasi sisi frontend untuk demonstrasi.

Contoh form pelanggan:

Nama pelanggan

Nomor telepon

Alamat

Kendaraan

Contoh form servis:

Pelanggan

Kendaraan

Keluhan

Mekanik

Tanggal servis

Status

Pekerjaan servis

Sparepart

Catatan

Contoh form sparepart:

Nama sparepart

Kode sparepart

Kategori

Harga

Stok

<<<<<<< HEAD




=======
>>>>>>> b897868 (Initial commit - AppBenk)
12. Responsive Design

Aplikasi harus responsive.

Prioritas:

Desktop

Tablet

Mobile

Pada desktop gunakan sidebar navigation.

Pada mobile, sidebar dapat berubah menjadi:

Collapsible sidebar

Drawer

Mobile navigation

Table pada mobile harus tetap usable, misalnya dengan horizontal scrolling atau responsive card layout.

<<<<<<< HEAD




=======
>>>>>>> b897868 (Initial commit - AppBenk)
13. Technology

Gunakan teknologi modern yang sesuai dan native dengan ekosistem Lovable.

Gunakan:

React

TypeScript

Tailwind CSS

shadcn/ui atau komponen UI yang setara

Lucide Icons atau icon library yang sesuai

Component-based architecture

Gunakan reusable components agar halaman memiliki konsistensi.

Contoh reusable components:

Sidebar

Header

DashboardCard

DataTable

SearchBar

Filter

StatusBadge

FormDialog

ConfirmDialog

EmptyState

Toast/Notification

<<<<<<< HEAD




=======
>>>>>>> b897868 (Initial commit - AppBenk)
14. Mock Data Only

Untuk Step 1 ini, gunakan mock/static data untuk menampilkan aplikasi secara realistis.

Jangan membuat:

Database

Supabase

Backend API

External API

Authentication backend

Database schema

Migration

Server-side logic

Payment integration

Semua interaksi CRUD pada tahap ini boleh menggunakan local state/mock data hanya untuk mendemonstrasikan UI dan user flow.

<<<<<<< HEAD




=======
>>>>>>> b897868 (Initial commit - AppBenk)
15. Important Scope Restriction

THIS IS STEP 1 ONLY.

Fokus utama adalah:

Build the frontend application structure, UI/UX, navigation, pages, components, forms, tables, dashboard, and mock interactions.

Jangan masuk ke tahap database atau backend.

Jangan membuat database schema atau menentukan struktur Supabase terlebih dahulu.

Jangan mengintegrasikan authentication provider.

Jangan menghubungkan aplikasi ke external services.

Tujuan Step 1 adalah menghasilkan prototype aplikasi frontend yang sudah terlihat seperti produk Bengkel Pitstop yang siap digunakan dan memiliki user flow yang jelas.

<<<<<<< HEAD




=======
>>>>>>> b897868 (Initial commit - AppBenk)
16. Expected Result

Setelah prompt ini dijalankan, aplikasi harus memiliki:

Login page

Dashboard

Sidebar navigation

Header/user menu

Halaman Pelanggan

Halaman Servis

Halaman Sparepart & Pricelist

Halaman Riwayat Servis

Form tambah/edit

Search dan filter

Detail data

Mock CRUD interaction

Responsive layout

Consistent design system

Empty/loading/error states untuk kebutuhan UI

Pastikan seluruh halaman saling terhubung melalui navigation dan user flow dapat dicoba tanpa membutuhkan database.

Do not proceed to database/backend implementation. Build Step 1 frontend only.

<<<<<<< HEAD

=======
>>>>>>> b897868 (Initial commit - AppBenk)
gunakan warna logo sebagai logo aplikasi

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pitstop-pro-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4f290905-f3bc-4af9-8a2f-2f7f363d0bbd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
