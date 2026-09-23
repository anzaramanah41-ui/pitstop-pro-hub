import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// Read env
const env = readFileSync(".env", "utf8");
const getEnv = (key) => {
  const match = env.match(new RegExp(`^${key}=(.+)$`, "m"));
  return match ? match[1].trim() : null;
};

const url = getEnv("VITE_SUPABASE_URL");
const anonKey = getEnv("VITE_SUPABASE_ANON_KEY");
const serviceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

if (!url || !anonKey) {
  console.error("❌ VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY tidak ditemukan di .env");
  process.exit(1);
}

console.log("Supabase URL:", url);
console.log("Anon Key exists:", !!anonKey);
console.log("Service Key exists:", !!serviceKey);

const anonClient = createClient(url, anonKey);
const serviceClient = serviceKey ? createClient(url, serviceKey) : null;

// Test 1: Baca tabel
console.log("\n=== TEST 1: Baca tabel workshop_payment_accounts ===");
const { data: tableData, error: tableError } = await anonClient
  .from("workshop_payment_accounts")
  .select("*")
  .limit(5);
console.log("Data:", tableData);
console.log("Error:", tableError);

// Test 2: List buckets
console.log("\n=== TEST 2: List Storage Buckets ===");
const client = serviceClient || anonClient;
const { data: buckets, error: bucketsError } = await client.storage.listBuckets();
console.log("Buckets:", buckets);
console.log("Error:", bucketsError);

// Test 3: Coba INSERT manual
console.log("\n=== TEST 3: Test INSERT ke tabel ===");
const testItem = {
  id: crypto.randomUUID(),
  workshop_id: "test-bengkel-001",
  id_bengkel: "test-bengkel-001",
  account_type: "qris",
  provider: "MANUAL",
  provider_account_id: "qris-test",
  qr_image_url: "data:image/png;base64,TEST123",
  display_name: "QRIS Test",
  is_active: true,
  status: "active",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const { data: insertData, error: insertError } = await anonClient
  .from("workshop_payment_accounts")
  .insert(testItem)
  .select()
  .single();
console.log("Insert result:", insertData);
console.log("Insert error:", insertError);

// Test 4: Baca kembali
if (!insertError) {
  console.log("\n=== TEST 4: Baca kembali setelah insert ===");
  const { data: readBack, error: readErr } = await anonClient
    .from("workshop_payment_accounts")
    .select("*")
    .eq("workshop_id", "test-bengkel-001");
  console.log("Read back (anon):", readBack);
  console.log("Read error:", readErr);

  // Hapus test data
  await anonClient.from("workshop_payment_accounts").delete().eq("workshop_id", "test-bengkel-001");
  console.log("Test data cleaned up.");
}

// Test 5: Coba buat bucket via SQL
if (serviceClient) {
  console.log("\n=== TEST 5: Buat bucket payment-assets via service key ===");
  const { data: bucketCreate, error: bucketErr } = await serviceClient.storage.createBucket("payment-assets", {
    public: true,
    fileSizeLimit: 10485760, // 10MB
  });
  console.log("Bucket create result:", bucketCreate);
  console.log("Bucket create error:", bucketErr);
}

