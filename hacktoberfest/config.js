// ============================================================
//  HACKTOBERFEST CERTIFICATES — EDIT THIS FILE TO MATCH YOUR TEMPLATE
// ============================================================
// Tip: the certificate design lives in design/certificate.html.
// After changing it, re-render with `node hacktoberfest/design/render.mjs`,
// which also prints the name-line position for the values below.

window.CERT_CONFIG = {
  eventName: "Hacktoberfest 2026",
  organizer: "REIMAGINE Club",

  templateImage: "assets/certificate-template.png",

  // Final participant list (Name, Team): the team registration form plus late
  // additions. Names only: this file is public, so never add emails or phone numbers.
  participantsFile: "participants.csv",

  // Only names on the list get a certificate; everyone else sees notFoundMessage.
  restrictToList: true,
  suggestAsYouType: false, // don't reveal list names while someone is typing
  notFoundMessage: "Sorry, we couldn't find that name in the Hacktoberfest 2026 participant list. Please type your full name exactly as you registered, or contact the REIMAGINE Club team.",

  // "priya patel" / "PRIYA PATEL" -> "Priya Patel"; mixed case kept as typed.
  autoCapitalize: true,

  // x / y are fractions of the image width / height; y is the text baseline.
  name: {
    x: 0.5,
    y: 0.640,
    maxWidth: 0.46,
    fontSize: 0.05,
    fontFamily: "Abril Fatface",
    fontWeight: "400",
    color: "#1d1340",
    align: "center",
    uppercase: false,
  },

  formats: ["pdf", "png"],
};
