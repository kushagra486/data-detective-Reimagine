// Hacktoberfest certificate helpers: show a pre-made certificate and export it.
(function () {
  function drawImage(canvas, blob) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext("2d").drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        resolve(canvas);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read certificate image")); };
      img.src = url;
    });
  }

  function safeFileName(name) {
    return ("Hacktoberfest 2026 Certificate - " + name).replace(/[\\/:*?"<>|]+/g, "").trim();
  }

  function downloadJPG(canvas, name) {
    canvas.toBlob((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = safeFileName(name) + ".jpg";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }, "image/jpeg", 0.92);
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
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, W, H);
    pdf.save(safeFileName(name) + ".pdf");
  }

  window.Certificate = { drawImage, downloadJPG, downloadPDF };
})();
