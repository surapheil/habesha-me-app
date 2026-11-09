// Creates or updates app users from a JSON file (run on a trusted machine only).
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... APP_URL=https://your-app node scripts/create-users.mjs scripts/users.json
// Field users (brand_manager) sign in with the employee ID in their personal access link.
// Admin users (brand_lead, management, owner_admin) sign in with their employee ID + password.
// A random employee ID (HBX-XXXXXXXX) is generated only when none is given.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { randomInt } from "node:crypto";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, APP_URL = "http://localhost:5173" } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
const file = process.argv[2];
if (!file) throw new Error("Usage: node scripts/create-users.mjs scripts/users.json");

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
const newEmployeeId = () => "HBX-" + Array.from({ length: 8 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
const ROLES = ["brand_manager", "brand_lead", "management", "owner_admin"];
// Must match staffEmail() in App.jsx. These addresses are only internal sign-in identifiers; no email is sent.
const fieldEmail = (id) => `${id.toLowerCase()}@field.habesha.invalid`;
const staffEmail = (id) => `${id.toLowerCase()}@staff.habesha.invalid`;

const { data: brandRows, error: brandError } = await admin.from("brands").select("id, name");
if (brandError) throw brandError;
const brandId = Object.fromEntries(brandRows.map(b => [b.name, b.id]));

const { data: existing } = await admin.auth.admin.listUsers({ perPage: 1000 });
const byEmail = new Map(existing.users.map(u => [u.email?.toLowerCase(), u]));

for (const person of JSON.parse(readFileSync(file, "utf8"))) {
  if (!ROLES.includes(person.role)) throw new Error(`${person.full_name}: unknown role ${person.role}`);
  const isField = person.role === "brand_manager";
  const employeeId = (person.employee_id || newEmployeeId()).trim().toUpperCase();
  const email = (person.email || (isField ? fieldEmail(employeeId) : staffEmail(employeeId))).toLowerCase();
  if (!isField && !person.password) throw new Error(`${person.full_name}: admin users need a password.`);
  if (["brand_manager", "brand_lead"].includes(person.role) && !(person.brands || []).length) {
    console.warn(`WARNING ${person.full_name}: no brands assigned — they will not see or create any activity until brands are added.`);
  }

  let user = byEmail.get(email);
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({ email, password: person.password, email_confirm: true });
    if (error) throw new Error(`${person.full_name}: ${error.message}`);
    user = data.user;
  } else if (person.password) {
    await admin.auth.admin.updateUserById(user.id, { password: person.password });
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: user.id, full_name: person.full_name, short_name: person.short_name ?? null, initials: person.initials ?? null,
    role: person.role, active: person.active ?? true,
  });
  if (profileError) throw new Error(`${person.full_name}: ${profileError.message}`);

  await admin.from("profile_brands").delete().eq("profile_id", user.id);
  const brands = (person.brands || []).map(name => {
    if (!brandId[name]) throw new Error(`${person.full_name}: unknown brand ${name}`);
    return { profile_id: user.id, brand_id: brandId[name] };
  });
  if (brands.length) {
    const { error } = await admin.from("profile_brands").insert(brands);
    if (error) throw new Error(`${person.full_name}: ${error.message}`);
  }

  if (isField) {
    const { error } = await admin.from("field_credentials").upsert({ profile_id: user.id, employee_id: employeeId });
    if (error) throw new Error(`${person.full_name}: ${error.message}`);
    console.log(`${person.full_name}\t${employeeId}\t${APP_URL}/login/${employeeId}`);
  } else {
    console.log(`${person.full_name}\t${person.role}\t${employeeId}\t${APP_URL}/manager-login`);
  }
}