import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import {
  CHANNEL_STATS, IMPRESSIONS_TREND, ENGAGEMENT_BREAKDOWN,
  FOLLOWER_DELTA, POSTS,
} from "./dummyTwitter";

function StatCard({ label, value, sub }) {
  return (
    <div className="admin-stat-card">
      <span className="admin-stat-label">{label}</span>
      <span className="admin-stat-value">{value}</span>
      {sub && <span className="admin-stat-sub">{sub}</span>}
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <section className="admin-chart-card">
      <h2 className="admin-section-title">{title}</h2>
      <div className="admin-chart-body">{children}</div>
    </section>
  );
}

function TooltipBox({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="admin-chart-tooltip">
      {label !== undefined && <div className="admin-chart-tooltip-label">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="admin-chart-tooltip-row">
          <span className="admin-chart-tooltip-dot" style={{ background: p.color || p.fill }} />
          <span className="admin-chart-tooltip-name">{p.name}</span>
          <span className="admin-chart-tooltip-value">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

function TwitterAnalytics() {
  const topPosts = [...POSTS]
    .filter((p) => p.status === "posted")
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 5);

  return (
    <div className="tw-analytics">
      <div className="admin-stats-grid">
        {CHANNEL_STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="social-analytics-grid">
        <ChartCard title="Impressions (last 7 days)">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={IMPRESSIONS_TREND} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <defs>
                <linearGradient id="twImpr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1d9bf0" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#1d9bf0" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#666" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#666" }} axisLine={false} tickLine={false} />
              <Tooltip content={<TooltipBox />} />
              <Area type="monotone" dataKey="impressions" name="Impressions" stroke="#1d9bf0" strokeWidth={2} fill="url(#twImpr)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Engagement Breakdown">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={ENGAGEMENT_BREAKDOWN} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2} stroke="#fff" strokeWidth={2} isAnimationActive={false}>
                {ENGAGEMENT_BREAKDOWN.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload;
                return (
                  <div className="admin-chart-tooltip">
                    <div className="admin-chart-tooltip-label">{p.name}</div>
                    <div className="admin-chart-tooltip-row">
                      <span className="admin-chart-tooltip-dot" style={{ background: p.color }} />
                      <span className="admin-chart-tooltip-name">Count</span>
                      <span className="admin-chart-tooltip-value">{p.value}</span>
                    </div>
                  </div>
                );
              }} />
              <Legend verticalAlign="bottom" height={40} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "0.72rem", color: "#666", paddingTop: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Followers Gained / Lost">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={FOLLOWER_DELTA} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#666" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#666" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<TooltipBox />} cursor={{ fill: "rgba(29,155,240,0.06)" }} />
              <Legend verticalAlign="top" height={30} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "0.72rem", color: "#666" }} />
              <Bar dataKey="gained" name="Gained" fill="#00ba7c" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="lost"   name="Lost"   fill="#f91880" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Posts">
          <div className="tw-top-posts">
            {topPosts.map((p, i) => (
              <div key={p.id} className="tw-top-post">
                <span className="tw-top-post-rank">{i + 1}</span>
                <div className="tw-top-post-body">
                  <div className="tw-top-post-text">{p.text.length > 80 ? p.text.slice(0, 80) + "…" : p.text}</div>
                  <div className="tw-top-post-meta">
                    {p.impressions.toLocaleString()} impressions · {p.likes} likes · {p.retweets} RTs
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

export default TwitterAnalytics;