import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// Read .env
const env = readFileSync(".env", "utf8");
const getEnv = (key) => {
  const match = env.match(new RegExp(`^${key}=(.+)$`, "m"));
  return match ? match[1].trim() : null;
};

const url = getEnv("VITE_SUPABASE_URL");
const anonKey = getEnv("VITE_SUPABASE_ANON_KEY");
const serviceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

console.log("=================================================");
console.log("APPBENK SUPABASE LIVE DATABASE INSPECTION SUITE");
console.log("=================================================");
console.log("Project URL:", url);
console.log("Anon Key present:", !!anonKey);
console.log("Service Key present:", !!serviceKey);

if (!url || !anonKey) {
  console.error("❌ URL Supabase atau Anon Key tidak ditemukan di .env");
  process.exit(1);
}

const anonClient = createClient(url, anonKey);
const adminClient = serviceKey ? createClient(url, serviceKey) : null;
const client = adminClient || anonClient;

// 1. Check Tables: customer_service_tickets, customer_service_messages, system_logs
console.log("\n--- 1. CEK TABEL TERKAIT SUPER ADMIN ---");

async function checkTable(tableName) {
  try {
    const { data, error } = await client.from(tableName).select("*").limit(1);
    if (error) {
      return { exists: false, error: error.message, code: error.code };
    }
    return { exists: true, sampleCount: data ? data.length : 0 };
  } catch (err) {
    return { exists: false, error: err.message };
  }
}

const resTickets = await checkTable("customer_service_tickets");
const resMessages = await checkTable("customer_service_messages");
const resLogs = await checkTable("system_logs");

console.log("Table customer_service_tickets:", resTickets);
console.log("Table customer_service_messages:", resMessages);
console.log("Table system_logs:", resLogs);

// 2. Check Bengkel columns: paket, status, owner_nama, owner_email
console.log("\n--- 2. CEK KOLOM TABEL BENGKEL (PAKET, STATUS, OWNER) ---");
try {
  const { data: bengkelSample, error: bengkelErr } = await client
    .from("bengkel")
    .select("id_bengkel, nama_bengkel, paket, status, owner_nama, owner_email")
    .limit(3);
  if (bengkelErr) {
    console.log("Kolom baru bengkel:", { exists: false, error: bengkelErr.message });
  } else {
    console.log("Kolom baru bengkel ADA:", bengkelSample);
  }
} catch (e) {
  console.log("Error querying bengkel:", e.message);
}

// 3. Check App Role enum or profiles
console.log("\n--- 3. CEK ROLE DI PROFILES / USERS ---");
try {
  const { data: profiles, error: profErr } = await client
    .from("profiles")
    .select("id, role, full_name, email")
    .limit(20);
  if (profErr) {
    console.log("Profiles check:", { error: profErr.message });
  } else {
    console.log(`Ditemukan ${profiles.length} profiles:`);
    profiles.forEach((p) => {
      console.log(` - [${p.role}] ${p.full_name || "-"} (${p.email || "-"})`);
    });
    const superAdminUsers = profiles.filter((p) => p.role === "super_admin");
    console.log("Jumlah akun super_admin di profiles:", superAdminUsers.length);
  }
} catch (e) {
  console.log("Error querying profiles:", e.message);
}

// Check admin table
try {
  const { data: admins, error: admErr } = await client.from("admin").select("*").limit(5);
  console.log("Tabel admin:", admErr ? admErr.message : `Ada ${admins.length} record admin`);
} catch (e) {}

// Check owner table
try {
  const { data: owners, error: ownErr } = await client.from("owner").select("*").limit(5);
  console.log("Tabel owner:", ownErr ? ownErr.message : `Ada ${owners.length} record owner`);
} catch (e) {}

// 4. Check Sequence & Trigger via direct test INSERT into customer_service_tickets
console.log("\n--- 4. TEST INSERT customer_service_tickets & SEQUENCE ---");
if (resTickets.exists) {
  const testTicket = {
    user_id: "test-user-system",
    user_name: "System Tester",
    user_email: "test@appbenk.id",
    user_role: "admin",
    subjek: "Testing Sequence Auto Number",
    kategori: "Bug/Error",
    pesan: "Pesan pengujian sistem sequence tiket otomatis",
    status: "Baru",
  };
  const { data: insertedTicket, error: insErr } = await client
    .from("customer_service_tickets")
    .insert(testTicket)
    .select()
    .single();

  if (insErr) {
    console.log("Insert test ticket FAILED:", insErr.message);
  } else {
    console.log("Insert test ticket SUCCESS:", {
      id: insertedTicket.id,
      ticket_number: insertedTicket.ticket_number,
      subjek: insertedTicket.subjek,
      status: insertedTicket.status,
    });

    // Test message insertion
    const testMsg = {
      ticket_id: insertedTicket.id,
      sender_user_id: "test-superadmin-system",
      sender_role: "super_admin",
      sender_name: "Super Admin",
      message: "Halo, laporan Anda telah diterima dan sedang diproses.",
    };
    const { data: insertedMsg, error: msgErr } = await client
      .from("customer_service_messages")
      .insert(testMsg)
      .select()
      .single();

    if (msgErr) {
      console.log("Insert message test FAILED:", msgErr.message);
    } else {
      console.log("Insert message test SUCCESS:", insertedMsg);
    }

    // Cleanup test record
    await client.from("customer_service_messages").delete().eq("ticket_id", insertedTicket.id);
    await client.from("customer_service_tickets").delete().eq("id", insertedTicket.id);
    console.log("Test ticket cleaned up.");
  }
} else {
  console.log("Tabel customer_service_tickets belum ada di Supabase database.");
}

// 5. Check Fitur Lama AppBenk (booking, servis, pembayaran, sparepart, pelanggan, kendaraan)
console.log("\n--- 5. CEK FITUR LAMA APPBENK DI DATABASE ---");
const oldTables = ["pelanggan", "kendaraan", "booking_servis", "servis", "pembayaran", "sparepart"];
for (const t of oldTables) {
  const r = await checkTable(t);
  console.log(`Tabel ${t}:`, r.exists ? "✓ Aktif" : `❌ Error: ${r.error}`);
}

console.log("\n=================================================");
console.log("INSPEKSI SELESAI");
console.log("=================================================");

