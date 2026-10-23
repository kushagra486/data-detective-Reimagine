// ============================================================
//  HACKTOBERFEST CERTIFICATES — SETTINGS
// ============================================================
// Certificates are served by Supabase. The participant list and the finished
// certificates live in a private table and a private storage bucket; the
// website asks the get-certificate function for a typed name and only gets a
// certificate back if that exact name is on the list. verify.html asks the
// verify-certificate function about a Certificate ID. Setup files are in
// hacktoberfest/supabase/.
//
// After publishing any change to the Hacktoberfest site, bump the version (e.g.
// 20261023-2 -> 20261023-3) in version.json AND in the ?v= tags and the V value in
// index.html and verify.html, so visitors' browsers load the newest files at once.

window.CERT_CONFIG = {
  eventName: "Hacktoberfest 2026",
  organizer: "REIMAGINE Club",

  // Supabase project. The publishable key is meant to be public; never put a
  // secret / service_role key in this file.
  supabaseUrl: "https://ahwtmyaqzkiekyywgyqw.supabase.co",
  supabaseKey: "sb_publishable_KPo7PQvRavvuFTakkliT8w_yGtz8MAV",

  // Shown when a typed name is not on the participant list.
  notFoundMessage: "Sorry, we couldn't find that name in the Hacktoberfest 2026 participant list. Please type your full name exactly as you registered, or contact the REIMAGINE Club team.",
};
