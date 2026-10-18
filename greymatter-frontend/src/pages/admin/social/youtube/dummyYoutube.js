// Design-pass data. Real shapes will come from /api/admin/social/youtube/*.

export const CATEGORIES = [
  "Education",
  "Science & Technology",
  "Howto & Style",
  "People & Blogs",
  "Entertainment",
  "News & Politics",
];

export const VISIBILITY = [
  { value: "public",   label: "Public",   desc: "Everyone can see" },
  { value: "unlisted", label: "Unlisted", desc: "Anyone with the link" },
  { value: "private",  label: "Private",  desc: "Only you" },
];

export const PLAYLISTS = [
  { id: 1, name: "Grade 10 Physics",      count: 12 },
  { id: 2, name: "Grade 10 Accounting",   count: 8  },
  { id: 3, name: "Grade 11 Maths",        count: 14 },
  { id: 4, name: "Grade 12 Physics",      count: 18 },
  { id: 5, name: "Grade 12 Life Science", count: 9  },
];

export const VIDEOS = [
  {
    id: "v1",
    title: "Redox Reactions Explained in 8 Minutes",
    duration: "08:12",
    thumbnail_color: "#6846ff",
    status: "published",
    visibility: "public",
    views: 4218,
    watch_hours: 312,
    ctr: 4.8,
    published_at: "2026-10-08 16:00",
    playlist: "Grade 12 Physics",
  },
  {
    id: "v2",
    title: "Electric Circuits — Series vs Parallel",
    duration: "12:47",
    thumbnail_color: "#00b894",
    status: "published",
    visibility: "public",
    views: 2841,
    watch_hours: 421,
    ctr: 5.2,
    published_at: "2026-10-02 18:00",
    playlist: "Grade 10 Physics",
  },
  {
    id: "v3",
    title: "Depreciation Methods — Straight Line vs Reducing Balance",
    duration: "09:34",
    thumbnail_color: "#e69a1a",
    status: "processing",
    visibility: "private",
    views: 0,
    watch_hours: 0,
    ctr: 0,
    published_at: "2026-10-11 12:30",
    playlist: "Grade 10 Accounting",
  },
  {
    id: "v4",
    title: "The GDP Deflator — What It Actually Measures",
    duration: "06:58",
    thumbnail_color: "#e53935",
    status: "failed",
    visibility: "private",
    views: 0,
    watch_hours: 0,
    ctr: 0,
    published_at: "2026-10-10 20:15",
    playlist: "—",
    error: "Upload aborted — network timeout at 62%",
  },
];

export const WATCH_TIME = [
  { date: "Oct 5",  hours: 42 },
  { date: "Oct 6",  hours: 51 },
  { date: "Oct 7",  hours: 48 },
  { date: "Oct 8",  hours: 76 },
  { date: "Oct 9",  hours: 62 },
  { date: "Oct 10", hours: 88 },
  { date: "Oct 11", hours: 71 },
];

export const RETENTION = [
  { pct: "0%",   viewership: 100 },
  { pct: "10%",  viewership: 92 },
  { pct: "20%",  viewership: 84 },
  { pct: "30%",  viewership: 78 },
  { pct: "40%",  viewership: 71 },
  { pct: "50%",  viewership: 64 },
  { pct: "60%",  viewership: 58 },
  { pct: "70%",  viewership: 51 },
  { pct: "80%",  viewership: 44 },
  { pct: "90%",  viewership: 38 },
  { pct: "100%", viewership: 31 },
];

export const TRAFFIC_SOURCES = [
  { name: "YouTube search",   value: 642, color: "#6846ff" },
  { name: "Browse features",  value: 812, color: "#00b894" },
  { name: "Suggested videos", value: 418, color: "#e69a1a" },
  { name: "External",         value: 126, color: "#0984e3" },
  { name: "Direct / unknown", value: 88,  color: "#888" },
];

export const SUBSCRIBER_DELTA = [
  { date: "Oct 5",  gained: 8,  lost: 1 },
  { date: "Oct 6",  gained: 12, lost: 2 },
  { date: "Oct 7",  gained: 6,  lost: 1 },
  { date: "Oct 8",  gained: 21, lost: 3 },
  { date: "Oct 9",  gained: 14, lost: 2 },
  { date: "Oct 10", gained: 18, lost: 1 },
  { date: "Oct 11", gained: 11, lost: 2 },
];

export const CHANNEL_STATS = [
  { label: "Subscribers",   value: "1,842", sub: "+89 (30d)" },
  { label: "Watch time",    value: "438h",  sub: "last 7 days" },
  { label: "Views",         value: "7,059", sub: "last 7 days" },
  { label: "Avg view dur.", value: "4:12",  sub: "of 8:12 avg" },
];