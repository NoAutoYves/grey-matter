// Design-pass data. Real shapes will come from /api/admin/social/tiktok/*.

export const PRIVACY_LEVELS = [
  { value: "PUBLIC_TO_EVERYONE",     label: "Everyone",       desc: "Public" },
  { value: "MUTUAL_FOLLOW_FRIENDS",  label: "Friends",        desc: "Mutual follows only" },
  { value: "FOLLOWER_OF_CREATOR",    label: "Followers",      desc: "Followers only" },
  { value: "SELF_ONLY",              label: "Only me",        desc: "Private" },
];

export const CHUNK_LIMITS = {
  min: 5 * 1024 * 1024,          // 5 MB
  max: 64 * 1024 * 1024,         // 64 MB
  finalMax: 128 * 1024 * 1024,   // last chunk may be up to 128 MB
  maxChunks: 1000,
};

export const VIDEO_LIMITS = {
  maxSize: 4 * 1024 * 1024 * 1024,  // 4 GB
  minDuration: 3,                   // seconds
  maxDuration: 600,                 // 10 minutes
  aspect: "9:16",
  formats: ["MP4", "MOV", "WEBM"],
  minResolution: "360x360",
};

export const VIDEOS = [
  {
    id: "t1",
    title: "Redox reactions explained in 60 seconds",
    duration: "00:58",
    cover_color: "#6846ff",
    status: "posted",
    privacy: "PUBLIC_TO_EVERYONE",
    views: 12480,
    likes: 842,
    comments: 76,
    shares: 134,
    posted_at: "2026-10-11 18:00",
    allow_comments: true,
    allow_duet: true,
    allow_stitch: true,
  },
  {
    id: "t2",
    title: "Series vs parallel circuits #physics #Grade10",
    duration: "01:24",
    cover_color: "#00b894",
    status: "posted",
    privacy: "PUBLIC_TO_EVERYONE",
    views: 8432,
    likes: 521,
    comments: 43,
    shares: 89,
    posted_at: "2026-10-10 17:30",
    allow_comments: true,
    allow_duet: false,
    allow_stitch: true,
  },
  {
    id: "t3",
    title: "Depreciation methods in 30 seconds",
    duration: "00:32",
    cover_color: "#e69a1a",
    status: "processing",
    privacy: "SELF_ONLY",
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    posted_at: "2026-10-13 09:15",
    allow_comments: true,
    allow_duet: false,
    allow_stitch: false,
  },
  {
    id: "t4",
    title: "What the GDP deflator actually measures",
    duration: "01:02",
    cover_color: "#e53935",
    status: "failed",
    privacy: "SELF_ONLY",
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    posted_at: "2026-10-12 20:00",
    allow_comments: true,
    allow_duet: false,
    allow_stitch: false,
    error: "Chunk 3 failed — upload token expired",
  },
];

export const CHANNEL_STATS = [
  { label: "Followers",      value: "1,247", sub: "+64 (30d)" },
  { label: "Video views",    value: "20,912", sub: "last 7 days" },
  { label: "Likes",          value: "1,363", sub: "last 7 days" },
  { label: "Avg completion", value: "41.2%", sub: "+3.1% vs last week" },
];

export const VIEWS_TREND = [
  { date: "Oct 7",  views: 1820 },
  { date: "Oct 8",  views: 2410 },
  { date: "Oct 9",  views: 1950 },
  { date: "Oct 10", views: 3200 },
  { date: "Oct 11", views: 4180 },
  { date: "Oct 12", views: 3620 },
  { date: "Oct 13", views: 3732 },
];

export const RETENTION = [
  { pct: "0%",   watch: 100 },
  { pct: "10%",  watch: 88 },
  { pct: "20%",  watch: 76 },
  { pct: "30%",  watch: 68 },
  { pct: "40%",  watch: 61 },
  { pct: "50%",  watch: 54 },
  { pct: "60%",  watch: 47 },
  { pct: "70%",  watch: 42 },
  { pct: "80%",  watch: 38 },
  { pct: "90%",  watch: 34 },
  { pct: "100%", watch: 28 },
];

export const TRAFFIC_SOURCES = [
  { name: "For You",    value: 8420, color: "#6846ff" },
  { name: "Profile",    value: 3120, color: "#00b894" },
  { name: "Search",     value: 1840, color: "#e69a1a" },
  { name: "Following",  value: 980,  color: "#0984e3" },
  { name: "Other",      value: 420,  color: "#888" },
];

export const FOLLOWER_DELTA = [
  { date: "Oct 7",  gained: 6,  lost: 1 },
  { date: "Oct 8",  gained: 14, lost: 2 },
  { date: "Oct 9",  gained: 8,  lost: 1 },
  { date: "Oct 10", gained: 22, lost: 3 },
  { date: "Oct 11", gained: 18, lost: 2 },
  { date: "Oct 12", gained: 11, lost: 1 },
  { date: "Oct 13", gained: 9,  lost: 2 },
];