import { createClient } from "@supabase/supabase-js";

const url = "https://oviiclcydeopilagbypq.supabase.co";
const key = "sb_publishable_7PrjkC9a5svgKbRVQ5-xfQ_VoEB8GSZ";
const supabase = createClient(url, key);

async function check() {
  console.log("--- 1. Querying workshop_payment_accounts ---");
  const accs = await supabase.from("workshop_payment_accounts").select("*");
  console.log("Account Result:", {
    error: accs.error ? { code: accs.error.code, message: accs.error.message } : null,
    dataCount: accs.data ? accs.data.length : 0,
    data: accs.data
  });

  console.log("--- 2. Checking Storage Buckets ---");
  const buckets = await supabase.storage.listBuckets();
  console.log("Buckets:", buckets);
}

check().catch(console.error);

