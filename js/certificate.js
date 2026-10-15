// Shared helpers: load template, draw name, export.
(function () {
  const cache = {};

  function loadImage(src) {
    if (!cache[src]) {
      cache[src] = new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Could not load template image: " + src));
        img.src = src;
      });
    }
    return cache[src];
  }

  function fontString(n, px) {
    return `${n.fontWeight || "400"} ${px}px "${n.fontFamily}"`;
  }

  async function render(canvas, name, cfg) {
    const n = cfg.name;
    const img = await loadImage(cfg.templateImage);
    const W = img.naturalWidth;
    const H = img.naturalHeight;
    canvas.width = W;
    canvas.height = H;

    let px = Math.round(n.fontSize * H);
    try { await document.fonts.load(fontString(n, px), name); } catch (_) {}

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(img, 0, 0, W, H);
    if (!name) return canvas;

    const text = n.uppercase ? name.toUpperCase() : name;
    const maxW = n.maxWidth * W;
    ctx.font = fontString(n, px);
    while (ctx.measureText(text).width > maxW && px > 8) {
      px -= 2;
      ctx.font = fontString(n, px);
    }
    ctx.fillStyle = n.color;
    ctx.textAlign = n.align || "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(text, n.x * W, n.y * H);
    return canvas;
  }

  function safeFileName(name) {
    return ("Certificate - " + name).replace(/[\\/:*?"<>|]+/g, "").trim();
  }

  function downloadPNG(canvas, name) {
    canvas.toBlob((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = safeFileName(name) + ".png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }, "image/png");
  }

  function downloadPDF(canvas, name) {
    const { jsPDF } = window.jspdf;
    const W = canvas.width, H = canvas.height;
    const pdf = new jsPDF({
      orientation: W >= H ? "landscape" : "portrait",
      unit: "px",
      format: [W, H],
      hotfixes: ["px_scaling"],
      compress: true,
    });
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, W, H);
    pdf.save(safeFileName(name) + ".pdf");
  }

  window.Certificate = { render, downloadPNG, downloadPDF, loadImage };
})();
