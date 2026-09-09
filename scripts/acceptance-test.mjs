/**
 * APPBENK — Acceptance Test Suite (12 Tests)
 * Verifies relational integrity, business logic, triggers, stock movements,
 * and operational workflows according to the AppBenk ERD specification.
 */

import assert from "node:assert/strict";

console.log("======================================================================");
console.log("             APPBENK — ACCEPTANCE TEST SUITE (12 TESTS)               ");
console.log("======================================================================\n");

// Simulated In-Memory Database Engine mirroring AppBenk PostgreSQL Schema & Triggers
class AppBenkDatabaseEngine {
  constructor() {
    this.pelanggan = new Map();
    this.kendaraan = new Map();
    this.booking_servis = new Map();
    this.servis = new Map();
    this.detail_servis = new Map();
    this.sparepart = new Map();
    this.penggunaan_sparepart = new Map();
    this.pembelian_sparepart = new Map();
    this.riwayat_stok = [];
    this.stok_opname = new Map();
    this.retur_sparepart = new Map();
    this.laporan_ringkasan_stok = new Map();
    this.pembayaran = new Map();
    this.admin = new Map();
    this.owner = new Map();

    // Initial Sparepart Catalog
    this.sparepart.set("SP-001", {
      id_sparepart: "SP-001",
      nama_sparepart: "Oli Mesin AHM MPX 0.8L",
      kategori: "Oli",
      satuan: "Botol",
      harga: 48000,
      stok_tersedia: 34,
      stok_minimum: 10,
      status_stok: "tersedia",
      tanggal_update: new Date().toISOString(),
    });
    this.sparepart.set("SP-002", {
      id_sparepart: "SP-002",
      nama_sparepart: "Busi NGK CPR9EA",
      kategori: "Mesin",
      satuan: "Pcs",
      harga: 27000,
      stok_tersedia: 18,
      stok_minimum: 8,
      status_stok: "tersedia",
      tanggal_update: new Date().toISOString(),
    });
    this.sparepart.set("SP-003", {
      id_sparepart: "SP-003",
      nama_sparepart: "Kampas Rem Depan NMAX",
      kategori: "Rem",
      satuan: "Set",
      harga: 95000,
      stok_tersedia: 6,
      stok_minimum: 6,
      status_stok: "menipis",
      tanggal_update: new Date().toISOString(),
    });
  }

  // 1. Buat Pelanggan
  createPelanggan(data) {
    assert(data.nama, "Nama pelanggan wajib diisi");
    assert(data.email, "Email pelanggan wajib diisi");
    const id = data.id_pelanggan || `pl-${crypto.randomUUID()}`;
    const row = {
      id_pelanggan: id,
      user_id: data.user_id || null,
      nama: data.nama,
      email: data.email,
      no_hp: data.no_hp || null,
      alamat: data.alamat || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.pelanggan.set(id, row);
    return row;
  }

  // 2. Buat Kendaraan
  createKendaraan(data) {
    assert(data.id_pelanggan, "id_pelanggan foreign key wajib diisi");
    assert(
      this.pelanggan.has(data.id_pelanggan),
      "Foreign key constraint violated: pelanggan does not exist",
    );
    assert(data.nopol, "Nopol wajib diisi");
    const id = data.id_kendaraan || `kd-${crypto.randomUUID()}`;
    const row = {
      id_kendaraan: id,
      id_pelanggan: data.id_pelanggan,
      merk: data.merk,
      tipe: data.tipe,
      tahun: data.tahun,
      nopol: data.nopol,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.kendaraan.set(id, row);
    return row;
  }

  // 3. Buat Booking
  createBooking(data) {
    assert(data.id_pelanggan, "id_pelanggan foreign key wajib diisi");
    assert(data.id_kendaraan, "id_kendaraan foreign key wajib diisi");
    assert(
      this.pelanggan.has(data.id_pelanggan),
      "Foreign key constraint violated: pelanggan does not exist",
    );
    assert(
      this.kendaraan.has(data.id_kendaraan),
      "Foreign key constraint violated: kendaraan does not exist",
    );
    const id = data.id_booking || `bk-${crypto.randomUUID()}`;
    const row = {
      id_booking: id,
      nomor_booking:
        data.nomor_booking || `BK-2026-${String(this.booking_servis.size + 1).padStart(4, "0")}`,
      id_pelanggan: data.id_pelanggan,
      id_kendaraan: data.id_kendaraan,
      tanggal_booking: data.tanggal_booking,
      waktu_booking: data.waktu_booking,
      jenis_servis: data.jenis_servis,
      keluhan: data.keluhan,
      mekanik_diinginkan: data.mekanik_diinginkan || null,
      status_booking: "menunggu_konfirmasi",
      alasan_penolakan: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.booking_servis.set(id, row);
    return row;
  }

  // 4. Admin Query Booking
  getAllBookings() {
    return Array.from(this.booking_servis.values()).sort((a, b) =>
      b.created_at.localeCompare(a.created_at),
    );
  }

  // 5. Admin Persetujuan / Penolakan Booking
  updateBookingStatus(id_booking, status, alasan_penolakan = null) {
    const b = this.booking_servis.get(id_booking);
    assert(b, `Booking ${id_booking} tidak ditemukan`);
    if (status === "ditolak") {
      assert(
        alasan_penolakan?.trim(),
        "Constraint check: alasan_penolakan wajib ada jika booking ditolak",
      );
      b.alasan_penolakan = alasan_penolakan.trim();
    }
    b.status_booking = status;
    b.updated_at = new Date().toISOString();
    return b;
  }

  // 6. Buat Servis dari Booking (1:1 Constraint)
  createServisFromBooking(data) {
    assert(data.id_booking, "id_booking foreign key wajib diisi");
    assert(this.booking_servis.has(data.id_booking), "Booking tidak ditemukan");
    for (const s of this.servis.values()) {
      if (s.id_booking === data.id_booking) {
        throw new Error(
          `Unique constraint violated: Booking ${data.id_booking} sudah memiliki data servis! (1:1)`,
        );
      }
    }
    const id = data.id_servis || `srv-${crypto.randomUUID()}`;
    const row = {
      id_servis: id,
      nomor_servis:
        data.nomor_servis || `SRV-2026-${String(this.servis.size + 1).padStart(4, "0")}`,
      id_booking: data.id_booking,
      id_pelanggan: data.id_pelanggan,
      id_kendaraan: data.id_kendaraan,
      mekanik: data.mekanik || null,
      jenis_servis: data.jenis_servis || null,
      keluhan: data.keluhan || null,
      hasil_pemeriksaan: data.hasil_pemeriksaan || null,
      estimasi_biaya: data.estimasi_biaya || 0,
      estimasi_waktu: data.estimasi_waktu || null,
      biaya_jasa: data.biaya_jasa || 0,
      biaya_sparepart: 0,
      total_biaya: data.biaya_jasa || 0,
      status_servis: "diproses",
      tanggal_mulai: new Date().toISOString(),
      estimasi_selesai: data.estimasi_selesai || null,
      tanggal_selesai: null,
      catatan: data.catatan || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.servis.set(id, row);
    return row;
  }

  // 7 & 8 & 9. Tambah Sparepart ke Servis (Trigger Kurangi Stok + Catat Riwayat Keluar)
  addDetailServisAndPenggunaan(id_servis, id_sparepart, jumlah, keterangan = "") {
    const s = this.servis.get(id_servis);
    assert(s, `Servis ${id_servis} tidak ditemukan`);
    const sp = this.sparepart.get(id_sparepart);
    assert(sp, `Sparepart ${id_sparepart} tidak ditemukan`);
    assert(jumlah > 0, "Jumlah sparepart harus > 0");
    assert(
      sp.stok_tersedia >= jumlah,
      `Stok ${id_sparepart} tidak mencukupi! Tersedia: ${sp.stok_tersedia}`,
    );

    // Kurangi Stok Atomic
    sp.stok_tersedia -= jumlah;
    sp.status_stok =
      sp.stok_tersedia === 0
        ? "habis"
        : sp.stok_tersedia <= sp.stok_minimum
          ? "menipis"
          : "tersedia";
    sp.tanggal_update = new Date().toISOString();

    // Catat Riwayat Stok (Jenis = Keluar)
    const logStok = {
      id_riwayat_stok: `rw-${crypto.randomUUID()}`,
      id_sparepart,
      jenis: "keluar",
      jumlah,
      tanggal: new Date().toISOString(),
      keterangan: keterangan || `Digunakan untuk servis ${s.nomor_servis}`,
    };
    this.riwayat_stok.push(logStok);

    // Simpan Penggunaan Sparepart
    const penggunaan = {
      id_penggunaan_sparepart: `pg-${crypto.randomUUID()}`,
      id_sparepart,
      id_servis,
      tanggal: new Date().toISOString().slice(0, 10),
      jumlah,
      mekanik: s.mekanik,
      keterangan,
    };
    this.penggunaan_sparepart.set(penggunaan.id_penggunaan_sparepart, penggunaan);

    // Simpan Detail Servis & Recalculate Total
    const detail = {
      id_detail_servis: `dt-${crypto.randomUUID()}`,
      id_servis,
      id_sparepart,
      jumlah,
      keterangan,
      harga: sp.harga,
      subtotal: jumlah * sp.harga,
    };
    this.detail_servis.set(detail.id_detail_servis, detail);

    s.biaya_sparepart += detail.subtotal;
    s.total_biaya = s.biaya_jasa + s.biaya_sparepart;

    return { detail, penggunaan, logStok };
  }

  // 10. Buat Pembayaran (1:1 Constraint ke Servis)
  createPembayaran(data) {
    assert(data.id_servis, "id_servis foreign key wajib diisi");
    assert(this.servis.has(data.id_servis), "Servis tidak ditemukan");
    for (const p of this.pembayaran.values()) {
      if (p.id_servis === data.id_servis) {
        throw new Error(
          `Unique constraint violated: Servis ${data.id_servis} sudah memiliki pembayaran! (1:1)`,
        );
      }
    }
    const id = data.id_pembayaran || `pay-${crypto.randomUUID()}`;
    const row = {
      id_pembayaran: id,
      nomor_transaksi:
        data.nomor_transaksi || `TRX-2026-${String(this.pembayaran.size + 1).padStart(4, "0")}`,
      id_servis: data.id_servis,
      id_pelanggan: data.id_pelanggan,
      metode_pembayaran: data.metode_pembayaran,
      tanggal_bayar: new Date().toISOString(),
      jumlah_bayar: data.jumlah_bayar,
      status_pembayaran: "belum_dibayar",
      bukti_pembayaran: null,
      alasan_penolakan: null,
      verified_by: null,
      verified_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.pembayaran.set(id, row);
    return row;
  }

  // 11. Upload Bukti Transfer
  uploadBuktiTransfer(id_pembayaran, bukti_pembayaran) {
    const p = this.pembayaran.get(id_pembayaran);
    assert(p, `Pembayaran ${id_pembayaran} tidak ditemukan`);
    assert(bukti_pembayaran, "Bukti transfer wajib ada");
    p.bukti_pembayaran = bukti_pembayaran;
    p.status_pembayaran = "menunggu_verifikasi";
    p.updated_at = new Date().toISOString();
    return p;
  }

  // 12. Admin Verifikasi Pembayaran
  verifikasiPembayaran(id_pembayaran, disetujui, alasan = null, verified_by = "Admin Joko") {
    const p = this.pembayaran.get(id_pembayaran);
    assert(p, `Pembayaran ${id_pembayaran} tidak ditemukan`);
    if (!disetujui) {
      assert(alasan?.trim(), "Alasan penolakan pembayaran wajib diisi jika ditolak");
      p.status_pembayaran = "ditolak";
      p.alasan_penolakan = alasan.trim();
    } else {
      p.status_pembayaran = "lunas";
      p.alasan_penolakan = null;
      p.verified_by = verified_by;
      p.verified_at = new Date().toISOString();

      // Sinkronkan status servis
      const s = this.servis.get(p.id_servis);
      if (s) {
        s.status_servis = "lunas";
        s.tanggal_selesai = new Date().toISOString();
      }
    }
    p.updated_at = new Date().toISOString();
    return p;
  }
}

// ----------------------------------------------------------------------------
// RUN TEST SUITE
// ----------------------------------------------------------------------------
const db = new AppBenkDatabaseEngine();

try {
  // TEST 1: Buat Pelanggan
  console.log("[TEST 1] Membuat Pelanggan...");
  const pelanggan = db.createPelanggan({
    nama: "Budi Santoso",
    email: "budi@mail.test",
    no_hp: "0812-3344-5566",
    alamat: "Jl. Merdeka No. 12, Bandung",
  });
  assert(pelanggan.id_pelanggan, "TEST 1 GAGAL: Pelanggan tidak memiliki ID");
  assert.equal(pelanggan.nama, "Budi Santoso");
  assert.equal(db.pelanggan.get(pelanggan.id_pelanggan)?.email, "budi@mail.test");
  console.log("  ✓ TEST 1 BERHASIL: Pelanggan tersimpan dengan ID:", pelanggan.id_pelanggan);

  // TEST 2: Buat Kendaraan untuk Pelanggan (Relasi Pelanggan 1 : M Kendaraan)
  console.log("\n[TEST 2] Membuat Kendaraan untuk Pelanggan...");
  const kendaraan = db.createKendaraan({
    id_pelanggan: pelanggan.id_pelanggan,
    merk: "Honda",
    tipe: "Vario 160",
    tahun: 2023,
    nopol: "B 1234 XYZ",
  });
  assert(kendaraan.id_kendaraan, "TEST 2 GAGAL: Kendaraan tidak memiliki ID");
  assert.equal(kendaraan.id_pelanggan, pelanggan.id_pelanggan);
  assert.equal(kendaraan.nopol, "B 1234 XYZ");
  console.log("  ✓ TEST 2 BERHASIL: Kendaraan terhubung dengan Pelanggan:", kendaraan.id_kendaraan);

  // TEST 3: Buat Booking Servis
  console.log("\n[TEST 3] Membuat Booking Servis...");
  const booking = db.createBooking({
    id_pelanggan: pelanggan.id_pelanggan,
    id_kendaraan: kendaraan.id_kendaraan,
    tanggal_booking: "2026-09-10",
    waktu_booking: "10:00",
    jenis_servis: "Servis Berkala & Ganti Oli",
    keluhan: "Tarikan gas terasa berat saat menanjak",
    mekanik_diinginkan: "Joko",
  });
  assert(booking.id_booking, "TEST 3 GAGAL: Booking tidak memiliki ID");
  assert.equal(booking.id_pelanggan, pelanggan.id_pelanggan);
  assert.equal(booking.id_kendaraan, kendaraan.id_kendaraan);
  assert.equal(booking.status_booking, "menunggu_konfirmasi");
  console.log(
    "  ✓ TEST 3 BERHASIL: Booking terhubung ke Pelanggan & Kendaraan:",
    booking.nomor_booking,
  );

  // TEST 4: Admin Melihat Antrean Booking
  console.log("\n[TEST 4] Admin Membuka Daftar Booking...");
  const antreanBooking = db.getAllBookings();
  const bookingDitemukan = antreanBooking.find((b) => b.id_booking === booking.id_booking);
  assert(bookingDitemukan, "TEST 4 GAGAL: Booking pelanggan tidak muncul pada daftar admin");
  console.log(
    "  ✓ TEST 4 BERHASIL: Booking pelanggan muncul di antrean admin:",
    bookingDitemukan.nomor_booking,
  );

  // TEST 5: Admin Menyetujui Booking
  console.log("\n[TEST 5] Admin Menyetujui Booking...");
  const bookingDisetujui = db.updateBookingStatus(booking.id_booking, "disetujui");
  assert.equal(bookingDisetujui.status_booking, "disetujui");
  console.log(
    "  ✓ TEST 5 BERHASIL: Status booking berubah menjadi:",
    bookingDisetujui.status_booking,
  );

  // TEST 6: Buat Servis dari Booking (Relasi 1 : 1)
  console.log("\n[TEST 6] Membuat Data Servis dari Booking...");
  const servis = db.createServisFromBooking({
    id_booking: booking.id_booking,
    id_pelanggan: pelanggan.id_pelanggan,
    id_kendaraan: kendaraan.id_kendaraan,
    mekanik: "Joko",
    jenis_servis: booking.jenis_servis,
    keluhan: booking.keluhan,
    hasil_pemeriksaan: "Roller CVT aus dan oli mesin sudah kotor",
    estimasi_biaya: 120000,
    estimasi_waktu: "1.5 jam",
    estimasi_selesai: "2026-09-10 11:30:00",
    biaya_jasa: 45000,
  });
  assert(servis.id_servis, "TEST 6 GAGAL: Servis tidak memiliki ID");
  assert.equal(servis.id_booking, booking.id_booking);

  // Verifikasi 1:1 constraint (tidak boleh ada servis kedua untuk booking yang sama)
  assert.throws(() => {
    db.createServisFromBooking({
      id_booking: booking.id_booking,
      id_pelanggan: pelanggan.id_pelanggan,
      id_kendaraan: kendaraan.id_kendaraan,
    });
  }, /Unique constraint violated/);
  console.log(
    "  ✓ TEST 6 BERHASIL: Servis dibuat (1 : 1 dengan booking), Nomor Servis:",
    servis.nomor_servis,
  );

  // TEST 7: Tambah Sparepart ke Servis (detail_servis & penggunaan_sparepart)
  console.log("\n[TEST 7] Menambahkan Sparepart SP-001 (Oli Mesin) ke Servis...");
  const stokAwal = db.sparepart.get("SP-001").stok_tersedia;
  const { detail, penggunaan, logStok } = db.addDetailServisAndPenggunaan(
    servis.id_servis,
    "SP-001",
    1,
    "Ganti oli mesin berkala",
  );
  assert(detail.id_detail_servis, "TEST 7 GAGAL: detail_servis tidak tersimpan");
  assert(penggunaan.id_penggunaan_sparepart, "TEST 7 GAGAL: penggunaan_sparepart tidak tersimpan");
  assert.equal(detail.harga, 48000);
  assert.equal(servis.biaya_sparepart, 48000);
  assert.equal(servis.total_biaya, 45000 + 48000); // jasa + part
  console.log("  ✓ TEST 7 BERHASIL: detail_servis & penggunaan_sparepart tersimpan!");

  // TEST 8: Verifikasi Stok Sparepart Berkurang
  console.log("\n[TEST 8] Memeriksa Pengurangan Stok Sparepart...");
  const stokAkhir = db.sparepart.get("SP-001").stok_tersedia;
  assert.equal(
    stokAkhir,
    stokAwal - 1,
    "TEST 8 GAGAL: Stok tidak berkurang sesuai jumlah penggunaan!",
  );
  console.log(`  ✓ TEST 8 BERHASIL: Stok SP-001 berkurang dari ${stokAwal} -> ${stokAkhir}`);

  // TEST 9: Verifikasi Riwayat Stok Mencatat jenis = 'keluar'
  console.log("\n[TEST 9] Memeriksa Riwayat Stok...");
  assert.equal(logStok.jenis, "keluar", "TEST 9 GAGAL: Riwayat stok bukan jenis keluar!");
  assert.equal(logStok.jumlah, 1);
  assert.equal(logStok.id_sparepart, "SP-001");
  console.log(
    `  ✓ TEST 9 BERHASIL: Riwayat stok tercatat: jenis=${logStok.jenis}, jumlah=${logStok.jumlah}, ket='${logStok.keterangan}'`,
  );

  // TEST 10: Buat Pembayaran (Relasi 1 : 1 dengan Servis)
  console.log("\n[TEST 10] Membuat Tagihan Pembayaran untuk Servis...");
  const pembayaran = db.createPembayaran({
    id_servis: servis.id_servis,
    id_pelanggan: pelanggan.id_pelanggan,
    metode_pembayaran: "transfer",
    jumlah_bayar: servis.total_biaya,
  });
  assert(pembayaran.id_pembayaran, "TEST 10 GAGAL: Pembayaran tidak memiliki ID");
  assert.equal(pembayaran.id_servis, servis.id_servis);
  assert.equal(pembayaran.jumlah_bayar, 93000);

  // Verifikasi 1:1 constraint (tidak boleh ada pembayaran kedua untuk servis yang sama)
  assert.throws(() => {
    db.createPembayaran({
      id_servis: servis.id_servis,
      id_pelanggan: pelanggan.id_pelanggan,
      metode_pembayaran: "cash",
      jumlah_bayar: servis.total_biaya,
    });
  }, /Unique constraint violated/);
  console.log(
    "  ✓ TEST 10 BERHASIL: Pembayaran terhubung 1:1 ke Servis, Nomor Transaksi:",
    pembayaran.nomor_transaksi,
  );

  // TEST 11: Upload Bukti Transfer
  console.log("\n[TEST 11] Mengunggah Bukti Pembayaran Transfer...");
  const buktiUrl = "https://storage.supabase.co/appbenk/bukti-transfer-trx-0001.png";
  const bayarUpdated = db.uploadBuktiTransfer(pembayaran.id_pembayaran, buktiUrl);
  assert.equal(bayarUpdated.bukti_pembayaran, buktiUrl);
  assert.equal(bayarUpdated.status_pembayaran, "menunggu_verifikasi");
  console.log(
    "  ✓ TEST 11 BERHASIL: Bukti pembayaran tersimpan, status:",
    bayarUpdated.status_pembayaran,
  );

  // TEST 12: Admin Verifikasi Pembayaran -> Status LUNAS
  console.log("\n[TEST 12] Admin Melakukan Verifikasi Pembayaran...");
  const hasilVerifikasi = db.verifikasiPembayaran(
    pembayaran.id_pembayaran,
    true,
    null,
    "Admin Rudi",
  );
  assert.equal(hasilVerifikasi.status_pembayaran, "lunas");
  assert.equal(hasilVerifikasi.verified_by, "Admin Rudi");
  assert(hasilVerifikasi.verified_at, "Waktu verifikasi harus tercatat");

  const servisLunas = db.servis.get(servis.id_servis);
  assert.equal(servisLunas.status_servis, "lunas");
  console.log(
    "  ✓ TEST 12 BERHASIL: Pembayaran & Servis berstatus:",
    hasilVerifikasi.status_pembayaran.toUpperCase(),
  );

  console.log("\n======================================================================");
  console.log("          SEMUA 12 ACCEPTANCE TESTS BERHASIL DENGAN SEMPURNA!         ");
  console.log("======================================================================");
} catch (err) {
  console.error("\n❌ TEST FAILED:", err);
  process.exit(1);
}
