(function () {
  const cfg = window.CERT_CONFIG;
  const $ = (id) => document.getElementById(id);

  const form = $("search-form");
  const input = $("name-input");
  const suggestions = $("suggestions");
  const message = $("message");
  const result = $("result");
  const canvas = $("preview");
  const resultName = $("result-name");

  let participants = [];
  let currentName = null;

  const normalize = (s) =>
    s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

  // Columns that hold a person's name: "Name", "Full Name", "Participant",
  // "Member 1", "Team Member 2 Name", "Leader", ... (team-name columns are skipped).
  const NAME_COL = /^(name|full ?name|participant( ?name)?|student( ?name)?|attendee( ?name)?|(team ?)?member ?\d*( ?name)?|(team ?)?lead(er)?( ?name)?)$/;

  function parseParticipants(text) {
    const rows = text.split(/\r?\n/).filter((l) => l.trim()).map(splitCSV);
    if (!rows.length) return [];
    const header = rows[0].map((h) => h.toLowerCase().replace(/[_\-.#:]+/g, " ").replace(/\s+/g, " ").trim());
    const first = header.findIndex((h) => /^first ?name$/.test(h));
    const last = header.findIndex((h) => /^(last ?name|surname)$/.test(h));
    const cols = header.map((h, i) => (NAME_COL.test(h) ? i : -1)).filter((i) => i >= 0);

    let body = rows.slice(1);
    let pick;
    if (first >= 0) pick = (r) => [`${r[first] || ""} ${last >= 0 ? r[last] || "" : ""}`];
    else if (cols.length) pick = (r) => cols.map((i) => r[i]);
    else { body = rows; pick = (r) => [r[0]]; } // no header: one name per line

    const names = [];
    for (const row of body) {
      for (const raw of pick(row)) {
        const name = (raw || "").replace(/\s+/g, " ").trim();
        if (name) names.push(name);
      }
    }
    return names;
  }

  function uniqueNames(list) {
    const seen = new Set();
    return list.filter((n) => { const k = normalize(n); if (seen.has(k)) return false; seen.add(k); return true; });
  }

  function splitCSV(line) {
    const out = []; let cur = ""; let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (q) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') q = false;
        else cur += ch;
      } else if (ch === '"') q = true;
      else if (ch === ",") { out.push(cur); cur = ""; }
      else cur += ch;
    }
    out.push(cur);
    return out;
  }

  function tidyName(name) {
    if (!cfg.autoCapitalize) return name;
    if (name !== name.toLowerCase() && name !== name.toUpperCase()) return name;
    return name.toLowerCase().replace(/(^|[\s\-'’.])(\p{L})/gu, (m, sep, ch) => sep + ch.toUpperCase());
  }

  function setMessage(text, kind) {
    message.textContent = text || "";
    message.className = "message" + (kind ? " " + kind : "");
  }

  function findMatches(query) {
    const q = normalize(query);
    if (q.length < 2) return [];
    const parts = q.split(" ");
    return participants
      .filter((p) => { const n = normalize(p); return parts.every((w) => n.includes(w)); })
      .slice(0, 6);
  }

  function showSuggestions(list) {
    suggestions.innerHTML = "";
    if (!list.length) { suggestions.hidden = true; input.setAttribute("aria-expanded", "false"); return; }
    for (const name of list) {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      li.textContent = name;
      li.addEventListener("mousedown", (e) => { e.preventDefault(); input.value = name; showSuggestions([]); generate(name); });
      suggestions.appendChild(li);
    }
    suggestions.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }

  async function generate(name) {
    setMessage("Preparing your certificate…");
    try {
      await window.Certificate.render(canvas, name, cfg);
      currentName = name;
      resultName.textContent = name;
      result.hidden = false;
      setMessage("");
      result.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      console.error(err);
      setMessage("Sorry, something went wrong while creating the certificate.", "error");
    }
  }

  input.addEventListener("input", () => {
    if (cfg.restrictToList && cfg.suggestAsYouType !== false) showSuggestions(findMatches(input.value));
  });
  input.addEventListener("blur", () => setTimeout(() => showSuggestions([]), 100));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    showSuggestions([]);
    const typed = input.value.replace(/\s+/g, " ").trim();
    if (!typed) { setMessage("Please enter your name.", "error"); return; }

    if (!cfg.restrictToList) { generate(tidyName(typed)); return; }

    const exact = participants.find((p) => normalize(p) === normalize(typed));
    if (exact) { generate(exact); return; }

    result.hidden = true;
    // In strict mode only hint at close matches for a full name, so the list can't be browsed.
    const strict = cfg.suggestAsYouType === false;
    const close = strict && normalize(typed).split(" ").length < 2 ? [] : findMatches(typed);
    if (close.length) {
      setMessage("No exact match. Did you mean one of these?", "warn");
      showSuggestions(close);
    } else {
      setMessage(cfg.notFoundMessage || "We couldn't find that name in the participant list. Please check the spelling or contact the organizers.", "error");
    }
  });

  $("download-pdf").addEventListener("click", () => currentName && window.Certificate.downloadPDF(canvas, currentName));
  $("download-png").addEventListener("click", () => currentName && window.Certificate.downloadPNG(canvas, currentName));
  if (!cfg.formats.includes("pdf")) $("download-pdf").hidden = true;
  if (!cfg.formats.includes("png")) $("download-png").hidden = true;

  document.querySelectorAll("[data-event-name]").forEach((el) => (el.textContent = cfg.eventName));
  document.querySelectorAll("[data-organizer]").forEach((el) => (el.textContent = cfg.organizer));
  document.title = "Certificates · " + cfg.eventName;
  if (!cfg.restrictToList) form.querySelector("button[type=submit]").textContent = "Get certificate";

  // Warm up the template + font so the first preview is fast.
  window.Certificate.loadImage(cfg.templateImage).catch(() => {});

  if (cfg.restrictToList) {
    const files = [].concat(cfg.participantsFile);
    Promise.all(files.map((f) =>
      fetch(f, { cache: "no-cache" }).then((r) => { if (!r.ok) throw new Error(f + ": " + r.status); return r.text(); })
    ))
      .then((texts) => { participants = uniqueNames(texts.flatMap(parseParticipants)); })
      .catch((err) => {
        console.error(err);
        setMessage("Participant list could not be loaded. Please try again later.", "error");
      });
  }
})();
