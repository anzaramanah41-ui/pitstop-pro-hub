import { createClient } from "@supabase/supabase-js";

const url = "https://oviiclcydeopilagbypq.supabase.co";
const key = "sb_publishable_7PrjkC9a5svgKbRVQ5-xfQ_VoEB8GSZ";
const supabase = createClient(url, key);

async function test() {
  const res = await supabase.from("workshops").select("*", { count: "exact", head: true });
  console.log("HEAD test for workshops:", res);
}
test();
