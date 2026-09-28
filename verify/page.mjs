/* =====================================================================
   UNDER THE HOOD LABS — the page, checked the way a student sees it

   1. LINKS     exactly three, in the owner's order, to the right sites,
                each opening in a new tab with a description
   2. TILE      safety orange (#ff6a00) carrying DARK text
   3. FOOTER    the full Cyber Warrior Program wording
   4. CONTRAST  WCAG AAA on painted pixels (7:1 body, 4.5:1 large), on a
                desk and on a phone, at rest and with a link hovered
   5. PHONE     nothing scrolls sideways at 360px

   Run:        node verify/page.mjs
   Calibrate:  node verify/page.mjs --plant   (every plant must be caught)
   Needs Playwright and Chromium (paths below, or PW / CHROME env vars).
   ===================================================================== */
import { readFileSync, writeFileSync, mkdtempSync, cpSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";
import { createServer } from "http";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PW = process.env.PW || "/opt/node22/lib/node_modules/playwright/index.mjs";
const CHROME = process.env.CHROME || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const EXPECT = [
  ["A+ Core 1 Under the Hood Labs", "https://rafikiscyent888.github.io/A-Core-1-under-the-hood-labs/"],
  ["Security Start-up Firewall", "https://rafikiscyent888.github.io/Security-Start-up-Firewall/"],
  ["Veterans Overcoming the Odds SOC", "https://rafikiscyent888.github.io/Veterans-Overcoming-Odds-SOC/"],
];
const FOOTER = "Cyber Warrior Program — built by an instructor, for students, to make certification study more interactive. For educational purposes only. Not affiliated with, endorsed by, or sponsored by CompTIA®. All trademarks belong to their respective owners.";

const lum = ([r, g, b]) => { const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

function serve(dir, port) {
  return createServer((q, s) => {
    const p = q.url.split("?")[0];
    if (p !== "/" && p !== "/index.html") { s.writeHead(404); s.end(); return; }
    s.writeHead(200, { "content-type": "text/html" }); s.end(readFileSync(join(dir, "index.html")));
  }).listen(port);
}

/* Paint-sample every run of text: hide the glyphs, screenshot, compare each
   run's colour with the pixels actually under it. Reads no stylesheet. */
async function contrast(page) {
  const runs = await page.evaluate(() => {
    const out = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) {
      if (!n.textContent.trim()) continue;
      const el = n.parentElement, cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none") continue;
      const rg = document.createRange(); rg.selectNodeContents(n);
      for (const r of rg.getClientRects()) if (r.width > 2 && r.height > 2)
        out.push({ t: n.textContent.trim().slice(0, 40), c: cs.color, s: parseFloat(cs.fontSize), b: parseInt(cs.fontWeight) >= 700, x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height });
    }
    return out;
  });
  await page.addStyleTag({ content: "*{color:transparent!important;text-shadow:none!important}" });
  const png = (await page.screenshot({ fullPage: true })).toString("base64");
  await page.evaluate(() => [...document.querySelectorAll("style")].pop().remove());
  const grounds = await page.evaluate(async ({ png, runs }) => {
    const im = new Image(); im.src = "data:image/png;base64," + png; await im.decode();
    const c = document.createElement("canvas"); c.width = im.width; c.height = im.height;
    const g = c.getContext("2d"); g.drawImage(im, 0, 0);
    return runs.map(r => {
      const x0 = Math.max(0, Math.floor(r.x)), y0 = Math.max(0, Math.floor(r.y));
      const d = g.getImageData(x0, y0, Math.max(1, Math.min(Math.floor(r.w), im.width - x0)), Math.max(1, Math.min(Math.floor(r.h), im.height - y0))).data;
      const px = []; for (let i = 0; i < d.length; i += 4) px.push([d[i], d[i + 1], d[i + 2]]);
      return px;
    });
  }, { png, runs });
  const bad = [];
  runs.forEach((r, i) => {
    const fg = r.c.match(/\d+(\.\d+)?/g).map(Number).slice(0, 3);
    const need = (r.s >= 24 || (r.b && r.s >= 18.66)) ? 4.5 : 7;
    let worst = 99; for (const p of grounds[i]) worst = Math.min(worst, ratio(fg, p));
    if (worst < need) bad.push(`${worst.toFixed(2)}:1 < ${need} "${r.t}"`);
  });
  return { n: runs.length, bad };
}

async function run(dir, port) {
  const srv = serve(dir, port);
  const pw = await import(PW); const { chromium } = pw.default || pw;
  const browser = await chromium.launch({ executablePath: CHROME, args: ["--headless=new", "--no-sandbox"] });
  const fails = []; const fail = (rule, msg) => fails.push(`${rule} — ${msg}`);
  try {
    for (const vp of [{ name: "desk", width: 1280, height: 900 }, { name: "phone", width: 360, height: 800 }]) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      const errs = []; page.on("pageerror", e => errs.push(e.message));
      await page.goto(`http://127.0.0.1:${port}/`); await page.waitForTimeout(200);
      if (errs.length) fail("page", `${vp.name}: script errors: ${errs.join(" | ")}`);

      if (vp.name === "desk") {
        /* 1. links */
        const links = await page.$$eval(".links a", as => as.map(a => ({ text: a.childNodes[1] ? a.textContent.replace(/\s+/g, " ").trim() : "", href: a.href, target: a.target, what: !!a.querySelector(".what") })));
        if (links.length !== 3) fail("links", `found ${links.length} links, expected 3`);
        EXPECT.forEach(([name, href], i) => {
          const l = links[i];
          if (!l) return;
          if (!l.text.includes(name)) fail("links", `link ${i + 1} should be "${name}", reads "${l.text.slice(0, 50)}"`);
          if (l.href !== href) fail("links", `link ${i + 1} goes to ${l.href}, expected ${href}`);
          if (l.target !== "_blank") fail("links", `link ${i + 1} doesn't open in a new tab`);
          if (!l.what) fail("links", `link ${i + 1} has no description`);
        });
        /* 2. tile */
        const tile = await page.$eval(".tile-header", el => { const cs = getComputedStyle(el); return { bg: cs.backgroundColor, fg: cs.color }; });
        if (tile.bg !== "rgb(255, 106, 0)") fail("tile", `tile is ${tile.bg}, expected safety orange rgb(255, 106, 0)`);
        const fg = tile.fg.match(/\d+/g).map(Number);
        if (lum(fg) > 0.2) fail("tile", `tile lettering is light (${tile.fg}); orange needs dark lettering`);
        /* 3. footer */
        const foot = (await page.textContent("footer .disclaimer")).replace(/\s+/g, " ").trim();
        if (foot !== FOOTER) fail("footer", `footer wording differs: "${foot.slice(0, 80)}…"`);
      }

      /* 5. phone: no sideways scroll */
      const wide = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      if (wide) fail("phone", `${vp.name}: the page scrolls sideways`);

      /* 4. contrast, at rest and with the first link hovered */
      const rest = await contrast(page);
      rest.bad.forEach(b => fail("contrast", `${vp.name}, at rest: ${b}`));
      await page.hover(".links li:first-child a"); await page.waitForTimeout(250);
      const hov = await contrast(page);
      hov.bad.forEach(b => fail("contrast", `${vp.name}, link hovered: ${b}`));
      if (rest.n < 10) fail("contrast", `${vp.name}: only ${rest.n} text runs measured — the sweep is not seeing the page`);
      await page.close();
    }
  } catch (e) { fail("run", "stopped early: " + String(e.message).split("\n")[0]); }
  finally { await browser.close(); srv.close(); }
  return fails;
}

const PLANTS = {
  wrongorder: { catches: "links", fn: s => s.replace("rafikiscyent888.github.io/A-Core-1-under-the-hood-labs/", "TMP").replace("rafikiscyent888.github.io/Security-Start-up-Firewall/", "rafikiscyent888.github.io/A-Core-1-under-the-hood-labs/").replace("TMP", "rafikiscyent888.github.io/Security-Start-up-Firewall/") },
  whitetext: { catches: "tile", fn: s => s.replace("background: var(--royal-orange);\n    color: var(--text-dark);", "background: var(--royal-orange);\n    color: var(--text-light);") },
  lowcontrast: { catches: "contrast", fn: s => s.replace("  .what {\n", "  .what {\n    color: #8a93b8;\n") },
  hoverwash: { catches: "contrast", fn: s => s.replace("background: rgba(6,12,34,0.45);", "background: rgba(255,255,255,0.55);") },
  shortfooter: { catches: "footer", fn: s => s.replace("Cyber Warrior Program &mdash; built by an instructor, for students, to make certification study more interactive. ", "") },
  sideways: { catches: "phone", fn: s => s.replace("  main {\n    width: 100%;", "  main {\n    min-width: 600px;\n    width: 100%;") },
};

if (process.argv.includes("--plant")) {
  let all = true, port = 8931;
  for (const [name, p] of Object.entries(PLANTS)) {
    const dir = mkdtempSync(join(tmpdir(), "uth-")); cpSync(join(ROOT, "index.html"), join(dir, "index.html"));
    const src = readFileSync(join(dir, "index.html"), "utf8"); const out = p.fn(src);
    if (out === src) { console.log(`  MISSED  ${name.padEnd(12)} (the plant did not apply — it tests nothing)`); all = false; continue; }
    writeFileSync(join(dir, "index.html"), out);
    const fails = await run(dir, port++);
    const caught = fails.some(f => f.startsWith(p.catches + " —"));
    console.log(`  ${caught ? "caught " : "MISSED "} ${name.padEnd(12)} (expected a "${p.catches}" failure)`);
    if (!caught) { all = false; console.log("      got: " + (fails.slice(0, 2).join(" | ") || "nothing")); }
  }
  console.log(all ? `\nall ${Object.keys(PLANTS).length} plants caught.` : "\nA PLANT WAS MISSED.");
  process.exit(all ? 0 : 1);
} else {
  const fails = await run(ROOT, 8930);
  if (fails.length) { console.log("FAILURES:\n  " + fails.join("\n  ")); process.exit(1); }
  console.log("Under the Hood Labs: three links in order, orange tile with dark lettering, full footer, AAA on painted pixels on a desk and a phone (at rest and hovered), no sideways scroll.");
}
