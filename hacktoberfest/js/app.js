// Hacktoberfest certificates: only names on the participant list have a certificate.
// Each pre-made certificate is stored encrypted under certs/, keyed by the exact name,
// so a certificate can only be opened by typing a listed name (see design notes in README).
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

  const ITERATIONS = 120000;
  let currentName = null;

  const normalize = (s) =>
    s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

  function tidyName(name) {
    return name.replace(/\s+/g, " ").trim().split(" ").map((w) =>
      w === w.toLowerCase() || (w === w.toUpperCase() && w.length > 1)
        ? w.toLowerCase().replace(/(^|[\-'’.])(\p{L})/gu, (m, sep, ch) => sep + ch.toUpperCase())
        : w
    ).join(" ");
  }

  async function sha256Hex(text) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function openSealed(secret, salt, bytes) {
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey(
      { name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(salt), iterations: ITERATIONS },
      base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]
    );
    return crypto.subtle.decrypt({ name: "AES-GCM", iv: bytes.slice(0, 12) }, key, bytes.slice(12));
  }

  async function fetchCertificate(name) {
    const key = normalize(name);
    const file = "certs/" + (await sha256Hex("hf26-cert|" + key)).slice(0, 40) + ".bin";
    const res = await fetch(file, { cache: "no-cache" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("HTTP " + res.status);
    const jpeg = await openSealed(key, "hf26-cert-key", new Uint8Array(await res.arrayBuffer()));
    return new Blob([jpeg], { type: "image/jpeg" });
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
      const blob = await fetchCertificate(typed);
      if (!blob) { setMessage(cfg.notFoundMessage, "error"); return; }
      await window.Certificate.drawImage(canvas, blob);
      currentName = tidyName(typed);
      resultName.textContent = currentName;
      result.hidden = false;
      setMessage("");
      result.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      console.error(err);
      setMessage("Sorry, something went wrong. Please check your connection and try again.", "error");
    } finally {
      button.disabled = false;
    }
  });

  $("download-pdf").addEventListener("click", () => currentName && window.Certificate.downloadPDF(canvas, currentName));
  $("download-png").addEventListener("click", () => currentName && window.Certificate.downloadJPG(canvas, currentName));

  document.title = "Certificates · " + cfg.eventName;
})();
