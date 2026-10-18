// Dummy data for design pass. Replace with API calls after DB is designed.

export const PLATFORMS = [
  { id: "facebook",  label: "Facebook",  color: "#1877f2", charLimit: 63206, media: "image+video" },
  { id: "instagram", label: "Instagram", color: "#e1306c", charLimit: 2200,  media: "image+video" },
  { id: "twitter",   label: "Twitter/X", color: "#111111", charLimit: 280,   media: "image+video" },
  { id: "tiktok",    label: "TikTok",    color: "#000000", charLimit: 2200,  media: "video" },
  { id: "youtube",   label: "YouTube",   color: "#ff0000", charLimit: 5000,  media: "video" },
];

export const ACCOUNTS = [
  { id: 1, platform: "facebook",  handle: "@greymatter",    status: "connected",    expires: "2026-12-04" },
  { id: 2, platform: "instagram", handle: "@greymatter.sa", status: "connected",    expires: "2026-11-22" },
  { id: 3, platform: "twitter",   handle: "@greymattersa",  status: "connected",    expires: "2026-10-30" },
  { id: 4, platform: "tiktok",    handle: "@greymatter",    status: "expiring",     expires: "2026-10-18" },
  { id: 5, platform: "youtube",   handle: "Grey Matter SA", status: "disconnected", expires: "—" },
];

export const STATS = [
  { label: "Scheduled",   value: 12 },
  { label: "Published 7d", value: 34 },
  { label: "Followers",   value: "5,241" },
  { label: "Failed 7d",   value: 2, danger: true },
];

export const QUEUE = [
  {
    id: 1,
    content: "New Grade 12 Physics exercise on electric circuits just dropped. Test yourself: greymatterschool.co.za",
    platforms: ["facebook", "instagram", "twitter"],
    when: "2026-10-11 18:00",
    status: "scheduled",
  },
  {
    id: 2,
    content: "Matric rewrite season is here. Our Grade 12 Maths exercises are free — no signup required.",
    platforms: ["facebook", "instagram"],
    when: "2026-10-12 07:30",
    status: "scheduled",
  },
  {
    id: 3,
    content: "60-second explainer: how to balance a redox equation. Full video tomorrow on TikTok.",
    platforms: ["tiktok", "youtube"],
    when: "2026-10-12 16:00",
    status: "scheduled",
  },
];

export const HISTORY = [
  {
    id: 101,
    content: "Accounting Grade 10: depreciation methods explained.",
    platforms: ["facebook", "instagram", "twitter"],
    when: "2026-10-09 18:00",
    status: "posted",
    reach: 412,
  },
  {
    id: 102,
    content: "Quick quiz: what is the GDP deflator?",
    platforms: ["twitter"],
    when: "2026-10-09 12:15",
    status: "posted",
    reach: 88,
  },
  {
    id: 103,
    content: "New Life Science topic live now.",
    platforms: ["instagram", "tiktok"],
    when: "2026-10-08 20:00",
    status: "failed",
    reach: 0,
    error: "TikTok: video codec not supported",
  },
];