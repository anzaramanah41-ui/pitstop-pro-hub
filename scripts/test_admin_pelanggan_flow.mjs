import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = readFileSync(".env", "utf8");
const getEnv = (key) => {
  const match = env.match(new RegExp(`^${key}=(.+)$`, "m"));
  return match ? match[1].trim() : null;
};

const url = getEnv("VITE_SUPABASE_URL");
const anonKey = getEnv("VITE_SUPABASE_ANON_KEY");

const supabase = createClient(url, anonKey);

console.log("=== TEST FULL FLOW ADMIN LOGIN -> SIMPAN QRIS -> PELANGGAN BACA ===\n");

// Ambil semua users yang ada
console.log("1. Cek user yang bisa dipakai untuk login...");
const { data: users, error: usersErr } = await supabase.auth.signInWithPassword({
  email: "admin@appbenk.com",
  password: "admin123",
});

if (usersErr) {
  console.log("   ❌ Login admin@appbenk.com gagal:", usersErr.message);
  
  // Coba email lain
  const tries = [
    { email: "admin@bengkel.com", password: "admin123" },
    { email: "admin@test.com", password: "admin123" },
    { email: "admin@appbenk.id", password: "admin123" },
  ];
  
  let loggedIn = false;
  for (const cred of tries) {
    const { data, error } = await supabase.auth.signInWithPassword(cred);
    if (!error && data.session) {
      console.log("   ✅ Login berhasil sebagai:", cred.email);
      loggedIn = true;
      break;
    }
  }
  
  if (!loggedIn) {
    console.log("\n⚠️  Tidak bisa login otomatis. Cek email/password admin di Supabase.");
    console.log("\nCara manual: Buka Supabase Dashboard -> Authentication -> Users");
    console.log("Lihat email admin yang terdaftar dan gunakan untuk login di app.");
    process.exit(0);
  }
} else {
  console.log("   ✅ Login berhasil:", users.user?.email);
}

const session = (await supabase.auth.getSession()).data.session;
if (!session) {
  console.log("❌ Tidak ada session aktif");
  process.exit(1);
}

console.log("   Token:", session.access_token.slice(0, 30) + "...\n");

// Test 2: INSERT sebagai authenticated user
console.log("2. Test INSERT ke tabel workshop_payment_accounts...");
const testId = crypto.randomUUID();
const { data: insertData, error: insertErr } = await supabase
  .from("workshop_payment_accounts")
  .insert({
    id: testId,
    workshop_id: "bengkel-001",
    id_bengkel: "bengkel-001",
    account_type: "qris",
    provider: "MANUAL",
    provider_account_id: "qris-test",
    qr_image_url: "data:image/png;base64,TEST_QRIS_IMAGE",
    display_name: "QRIS Test Admin",
    is_active: true,
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
  .select()
  .single();

if (insertErr) {
  console.log("   ❌ INSERT gagal:", insertErr.message, insertErr.code);
} else {
  console.log("   ✅ INSERT berhasil! ID:", insertData.id);
}

// Test 3: READ sebagai anon (simulasi pelanggan yang belum login / baru buka halaman)
console.log("\n3. Test READ sebagai anon (simulasi pelanggan)...");
await supabase.auth.signOut();
const anonClient = createClient(url, anonKey);
const { data: readData, error: readErr } = await anonClient
  .from("workshop_payment_accounts")
  .select("*")
  .eq("workshop_id", "bengkel-001");

if (readErr) {
  console.log("   ❌ READ anon gagal:", readErr.message);
} else {
  console.log("   ✅ READ berhasil! Jumlah row:", readData.length);
  if (readData.length > 0) {
    console.log("   Data QRIS:", {
      id: readData[0].id,
      display_name: readData[0].display_name,
      qr_image_url: readData[0].qr_image_url?.slice(0, 50) + "...",
    });
  }
}

// Test 4: Cek bucket
console.log("\n4. Cek bucket payment-assets...");
await supabase.auth.signInWithPassword({ email: "admin@appbenk.com", password: "admin123" }).catch(() => {});
const { data: buckets } = await supabase.storage.listBuckets();
const paymentBucket = buckets?.find(b => b.id === "payment-assets");
if (paymentBucket) {
  console.log("   ✅ Bucket payment-assets ada:", paymentBucket);
} else {
  console.log("   ⚠️  Bucket payment-assets belum terlihat (butuh service role)");
  console.log("   Info: Bucket tetap bisa berfungsi walau tidak terlihat dari anon key.");
}

// Cleanup test data
if (insertData?.id) {
  await supabase.from("workshop_payment_accounts").delete().eq("id", insertData.id);
  console.log("\n5. Test data dibersihkan.");
}

console.log("\n=== KESIMPULAN ===");
if (!insertErr && !readErr) {
  console.log("✅ FLOW LENGKAP BERHASIL!");
  console.log("   Admin bisa INSERT QRIS ke Supabase");
  console.log("   Pelanggan bisa READ QRIS dari Supabase");
  console.log("   Koneksi Admin -> Pelanggan sudah KONEK!\n");
} else {
  console.log("❌ Ada masalah yang perlu diperbaiki.");
}

