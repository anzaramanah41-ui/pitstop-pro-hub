/**
 * APPBENK — SECURE STAFF ACCOUNT PROVISIONING TOOL
 * 
 * Tool internal / server-side untuk membuat akun testing ADMIN dan OWNER secara aman
 * menggunakan Supabase Auth (bukan akun demo, melainkan Supabase Auth users nyata).
 * 
 * Penggunaan CLI:
 *   node scripts/create-staff-account.mjs --email=owner@bengkel.com --password=SecurePassword123! --name="Budi Owner" --role=owner --workshopId=bengkel-001
 *   node scripts/create-staff-account.mjs --email=admin@bengkel.com --password=SecurePassword123! --name="Joko Admin" --role=admin --workshopId=bengkel-001
 * 
 * Catatan Keamanan:
 * - Jangan hardcode password di source code.
 * - Tool ini hanya dijalankan di environment developer / server-side terpercaya.
 */

import { createClient } from "@supabase/supabase-js";

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  for (const arg of args) {
    if (arg.startsWith("--")) {
      const [key, val] = arg.slice(2).split("=");
      parsed[key] = val || true;
    }
  }
  return parsed;
}

const args = parseArgs();
const email = args.email;
const password = args.password || "Appbenk2026!Secure";
const fullName = args.name || (email ? email.split("@")[0] : "Staff Member");
const role = (args.role || "admin").toLowerCase();
const workshopId = args.workshopId || "bengkel-001";

console.log("======================================================================");
console.log("       APPBENK — SECURE INTERNAL STAFF ACCOUNT PROVISIONING           ");
console.log("======================================================================\n");

if (!email) {
  console.log("Petunjuk Penggunaan:");
  console.log("  node scripts/create-staff-account.mjs \\");
  console.log("    --email=staff@bengkel.com \\");
  console.log("    --password=KataSandiAman123! \\");
  console.log("    --name=\"Nama Staff\" \\");
  console.log("    --role=admin|owner \\");
  console.log("    --workshopId=bengkel-001|bengkel-002\n");
  console.log("Opsi 1: Jika Anda memiliki SUPABASE_SERVICE_ROLE_KEY di environment:");
  console.log("  Script akan membuat akun secara langsung melalui Supabase Admin API.\n");
  console.log("Opsi 2: Menggunakan SQL Editor di Supabase Cloud Dashboard:");
  console.log("  Jalankan fungsi berikut di SQL Editor:");
  console.log("  SELECT public.create_internal_staff_user('email_anda', 'password_anda', 'Nama', 'admin|owner', 'bengkel-001');\n");
  process.exit(0);
}

if (!["admin", "owner"].includes(role)) {
  console.error("❌ ERROR: Role harus bernilai 'admin' atau 'owner'.");
  process.exit(1);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://oviiclcydeopilagbypq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log(`Target Email     : ${email}`);
console.log(`Role Ditentukan  : ${role.toUpperCase()}`);
console.log(`Nama Lengkap     : ${fullName}`);
console.log(`Workshop Target  : ${workshopId}`);
console.log(`Supabase URL     : ${supabaseUrl}\n`);

if (serviceRoleKey) {
  console.log("Menghubungkan ke Supabase Admin Auth API...");
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  async function provisionDirectly() {
    try {
      // 1. Buat / update akun auth.users
      const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          is_internal_provisioning: true,
          internal_role: role,
          workshop_id: workshopId,
        },
      });

      if (createError) {
        console.error("❌ Gagal membuat auth user:", createError.message);
        process.exit(1);
      }

      const userId = userData.user.id;
      console.log(`✓ User Auth ID terbuat: ${userId}`);

      // 2. Upsert profile
      const { error: profError } = await adminClient.from("profiles").upsert({
        id: userId,
        full_name: fullName,
        email,
        role,
        workshop_id: workshopId,
        id_bengkel: workshopId,
      });

      if (profError) {
        console.warn("⚠ Gagal mengupdate profil:", profError.message);
      } else {
        console.log(`✓ Profil tersinkron: role=${role}, workshop=${workshopId}`);
      }

      // 3. Upsert workshop_members
      const { error: memberError } = await adminClient.from("workshop_members").upsert({
        workshop_id: workshopId,
        user_id: userId,
        role: role.toUpperCase(),
        status: "ACTIVE",
      });

      if (memberError) {
        console.warn("⚠ Gagal menambahkan ke workshop_members:", memberError.message);
      } else {
        console.log(`✓ Terdaftar di workshop_members sebagai ${role.toUpperCase()}`);
      }

      console.log("\n======================================================================");
      console.log("  AKUN STAFF TELAH DIBUAT & SIAP DIGUNAKAN DI /login DENGAN AMAN!     ");
      console.log("======================================================================");
    } catch (err) {
      console.error("❌ Terjadi exception:", err.message);
      process.exit(1);
    }
  }

  provisionDirectly();
} else {
  console.log("ℹ SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di environment lokal.");
  console.log("  Untuk keamanan maksimal tanpa mengekspos service key, jalankan query berikut");
  console.log("  di SQL Editor Supabase Cloud Dashboard (https://oviiclcydeopilagbypq.supabase.co):\n");
  console.log("----------------------------------------------------------------------");
  console.log(
    `SELECT public.create_internal_staff_user(\n  '${email}',\n  '${password}',\n  '${fullName}',\n  '${role}',\n  '${workshopId}'\n);`
  );
  console.log("----------------------------------------------------------------------\n");
  console.log("Query di atas akan secara otomatis:");
  console.log("  1. Membuat user di auth.users dengan email terkonfirmasi.");
  console.log("  2. Membuat/menyinkronkan profil di public.profiles.");
  console.log("  3. Menambahkan membership di public.workshop_members.");
  console.log("  4. Mengisolasi akses ke workshop yang dituju.");
}
