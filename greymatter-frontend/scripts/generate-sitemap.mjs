// scripts/generate-sitemap.mjs
// Regenerates public/sitemap.xml from the live API.
// Run manually when content changes: npm run sitemap
//
// This is intentionally separate from `npm run build`. The sitemap
// only changes when topics or exercises are added/removed, which is
// rare. Regenerating on every build wastes time and adds nothing.

import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUTPUT = path.join(ROOT, "public", "sitemap.xml");

const API = process.env.API_URL || "http://localhost:5000";
const SITE = "https://greymatterschool.co.za";

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

const STATIC_PAGES = [
  { path: "/",              priority: "1.0", freq: "weekly"  },
  { path: "/subjects/",     priority: "0.9", freq: "weekly"  },
  { path: "/how-it-works/", priority: "0.7", freq: "monthly" },
  { path: "/about/",        priority: "0.6", freq: "monthly" },
  { path: "/contact/",      priority: "0.6", freq: "monthly" },
  { path: "/help/",         priority: "0.6", freq: "monthly" },
  { path: "/careers/",      priority: "0.5", freq: "monthly" },
  { path: "/terms/",        priority: "0.3", freq: "yearly"  },
  { path: "/privacy/",      priority: "0.3", freq: "yearly"  },
  { path: "/cookies/",      priority: "0.3", freq: "yearly"  },
];

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url}  ${res.status}`);
  return res.json();
}

async function fetchTopicsForSubject(slug) {
  try {
    const data = await fetchJson(`${API}/api/exercises/${slug}/topics`);
    const topics = [];
    for (const grade of data.grouped_topics || []) {
      for (const t of grade.topics || []) {
        topics.push({ topicId: t.topic_id, topicName: t.topic_name });
      }
    }
    return topics;
  } catch (err) {
    console.warn(`[sitemap] ${slug} topics failed: ${err.message}`);
    return [];
  }
}

async function fetchExercisesForTopic(slug, topicId) {
  try {
    const data = await fetchJson(`${API}/api/exercises/${slug}/topic/${topicId}`);
    return (data.exercises || []).map((e) => e.exercise_id);
  } catch (err) {
    console.warn(`[sitemap] ${slug}/topic/${topicId} exercises failed: ${err.message}`);
    return [];
  }
}

async function runWithConcurrency(items, limit, fn) {
  const results = [];
  let index = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

async function main() {
  console.log(`[sitemap] using API at ${API}`);

  const urls = [];

  // Static pages
  for (const p of STATIC_PAGES) {
    urls.push({ loc: p.path, priority: p.priority, freq: p.freq });
  }

  // Subject landing pages
  for (const slug of SUBJECT_SLUGS) {
    urls.push({ loc: `/${slug}/`, priority: "0.8", freq: "weekly" });
  }

  let totalTopics = 0;
  let totalExercises = 0;

  for (const slug of SUBJECT_SLUGS) {
    const topics = await fetchTopicsForSubject(slug);
    console.log(`[sitemap] ${slug}: ${topics.length} topics`);

    for (const t of topics) {
      urls.push({
        loc: `/${slug}/topic/${t.topicId}/`,
        priority: "0.6",
        freq: "monthly",
      });
      totalTopics++;
    }

    // Fetch exercises for every topic in this subject, with concurrency.
    const exerciseLists = await runWithConcurrency(topics, 8, (t) =>
      fetchExercisesForTopic(slug, t.topicId)
    );

    for (let i = 0; i < topics.length; i++) {
      for (const exerciseId of exerciseLists[i]) {
        urls.push({
          loc: `/${slug}/exercise?exercise_id=${exerciseId}`,
          priority: "0.5",
          freq: "monthly",
        });
        totalExercises++;
      }
    }
  }

  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    "",
  ];

  for (const u of urls) {
    lines.push("  <url>");
    lines.push(`    <loc>${SITE}${u.loc}</loc>`);
    lines.push(`    <changefreq>${u.freq}</changefreq>`);
    lines.push(`    <priority>${u.priority}</priority>`);
    lines.push("  </url>");
  }

  lines.push("</urlset>");
  lines.push("");

  await writeFile(OUTPUT, lines.join("\n"), "utf8");

  console.log(`[sitemap] wrote ${urls.length} URLs to ${OUTPUT}`);
  console.log(`[sitemap]   ${STATIC_PAGES.length} static pages`);
  console.log(`[sitemap]   ${SUBJECT_SLUGS.length} subject pages`);
  console.log(`[sitemap]   ${totalTopics} topics`);
  console.log(`[sitemap]   ${totalExercises} exercises`);
}

main().catch((err) => {
  console.error("[sitemap] fatal:", err);
  process.exit(1);
});