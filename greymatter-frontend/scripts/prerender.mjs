// scripts/prerender.mjs
// Renders each public route to static HTML after `vite build`.
// Uses Vite's programmatic preview API (no child process) and Puppeteer
// to capture the rendered DOM for each route.

import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { preview as vitePreview } from "vite";
import puppeteer from "puppeteer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const PORT = 4173;
const ORIGIN = `http://127.0.0.1:${PORT}`;

// ── Routes to prerender ──────────────────────────────────────────────────────
// Public, content-bearing routes only. Nothing behind auth.
// Topic pages (/:subject/topic/:topicId) are intentionally excluded for now —
// there are ~200 of them and they'd require querying the API during build.
const SUBJECT_SLUGS = [
  "accounting",
  "business",
  "economics",
  "geography",
  "life-science",
  "physics",
  "maths-lit",
  "mathematics",
];

const STATIC_ROUTES = [
  "/",
  "/subjects",
  "/about",
  "/contact",
  "/careers",
  "/help",
  "/terms",
  "/privacy",
  "/cookies",
];

const ROUTES = [
  ...STATIC_ROUTES,
  ...SUBJECT_SLUGS.map((slug) => `/${slug}`),
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function routeToOutputPath(route) {
  if (route === "/") return path.join(DIST, "index.html");
  const clean = route.replace(/^\/+|\/+$/g, "");
  return path.join(DIST, clean, "index.html");
}

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      if (res.status >= 200 && res.status < 500) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`vite preview did not start at ${url} within ${timeoutMs}ms`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  if (!existsSync(DIST)) {
    throw new Error("dist/ not found. Run `vite build` before prerender.");
  }

  console.log("[prerender] starting vite preview…");
  // Use Vite's programmatic preview API — avoids the Windows spawn/quoting
  // nightmare that comes with invoking vite.cmd through a shell.
  const server = await vitePreview({
    root: ROOT,
    preview: {
      port: PORT,
      strictPort: true,
      host: "127.0.0.1",
    },
  });

  let browser;
  try {
    await waitForServer(ORIGIN);
    console.log("[prerender] preview up, launching puppeteer…");

    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );

    let ok = 0;
    let failed = 0;

    for (const route of ROUTES) {
      const url = `${ORIGIN}${route}`;
      try {
        await page.goto(url, { waitUntil: "networkidle0", timeout: 45000 });
        // Give React a moment to flush any final state.
        await new Promise((r) => setTimeout(r, 300));

        const html = await page.content();
        const outPath = routeToOutputPath(route);
        await mkdir(path.dirname(outPath), { recursive: true });
        await writeFile(outPath, html, "utf8");
        console.log(`[prerender] ✓ ${route} → ${path.relative(ROOT, outPath)}`);
        ok++;
      } catch (err) {
        console.error(`[prerender] ✗ ${route}: ${err.message}`);
        failed++;
      }
    }

    console.log(`[prerender] done: ${ok} ok, ${failed} failed`);
    if (failed > 0) process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    await server.close();
  }
}

main()
  .then(() => {
    // Force a clean exit so lingering handles don't hold the terminal.
    process.exit(process.exitCode || 0);
  })
  .catch((err) => {
    console.error("[prerender] fatal:", err);
    process.exit(1);
  });