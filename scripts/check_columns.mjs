import { createClient } from "@supabase/supabase-js";

const url = "https://oviiclcydeopilagbypq.supabase.co";
const key = "sb_publishable_7PrjkC9a5svgKbRVQ5-xfQ_VoEB8GSZ";
const supabase = createClient(url, key);

async function checkColumns(tableName) {
  const { data, error } = await supabase.from(tableName).select("*").limit(1);
  if (error) {
    console.log(`[${tableName}] ERROR:`, error.message);
  } else if (data && data.length > 0) {
    const keys = Object.keys(data[0]);
    console.log(`[${tableName}] Columns:`, keys.join(", "));
    console.log(`   -> has 'workshop_id': ${keys.includes("workshop_id")}`);
    console.log(`   -> has 'id_bengkel': ${keys.includes("id_bengkel")}`);
  } else {
    // If no rows, let's try selecting specific column to see if it errors
    const resW = await supabase.from(tableName).select("workshop_id").limit(1);
    const resB = await supabase.from(tableName).select("id_bengkel").limit(1);
    console.log(`[${tableName}] Empty table. Column probe:`);
    console.log(`   -> workshop_id probe: ${resW.error ? resW.error.code : "OK"}`);
    console.log(`   -> id_bengkel probe: ${resB.error ? resB.error.code : "OK"}`);
  }
}

async function run() {
  const tables = [
    "profiles",
    "admin",
    "owner",
    "pelanggan",
    "mekanik",
    "booking_servis",
    "servis",
    "detail_servis",
    "pembayaran",
    "sparepart",
    "penggunaan_sparepart",
    "pembelian_sparepart",
    "riwayat_stok",
    "retur_sparepart",
    "supplier",
    "kendaraan",
    "bengkel"
  ];
  for (const t of tables) {
    await checkColumns(t);
  }
}

run();
