import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

const envPath = resolve(process.cwd(), ".env");
const envContent = readFileSync(envPath, "utf-8");
const getEnv = (key) => {
  const match = envContent.match(new RegExp(`^${key}=(.+)$`, "m"));
  return match ? match[1].trim().replace(/^["']|["']$/g, "") : null;
};

const URL = getEnv("VITE_SUPABASE_URL");
const KEY = getEnv("VITE_SUPABASE_ANON_KEY");

console.log("Checking Supabase Auth with:");
console.log("URL:", URL);
console.log("Key format:", KEY?.startsWith("sb_publishable_") ? "sb_publishable_*" : "JWT/other");

const supabase = createClient(URL, KEY, {
  auth: { persistSession: false },
});

async function run() {
  const testEmail = `test_audit_${Date.now()}@example.com`;
  const testPass = "Password123!";

  console.log("\n1. Testing signUp with:", testEmail);
  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email: testEmail,
    password: testPass,
    options: {
      data: {
        full_name: "Audit User Test",
        phone: "081234567890",
      },
    },
  });

  if (signUpErr) {
    console.error("❌ signUp error:", signUpErr.message, "Status:", signUpErr.status);
  } else {
    console.log("✅ signUp success:", {
      userId: signUpData.user?.id,
      identities: signUpData.user?.identities?.length,
      session: !!signUpData.session,
    });
  }

  console.log("\n2. Testing signIn with password immediately...");
  const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPass,
  });

  if (signInErr) {
    console.error("❌ signIn error:", signInErr.message, "(Status:", signInErr.status, ")");
  } else {
    console.log("✅ signIn success! User:", signInData.user.id);
  }

  if (signUpData?.user?.id) {
    console.log("\n3. Testing profile query for user:", signUpData.user.id);
    const { data: prof, error: profErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", signUpData.user.id)
      .maybeSingle();

    if (profErr) {
      console.error("❌ profile query error:", profErr);
    } else {
      console.log("✅ profile result:", prof);
    }
  }
}

run().catch(console.error);
