// Field app sign-in (FR-105-001): the access link carries the employee ID.
// The function checks the ID with the service role, then returns a one-time token
// that the app exchanges for a normal Supabase session (auth.verifyOtp, type "email").
import { createClient } from "jsr:@supabase/supabase-js@2";

const MAX_FAILURES = 10; // per IP
const WINDOW_MINUTES = 15;

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("APP_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const reply = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return reply(405, { error: "Method not allowed." });

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";

  // Rate limit failed attempts per IP.
  const since = new Date(Date.now() - WINDOW_MINUTES * 60_000).toISOString();
  const { count } = await admin.from("login_attempts").select("id", { count: "exact", head: true })
    .eq("ip", ip).eq("success", false).gte("at", since);
  if ((count ?? 0) >= MAX_FAILURES) {
    return reply(429, { error: `Too many attempts. Try again in ${WINDOW_MINUTES} minutes.` });
  }

  let employeeId = "";
  try {
    employeeId = String((await req.json()).employeeId ?? "").trim().toUpperCase();
  } catch {
    return reply(400, { error: "Enter your employee ID." });
  }
  if (!employeeId) return reply(400, { error: "Enter your employee ID." });

  const fail = async (status: number, error: string) => {
    await admin.from("login_attempts").insert({ ip, success: false });
    return reply(status, { error });
  };

  const { data: credential } = await admin.from("field_credentials")
    .select("profile_id, profiles(active)").eq("employee_id", employeeId).maybeSingle();
  if (!credential) return fail(401, "We don’t recognise this employee ID. Check your access link or contact your manager.");
  // deno-lint-ignore no-explicit-any
  if (!(credential as any).profiles?.active) return fail(403, "Your account is inactive. Contact your manager.");

  const { data: userData, error: userError } = await admin.auth.admin.getUserById(credential.profile_id);
  if (userError || !userData.user?.email) return fail(500, "Sign-in is unavailable. Contact your manager.");

  const { data: link, error: linkError } = await admin.auth.admin.generateLink({ type: "magiclink", email: userData.user.email });
  if (linkError || !link.properties?.hashed_token) return fail(500, "Sign-in is unavailable. Contact your manager.");

  await admin.from("login_attempts").insert({ ip, success: true });
  return reply(200, { token_hash: link.properties.hashed_token });
});