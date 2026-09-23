# 📊 AppBenk — ERD & BPMN Diagram

---

## 🗃️ ERD (Entity Relationship Diagram)

> Menggambarkan seluruh tabel database AppBenk beserta relasinya.

```mermaid
erDiagram
    AUTH_USERS {
        uuid id PK
        text email
        timestamptz created_at
    }

    PROFILES {
        uuid id PK
        text full_name
        text email
        text phone
        text role
        text workshop_id FK
        timestamptz created_at
    }

    WORKSHOPS {
        text id PK
        text name
        text code
        uuid owner_id FK
        text phone
        text email
        text address
        text city
        text province
        float latitude
        float longitude
        timestamptz created_at
    }

    WORKSHOP_MEMBERS {
        uuid id PK
        text workshop_id FK
        uuid user_id FK
        text role
        timestamptz created_at
    }

    WORKSHOP_PAYMENT_ACCOUNTS {
        uuid id PK
        text workshop_id FK
        text provider
        text provider_account_id
        text status
        bool is_active
    }

    NOTIFICATION_LOGS {
        uuid id PK
        text workshop_id FK
        uuid user_id FK
        text channel
        text type
        text recipient
        text message
        text status
        timestamptz sent_at
    }

    PELANGGAN {
        uuid id_pelanggan PK
        uuid user_id FK
        text nama
        text email
        text no_hp
        text alamat
        text workshop_id FK
    }

    KENDARAAN {
        uuid id_kendaraan PK
        uuid id_pelanggan FK
        text merk
        text tipe
        int tahun
        text nopol
        text workshop_id FK
    }

    ADMIN {
        uuid id_admin PK
        uuid user_id FK
        text nama
        text email
        text no_hp
        text status
        text workshop_id FK
    }

    OWNER {
        uuid id_owner PK
        uuid user_id FK
        text nama
        text email
        text no_hp
        text status
        text workshop_id FK
    }

    BOOKING_SERVIS {
        uuid id_booking PK
        text nomor_booking
        uuid id_pelanggan FK
        uuid id_kendaraan FK
        date tanggal_booking
        time waktu_booking
        text jenis_servis
        text keluhan
        text status_booking
        text workshop_id FK
    }

    SERVIS {
        uuid id_servis PK
        text nomor_servis
        uuid id_booking FK
        uuid id_pelanggan FK
        uuid id_kendaraan FK
        text mekanik
        text jenis_servis
        numeric estimasi_biaya
        numeric biaya_jasa
        numeric biaya_sparepart
        numeric total_biaya
        text status_servis
        timestamptz tanggal_mulai
        timestamptz tanggal_selesai
        text workshop_id FK
    }

    DETAIL_SERVIS {
        uuid id_detail_servis PK
        uuid id_servis FK
        text id_sparepart FK
        int jumlah
        numeric harga
        text keterangan
        text workshop_id FK
    }

    PEMBAYARAN {
        uuid id_pembayaran PK
        text nomor_transaksi
        uuid id_servis FK
        uuid id_pelanggan FK
        text metode_pembayaran
        numeric jumlah_bayar
        text status_pembayaran
        text bukti_pembayaran
        timestamptz tanggal_bayar
        text workshop_id FK
    }

    SPAREPART {
        text id_sparepart PK
        text nama_sparepart
        text kategori
        text satuan
        numeric harga
        int stok_tersedia
        int stok_minimum
        text status_stok
        text workshop_id FK
    }

    PENGGUNAAN_SPAREPART {
        uuid id_penggunaan_sparepart PK
        text id_sparepart FK
        uuid id_servis FK
        date tanggal
        int jumlah
        text mekanik
        text workshop_id FK
    }

    PEMBELIAN_SPAREPART {
        uuid id_pembelian_sparepart PK
        text nomor_pembelian
        text id_sparepart FK
        text supplier
        date tanggal
        int jumlah
        numeric harga
        numeric total
        text status
        text workshop_id FK
    }

    RIWAYAT_STOK {
        uuid id_riwayat_stok PK
        text id_sparepart FK
        text jenis
        int jumlah
        timestamptz tanggal
        text keterangan
        text workshop_id FK
    }

    STOK_OPNAME {
        text id_stok_opname PK
        date tanggal
        text keterangan
        int total_item
        int selisih_total
        text workshop_id FK
    }

    RETUR_SPAREPART {
        uuid id_retur_sparepart PK
        uuid id_pembelian_sparepart FK
        text id_sparepart FK
        int jumlah
        date tanggal
        text alasan
        text status
        text workshop_id FK
    }

    LAPORAN_RINGKASAN_STOK {
        uuid id_ringkasan_stok PK
        text id_sparepart FK
        int stok_awal
        int stok_masuk
        int stok_keluar
        int stok_akhir
        text periode
    }

    %% Auth Relations
    AUTH_USERS ||--o{ PROFILES : "has profile"
    AUTH_USERS ||--o| PELANGGAN : "is customer"
    AUTH_USERS ||--o| ADMIN : "is admin"
    AUTH_USERS ||--o| OWNER : "is owner"
    AUTH_USERS ||--o{ WORKSHOP_MEMBERS : "member of"

    %% Workshop Relations
    WORKSHOPS ||--o{ WORKSHOP_MEMBERS : "has members"
    WORKSHOPS ||--o{ WORKSHOP_PAYMENT_ACCOUNTS : "has payment accounts"
    WORKSHOPS ||--o{ NOTIFICATION_LOGS : "logs notifications"
    WORKSHOPS ||--o| OWNER : "owned by"

    %% Customer Relations
    PELANGGAN ||--o{ KENDARAAN : "owns"
    PELANGGAN ||--o{ BOOKING_SERVIS : "makes bookings"
    PELANGGAN ||--o{ SERVIS : "has services"
    PELANGGAN ||--o{ PEMBAYARAN : "makes payments"

    %% Vehicle Relations
    KENDARAAN ||--o{ BOOKING_SERVIS : "is booked"
    KENDARAAN ||--o{ SERVIS : "is serviced"

    %% Booking to Service
    BOOKING_SERVIS ||--o| SERVIS : "becomes service"

    %% Service Relations
    SERVIS ||--o{ DETAIL_SERVIS : "has details"
    SERVIS ||--o| PEMBAYARAN : "has payment"
    SERVIS ||--o{ PENGGUNAAN_SPAREPART : "uses parts"

    %% Sparepart Relations
    SPAREPART ||--o{ DETAIL_SERVIS : "used in detail"
    SPAREPART ||--o{ PENGGUNAAN_SPAREPART : "used in service"
    SPAREPART ||--o{ PEMBELIAN_SPAREPART : "purchased via"
    SPAREPART ||--o{ RIWAYAT_STOK : "has stock history"
    SPAREPART ||--o{ RETUR_SPAREPART : "can be returned"
    SPAREPART ||--o{ LAPORAN_RINGKASAN_STOK : "summarized in"

    %% Purchase & Return
    PEMBELIAN_SPAREPART ||--o{ RETUR_SPAREPART : "can be returned"
```

---

## 🔄 BPMN — Proses Utama AppBenk

### 1. BPMN: Registrasi & Login Pelanggan

```mermaid
flowchart TD
    A([🟢 Mulai]) --> B[Pelanggan buka halaman Register]
    B --> C[Isi nama, email @gmail.com, password]
    C --> D{Validasi\nInput}
    D -- Email bukan @gmail.com --> E[Tampil error: Gunakan @gmail.com]
    E --> C
    D -- Valid --> F[Kirim ke Supabase Auth]
    F --> G{Email sudah\nterdaftar?}
    G -- Ya --> H[Tampil error: Email sudah dipakai]
    H --> C
    G -- Tidak --> I[Akun dibuat di auth.users]
    I --> J[Trigger: Insert ke tabel profiles & pelanggan]
    J --> K[Tampil halaman verifikasi email]
    K --> L{Pengguna klik\nverifikasi email?}
    L -- Tidak --> M[Email belum terverifikasi]
    L -- Ya --> N[Status email verified]
    N --> O([Login])

    P([🟢 Mulai Login]) --> Q[Pelanggan buka halaman Login]
    Q --> R[Isi email @gmail.com & password]
    R --> S{Validasi\nInput}
    S -- Bukan @gmail.com --> T[Error: Hanya @gmail.com]
    T --> R
    S -- Valid --> U{Percobaan\n>= 5?}
    U -- Ya --> V[Akun terkunci 60 detik]
    V --> W([⏳ Tunggu])
    W --> Q
    U -- Tidak --> X[Kirim ke Supabase Auth]
    X --> Y{Autentikasi\nberhasil?}
    Y -- Gagal --> Z[Tambah hitungan gagal]
    Z --> AA[Tampil: Kata sandi salah]
    AA --> R
    Y -- Berhasil --> AB[Load profil user dari DB]
    AB --> AC{Role\nuser?}
    AC -- pelanggan --> AD[Redirect ke /pelanggan/dashboard]
    AC -- admin --> AE[Redirect ke /admin/dashboard]
    AC -- owner --> AF[Redirect ke /owner/dashboard]
    AD & AE & AF --> AG([🔴 Selesai])
```

---

### 2. BPMN: Lupa Password (OTP Flow)

```mermaid
flowchart TD
    A([🟢 Mulai]) --> B[Pelanggan klik Lupa Password]
    B --> C{Email sudah\ndiisi di form?}
    C -- Tidak --> D[Tampil pesan: Isi email dulu]
    D --> B
    C -- Ya --> E{Email\n@gmail.com?}
    E -- Tidak --> F[Error: Hanya @gmail.com]
    F --> B
    E -- Ya --> G[Kirim OTP ke email via Supabase]
    G --> H[Redirect ke halaman /reset-password]
    H --> I[Pelanggan buka email]
    I --> J[Salin kode OTP 6 digit]
    J --> K[Masukkan email, OTP, dan password baru]
    K --> L{Validasi\nOTP}
    L -- OTP salah / expired --> M[Tampil error verifikasi gagal]
    M --> K
    L -- OTP valid --> N[supabase.auth.verifyOtp]
    N --> O[supabase.auth.updateUser - password baru]
    O --> P[Redirect ke halaman Login]
    P --> Q([🔴 Selesai])
```

---

### 3. BPMN: Booking Servis oleh Pelanggan

```mermaid
flowchart TD
    A([🟢 Mulai]) --> B[Pelanggan login]
    B --> C[Buka menu Booking]
    C --> D[Pilih kendaraan]
    D --> E{Kendaraan\nsudah ada?}
    E -- Tidak --> F[Tambah kendaraan baru]
    F --> D
    E -- Ya --> G[Pilih tanggal & waktu]
    G --> H[Pilih jenis servis]
    H --> I[Isi keluhan kendaraan]
    I --> J{Pilih mekanik\ndiinginkan?}
    J -- Opsional --> K[Pilih mekanik]
    J -- Lewati --> L[Submit booking]
    K --> L
    L --> M[Insert ke tabel booking_servis]
    M --> N[Status: menunggu_konfirmasi]
    N --> O[Admin menerima notif booking baru]
    O --> P{Admin\nkonfirmasi?}
    P -- Tolak --> Q[Status: ditolak + alasan]
    Q --> R[Notif penolakan ke Pelanggan]
    P -- Setujui --> S[Status: disetujui]
    S --> T[Notif persetujuan ke Pelanggan]
    T --> U([🔴 Selesai - Menunggu Servis])
```

---

### 4. BPMN: Proses Servis oleh Admin/Mekanik

```mermaid
flowchart TD
    A([🟢 Mulai]) --> B[Admin buka menu Servis]
    B --> C{Dari booking\natau langsung?}
    C -- Dari Booking --> D[Konversi Booking ke Servis]
    C -- Walk-in --> E[Buat servis baru manual]
    D & E --> F[Insert ke tabel servis]
    F --> G[Status servis: menunggu]
    G --> H[Assign mekanik]
    H --> I[Mulai pengerjaan]
    I --> J[Status servis: diproses]
    J --> K[Tambah penggunaan sparepart]
    K --> L[Trigger DB: kurangi stok sparepart]
    L --> M[Insert ke riwayat_stok: keluar]
    M --> N[Isi hasil pemeriksaan]
    N --> O[Set biaya jasa & sparepart]
    O --> P[Status servis: selesai]
    P --> Q[Status servis: menunggu_pembayaran]
    Q --> R([🔴 Selesai - Lanjut ke Pembayaran])
```

---

### 5. BPMN: Proses Pembayaran

```mermaid
flowchart TD
    A([🟢 Mulai]) --> B[Pelanggan buka menu Pembayaran]
    B --> C[Lihat tagihan servis]
    C --> D{Pilih metode\npembayaran}
    D -- Cash --> E[Catat pembayaran tunai]
    D -- Transfer --> F[Upload bukti transfer]
    D -- QRIS --> G[Generate QRIS via Midtrans]
    G --> H[Pelanggan scan QRIS]
    H --> I[Midtrans callback konfirmasi]
    E & F --> J[Status: menunggu_verifikasi]
    I --> K[Status: lunas otomatis]
    J --> L[Admin verifikasi pembayaran]
    L --> M{Bukti\nvalid?}
    M -- Tidak --> N[Status: ditolak + alasan]
    N --> O[Notif penolakan ke Pelanggan]
    O --> D
    M -- Ya --> P[Status pembayaran: lunas]
    P --> Q[Status servis: lunas]
    Q --> K
    K --> R[Insert ke laporan / riwayat]
    R --> S([🔴 Selesai])
```

---

### 6. BPMN: Manajemen Stok Sparepart

```mermaid
flowchart TD
    A([🟢 Mulai]) --> B[Admin buka menu Stok]
    B --> C{Jenis\nAksi?}

    C -- Pembelian Baru --> D[Input data pembelian sparepart]
    D --> E[Insert ke pembelian_sparepart]
    E --> F[Status: diterima]
    F --> G[Trigger DB: tambah stok]
    G --> H[Update stok_tersedia sparepart]
    H --> I[Insert ke riwayat_stok: masuk]

    C -- Stok Opname --> J[Hitung stok fisik]
    J --> K[Bandingkan dengan stok sistem]
    K --> L{Selisih?}
    L -- Ada selisih --> M[Insert penyesuaian ke riwayat_stok]
    L -- Tidak ada --> N[Catat stok opname]
    M --> N

    C -- Retur Supplier --> O[Pilih pembelian yang diretur]
    O --> P[Insert ke retur_sparepart]
    P --> Q[Status retur: diproses]
    Q --> R{Disetujui?}
    R -- Ya --> S[Status: disetujui, kurangi stok]
    R -- Tidak --> T[Status: ditolak]

    I & N & S & T --> U([🔴 Selesai])
```

---

### 7. BPMN: Laporan & Dashboard Owner

```mermaid
flowchart TD
    A([🟢 Mulai]) --> B[Owner login]
    B --> C[Buka Dashboard Owner]
    C --> D[Sistem load data dari DB]
    D --> E[Tampilkan ringkasan:\nTotal pendapatan, servis selesai,\nsparepart terjual]
    E --> F{Owner\npilih laporan?}
    F -- Laporan Servis --> G[Filter berdasarkan periode]
    F -- Laporan Sparepart --> H[Load data sparepart + stok]
    F -- Laporan Keuntungan --> I[Hitung pendapatan - HPP]
    F -- Laporan Pelanggan --> J[Tampil daftar pelanggan]
    G & H & I & J --> K[Tampilkan dalam tabel/grafik]
    K --> L{Export\nLaporan?}
    L -- Ya --> M[Download PDF / Excel]
    L -- Tidak --> N([🔴 Selesai])
    M --> N
```

---

## 📋 Ringkasan Entitas & Peran

| Tabel | Deskripsi | Aktor |
|---|---|---|
| `auth.users` | Tabel bawaan Supabase Auth | Sistem |
| `profiles` | Profil publik user, bridge Auth ↔ App | Semua |
| `workshops` | Entitas bengkel (multi-tenant) | Owner, Sistem |
| `workshop_members` | RBAC: Anggota & role per bengkel | Sistem |
| `pelanggan` | Data pelanggan terdaftar | Pelanggan |
| `kendaraan` | Kendaraan milik pelanggan | Pelanggan |
| `booking_servis` | Permintaan booking servis | Pelanggan → Admin |
| `servis` | Catatan pengerjaan servis aktual | Admin, Mekanik |
| `detail_servis` | Detail sparepart per servis | Admin |
| `pembayaran` | Transaksi pembayaran servis | Pelanggan → Admin |
| `sparepart` | Katalog & stok sparepart | Admin |
| `penggunaan_sparepart` | Log pemakaian sparepart per servis | Admin |
| `pembelian_sparepart` | Pembelian dari supplier | Admin |
| `riwayat_stok` | Log pergerakan stok (masuk/keluar) | Sistem (Trigger) |
| `stok_opname` | Rekap opname stok berkala | Admin |
| `retur_sparepart` | Pengembalian barang ke supplier | Admin |
| `laporan_ringkasan_stok` | Laporan stok per periode | Owner, Admin |
| `notification_logs` | Log notif Email/WA/In-App | Sistem |
| `admin` | Data admin bengkel | Owner |
| `owner` | Data owner bengkel | Sistem |
