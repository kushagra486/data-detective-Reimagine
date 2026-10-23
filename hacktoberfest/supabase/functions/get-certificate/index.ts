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
// Limit (in SQL): 40 wrong names per visitor per 10 minutes. Correct names never count,
// so a whole class downloading over one college Wi-Fi connection is never blocked.

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(req) });
  if (req.method !== "POST") return reply(req, 405, { error: "method_not_allowed" });

  let name = "";
  try {
    name = String((await req.json())?.name ?? "").normalize("NFC");
  } catch {
    return reply(req, 400, { error: "bad_request" });
  }

  // The name check runs in SQL (public.hacktoberfest_claim): only an exact listed name
  // (case and extra spaces ignored) returns a row. Wrong names are counted per visitor
  // IP so nobody can try thousands of names.
  const client = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  const { data, error } = await db.rpc("hacktoberfest_claim", { p_name: name, p_client: client });
  if (error) return reply(req, 500, { error: "server_error" });
  const person = data?.[0];
  if (person?.status === "rate_limited") return reply(req, 429, { error: "too_many_requests" });
  if (person?.status !== "ok") return reply(req, 404, { error: "not_found" });

  const { data: signed, error: signError } = await db.storage.from(BUCKET)
    .createSignedUrl(`${person.certificate_id}.jpg`, 300);
  if (signError || !signed) return reply(req, 500, { error: "certificate_missing" });

  return reply(req, 200, {
    name: person.name,
    team: person.team,
    certificateId: person.certificate_id,
    url: signed.signedUrl,
  });
});
