// Verify a Hacktoberfest certificate by its Certificate ID.
// Each ID has an encrypted record under verify/ that only that ID can open.
(function () {
  const $ = (id) => document.getElementById(id);
  const form = $("verify-form");
  const input = $("id-input");
  const message = $("message");
  const card = $("verified");
  const button = form.querySelector("button[type=submit]");
  const ITERATIONS = 120000;

  // "hf26 r4eg kmzf", "HF26R4EGKMZF" -> "HF26-R4EG-KMZF"
  function cleanId(raw) {
    const s = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
    return s.length === 12 ? `${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8)}` : raw.trim().toUpperCase();
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

  function setMessage(text, kind) {
    message.textContent = text || "";
    message.className = "message" + (kind ? " " + kind : "");
  }

  async function verify(raw) {
    const id = cleanId(raw);
    card.hidden = true;
    if (!id) { setMessage("Please enter a Certificate ID.", "error"); return; }
    input.value = id;
    button.disabled = true;
    setMessage("Checking…");
    try {
      const res = await fetch("verify/" + (await sha256Hex("hf26-verify|" + id)).slice(0, 40) + ".bin", { cache: "no-cache" });
      if (res.status === 404) {
        setMessage(`No certificate was issued with the ID ${id}. This certificate is not genuine — please check the ID and try again.`, "error");
        return;
      }
      if (!res.ok) throw new Error("HTTP " + res.status);
      const info = JSON.parse(new TextDecoder().decode(await openSealed(id, "hf26-verify-key", new Uint8Array(await res.arrayBuffer()))));
      $("v-name").textContent = info.name;
      $("v-team").textContent = info.team || "—";
      $("v-event").textContent = info.event;
      $("v-id").textContent = info.id;
      setMessage("");
      card.hidden = false;
    } catch (err) {
      console.error(err);
      setMessage("Sorry, something went wrong. Please check your connection and try again.", "error");
    } finally {
      button.disabled = false;
    }
  }

  form.addEventListener("submit", (e) => { e.preventDefault(); verify(input.value); });
  const fromLink = new URLSearchParams(location.search).get("id");
  if (fromLink) verify(fromLink);
})();
