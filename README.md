# Certificate Portal

A static website where participants search their name and download a personalised certificate (PDF or PNG). Everything is generated in the browser, so there's no server or database. It can be hosted for free on GitHub Pages, Netlify or Vercel.

## How it works

1. A participant types their name. Matching names from `participants.csv` are suggested as they type.
2. If the name is on the list, their name is drawn onto your certificate template and a preview is shown.
3. They click **Download PDF** or **Download Image (PNG)**.

## Setup (organizers)

1. **Template:** replace `assets/certificate-template.png` with your blank certificate (no name on it). Export it at high resolution, e.g. 3508×2480 for A4 landscape. If the file name differs, update `templateImage` in `config.js`.
2. **Participants:** put the names in `participants.csv`, one per line under a `name` header. You can export this from Excel or Google Sheets as CSV.
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

Repo → Settings → Pages → Source: *Deploy from a branch* → `main` / root. The site will be at `https://<user>.github.io/<repo>/`.

## Options (`config.js`)

| Option | Meaning |
| --- | --- |
| `restrictToList` | `true`: only names in the CSV get a certificate. `false`: anyone can type any name. |
| `formats` | `["pdf", "png"]`, or just one of them. |
| `name.uppercase` | Print the name in capitals. |

> Note: on a static site the participant list is publicly downloadable. If that's a concern, set `restrictToList: false` or use a small backend.
