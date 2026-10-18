import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import FuncHeader from "../../components/functional-comps/FuncHeader";
import FuncFooter from "../../components/functional-comps/FuncFooter";
import { Helmet } from "react-helmet";
import { api } from "../../utils/api";
import "../../styles/notes/NotesTopicList.css";

const SLUG_TO_DB = {
  accounting: "Accounting",
  business: "Business",
  economics: "Economics",
  geography: "Geography",
  life_science: "Life Science",
  physics: "Physics",
  mathematics: "Mathematics",
  maths_literacy: "Mathematical Literacy",
};

const SLUG_TO_DISPLAY = {
  accounting: "Accounting",
  business: "Business",
  economics: "Economics",
  geography: "Geography",
  life_science: "Life Science",
  physics: "Physics",
  mathematics: "Mathematics",
  maths_literacy: "Mathematical Literacy",
};

const GRADES = [10, 11, 12];

function normaliseGrade(v) {
  const n = Number(v);
  if (Number.isNaN(n)) return null;
  if (n >= 3 && n <= 5) return n + 7;
  if (n >= 10 && n <= 12) return n;
  return null;
}

function NotesTopicList() {
  const { subjectSlug } = useParams();
  const subjectName = SLUG_TO_DISPLAY[subjectSlug] || subjectSlug;
  const subjectDbName = SLUG_TO_DB[subjectSlug] || subjectSlug;

  const [byGrade, setByGrade] = useState({ 10: [], 11: [], 12: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeGrade, setActiveGrade] = useState(10);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/api/exercises/${encodeURIComponent(subjectDbName)}/topics`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load topics");

        const grouped = data.grouped_topics || [];
        const out = { 10: [], 11: [], 12: [] };
        for (const group of grouped) {
          const g = normaliseGrade(group.grade_level ?? group.grade ?? group.grade_number);
          if (!g || !out[g]) continue;
          for (const t of group.topics || []) {
            out[g].push(t);
          }
        }
        if (!cancelled) setByGrade(out);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load topics");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [subjectDbName]);

  useEffect(() => {
    if (loading) return;
    const first = GRADES.find((g) => byGrade[g].length > 0);
    if (first) setActiveGrade(first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const gradeTopics = useMemo(() => byGrade[activeGrade] || [], [byGrade, activeGrade]);

  return (
    <div className="notes-topics-page">
      <Helmet htmlAttributes={{ lang: "en-ZA" }}>
        <title>{subjectName} Notes | Grey Matter</title>
        <meta
          name="description"
          content={`Full CAPS-aligned chapter notes for every ${subjectName} topic in Grades 10, 11, and 12. Free to read.`}
        />
        <meta name="theme-color" content="#6846ff" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://greymatterschool.co.za/notes/${subjectSlug}/`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": `${subjectName} Notes | Grey Matter`,
            "url": `https://greymatterschool.co.za/notes/${subjectSlug}/`,
            "about": subjectName,
            "educationalLevel": ["Grade 10", "Grade 11", "Grade 12"],
            "inLanguage": "en-ZA"
          })}
        </script>
      </Helmet>

      <FuncHeader />

      <main className="notes-topics-main">
        <header className="notes-topics-hero">
          <Link to="/notes/" className="notes-back-link"> All subjects</Link>
          <h1 className="notes-topics-title">{subjectName}</h1>
          <p className="notes-topics-subtitle">
            Pick a grade to see the topics covered in this subject.
          </p>
        </header>

        <div className="notes-grade-tabs">
          {GRADES.map((g) => {
            const count = byGrade[g].length;
            return (
              <button
                key={g}
                type="button"
                className={`notes-grade-tab ${activeGrade === g ? "active" : ""}`}
                onClick={() => setActiveGrade(g)}
                disabled={count === 0 && !loading}
              >
                Grade {g}
                {!loading && <span className="notes-grade-tab-count">{count}</span>}
              </button>
            );
          })}
        </div>

        {error && <div className="notes-error">{error}</div>}

        {loading ? (
          <div className="notes-loading">Loading topics…</div>
        ) : gradeTopics.length === 0 ? (
          <div className="notes-empty">
            No topics for Grade {activeGrade} yet. Check the other grades.
          </div>
        ) : (
          <ul className="notes-topic-list">
            {gradeTopics.map((t) => (
              <li key={t.topic_id} className="notes-topic-item">
                <Link
                  to={`/notes/${subjectSlug}/${t.topic_id}/`}
                  className="notes-topic-link"
                >
                  <div className="notes-topic-text">
                    <span className="notes-topic-name">{t.topic_name}</span>
                    <span className="notes-topic-meta">
                      {t.exercise_count
                        ? `${t.exercise_count} exercise${t.exercise_count === 1 ? "" : "s"}`
                        : "Notes"} · Grade {activeGrade}
                    </span>
                  </div>
                  <span className="notes-topic-arrow"></span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      <FuncFooter />
    </div>
  );
}

export default NotesTopicList;