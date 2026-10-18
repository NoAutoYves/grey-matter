import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import FuncHeader from "../../components/functional-comps/FuncHeader";
import FuncFooter from "../../components/functional-comps/FuncFooter";
import NotesRenderer from "../../components/notes/NotesRenderer";
import { Helmet } from "react-helmet";
import { api } from "../../utils/api";
import "../../styles/notes/Notes.css";

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

function Notes() {
  const { subjectSlug, topicId } = useParams();
  const subjectName = SLUG_TO_DISPLAY[subjectSlug] || subjectSlug;
  const subjectDbName = SLUG_TO_DB[subjectSlug] || subjectSlug;

  const [topicName, setTopicName] = useState("");
  const [grade, setGrade] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const topicRes = await api.get(
          `/api/exercises/${encodeURIComponent(subjectDbName)}/topic/${topicId}`
        );
        const topicData = await topicRes.json();
        if (!topicRes.ok) throw new Error(topicData.error || "Topic not found");

        if (cancelled) return;
        setTopicName(topicData.topic_name || "");
        const exercises = topicData.exercises || [];
        if (exercises.length === 0) {
          setNotes("");
          return;
        }

        const firstId = exercises[0].exercise_id;
        const notesRes = await api.get(`/api/exercise/notes/${firstId}`);
        const notesData = await notesRes.json();
        if (!notesRes.ok) throw new Error(notesData.error || "Failed to load notes");

        if (cancelled) return;
        setNotes(notesData.notes || "");
        if (notesData.grade) setGrade(notesData.grade);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load notes");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [subjectSlug, subjectDbName, topicId]);

  return (
    <div className="notes-page">
      <Helmet htmlAttributes={{ lang: "en-ZA" }}>
        <title>{topicName ? `${topicName} Notes | ${subjectName} | Grey Matter` : `${subjectName} Notes | Grey Matter`}</title>
        <meta
          name="description"
          content={
            topicName
              ? `Full CAPS-aligned chapter notes for ${topicName}${grade ? ` (Grade ${grade} ${subjectName})` : ""}. Free to read on Grey Matter.`
              : `Full chapter notes for ${subjectName} on Grey Matter.`
          }
        />
        <meta name="theme-color" content="#6846ff" />
        <meta name="robots" content="index, follow" />
        <link
          rel="canonical"
          href={`https://greymatterschool.co.za/notes/${subjectSlug}/${topicId}/`}
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LearningResource",
            "name": topicName ? `${topicName} Notes` : `${subjectName} Notes`,
            "url": `https://greymatterschool.co.za/notes/${subjectSlug}/${topicId}/`,
            "about": subjectName,
            "educationalLevel": grade ? `Grade ${grade}` : undefined,
            "learningResourceType": "Notes",
            "isAccessibleForFree": true,
            "inLanguage": "en-ZA",
            "provider": {
              "@type": "EducationalOrganization",
              "name": "Grey Matter",
              "url": "https://greymatterschool.co.za/"
            }
          })}
        </script>
      </Helmet>

      <FuncHeader />

      <main className="notes-main">
        <header className="notes-hero">
          <Link to={`/notes/${subjectSlug}/`} className="notes-back-link">
             {subjectName}
          </Link>

          <p className="notes-overline">{subjectName} · Notes</p>
          <h1 className="notes-title">{topicName || `Topic ${topicId}`}</h1>
          {grade && (
            <p className="notes-subtitle">Grade {grade} · CAPS curriculum</p>
          )}
        </header>

        {error && <div className="notes-error">{error}</div>}

        {loading ? (
          <div className="notes-loading">Loading notes…</div>
        ) : !notes ? (
          <div className="notes-empty">
            No notes available for this topic yet.
          </div>
        ) : (
          <article className="notes-content-card">
            <NotesRenderer content={notes} />
          </article>
        )}
      </main>

      <FuncFooter />
    </div>
  );
}

export default Notes;