// Renders design/certificate.html to assets/certificate-template.png
// and prints where the name line is, as fractions for config.js.
// Usage (from the repo root): node hacktoberfest/design/render.mjs
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const W = 1754, H = 1240, SCALE = 2; // 3508 x 2480 output

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: SCALE });
await page.goto("file://" + path.join(here, "certificate.html"));
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(here, "..", "assets", "certificate-template.png") });

const line = await page.locator("#name-line").boundingBox();
console.log(JSON.stringify({
  x: +((line.x + line.width / 2) / W).toFixed(4),
  lineY: +(line.y / H).toFixed(4),
  maxWidth: +(line.width / W).toFixed(3),
}));
await browser.close();
