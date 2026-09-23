import { createClient } from "@supabase/supabase-js";

const url = "https://oviiclcydeopilagbypq.supabase.co";
const key = "sb_publishable_7PrjkC9a5svgKbRVQ5-xfQ_VoEB8GSZ";
const supabase = createClient(url, key);

async function inspectUsers() {
  const { data: profs } = await supabase.from("profiles").select("id, full_name, email, role, id_bengkel");
  console.log("PROFILES:", profs);

  const { data: admins } = await supabase.from("admin").select("id_admin, user_id, nama, email, id_bengkel");
  console.log("ADMINS:", admins);

  const { data: owners } = await supabase.from("owner").select("id_owner, user_id, nama, email, id_bengkel");
  console.log("OWNERS:", owners);
}

inspectUsers();
