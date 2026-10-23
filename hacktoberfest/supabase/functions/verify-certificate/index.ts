// verify-certificate — confirms a Hacktoberfest certificate by its Certificate ID.
//
// GET ?id=HF26-XXXX-XXXX
//   200 { valid: true,  name, team, certificateId, event }
//   200 { valid: false, revoked: true, certificateId }       certificate was cancelled
//   404 { valid: false }                                       no such certificate
//
// Deploy with JWT verification OFF. Also used by the weekly keep-awake ping.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const ALLOWED_ORIGINS = [
  "https://kushagra486.github.io",
  "http://localhost:8765",
];
const EVENT = "Hacktoberfest 2026 — REIMAGINE Club, BBDITM Lucknow";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

function cors(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "GET, OPTIONS",
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

// "hf26 r4eg kmzf" / "HF26R4EGKMZF" -> "HF26-R4EG-KMZF"
function cleanId(raw: string): string {
  const s = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return s.length === 12 ? `${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8)}` : raw.trim().toUpperCase();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });
  if (req.method !== "GET") return reply(req, 405, { error: "method_not_allowed" });

  const id = cleanId(new URL(req.url).searchParams.get("id") ?? "");
  if (!/^HF26-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(id)) return reply(req, 404, { valid: false });

  const { data: cert, error } = await db.from("hacktoberfest_participants")
    .select("name, team, certificate_id, revoked")
    .eq("certificate_id", id).maybeSingle();
  if (error) return reply(req, 500, { error: "server_error" });
  if (!cert) return reply(req, 404, { valid: false });
  if (cert.revoked) return reply(req, 200, { valid: false, revoked: true, certificateId: cert.certificate_id });

  return reply(req, 200, {
    valid: true,
    name: cert.name,
    team: cert.team,
    certificateId: cert.certificate_id,
    event: EVENT,
  });
});
