import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
  AreaChart, Area,
  PieChart, Pie,
} from "recharts";
import { api } from "../../utils/api";
import "../../styles/admin/AdminShared.css";
import "../../styles/admin/AdminAnalytics.css";

const PALETTE = ["#6846ff", "#8a6eff", "#00b894", "#e69a1a", "#e53935", "#00cec9", "#fd79a8", "#0984e3"];

function StatCard({ label, value }) {
  return (
    <div className="admin-stat-card">
      <span className="admin-stat-label">{label}</span>
      <span className="admin-stat-value">{value}</span>
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

function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/admin/analytics");
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || "Failed to load analytics");
        setData(d);
      } catch (e) {
        setError(e.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="admin-loading">Loading analytics...</div>;
  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-error-banner">{error}</div>
      </div>
    );
  }
  if (!data) return null;

  const dailyData = data.daily_active.map((d) => ({
    date: d.date?.slice(5) || "",
    users: d.count,
  }));

  const scoreData = data.score_distribution.map((d) => ({
    range: d.range,
    count: d.count,
  }));

  const subjectData = data.subject_performance.map((d) => ({
    subject: d.subject.length > 18 ? d.subject.slice(0, 18) + "…" : d.subject,
    fullSubject: d.subject,
    completions: d.completions,
  }));

  const popularData = data.popular_exercises.slice(0, 6).map((d) => ({
    name: d.title.length > 32 ? d.title.slice(0, 32) + "…" : d.title,
    fullTitle: d.title,
    value: d.count,
  }));

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Analytics</h1>
          <p className="admin-page-subtitle">Last 7 days</p>
        </div>
      </header>

      <div className="admin-stats-grid">
        <StatCard label="Total Users" value={data.total_users} />
        <StatCard label="Active Users" value={data.active_users} />
        <StatCard label="Completion Rate" value={`${data.completion_rate}%`} />
        <StatCard label="Avg Time (min)" value={data.avg_time_minutes} />
        <StatCard label="Published Exercises" value={data.total_exercises} />
        <StatCard label="Total Completions" value={data.total_completions} />
      </div>

      <div className="admin-analytics-grid">
        <ChartCard title="Daily Active Users">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <defs>
                <linearGradient id="dailyFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6846ff" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#6846ff" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#666" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#666" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<TooltipBox />} />
              <Area
                type="monotone"
                dataKey="users"
                name="Active users"
                stroke="#6846ff"
                strokeWidth={2}
                fill="url(#dailyFill)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Popular Exercises">
          {popularData.length === 0 ? (
            <div className="admin-empty">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={popularData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  stroke="#fff"
                  strokeWidth={2}
                  isAnimationActive={false}
                >
                  {popularData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0].payload;
                    return (
                      <div className="admin-chart-tooltip">
                        <div className="admin-chart-tooltip-label">{p.fullTitle}</div>
                        <div className="admin-chart-tooltip-row">
                          <span className="admin-chart-tooltip-dot" style={{ background: payload[0].color || payload[0].payload.fill }} />
                          <span className="admin-chart-tooltip-name">Completions</span>
                          <span className="admin-chart-tooltip-value">{p.value}</span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={48}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "0.72rem", color: "#666", paddingTop: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Score Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 12, fill: "#666" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#666" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<TooltipBox />} cursor={{ fill: "rgba(104,70,255,0.06)" }} />
              <Bar dataKey="count" name="Attempts" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                {scoreData.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Completions by Subject">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={subjectData}
              layout="vertical"
              margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: "#666" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="subject"
                tick={{ fontSize: 12, fill: "#666" }}
                axisLine={false}
                tickLine={false}
                width={130}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload;
                  return (
                    <div className="admin-chart-tooltip">
                      <div className="admin-chart-tooltip-label">{p.fullSubject}</div>
                      <div className="admin-chart-tooltip-row">
                        <span className="admin-chart-tooltip-dot" style={{ background: "#6846ff" }} />
                        <span className="admin-chart-tooltip-name">Completions</span>
                        <span className="admin-chart-tooltip-value">{p.completions}</span>
                      </div>
                    </div>
                  );
                }}
                cursor={{ fill: "rgba(104,70,255,0.06)" }}
              />
              <Bar dataKey="completions" name="Completions" fill="#6846ff" radius={[0, 6, 6, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <section className="admin-analytics-panel">
        <h2 className="admin-section-title">Top Performers</h2>
        {data.top_performers.length === 0 ? (
          <div className="admin-empty">No data</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Avg Score</th>
                  <th>Completions</th>
                </tr>
              </thead>
              <tbody>
                {data.top_performers.map((u, i) => (
                  <tr key={i}>
                    <td className="admin-cell-num">{i + 1}</td>
                    <td>{u.email}</td>
                    <td className="admin-cell-num">{u.avg_score}%</td>
                    <td className="admin-cell-num">{u.completions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminAnalytics;