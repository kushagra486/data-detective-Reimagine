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

  // Participant lists, checked only when restrictToList is true. Each CSV can be
  // a plain list of names, an MLH export (First Name / Last Name columns) or a
  // team sheet (Team Leader / Member 1 / Member 2 ... columns). Names only: these
  // files are public on a static site, so never include emails or phone numbers.
  participantsFile: ["participants-mlh.csv", "participants-teams.csv"],

  // true = only names on the lists above get a certificate; others see notFoundMessage.
  // Switched on once the participant lists are added.
  restrictToList: false,
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
