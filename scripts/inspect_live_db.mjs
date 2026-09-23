import { createClient } from "@supabase/supabase-js";

const url = "https://oviiclcydeopilagbypq.supabase.co";
const key = "sb_publishable_7PrjkC9a5svgKbRVQ5-xfQ_VoEB8GSZ";

const supabase = createClient(url, key);

async function inspectTable(tableName) {
  const res = await supabase.from(tableName).select("*").limit(1);
  console.log(`Table '${tableName}':`, {
    error: res.error ? { message: res.error.message, code: res.error.code, details: res.error.details, hint: res.error.hint } : null,
    hasData: Array.isArray(res.data),
    dataLength: res.data ? res.data.length : 0,
    sample: res.data ? res.data[0] : null
  });
}

async function run() {
  const tables = [
    "workshops",
    "workshop_members",
    "workshop_payment_accounts",
    "notification_logs",
    "stok_opname",
    "bengkel",
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
    "laporan_ringkasan_stok"
  ];

  for (const t of tables) {
    await inspectTable(t);
  }
}

run();
