import fs from "fs";

console.log("=== VERIFIKASI RBAC ROLE OWNER BISA AKSES SEMUA FITUR ADMIN ===");

const authContent = fs.readFileSync("src/lib/auth.tsx", "utf8");

// Parse IZIN_ROLE
const ownerIzinMatch = authContent.match(/owner:\s*\[([^\]]+)\]/);
if (!ownerIzinMatch) {
  console.error("❌ Gagal menemukan IZIN_ROLE.owner");
  process.exit(1);
}
const izinRoutes = ownerIzinMatch[1].split(",").map(s => s.trim().replace(/['"]/g, ""));
console.log("IZIN_ROLE.owner:", izinRoutes);

const bolehAkses = (pathname) => {
  return izinRoutes.some((p) => pathname === p || pathname.startsWith(p + "/"));
};

const adminRoutes = [
  "/admin/dashboard",
  "/admin/booking",
  "/admin/servis",
  "/admin/pembayaran",
  "/admin/mekanik",
  "/admin/sparepart",
  "/admin/stok",
  "/admin/laporan",
  "/admin/cs",
  "/admin/pengaturan",
];

console.log("\n1. Pengecekan Izin Akses Rute Admin:");
let allPermitted = true;
for (const r of adminRoutes) {
  const allowed = bolehAkses(r);
  console.log(`  - Akses ${r}:`, allowed ? "✅ DIIZINKAN" : "❌ DITOLAK");
  if (!allowed) allPermitted = false;
}

console.log("\n2. Pengecekan Menu Sidebar Owner di NAV_GROUPS:");
const navMatches = [...authContent.matchAll(/\{\s*to:\s*"([^"]+)",\s*label:\s*"([^"]+)"/g)];
const ownerNavSection = authContent.slice(authContent.indexOf("owner: ["));
const ownerNavSectionEnd = ownerNavSection.indexOf("];");
const ownerNavBlock = ownerNavSection.slice(0, ownerNavSectionEnd);

const ownerRoutes = [...ownerNavBlock.matchAll(/to:\s*"([^"]+)"/g)].map(m => m[1]);
console.log("Total route di menu owner:", ownerRoutes.length);

for (const r of adminRoutes) {
  const found = ownerRoutes.includes(r);
  console.log(`  - Menu ${r}:`, found ? "✅ ADA DI SIDEBAR" : "❌ TIDAK ADA");
  if (!found) allPermitted = false;
}

const ownerSpecificRoutes = [
  "/owner/dashboard",
  "/owner/servis",
  "/owner/sparepart",
  "/owner/pelanggan",
  "/owner/keuntungan",
];

console.log("\n3. Pengecekan Fitur Asli Owner:");
for (const r of ownerSpecificRoutes) {
  const found = ownerRoutes.includes(r);
  console.log(`  - Menu ${r}:`, found ? "✅ TETAP TERSEDIA" : "❌ HILANG");
  if (!found) allPermitted = false;
}

if (!allPermitted) {
  console.error("\n❌ Verifikasi Gagal!");
  process.exit(1);
}

console.log("\n======================================================================");
console.log("🎉 VERIFIKASI BERHASIL 100%! OWNER MEMILIKI AKSES LENGKAP SEMUA FITUR ADMIN");
console.log("======================================================================");
