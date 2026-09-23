import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

function loadEnv() {
  const env = {};
  if (fs.existsSync('.env')) {
    const content = fs.readFileSync('.env', 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        env[key] = val;
      }
    }
  }
  return env;
}

const env = loadEnv();
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data: retur, error: errRetur } = await sb.from('retur_sparepart').select('*');
  console.log("=== RETUR SPAREPART ===");
  console.log("COUNT:", retur?.length, "ERROR:", errRetur);
  console.log("DATA:", JSON.stringify(retur, null, 2));

  const { data: riw, error: errRiw } = await sb.from('riwayat_stok').select('*').order('created_at', { ascending: false }).limit(5);
  console.log("\n=== RIWAYAT STOK ===");
  console.log("COUNT:", riw?.length, "ERROR:", errRiw);
  console.log("DATA:", JSON.stringify(riw, null, 2));

  const { data: pemb, error: errPemb } = await sb.from('pembelian_sparepart').select('*').order('created_at', { ascending: false }).limit(5);
  console.log("\n=== PEMBELIAN ===");
  console.log("COUNT:", pemb?.length, "ERROR:", errPemb);
}

check();
