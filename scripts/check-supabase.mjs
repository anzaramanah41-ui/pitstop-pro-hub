/**
 * APPBENK — Supabase Cloud Connection Checker v2
 * Kompatibel dengan format key lama (JWT) dan baru (sb_publishable_*).
 * Jalankan: node scripts/check-supabase.mjs
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// ─────────────────────────────────────────────────────────────────────
// 1. Baca kredensial dari .env
// ─────────────────────────────────────────────────────────────────────
const envPath = resolve(process.cwd(), ".env");
if (!existsSync(envPath)) {
  console.error("\n❌  File .env tidak ditemukan di root project.");
  console.error("   Buat file .env dengan isi:\n");
  console.error("   VITE_SUPABASE_URL=https://oviiclcydeopilagbypq.supabase.co");
  console.error(
    "   VITE_SUPABASE_ANON_KEY=<anon/publishable key dari Supabase → Settings → API>\n",
  );
  process.exit(1);
}

const envContent = readFileSync(envPath, "utf-8");
const getEnv = (key) => {
  const match = envContent.match(new RegExp(`^${key}=(.+)$`, "m"));
  return match ? match[1].trim().replace(/^["']|["']$/g, "") : null;
};

const BASE_URL = getEnv("VITE_SUPABASE_URL")?.replace(/\/$/, "");
const KEY = getEnv("VITE_SUPABASE_ANON_KEY");

if (!BASE_URL || !KEY) {
  console.error(
    "\n❌  VITE_SUPABASE_URL dan/atau VITE_SUPABASE_ANON_KEY tidak ada di .env\n",
  );
  process.exit(1);
}

// Deteksi format key: sb_publishable_* (baru) vs JWT eyJ... (lama)
const isNewKeyFormat = KEY.startsWith("sb_publishable_") || KEY.startsWith("sb_secret_");

// Header untuk kedua format key
const HEADERS = isNewKeyFormat
  ? {
      // Format baru Supabase (sb_publishable_*)
      "x-api-key": KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    }
  : {
      // Format lama JWT (eyJ...)
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    };

const APPBENK_TABLES = [
  "profiles",
  "pelanggan",
  "kendaraan",
  "booking_servis",
  "servis",
  "pembayaran",
  "detail_servis",
  "pembelian_sparepart",
  "penggunaan_sparepart",
  "sparepart",
  "riwayat_stok",
  "stok_opname",
  "retur_sparepart",
  "laporan_ringkasan_stok",
  "admin",
  "owner",
];

const W = 70;
const sep = "─".repeat(W);
const hdr = (t) => {
  const pad = Math.max(0, W - t.length - 2);
  console.log(`\n┌${sep}┐`);
  console.log(`│  ${t}${" ".repeat(pad)} │`);
  console.log(`└${sep}┘`);
};
const ok = (m) => console.log(`  ✅  ${m}`);
const fail = (m) => console.log(`  ❌  ${m}`);
const warn = (m) => console.log(`  ⚠️   ${m}`);
const info = (m) => console.log(`  ℹ️   ${m}`);

// ─────────────────────────────────────────────────────────────────────
// 2. CEK 1 — Koneksi dasar (gunakan /auth/v1/settings, bukan /rest/v1/)
// ─────────────────────────────────────────────────────────────────────
hdr("CEK 1 — Koneksi ke Supabase Cloud");
info(`Project URL  : ${BASE_URL}`);
info(`Anon Key     : ${KEY.slice(0, 35)}…`);
info(`Format Key   : ${isNewKeyFormat ? "Baru (sb_publishable_*)" : "Lama (JWT eyJ…)"}`);

let connOk = false;

// Coba /auth/v1/settings — endpoint publik yang tidak butuh secret key
try {
  const r = await fetch(`${BASE_URL}/auth/v1/settings`, {
    headers: { ...HEADERS, apikey: KEY }, // auth v1 masih terima apikey header
  });
  if (r.status === 200) {
    ok("Koneksi ke Supabase Auth API berhasil (HTTP 200).");
    connOk = true;
  } else if (r.status === 401 || r.status === 403) {
    // 401/403 di auth/v1/settings artinya server merespons — koneksi OK
    ok(`Server merespons (HTTP ${r.status}) — koneksi jaringan berhasil.`);
    connOk = true;
  } else {
    const body = await r.text();
    fail(`Auth endpoint HTTP ${r.status}: ${body.slice(0, 150)}`);
  }
} catch (e) {
  fail(`Tidak dapat terhubung ke Supabase: ${e.message}`);
}

// Juga coba /rest/v1/ (mungkin butuh apikey header meski key baru)
if (!connOk) {
  try {
    const r = await fetch(`${BASE_URL}/rest/v1/`, {
      headers: { ...HEADERS, apikey: KEY },
    });
    if (r.status !== 0) {
      ok(`REST API merespons (HTTP ${r.status}) — koneksi jaringan berhasil.`);
      connOk = true;
    }
  } catch (_) {
    // sudah dicatat di atas
  }
}

// ─────────────────────────────────────────────────────────────────────
// 3. CEK 2 — Keberadaan tabel (coba beberapa strategi header)
// ─────────────────────────────────────────────────────────────────────
hdr("CEK 2 — Keberadaan Tabel Database APPBENK (16 tabel)");

// Fungsi untuk cek satu tabel dengan berbagai kombinasi header
async function cekTabel(tbl) {
  // Strategi header yang dicoba secara berurutan
  const strategies = [
    // Strategi 1: Header standar sesuai format key
    { ...HEADERS, Prefer: "count=exact" },
    // Strategi 2: Selalu sertakan apikey (untuk backward compat)
    { ...HEADERS, apikey: KEY, Prefer: "count=exact" },
    // Strategi 3: Hanya Authorization Bearer
    { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Prefer: "count=exact" },
  ];

  for (const hdrs of strategies) {
    try {
      const r = await fetch(`${BASE_URL}/rest/v1/${tbl}?limit=0`, { headers: hdrs });

      if (r.status === 200 || r.status === 206) {
        const count = r.headers.get("content-range") ?? "0/*";
        return { exists: true, rls: false, count, status: r.status };
      }
      if (r.status === 401 || r.status === 403) {
        // Tabel ada, tapi RLS memblokir anon
        return { exists: true, rls: true, count: "RLS", status: r.status };
      }
      if (r.status === 404) {
        // Cek apakah ini 404 dari PostgREST (tabel tidak ada)
        // vs 404 dari proxy (endpoint tidak ditemukan)
        const body = await r.text();
        if (body.includes("relation") || body.includes("does not exist") || body === "[]" || body.trim() === "") {
          return { exists: false, status: 404, body };
        }
        // 404 lain bisa jadi masalah routing, bukan tabel
        return { exists: "unknown", status: 404, body: body.slice(0, 80) };
      }
      // Status lain — lanjut ke strategi berikutnya
    } catch (_) {
      // lanjut
    }
  }
  return { exists: false, status: 0, body: "Semua strategi koneksi gagal" };
}

const tableStatus = {};
let rlsCount = 0;
let existCount = 0;
let missingCount = 0;

for (const tbl of APPBENK_TABLES) {
  const hasil = await cekTabel(tbl);
  tableStatus[tbl] = hasil;

  if (hasil.exists === true && !hasil.rls) {
    existCount++;
    ok(`${tbl.padEnd(28)} — ada, dapat diakses  (${hasil.count})`);
  } else if (hasil.exists === true && hasil.rls) {
    existCount++;
    rlsCount++;
    ok(`${tbl.padEnd(28)} — ada  (RLS aktif — NORMAL)`);
  } else if (hasil.exists === "unknown") {
    warn(`${tbl.padEnd(28)} — tidak pasti (HTTP ${hasil.status}): ${hasil.body}`);
    missingCount++;
  } else {
    missingCount++;
    fail(`${tbl.padEnd(28)} — TIDAK DITEMUKAN (migration belum dijalankan)`);
  }
}

// ─────────────────────────────────────────────────────────────────────
// 4. CEK 3 — Status Migration
// ─────────────────────────────────────────────────────────────────────
hdr("CEK 3 — Status Migration");

if (missingCount === 0) {
  ok("Semua 16 tabel ada → migration sudah berhasil diterapkan.");
} else if (existCount === 0) {
  fail(`Tidak ada tabel yang ditemukan → migration BELUM dijalankan sama sekali.`);
} else {
  warn(`${existCount} tabel ada, ${missingCount} tabel tidak ada → migration sebagian.`);
}

// ─────────────────────────────────────────────────────────────────────
// 5. CEK 4 — RLS Status
// ─────────────────────────────────────────────────────────────────────
hdr("CEK 4 — Row Level Security (RLS)");

if (rlsCount > 0) {
  ok(`${rlsCount} / 16 tabel RLS aktif (anon diblokir) — ini konfigurasi yang BENAR.`);
  const rlsNames = Object.entries(tableStatus)
    .filter(([, s]) => s.rls)
    .map(([t]) => t);
  info(`Tabel dengan RLS: ${rlsNames.join(", ")}`);
} else if (existCount > 0) {
  warn("Tabel ada tapi tidak ada yang memblokir anon — periksa apakah RLS sudah diaktifkan.");
} else {
  info("Tidak dapat mengecek RLS karena tabel belum ada.");
}

// ─────────────────────────────────────────────────────────────────────
// 6. RINGKASAN AKHIR
// ─────────────────────────────────────────────────────────────────────
hdr("RINGKASAN AKHIR");

console.log(`
  Koneksi Supabase   : ${connOk ? "✅ Berhasil" : "❌ Gagal — periksa URL & key di .env"}
  Format Key         : ${isNewKeyFormat ? "Baru (sb_publishable_*)" : "Lama (JWT)"}
  Tabel ditemukan    : ${existCount} / ${APPBENK_TABLES.length}
  Tabel tidak ada    : ${missingCount}
  RLS aktif          : ${rlsCount} tabel
`);

if (missingCount > 0) {
  const missingList = APPBENK_TABLES.filter((t) => tableStatus[t]?.exists === false);
  if (missingList.length > 0) {
    console.log("  Tabel yang BELUM ada:");
    missingList.forEach((t) => console.log(`    - ${t}`));
  }
  console.log(`
  ════════════════════════════════════════════════════════════
  📌  LANGKAH PERBAIKAN — Jalankan Migration SQL:

    1. Buka:
       https://supabase.com/dashboard/project/oviiclcydeopilagbypq/sql/new

    2. Salin SELURUH isi file:
       supabase/migrations/20260904_appbenk_master.sql

    3. Paste ke SQL Editor lalu klik RUN

    ⚠️  Semua perintah menggunakan CREATE ... IF NOT EXISTS
       sehingga AMAN dijalankan berulang kali.
  ════════════════════════════════════════════════════════════
`);
} else {
  console.log(
    "  🎉  Semua tabel APPBENK ada & migration berhasil diterapkan!\n",
  );
  console.log("  Langkah berikutnya:");
  console.log("    → Pastikan .env sudah berisi VITE_SUPABASE_ANON_KEY yang benar");
  console.log("    → Jalankan: npm run dev\n");
}
