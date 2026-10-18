// Design-pass data only. Replace with /api/admin/social/analytics after
// DB tables exist. Shape mirrors what the real endpoint should return.

export const STATS = [
  { label: "Total Followers",   value: "5,265", sub: "+312 (30d)" },
  { label: "Impressions (30d)", value: "48.2K", sub: "+18%" },
  { label: "Engagement Rate",   value: "4.7%",  sub: "+0.6pt" },
  { label: "Posts Published",   value: "34",    sub: "7 this week" },
];

export const FOLLOWER_GROWTH = [
  { date: "Sep 12", facebook: 1710, instagram: 2030, twitter: 610, tiktok: 340, youtube: 210 },
  { date: "Sep 17", facebook: 1745, instagram: 2072, twitter: 622, tiktok: 358, youtube: 216 },
  { date: "Sep 22", facebook: 1762, instagram: 2101, twitter: 628, tiktok: 372, youtube: 220 },
  { date: "Sep 27", facebook: 1788, instagram: 2123, twitter: 631, tiktok: 385, youtube: 224 },
  { date: "Oct 2",  facebook: 1795, instagram: 2138, twitter: 636, tiktok: 396, youtube: 227 },
  { date: "Oct 7",  facebook: 1812, instagram: 2148, twitter: 638, tiktok: 405, youtube: 229 },
  { date: "Oct 11", facebook: 1820, instagram: 2161, twitter: 641, tiktok: 412, youtube: 231 },
];

export const ENGAGEMENT = [
  { platform: "Facebook",  likes: 340, comments: 82,  shares: 45  },
  { platform: "Instagram", likes: 512, comments: 114, shares: 38  },
  { platform: "Twitter",   likes: 128, comments: 31,  shares: 12  },
  { platform: "TikTok",    likes: 894, comments: 176, shares: 210 },
  { platform: "YouTube",   likes: 62,  comments: 14,  shares: 8   },
];

export const PLATFORM_SHARE = [
  { name: "Instagram", value: 2161, color: "#e1306c" },
  { name: "Facebook",  value: 1820, color: "#1877f2" },
  { name: "Twitter",   value: 641,  color: "#111111" },
  { name: "TikTok",    value: 412,  color: "#69c9d0" },
  { name: "YouTube",   value: 231,  color: "#ff0000" },
];

export const BEST_TIMES = [
  { hour: "06:00", engagement: 18 },
  { hour: "08:00", engagement: 34 },
  { hour: "10:00", engagement: 28 },
  { hour: "12:00", engagement: 22 },
  { hour: "14:00", engagement: 41 },
  { hour: "16:00", engagement: 62 },
  { hour: "18:00", engagement: 88 },
  { hour: "20:00", engagement: 54 },
  { hour: "22:00", engagement: 21 },
];

export const TOP_POSTS = [
  { id: 1, content: "Redox in 60 seconds — quick explainer.",     platform: "TikTok",    reach: 4820, engagement: 612, rate: 12.7 },
  { id: 2, content: "Grade 12 Physics circuits — new exercise.", platform: "Instagram", reach: 2140, engagement: 271, rate: 12.6 },
  { id: 3, content: "Matric rewrite season starts today.",       platform: "Facebook",  reach: 1890, engagement: 184, rate: 9.7  },
  { id: 4, content: "Depreciation methods explained.",           platform: "Facebook",  reach: 1412, engagement: 121, rate: 8.6  },
  { id: 5, content: "Quick quiz: GDP deflator.",                 platform: "Twitter",   reach: 880,  engagement: 68,  rate: 7.7  },
];