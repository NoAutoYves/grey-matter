import {
  ResponsiveContainer,
  AreaChart, Area,
  LineChart, Line,
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import {
  CHANNEL_STATS, VIEWS_TREND, RETENTION,
  TRAFFIC_SOURCES, FOLLOWER_DELTA, VIDEOS,
} from "./dummyTikTok";

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
          <span className="admin-chart-tooltip-value">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function TikTokAnalytics() {
  const topVideos = [...VIDEOS]
    .filter((v) => v.status === "posted")
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return (
    <div className="tt-analytics">
      <div className="admin-stats-grid">
        {CHANNEL_STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="social-analytics-grid">
        <ChartCard title="Views (last 7 days)">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={VIEWS_TREND} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <defs>
                <linearGradient id="ttViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6846ff" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#6846ff" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#666" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#666" }} axisLine={false} tickLine={false} />
              <Tooltip content={<TooltipBox />} />
              <Area type="monotone" dataKey="views" name="Views" stroke="#6846ff" strokeWidth={2} fill="url(#ttViews)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Audience Retention">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={RETENTION} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis dataKey="pct" tick={{ fontSize: 12, fill: "#666" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#666" }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<TooltipBox />} />
              <Line type="monotone" dataKey="watch" name="% watching" stroke="#00b894" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Traffic Sources">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={TRAFFIC_SOURCES} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2} stroke="#fff" strokeWidth={2} isAnimationActive={false}>
                {TRAFFIC_SOURCES.map((t, i) => <Cell key={i} fill={t.color} />)}
              </Pie>
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload;
                return (
                  <div className="admin-chart-tooltip">
                    <div className="admin-chart-tooltip-label">{p.name}</div>
                    <div className="admin-chart-tooltip-row">
                      <span className="admin-chart-tooltip-dot" style={{ background: p.color }} />
                      <span className="admin-chart-tooltip-name">Views</span>
                      <span className="admin-chart-tooltip-value">{p.value.toLocaleString()}</span>
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
              <Tooltip content={<TooltipBox />} cursor={{ fill: "rgba(104,70,255,0.06)" }} />
              <Legend verticalAlign="top" height={30} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "0.72rem", color: "#666" }} />
              <Bar dataKey="gained" name="Gained" fill="#00b894" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="lost"   name="Lost"   fill="#e53935" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <section className="social-analytics-panel">
        <h2 className="admin-section-title">Top Videos</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Video</th>
                <th>Views</th>
                <th>Likes</th>
                <th>Rate</th>
              </tr>
            </thead>
            <tbody>
              {topVideos.map((v, i) => (
                <tr key={v.id}>
                  <td className="admin-cell-num">{i + 1}</td>
                  <td>{v.title}</td>
                  <td className="admin-cell-num">{v.views.toLocaleString()}</td>
                  <td className="admin-cell-num">{v.likes.toLocaleString()}</td>
                  <td className="admin-cell-num">{Math.round((v.likes / v.views) * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default TikTokAnalytics;