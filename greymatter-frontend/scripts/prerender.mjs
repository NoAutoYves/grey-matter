// scripts/prerender.mjs
// Renders each public route to static HTML after `vite build`.
// Uses Vite's programmatic preview API and Puppeteer to capture
// the rendered DOM for each route.
//
// Topic pages are discovered dynamically by fetching the topic list
// from the API (via vite preview's proxy) before prerendering.
// The sitemap is generated programmatically so it always matches
// the routes that were actually prerendered.

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
const SITE = "https://greymatterschool.co.za";

// ── Routes ──────────────────────────────────────────────────────────────
// Public, content-bearing routes only. Nothing behind auth.

// All routes use a TRAILING SLASH because that's the URL Google indexes
// (nginx 301-redirects /geography → /geography/). Visiting with the slash
// means window.location.pathname in the rendered HTML matches the canonical
// tag, which avoids Google overriding our canonical choice.
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
  "/subjects/",
  "/how-it-works/",
  "/about/",
  "/contact/",
  "/careers/",
  "/help/",
  "/terms/",
  "/privacy/",
  "/cookies/",
];

// ── Helpers ─────────────────────────────────────────────────────────────
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

async function fetchAllTopics() {
  const topics = [];
  for (const slug of SUBJECT_SLUGS) {
    try {
      const res = await fetch(`${ORIGIN}/api/exercises/${slug}/topics`);
      if (!res.ok) {
        console.warn(`[prerender] topics fetch for ${slug} returned ${res.status}`);
        continue;
      }
      const data = await res.json();
      const grouped = data.grouped_topics || [];
      let count = 0;
      for (const grade of grouped) {
        for (const topic of grade.topics || []) {
          topics.push({
            slug,
            topicId: topic.topic_id,
            topicName: topic.topic_name,
          });
          count++;
        }
      }
      console.log(`[prerender] fetched ${count} topics for ${slug}`);
    } catch (err) {
      console.warn(`[prerender] topics fetch for ${slug} failed: ${err.message}`);
    }
  }
  return topics;
}

function generateSitemap(topics) {
  const today = new Date().toISOString().split("T")[0];

  const staticUrls = [
    { loc: "/", priority: "1.0", freq: "weekly" },
    { loc: "/subjects/", priority: "0.9", freq: "weekly" },
    { loc: "/how-it-works/", priority: "0.7", freq: "monthly" },
    { loc: "/about/", priority: "0.6", freq: "monthly" },
    { loc: "/contact/", priority: "0.6", freq: "monthly" },
    { loc: "/help/", priority: "0.6", freq: "monthly" },
    { loc: "/careers/", priority: "0.5", freq: "monthly" },
    { loc: "/terms/", priority: "0.3", freq: "yearly" },
    { loc: "/privacy/", priority: "0.3", freq: "yearly" },
    { loc: "/cookies/", priority: "0.3", freq: "yearly" },
  ];

  const subjectUrls = SUBJECT_SLUGS.map((slug) => ({
    loc: `/${slug}/`,
    priority: "0.8",
    freq: "weekly",
  }));

  const topicUrls = topics.map((t) => ({
    loc: `/${t.slug}/topic/${t.topicId}/`,
    priority: "0.6",
    freq: "monthly",
  }));

  const all = [...staticUrls, ...subjectUrls, ...topicUrls];

  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    "",
  ];

  for (const u of all) {
    lines.push("  <url>");
    lines.push(`    <loc>${SITE}${u.loc}</loc>`);
    lines.push(`    <lastmod>${today}</lastmod>`);
    lines.push(`    <changefreq>${u.freq}</changefreq>`);
    lines.push(`    <priority>${u.priority}</priority>`);
    lines.push("  </url>");
  }

  lines.push("</urlset>");
  lines.push("");

  return lines.join("\n");
}

// ── Main ────────────────────────────────────────────────────────────────
async function main() {
  if (!existsSync(DIST)) {
    throw new Error("dist/ not found. Run `vite build` before prerender.");
  }

  console.log("[prerender] starting vite preview…");
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

    // Fetch topics via the preview proxy. This uses the same
    // /api endpoint the browser would hit, so it will fail loudly
    // if the API is unreachable from the build machine.
    const allTopics = await fetchAllTopics();
    console.log(`[prerender] total topics discovered: ${allTopics.length}`);

    const topicRoutes = allTopics.map((t) => `/${t.slug}/topic/${t.topicId}/`);

    const ROUTES = [
      ...STATIC_ROUTES,
      ...SUBJECT_SLUGS.map((slug) => `/${slug}/`),
      ...topicRoutes,
    ];

    console.log(`[prerender] total routes to prerender: ${ROUTES.length}`);

    // Generate the sitemap before prerendering. This overwrites whatever
    // Vite copied from public/sitemap.xml, so it always reflects the
    // current topic set. No need to maintain the static file any more.
    const sitemapXml = generateSitemap(allTopics);
    await writeFile(path.join(DIST, "sitemap.xml"), sitemapXml, "utf8");
    console.log(
      `[prerender] wrote sitemap.xml with ${
        STATIC_ROUTES.length + SUBJECT_SLUGS.length + allTopics.length
      } URLs`
    );

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
    const failures = [];
    const startTime = Date.now();

    for (let i = 0; i < ROUTES.length; i++) {
      const route = ROUTES[i];
      const url = `${ORIGIN}${route}`;
      try {
        await page.goto(url, { waitUntil: "networkidle0", timeout: 45000 });
        // Give React a moment to flush any final state.
        await new Promise((r) => setTimeout(r, 300));

        const html = await page.content();
        const outPath = routeToOutputPath(route);
        await mkdir(path.dirname(outPath), { recursive: true });
        await writeFile(outPath, html, "utf8");
        ok++;

        // Log progress every 25 routes so the terminal stays readable
        // but you can still see movement.
        if ((i + 1) % 25 === 0 || i === ROUTES.length - 1) {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
          console.log(
            `[prerender] progress: ${i + 1}/${ROUTES.length} (${elapsed}s elapsed)`
          );
        }
      } catch (err) {
        console.error(`[prerender] ✗ ${route}: ${err.message}`);
        failed++;
        failures.push(route);
      }
    }

    console.log(`[prerender] done: ${ok} ok, ${failed} failed`);
    if (failed > 0) {
      console.error(
        "[prerender] failed routes:",
        failures.slice(0, 10).join(", ")
      );
      if (failures.length > 10) {
        console.error(`[prerender] ...and ${failures.length - 10} more`);
      }
      process.exitCode = 1;
    }
  } finally {
    if (browser) await browser.close();
    await server.close();
  }
}

main()
  .then(() => {
    process.exit(process.exitCode || 0);
  })
  .catch((err) => {
    console.error("[prerender] fatal:", err);
    process.exit(1);
  });