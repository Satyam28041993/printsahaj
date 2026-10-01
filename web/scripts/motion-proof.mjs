/**
 * P-005 motion proof. Builds nothing: point it at two finished static exports
 * (`web/out` from main and from the branch).
 *
 *   npm i --no-save playwright-core        # in web/, or anywhere resolvable
 *   node scripts/motion-proof.mjs --before <dir-of-main-out> --after <dir-of-branch-out> \
 *        [--out ../docs/proof/p005] [--chrome /path/to/chrome]
 *
 * For each build, at 390x844 (isMobile + hasTouch + Android UA) and 1440x900, it
 * records a video of one deterministic script (2s at top, scroll 120px every 90ms,
 * 2.5s pauses at showcase / help / founder, touchscreen tap on "Start a Project"),
 * converts it to MP4 + GIF with ffmpeg (fps=12, scale=390, under 8 MB), saves
 * before/after frame strips (0/150/300/600/1000ms after entry), and logs measured
 * numbers: max translateY per entrance and its duration (rAF sampling), the
 * ScrollTrigger count (html[data-m-triggers]) and JS errors.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright-core");

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const BEFORE = path.resolve(arg("before"));
const AFTER = path.resolve(arg("after"));
const OUT = path.resolve(arg("out", "../docs/proof/p005"));
const CHROME = arg("chrome", process.env.CHROME_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome");
const UA =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2", ".json": "application/json", ".ico": "image/x-icon", ".txt": "text/plain" };

fs.mkdirSync(OUT, { recursive: true });
const tmp = fs.mkdtempSync(path.join(OUT, ".tmp-"));

function serve(root) {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p.endsWith("/")) p += "index.html";
    const file = path.join(root, p);
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404);
      return res.end("not found");
    }
    res.writeHead(200, { "content-type": MIME[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, () => resolve({ server, url: `http://127.0.0.1:${server.address().port}/` })));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SECTIONS = {
  hero: "#top .h-panel",
  showcase: ".sc",
  help: ".hp",
  consult: ".hp-consult",
  founder: ".fd",
};
const PAUSE_AT = [".sc", ".hp", ".fd"];

/** rAF sampler: max translateY and active duration for every entrance target. */
const SAMPLER = () => {
  const sel = "[data-reveal], .h-reveal, [data-m='reveal'], [data-m='reveal'] [data-m-child], [data-m='pop'] [data-m-child]";
  const state = new Map();
  window.__motion = state;
  const ty = (el) => {
    const t = getComputedStyle(el).transform;
    if (!t || t === "none") return 0;
    return new DOMMatrixReadOnly(t).m42;
  };
  const tick = (now) => {
    document.querySelectorAll(sel).forEach((el) => {
      const y = ty(el);
      let s = state.get(el);
      if (!s) state.set(el, (s = { last: y, max: 0, first: null, end: null }));
      if (Math.abs(y - s.last) > 0.05) {
        s.first ??= now;
        s.end = now;
        s.max = Math.max(s.max, Math.abs(y), Math.abs(s.last));
      }
      s.last = y;
    });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

async function newPage(browser, url, { w, h, mobile, video, jsOff, reduce }) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    isMobile: mobile,
    hasTouch: mobile,
    deviceScaleFactor: 1,
    userAgent: mobile ? UA : undefined,
    javaScriptEnabled: !jsOff,
    reducedMotion: reduce ? "reduce" : "no-preference",
    recordVideo: video ? { dir: video, size: { width: w, height: h } } : undefined,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.addInitScript(`(${SAMPLER.toString()})()`).catch(() => {});
  await page.goto(url, { waitUntil: "load" });
  return { ctx, page, errors };
}

async function runScript(page, { mobile }) {
  await sleep(2000);
  const stops = await page.evaluate((sels) => sels.map((s) => { const e = document.querySelector(s); return e ? e.getBoundingClientRect().top + scrollY - 40 : Infinity; }), PAUSE_AT);
  const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const done = new Set();
  for (let y = 0; y < max; y += 120) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await sleep(90);
    stops.forEach((stop, i) => {
      if (!done.has(i) && y >= stop) done.add(i);
    });
    const hit = stops.findIndex((stop, i) => done.has(i) && !done.has(`p${i}`) && y >= stop);
    if (hit > -1) {
      done.add(`p${hit}`);
      await sleep(2500);
    }
  }
  await sleep(600);
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(800);
  const box = await page.locator("text=Start a Project").first().boundingBox();
  if (box) {
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    if (mobile) await page.touchscreen.tap(x, y);
    else await page.mouse.click(x, y);
  }
  await sleep(1200);
}

function ffmpeg(args) {
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args]);
}

function convert(webm, base) {
  ffmpeg(["-i", webm, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-vf", "scale=trunc(iw/2)*2:-2", `${base}.mp4`]);
  const ladder = [
    [12, 96, "bayer:bayer_scale=4"],
    [8, 96, "bayer:bayer_scale=4"],
    [6, 64, "none"],
    [5, 48, "none"],
    [4, 48, "none"],
  ];
  for (const [fps, colors, dither] of ladder) {
    ffmpeg(["-i", webm, "-vf", `fps=${fps},scale=390:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=${colors}[p];[b][p]paletteuse=dither=${dither}`, "-loop", "0", `${base}.gif`]);
    if (fs.statSync(`${base}.gif`).size < 8 * 1024 * 1024) return fps;
  }
  return 4;
}

async function strip(page, label, name, selector, { press } = {}) {
  const frames = [0, 150, 300, 600, 1000];
  if (name === "hero") {
    // The hero entrance runs on load: reload and sample from navigation commit.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.reload({ waitUntil: "commit" });
  } else {
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(600);
  }
  const y = name === "hero" ? 0 : await page.evaluate((s) => { const e = document.querySelector(s); return e ? e.getBoundingClientRect().top + scrollY : 0; }, selector);
  const vh = page.viewportSize().height;
  const files = [];
  // "Entry": jump so the section's top sits at 78% of the viewport, then sample.
  const target = name === "hero" ? 0 : Math.max(0, y - vh * 0.78);
  if (name !== "hero") await page.evaluate((v) => window.scrollTo(0, v), Math.max(0, target - 300));
  if (name !== "hero") await sleep(300);
  const t0 = Date.now();
  if (name !== "hero") await page.evaluate((v) => window.scrollTo(0, v), target);
  if (press) {
    const el = page.locator(press).first();
    const b = await el.boundingBox();
    if (b) await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await page.mouse.down();
  }
  for (const f of frames) {
    const wait = f - (Date.now() - t0);
    if (wait > 0) await sleep(wait);
    const file = path.join(tmp, `${label}_${name}_${f}.png`);
    await page.screenshot({ path: file });
    files.push(file);
  }
  if (press) await page.mouse.up();
  return files;
}

function stitch(files, out) {
  ffmpeg([...files.flatMap((f) => ["-i", f]), "-filter_complex", `hstack=inputs=${files.length}`, out]);
}

async function measure(page) {
  return page.evaluate(() => {
    const rows = [...(window.__motion?.values() ?? [])].filter((s) => s.first !== null);
    const durations = rows.map((s) => s.end - s.first).sort((a, b) => a - b);
    const maxes = rows.map((s) => s.max).sort((a, b) => a - b);
    const pick = (a, q) => (a.length ? Math.round(a[Math.min(a.length - 1, Math.floor(a.length * q))]) : 0);
    return {
      entrances: rows.length,
      maxTranslateY_px: { median: pick(maxes, 0.5), max: pick(maxes, 1) },
      duration_ms: { median: pick(durations, 0.5), max: pick(durations, 1) },
      scrollTriggers: Number(document.documentElement.dataset.mTriggers || 0),
    };
  });
}

const results = {};
const browser = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox"] });

for (const [label, dir] of [["before", BEFORE], ["after", AFTER]]) {
  const { server, url } = await serve(dir);
  for (const vp of [{ w: 390, h: 844, mobile: true }, { w: 1440, h: 900, mobile: false }]) {
    const key = `${label}_${vp.w}`;
    console.log(`\n== ${key}`);
    // 1. Video + measurements.
    const vdir = path.join(tmp, `v_${key}`);
    const { ctx, page, errors } = await newPage(browser, url, { ...vp, video: vdir });
    await runScript(page, vp);
    results[key] = { ...(await measure(page)), jsErrors: errors.length, errors };
    const video = page.video();
    await ctx.close();
    const webm = await video.path();
    const fps = convert(webm, path.join(OUT, `${label}_${vp.w}`));
    results[key].gifFps = fps;
    // 2. Frame strips (390 only, per the brief).
    if (vp.w === 390) {
      const s = await newPage(browser, url, vp);
      await sleep(2500);
      for (const [name, selector] of Object.entries(SECTIONS)) {
        stitch(await strip(s.page, label, name, selector), path.join(OUT, `${label}_390_${name}.png`));
      }
      stitch(await strip(s.page, label, "press", ".pill--dark", { press: "#top .pill--dark" }), path.join(OUT, `${label}_390_press.png`));
      await s.ctx.close();
    }
  }
  server.close();
}

// 3. Reduced-motion and no-JS screenshots of the branch build.
{
  const { server, url } = await serve(AFTER);
  const r = await newPage(browser, url, { w: 390, h: 844, mobile: true, reduce: true });
  await sleep(1500);
  await r.page.evaluate(() => window.scrollTo(0, 1200));
  await sleep(500);
  await r.page.screenshot({ path: path.join(OUT, "after_390_reduced-motion.png") });
  await r.ctx.close();
  const n = await newPage(browser, url, { w: 390, h: 844, mobile: true, jsOff: true });
  await n.page.screenshot({ path: path.join(OUT, "after_390_no-js.png"), fullPage: true });
  await n.ctx.close();
  server.close();
}

await browser.close();
fs.rmSync(tmp, { recursive: true, force: true });
fs.writeFileSync(path.join(OUT, "metrics.json"), JSON.stringify(results, null, 2));
console.log("\n" + JSON.stringify(results, null, 2));
