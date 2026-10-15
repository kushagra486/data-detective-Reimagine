// ============================================================
//  CERTIFICATE PORTAL — EDIT THIS FILE TO MATCH YOUR TEMPLATE
// ============================================================
// Tip: open calibrate.html in the browser to pick the name
// position visually, then paste the generated values below.

window.CERT_CONFIG = {
  // Event details shown on the website
  eventName: "Data Detective",
  organizer: "REIMAGINE",

  // The blank certificate image (PNG or JPG). Higher resolution = sharper download.
  templateImage: "assets/certificate-template.jpg",

  // List of participants, used only when restrictToList is true
  // (one name per line, or a CSV with a "name" column).
  participantsFile: "participants.csv",

  // false = anyone can type their name and get a certificate (no list needed).
  // true  = only names in the participants file are accepted.
  restrictToList: false,

  // Fix capitalisation of names typed all-lowercase or ALL-CAPS
  // ("priya patel" -> "Priya Patel"). Mixed-case names are kept as typed.
  autoCapitalize: true,

  // Where and how the name is printed on the template.
  // x / y are fractions of the image width / height (0.5 = center).
  // y is the text baseline (the line the letters sit on).
  name: {
    x: 0.5,
    y: 0.643,
    maxWidth: 0.54,         // name shrinks to fit within this fraction of the width
    fontSize: 0.047,        // fraction of image height
    fontFamily: "Cinzel",   // any Google Font loaded in index.html
    fontWeight: "700",
    color: "#13295b",
    align: "center",        // "left" | "center" | "right"
    uppercase: false,
  },

  // Download formats offered to participants
  formats: ["pdf", "png"],
};
