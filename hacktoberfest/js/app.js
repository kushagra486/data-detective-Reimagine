// Hacktoberfest certificates: only names on the participant list get a certificate.
// The website asks the Supabase get-certificate function for the typed name; it checks
// the private participant list and, only for a listed name, returns a short-lived link
// to that person's pre-made certificate.
(function () {
  const cfg = window.CERT_CONFIG;
  const $ = (id) => document.getElementById(id);

  const form = $("search-form");
  const input = $("name-input");
  const message = $("message");
  const result = $("result");
  const canvas = $("preview");
  const resultName = $("result-name");
  const button = form.querySelector("button[type=submit]");

  let currentName = null;

  // Returns { name, blob } for a listed name, or null if the name is not on the list.
  async function fetchCertificate(name) {
    const res = await fetch(cfg.supabaseUrl + "/functions/v1/get-certificate", {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: cfg.supabaseKey },
      body: JSON.stringify({ name }),
    });
    if (res.status === 404) return null;
    if (res.status === 429) throw Object.assign(new Error("rate limited"), { rateLimited: true });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const info = await res.json();
    const img = await fetch(info.url);
    if (!img.ok) throw new Error("certificate HTTP " + img.status);
    return { name: info.name, blob: await img.blob() };
  }

  function setMessage(text, kind) {
    message.textContent = text || "";
    message.className = "message" + (kind ? " " + kind : "");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const typed = input.value.replace(/\s+/g, " ").trim();
    if (!typed) { setMessage("Please enter your name.", "error"); return; }

    result.hidden = true;
    button.disabled = true;
    setMessage("Checking the participant list…");
    try {
      const cert = await fetchCertificate(typed);
      if (!cert) { setMessage(cfg.notFoundMessage, "error"); return; }
      await window.Certificate.drawImage(canvas, cert.blob);
      currentName = cert.name;
      resultName.textContent = currentName;
      result.hidden = false;
      setMessage("");
      result.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      console.error(err);
      setMessage(err.rateLimited
        ? "Too many names that are not on the list were tried from this connection. Please wait 10 minutes, then type your full name exactly as you registered."
        : "Sorry, something went wrong. Please check your connection and try again.", "error");
    } finally {
      button.disabled = false;
    }
  });

  $("download-pdf").addEventListener("click", () => currentName && window.Certificate.downloadPDF(canvas, currentName));
  $("download-png").addEventListener("click", () => currentName && window.Certificate.downloadJPG(canvas, currentName));

  document.title = "Certificates · " + cfg.eventName;
})();
