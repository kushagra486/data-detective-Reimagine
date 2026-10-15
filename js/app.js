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

  function parseParticipants(text) {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return [];
    const header = splitCSV(lines[0]).map((h) => h.toLowerCase());
    let col = header.findIndex((h) => h === "name" || h === "full name" || h === "participant");
    let rows = lines;
    if (col !== -1) rows = lines.slice(1);
    else col = 0;
    const seen = new Set();
    const out = [];
    for (const row of rows) {
      const name = (splitCSV(row)[col] || "").trim();
      const key = normalize(name);
      if (name && !seen.has(key)) { seen.add(key); out.push(name); }
    }
    return out;
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
    if (cfg.restrictToList) showSuggestions(findMatches(input.value));
  });
  input.addEventListener("blur", () => setTimeout(() => showSuggestions([]), 100));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    showSuggestions([]);
    const typed = input.value.replace(/\s+/g, " ").trim();
    if (!typed) { setMessage("Please enter your name.", "error"); return; }

    if (!cfg.restrictToList) { generate(typed); return; }

    const exact = participants.find((p) => normalize(p) === normalize(typed));
    if (exact) { generate(exact); return; }

    result.hidden = true;
    const close = findMatches(typed);
    if (close.length) {
      setMessage("No exact match. Did you mean one of these?", "warn");
      showSuggestions(close);
    } else {
      setMessage("We couldn't find that name in the participant list. Please check the spelling or contact the organizers.", "error");
    }
  });

  $("download-pdf").addEventListener("click", () => currentName && window.Certificate.downloadPDF(canvas, currentName));
  $("download-png").addEventListener("click", () => currentName && window.Certificate.downloadPNG(canvas, currentName));
  if (!cfg.formats.includes("pdf")) $("download-pdf").hidden = true;
  if (!cfg.formats.includes("png")) $("download-png").hidden = true;

  document.querySelectorAll("[data-event-name]").forEach((el) => (el.textContent = cfg.eventName));
  document.querySelectorAll("[data-organizer]").forEach((el) => (el.textContent = cfg.organizer));
  document.title = "Certificates · " + cfg.eventName;

  // Warm up the template + font so the first preview is fast.
  window.Certificate.loadImage(cfg.templateImage).catch(() => {});

  if (cfg.restrictToList) {
    fetch(cfg.participantsFile, { cache: "no-cache" })
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then((t) => { participants = parseParticipants(t); })
      .catch((err) => {
        console.error(err);
        setMessage("Participant list could not be loaded. Please try again later.", "error");
      });
  }
})();
