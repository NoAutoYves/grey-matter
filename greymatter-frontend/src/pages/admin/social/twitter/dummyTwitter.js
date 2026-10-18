// Design-pass data. Real shapes will come from /api/admin/social/twitter/*.

export const CHAR_LIMITS = {
  standard: 280,
  premium: 25000,
  threadPart: 280,       // thread parts always 280 regardless of tier
  pollText: 280,         // polls always 280
};

export const MEDIA_LIMITS = {
  image:  { maxMB: 5,   formats: ["JPG", "PNG", "WEBP"], max: 4 },
  gif:    { maxMB: 15,  formats: ["GIF"],                max: 1 },
  video:  { maxMB: 512, formats: ["MP4", "MOV"],         max: 1 },
};

export const POLL_LIMITS = {
  minOptions: 2,
  maxOptions: 4,
  minMinutes: 5,
  maxMinutes: 10080, // 7 days
  maxChars: 25,      // per poll option
};

export const POLL_DURATIONS = [
  { value: 60,    label: "1 hour" },
  { value: 360,   label: "6 hours" },
  { value: 1440,  label: "1 day" },
  { value: 4320,  label: "3 days" },
  { value: 10080, label: "7 days" },
];

export const POSTS = [
  {
    id: "tw1",
    text: "Redox reactions in 60 seconds. The trick is balancing the electrons first — everything else follows. #chemistry #Grade12 #matric",
    type: "single",
    status: "posted",
    media_count: 1,
    poll: null,
    impressions: 12480,
    likes: 342,
    retweets: 81,
    replies: 24,
    bookmarks: 56,
    url_clicks: 142,
    posted_at: "2026-10-11 16:00",
    thread_length: null,
  },
  {
    id: "tw2",
    text: "Thread: 5 things matric learners get wrong about electric circuits (and how to fix them) 1/5",
    type: "thread",
    status: "posted",
    media_count: 0,
    poll: null,
    impressions: 8432,
    likes: 521,
    retweets: 198,
    replies: 43,
    bookmarks: 212,
    url_clicks: 312,
    posted_at: "2026-10-10 14:30",
    thread_length: 5,
  },
  {
    id: "tw3",
    text: "Quick poll for Grade 11s: which topic is giving you the most trouble right now?",
    type: "poll",
    status: "posted",
    media_count: 0,
    poll: {
      options: ["Quadratic equations", "Trig identities", "Financial maths", "Sequences & series"],
      votes: [142, 89, 67, 118],
      ends_at: "2026-10-14 10:00",
    },
    impressions: 3218,
    likes: 88,
    retweets: 12,
    replies: 31,
    bookmarks: 4,
    url_clicks: 22,
    posted_at: "2026-10-09 10:00",
    thread_length: null,
  },
  {
    id: "tw4",
    text: "New Grade 12 Physics video is live on YouTube. Link in the thread 👇",
    type: "thread",
    status: "processing",
    media_count: 0,
    poll: null,
    impressions: 0,
    likes: 0,
    retweets: 0,
    replies: 0,
    bookmarks: 0,
    url_clicks: 0,
    posted_at: "2026-10-13 09:15",
    thread_length: 2,
  },
  {
    id: "tw5",
    text: "GDP deflator explained without jargon. #economics #Grade12",
    type: "single",
    status: "failed",
    media_count: 1,
    poll: null,
    impressions: 0,
    likes: 0,
    retweets: 0,
    replies: 0,
    bookmarks: 0,
    url_clicks: 0,
    posted_at: "2026-10-12 20:00",
    thread_length: null,
    error: "Media processing failed — video exceeds 20 min for non-Premium account",
  },
];

export const CHANNEL_STATS = [
  { label: "Followers",    value: "3,847",  sub: "+142 (30d)" },
  { label: "Impressions",  value: "24,138", sub: "last 7 days" },
  { label: "Engagements",  value: "1,208",  sub: "4.9% rate" },
  { label: "Profile clicks", value: "386",  sub: "last 7 days" },
];

export const IMPRESSIONS_TREND = [
  { date: "Oct 7",  impressions: 2840 },
  { date: "Oct 8",  impressions: 3210 },
  { date: "Oct 9",  impressions: 4180 },
  { date: "Oct 10", impressions: 3620 },
  { date: "Oct 11", impressions: 4210 },
  { date: "Oct 12", impressions: 2890 },
  { date: "Oct 13", impressions: 3188 },
];

export const ENGAGEMENT_BREAKDOWN = [
  { name: "Likes",         value: 642, color: "#f91880" },
  { name: "Retweets",      value: 281, color: "#00ba7c" },
  { name: "Replies",       value: 114, color: "#1d9bf0" },
  { name: "Bookmarks",     value: 89,  color: "#7856ff" },
  { name: "Link clicks",   value: 82,  color: "#ffd400" },
];

export const FOLLOWER_DELTA = [
  { date: "Oct 7",  gained: 18, lost: 3 },
  { date: "Oct 8",  gained: 24, lost: 2 },
  { date: "Oct 9",  gained: 31, lost: 4 },
  { date: "Oct 10", gained: 22, lost: 1 },
  { date: "Oct 11", gained: 28, lost: 3 },
  { date: "Oct 12", gained: 14, lost: 2 },
  { date: "Oct 13", gained: 19, lost: 1 },
];