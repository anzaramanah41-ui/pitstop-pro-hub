import { createClient } from "@supabase/supabase-js";

const url = "https://oviiclcydeopilagbypq.supabase.co";
const key = "sb_publishable_7PrjkC9a5svgKbRVQ5-xfQ_VoEB8GSZ";
const supabase = createClient(url, key);

async function test() {
  const res = await supabase.from("kendaraan").select("*").limit(1);
  console.log("kendaraan:", res.error ? res.error.message : "EXISTS, rows: " + res.data.length);
}
test();
