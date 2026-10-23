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

  // Used only when restrictToList is true.
  participantsFile: "participants.csv",

  // false = anyone can type their name and get a certificate (no list needed).
  restrictToList: false,

  // "priya patel" / "PRIYA PATEL" -> "Priya Patel"; mixed case kept as typed.
  autoCapitalize: true,

  // x / y are fractions of the image width / height; y is the text baseline.
  name: {
    x: 0.5,
    y: 0.626,
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
