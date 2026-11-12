// Data layer: maps database rows to the shape the screens already use.
const ROLE_LABELS = { brand_manager: "Brand Manager", brand_lead: "Brand Lead", management: "Management", owner_admin: "Owner/Admin" };
export const ADMIN_ROLES = ["Brand Lead", "Management", "Owner/Admin"];

const initialsOf = (name = "") => name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join("");

// Turns a Supabase / Edge Function error into a sentence the user can read.
export async function readError(error, fallback = "Something went wrong. Check your connection and try again.") {
  if (!error) return fallback;
  if (error.context && typeof error.context.json === "function") {
    try {
      const body = await error.context.json();
      if (body?.error) return body.error;
    } catch { /* fall through */ }
  }
  if (error.message && !/fetch|network/i.test(error.message)) return error.message;
  return fallback;
}

const toUser = (profile) => profile && {
  id: profile.id,
  name: profile.full_name,
  shortName: profile.short_name || profile.full_name,
  initials: profile.initials || initialsOf(profile.full_name),
  role: ROLE_LABELS[profile.role] || profile.role,
  employeeId: profile.employee_id || undefined,
  brands: profile.brands || [],
  active: profile.active,
};

const META_KEYS = ["id", "code", "ownerId", "ownerName", "status", "stage", "submittedAt", "updatedAt", "history", "decision", "_isDraft"];
const toRow = (record) => {
  const answers = { ...record };
  META_KEYS.forEach(key => delete answers[key]);
  return {
    activity_type: record.activityType,
    activity_name: record.activityName || null,
    brand: record.brand || null,
    division: Array.isArray(record.division) ? record.division : [],
    city: record.city || null,
    start_date: record.startDate || null,
    end_date: record.endDate || null,
    stage: Number.isInteger(record.stage) ? record.stage : 0,
    answers,
  };
};

const toRecord = (row) => {
  const history = (row.activity_history || [])
    .slice()
    .sort((a, b) => new Date(a.at) - new Date(b.at))
    .map(entry => ({ event: entry.event, by: entry.actor?.full_name || "", at: entry.at, comment: entry.comment || "", changes: entry.changes || null }));
  const lastDecision = [...history].reverse().find(entry => entry.event === "Approved" || entry.event === "Rejected");
  const outcome = lastDecision ? (lastDecision.event === "Approved" ? "approved" : "rejected") : (row.status === "rejected" ? "rejected" : "approved");
  return {
    ...(row.answers || {}),
    id: row.id,
    code: row.code,
    ownerId: row.owner_id,
    ownerName: row.owner?.full_name || "",
    activityType: row.activity_type,
    activityName: row.activity_name || "",
    brand: row.brand || "",
    division: row.division || [],
    city: row.city || "",
    startDate: row.start_date || "",
    endDate: row.end_date || "",
    status: row.status,
    stage: row.stage,
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
    decision: row.decided_at ? { outcome, by: row.decider?.full_name || "", at: row.decided_at, comment: row.decision_comment || "" } : null,
    history,
  };
};

const LIST_COLUMNS = "*, owner:profiles!activities_owner_id_fkey(full_name), decider:profiles!activities_decided_by_fkey(full_name)";
const DETAIL_COLUMNS = `${LIST_COLUMNS}, activity_history(event, comment, at, changes, actor:profiles(full_name))`;

export function createApi(client) {
  const fail = async (error) => { throw new Error(await readError(error)); };
  const api = {
    async getProfile() {
      const { data, error } = await client.rpc("get_my_profile");
      if (error) await fail(error);
      return toUser(data);
    },
    async listPeople() {
      const { data, error } = await client.from("profiles").select("full_name").eq("active", true).order("full_name");
      if (error) await fail(error);
      return data.map(row => row.full_name);
    },
    async listActivities() {
      const { data, error } = await client.from("activities").select(LIST_COLUMNS).order("updated_at", { ascending: false });
      if (error) await fail(error);
      return data.map(toRecord);
    },
    async getActivity(id) {
      const { data, error } = await client.from("activities").select(DETAIL_COLUMNS).eq("id", id).single();
      if (error) await fail(error);
      return toRecord(data);
    },
    // Creates the draft on first save, then updates it (drafts and rejected activities only).
    async saveDraft(record) {
      const row = toRow(record);
      const query = record.id
        ? client.from("activities").update(row).eq("id", record.id).select(LIST_COLUMNS).single()
        : client.from("activities").insert(row).select(LIST_COLUMNS).single();
      const { data, error } = await query;
      if (error) await fail(error);
      return toRecord(data);
    },
    async submit(record) {
      const saved = await api.saveDraft(record);
      const { error } = await client.rpc("submit_activity", { p_activity: saved.id });
      if (error) await fail(error);
      return api.getActivity(saved.id);
    },
    async decide(id, outcome, comment) {
      const { error } = await client.rpc("decide_activity", { p_activity: id, p_outcome: outcome, p_comment: comment || null });
      if (error) await fail(error);
      return api.getActivity(id);
    },
    async reopen(id) {
      const { error } = await client.rpc("reopen_activity", { p_activity: id });
      if (error) await fail(error);
      return api.getActivity(id);
    },
    async cancel(id) {
      const { error } = await client.rpc("cancel_activity", { p_activity: id });
      if (error) await fail(error);
      return api.getActivity(id);
    },
    // Divisions and cities from configuration (FR-203): active ones only, for the forms and filters.
    async getReferentials() {
      const [divisions, cities] = await Promise.all([
        client.from("divisions").select("id, name").eq("active", true),
        client.from("cities").select("name, division_id").eq("active", true),
      ]);
      if (divisions.error) await fail(divisions.error);
      if (cities.error) await fail(cities.error);
      const byName = (x, y) => x.localeCompare(y, undefined, { sensitivity: "base" });
      const names = Object.fromEntries(divisions.data.map(d => [d.id, d.name]));
      const map = Object.fromEntries(divisions.data.map(d => [d.name, []]));
      cities.data.forEach(c => { if (names[c.division_id]) map[names[c.division_id]].push(c.name); });
      Object.values(map).forEach(list => list.sort(byName));
      return { divisions: Object.keys(map).sort(byName), cities: map };
    },
    // Owner/Admin configuration screen: everything, including deactivated entries.
    async listConfiguration() {
      const [divisions, cities, history] = await Promise.all([
        client.from("divisions").select("id, name, active").order("name"),
        client.from("cities").select("id, name, division_id, active").order("name"),
        client.from("config_history").select("table_name, action, old_value, new_value, at, actor:profiles(full_name)").order("at", { ascending: false }).limit(15),
      ]);
      for (const result of [divisions, cities, history]) if (result.error) await fail(result.error);
      return { divisions: divisions.data, cities: cities.data, history: history.data };
    },
    async addCity(name, divisionId) {
      const { error } = await client.from("cities").insert({ name: name.trim(), division_id: divisionId });
      if (error) await fail(error.code === "23505" ? { message: "That city already exists in this division." } : error);
    },
    async updateCity(id, changes) {
      const { error } = await client.from("cities").update(changes).eq("id", id);
      if (error) await fail(error.code === "23505" ? { message: "That city already exists in this division." } : error);
    },
    async addDivision(name) {
      const { error } = await client.from("divisions").insert({ name: name.trim() });
      if (error) await fail(error.code === "23505" ? { message: "That division already exists." } : error);
    },
    async updateDivision(id, changes) {
      const { error } = await client.from("divisions").update(changes).eq("id", id);
      if (error) await fail(error.code === "23505" ? { message: "That division already exists." } : error);
    },
    async deleteDraft(id) {
      const { error } = await client.from("activities").delete().eq("id", id);
      if (error) await fail(error);
    },
  };
  return api;
}