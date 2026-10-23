# Certificate Portal

A static website where participants search their name and download a personalised certificate (PDF or PNG). Everything is generated in the browser, so there's no server or database. It can be hosted for free on GitHub Pages, Netlify or Vercel.

## How it works

1. A participant types their name.
2. Their name is drawn onto your certificate template and a preview is shown. Names typed in all-lowercase or ALL-CAPS are capitalised properly.
3. They click **Download PDF** or **Download Image (PNG)**.

## Setup (organizers)

1. **Template:** replace `assets/certificate-template.jpg` with your blank certificate (no name on it). Export it at high resolution, e.g. 3508×2480 for A4 landscape. If the file name differs, update `templateImage` in `config.js`.
2. **Participants (optional):** by default anyone can type a name. To accept only listed names, set `restrictToList: true` in `config.js` and put the names in `participants.csv`, one per line under a `name` header. You can export this from Excel or Google Sheets as CSV.
3. **Name position:** open `calibrate.html`, click where the name should sit, and adjust the font, size and colour. Then copy the generated `name:` block into `config.js`.
4. **Font:** if you use a different Google Font, add it to the Google Fonts `<link>` in `index.html`.
5. **Theme:** change the colours at the top of `css/style.css` and the `eventName` / `organizer` in `config.js`.

## Run locally

Browsers block loading files from `file://`, so serve the folder:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy on GitHub Pages

Repo → Settings → Pages → Source: *Deploy from a branch* → Branch `main`, folder `/ (root)` → Save.
The site is published at https://kushagra486.github.io/data-detective-Reimagine/ and updates automatically (in about a minute) on every push to `main`.

## Options (`config.js`)

| Option | Meaning |
| --- | --- |
| `restrictToList` | `false` (default): anyone can type any name. `true`: only names in the CSV get a certificate, with suggestions as they type. |
| `autoCapitalize` | Turns `priya patel` / `PRIYA PATEL` into `Priya Patel`. |
| `formats` | `["pdf", "png"]`, or just one of them. |
| `name.uppercase` | Print the name in capitals. |

> Note: when `restrictToList` is on, the participant list is publicly downloadable from a static site.

## Hacktoberfest 2026 site (`hacktoberfest/`)

A second event portal for REIMAGINE Club's Hacktoberfest, served at
https://kushagra486.github.io/data-detective-Reimagine/hacktoberfest/. It reuses the shared `js/` code
and has its own `config.js`, `css/` and `assets/`.

The certificate is designed in `hacktoberfest/design/certificate.html` and has signature spaces for the
Director (BBDITM), the Head of Department (IT) and the REIMAGINE Club Coordinator. After editing the design,
re-render it with `node hacktoberfest/design/render.mjs` (needs Playwright). The script prints the name-line
position to copy into `hacktoberfest/config.js`.
