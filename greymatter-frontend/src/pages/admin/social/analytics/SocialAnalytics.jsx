import {
  ResponsiveContainer,
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
  BarChart, Bar, Cell,
  PieChart, Pie,
} from "recharts";
import {
  STATS, FOLLOWER_GROWTH, ENGAGEMENT, PLATFORM_SHARE,
  BEST_TIMES, TOP_POSTS,
} from "./dummySocialAnalytics";

const PALETTE = ["#6846ff", "#00b894", "#e69a1a", "#e53935", "#0984e3"];
const LINE_COLORS = {
  facebook:  "#1877f2",
  instagram: "#e1306c",
  twitter:   "#111111",
  tiktok:    "#69c9d0",
  youtube:   "#ff0000",
};
const PLATFORM_ORDER = ["facebook", "instagram", "twitter", "tiktok", "youtube"];

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

function SocialAnalytics() {
  return (
    <div className="social-analytics">
      <div className="admin-stats-grid">
        {STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="social-analytics-grid">
        <ChartCard title="Follower Growth (30 days)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={FOLLOWER_GROWTH} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#666" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#666" }} axisLine={false} tickLine={false} />
              <Tooltip content={<TooltipBox />} />
              <Legend verticalAlign="top" height={30} iconType="circle" iconSize={8}
                wrapperStyle={{ fontSize: "0.72rem", color: "#666" }} />
              {PLATFORM_ORDER.map((p) => (
                <Line
                  key={p}
                  type="monotone"
                  dataKey={p}
                  name={p.charAt(0).toUpperCase() + p.slice(1)}
                  stroke={LINE_COLORS[p]}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Follower Share by Platform">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={PLATFORM_SHARE}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                stroke="#fff"
                strokeWidth={2}
                isAnimationActive={false}
              >
                {PLATFORM_SHARE.map((p, i) => (
                  <Cell key={i} fill={p.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload;
                  return (
                    <div className="admin-chart-tooltip">
                      <div className="admin-chart-tooltip-label">{p.name}</div>
                      <div className="admin-chart-tooltip-row">
                        <span className="admin-chart-tooltip-dot" style={{ background: p.color }} />
                        <span className="admin-chart-tooltip-name">Followers</span>
                        <span className="admin-chart-tooltip-value">{p.value.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                }}
              />
              <Legend verticalAlign="bottom" height={40} iconType="circle" iconSize={8}
                wrapperStyle={{ fontSize: "0.72rem", color: "#666", paddingTop: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Engagement by Platform">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ENGAGEMENT} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis dataKey="platform" tick={{ fontSize: 12, fill: "#666" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#666" }} axisLine={false} tickLine={false} />
              <Tooltip content={<TooltipBox />} cursor={{ fill: "rgba(104,70,255,0.06)" }} />
              <Legend verticalAlign="top" height={30} iconType="circle" iconSize={8}
                wrapperStyle={{ fontSize: "0.72rem", color: "#666" }} />
              <Bar dataKey="likes"    name="Likes"    stackId="a" fill="#6846ff" isAnimationActive={false} />
              <Bar dataKey="comments" name="Comments" stackId="a" fill="#00b894" isAnimationActive={false} />
              <Bar dataKey="shares"   name="Shares"   stackId="a" fill="#e69a1a" radius={[6, 6, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Best Posting Times">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={BEST_TIMES} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 12, fill: "#666" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#666" }} axisLine={false} tickLine={false} />
              <Tooltip content={<TooltipBox />} cursor={{ fill: "rgba(104,70,255,0.06)" }} />
              <Bar dataKey="engagement" name="Engagement" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                {BEST_TIMES.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <section className="social-analytics-panel">
        <h2 className="admin-section-title">Top Posts (30 days)</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Post</th>
                <th>Platform</th>
                <th>Reach</th>
                <th>Engagement</th>
                <th>Rate</th>
              </tr>
            </thead>
            <tbody>
              {TOP_POSTS.map((p, i) => (
                <tr key={p.id}>
                  <td className="admin-cell-num">{i + 1}</td>
                  <td>{p.content}</td>
                  <td><span className="admin-badge admin-badge-neutral">{p.platform}</span></td>
                  <td className="admin-cell-num">{p.reach.toLocaleString()}</td>
                  <td className="admin-cell-num">{p.engagement.toLocaleString()}</td>
                  <td className="admin-cell-num">{p.rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default SocialAnalytics;