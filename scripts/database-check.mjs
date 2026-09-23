import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL || "https://oviiclcydeopilagbypq.supabase.co";
const key = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_7PrjkC9a5svgKbRVQ5-xfQ_VoEB8GSZ";

const supabase = createClient(url, key);

console.log("======================================================================");
console.log("            APPBENK — SUPABASE CLOUD DATABASE CHECKS                  ");
console.log("======================================================================\n");
console.log(`Endpoint: ${url}\n`);

const tablesToCheck = [
  "bengkel",
  "workshops",
  "workshop_members",
  "workshop_payment_accounts",
  "notification_logs",
  "profiles",
  "pelanggan",
  "kendaraan",
  "mekanik",
  "supplier",
  "booking_servis",
  "servis",
  "detail_servis",
  "pembayaran",
  "sparepart",
  "penggunaan_sparepart",
  "pembelian_sparepart",
  "riwayat_stok",
  "stok_opname",
  "retur_sparepart",
  "admin",
  "owner",
  "laporan_ringkasan_stok",
];

async function runDatabaseChecks() {
  const results = [];

  for (const table of tablesToCheck) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select("*", { count: "exact" })
        .limit(1);

      if (error) {
        // Status PGRST205 or 42P01 means table does not exist yet on cloud before migration is executed
        results.push({
          table,
          status: error.code === "PGRST205" || error.code === "42P01" || error.message.includes("does not exist") || error.message.includes("schema cache")
            ? "MIGRATION_PENDING"
            : `ERROR: ${error.message} (${error.code})`,
          count: null,
        });
      } else {
        results.push({
          table,
          status: "ONLINE",
          count: count ?? 0,
        });
      }
    } catch (err) {
      results.push({
        table,
        status: `EXCEPTION: ${err.message}`,
        count: null,
      });
    }
  }

  console.log("Table Status Overview:");
  console.log("----------------------------------------------------------------------");
  console.log(
    "TABLE".padEnd(30) + "STATUS".padEnd(25) + "ROWS".padStart(10)
  );
  console.log("----------------------------------------------------------------------");

  for (const r of results) {
    console.log(
      r.table.padEnd(30) +
      r.status.padEnd(25) +
      (r.count !== null ? String(r.count) : "-").padStart(10)
    );
  }

  console.log("----------------------------------------------------------------------\n");

  // Summary
  const online = results.filter((r) => r.status === "ONLINE");
  const pending = results.filter((r) => r.status === "MIGRATION_PENDING");

  console.log(`✓ Active tables on Supabase: ${online.length}`);
  if (pending.length > 0) {
    console.log(`ℹ Tables pending DDL execution: ${pending.length} (${pending.map(p => p.table).join(", ")})`);
    console.log(`  -> Execute supabase/EXECUTE_MULTITENANT_MIGRATION.sql in Supabase SQL Editor to apply.`);
  }

  console.log("\n======================================================================");
  console.log("                     DATABASE CHECKS COMPLETED                        ");
  console.log("======================================================================");
}

runDatabaseChecks();
