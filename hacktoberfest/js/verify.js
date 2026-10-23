// Verify a Hacktoberfest certificate by its Certificate ID, using the Supabase
// verify-certificate function (which reads the private participant list).
(function () {
  const cfg = window.CERT_CONFIG;
  const $ = (id) => document.getElementById(id);
  const form = $("verify-form");
  const input = $("id-input");
  const message = $("message");
  const card = $("verified");
  const button = form.querySelector("button[type=submit]");

  // "hf26 r4eg kmzf", "HF26R4EGKMZF" -> "HF26-R4EG-KMZF"
  function cleanId(raw) {
    const s = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
    return s.length === 12 ? `${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8)}` : raw.trim().toUpperCase();
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
      const res = await fetch(cfg.supabaseUrl + "/functions/v1/verify-certificate?id=" + encodeURIComponent(id), {
        headers: { apikey: cfg.supabaseKey },
      });
      if (res.status === 404) {
        setMessage(`No certificate was issued with the ID ${id}. This certificate is not genuine — please check the ID and try again.`, "error");
        return;
      }
      if (!res.ok) throw new Error("HTTP " + res.status);
      const info = await res.json();
      if (!info.valid) {
        setMessage(`The certificate ${id} has been cancelled by REIMAGINE Club and is no longer valid.`, "error");
        return;
      }
      $("v-name").textContent = info.name;
      $("v-team").textContent = info.team || "—";
      $("v-event").textContent = info.event;
      $("v-id").textContent = info.certificateId;
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
