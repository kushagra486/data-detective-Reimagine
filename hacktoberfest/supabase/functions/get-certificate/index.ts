// get-certificate — returns a Hacktoberfest certificate only for a name on the list.
//
// POST { "name": "Priya Sharma" }
//   200 { name, team, certificateId, url }   url = signed link to the JPG, valid 5 minutes
//   404 { error: "not_found" }               name is not on the participant list
//   429 { error: "too_many_requests" }       too many names not on the list from this visitor
//
// Deploy with JWT verification OFF (the website calls it without logging in).
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const ALLOWED_ORIGINS = [
  "https://kushagra486.github.io",
  "http://localhost:8765",
];
const BUCKET = "hacktoberfest-certificates";
// Only failed lookups (names not on the list) count, so a whole class downloading
// over one college Wi-Fi connection is never blocked, but guessing names is.
const MAX_MISSES = 40;           // per visitor ...
const WINDOW_MINUTES = 10;       // ... in this many minutes

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

function cors(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info",
    "Vary": "Origin",
  };
}

function reply(req: Request, status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(req), "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

// Same matching rule as the database's name_key column: lower-case, single spaces.
const nameKey = (s: string) => s.normalize("NFC").replace(/\s+/g, " ").trim().toLowerCase();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(req) });
  if (req.method !== "POST") return reply(req, 405, { error: "method_not_allowed" });

  let name = "";
  try {
    name = String((await req.json())?.name ?? "");
  } catch {
    return reply(req, 400, { error: "bad_request" });
  }
  const key = nameKey(name);
  if (key.length < 2 || key.length > 80) return reply(req, 404, { error: "not_found" });

  // Rate limit by visitor IP so nobody can try thousands of names.
  const client = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  const since = new Date(Date.now() - WINDOW_MINUTES * 60_000).toISOString();
  const { count } = await db.from("hacktoberfest_lookups")
    .select("id", { count: "exact", head: true })
    .eq("client", client).gte("created_at", since);
  if ((count ?? 0) >= MAX_MISSES) return reply(req, 429, { error: "too_many_requests" });

  const { data: person, error } = await db.from("hacktoberfest_participants")
    .select("id, name, team, certificate_id, revoked, first_downloaded_at, download_count")
    .eq("name_key", key).maybeSingle();
  if (error) return reply(req, 500, { error: "server_error" });
  if (!person || person.revoked) {
    await db.from("hacktoberfest_lookups").insert({ client }); // remember the miss
    return reply(req, 404, { error: "not_found" });
  }

  const { data: signed, error: signError } = await db.storage.from(BUCKET)
    .createSignedUrl(`${person.certificate_id}.jpg`, 300);
  if (signError || !signed) return reply(req, 500, { error: "certificate_missing" });

  const now = new Date().toISOString();
  await db.from("hacktoberfest_participants").update({
    first_downloaded_at: person.first_downloaded_at ?? now,
    last_downloaded_at: now,
    download_count: person.download_count + 1,
  }).eq("id", person.id);

  return reply(req, 200, {
    name: person.name,
    team: person.team,
    certificateId: person.certificate_id,
    url: signed.signedUrl,
  });
});
