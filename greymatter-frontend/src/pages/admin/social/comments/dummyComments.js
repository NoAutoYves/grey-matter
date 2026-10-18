// Design-pass data only. Maps to real tables (comments, comment_replies,
// comment_reports) after DB design. Replace imports with API calls then.

export const STATUS_FILTERS = [
  { value: "all",      label: "All" },
  { value: "pending",  label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "flagged",  label: "Flagged" },
  { value: "hidden",   label: "Hidden" },
];

export const FLAG_REASONS = ["Spam", "Inappropriate", "Off-topic", "Harassment", "Other"];

export const COMMENTS = [
  {
    id: 1,
    user: { id: 12, name: "Thabo Mokoena", email: "thabo.m@example.com" },
    exercise: "Electric Circuits (Grade 10 Physics) - Exercise 1",
    content: "Question 4 doesn't make sense. The answer says B but I calculated C using V=IR.",
    created_at: "2026-10-11 14:23",
    status: "pending",
    flag_reason: null,
    replies: [],
  },
  {
    id: 2,
    user: { id: 8, name: "Lerato Dlamini", email: "lerato.d@example.com" },
    exercise: "Finance (Interest, banking and inflation) (Grade 11 Mathematical Literacy) - Exercise 3",
    content: "This exercise helped me so much! Thank you.",
    created_at: "2026-10-11 10:12",
    status: "approved",
    flag_reason: null,
    replies: [
      { id: 1, author: "Madon", content: "Glad it helped, Lerato!", created_at: "2026-10-11 11:00" },
    ],
  },
  {
    id: 3,
    user: { id: 45, name: "Anonymous", email: "spam@example.com" },
    exercise: "Business Cycles (Grade 12 Economics) - Exercise 2",
    content: "CHECK OUT MY YOUTUBE CHANNEL FOR FREE MATRIC NOTES!!! LINK IN BIO",
    created_at: "2026-10-10 22:45",
    status: "flagged",
    flag_reason: "Spam",
    replies: [],
  },
  {
    id: 4,
    user: { id: 22, name: "Sipho Ndlovu", email: "sipho@example.com" },
    exercise: "Depreciation (Grade 10 Accounting) - Exercise 4",
    content: "I think there's a typo in question 7 — it says 'recieved' instead of 'received'.",
    created_at: "2026-10-10 18:30",
    status: "approved",
    flag_reason: null,
    replies: [
      { id: 1, author: "Madon", content: "Fixed, thanks for the catch.", created_at: "2026-10-10 19:00" },
    ],
  },
  {
    id: 5,
    user: { id: 31, name: "Naledi Khumalo", email: "naledi@example.com" },
    exercise: "Redox Reactions (Grade 12 Physics) - Exercise 5",
    content: "Can you add more practice questions on oxidation numbers?",
    created_at: "2026-10-09 15:20",
    status: "hidden",
    flag_reason: null,
    replies: [],
  },
];