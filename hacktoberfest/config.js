// ============================================================
//  HACKTOBERFEST CERTIFICATES — SETTINGS
// ============================================================
// Certificates are pre-made for every name on the participant list and stored
// encrypted in certs/ (one file per accepted name); verify/ holds one record per
// Certificate ID. Only a listed name can open its certificate, so nobody else can
// get one. The blank template and the list itself are not published.
//
// After publishing any change to the Hacktoberfest site, bump the version (e.g.
// 20261023-1 -> 20261023-2) in version.json AND in the ?v= tags and the V value in
// index.html and verify.html, so visitors' browsers load the newest files at once.

window.CERT_CONFIG = {
  eventName: "Hacktoberfest 2026",
  organizer: "REIMAGINE Club",

  // Shown when a typed name is not on the participant list.
  notFoundMessage: "Sorry, we couldn't find that name in the Hacktoberfest 2026 participant list. Please type your full name exactly as you registered, or contact the REIMAGINE Club team.",
};
