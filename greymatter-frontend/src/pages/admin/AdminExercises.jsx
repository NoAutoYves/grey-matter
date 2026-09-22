import { useState, useEffect, useRef } from "react";
import { api } from "../../utils/api";
import styles from './AdminExercises.module.css';

const ROWS_PER_PAGE = 15;

function AdminExercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Create form
  const [showForm, setShowForm] = useState(false);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [gradeId, setGradeId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [topicName, setTopicName] = useState("");
  const [topicUrl, setTopicUrl] = useState("");
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseTitle, setExerciseTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Edit modal
  const [editTarget, setEditTarget] = useState(null);
  const [editName, setEditName] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { setPage(1); }, [search, filter]);

  const fetchAll = async () => {
    try {
      const [exRes, gRes, sRes] = await Promise.all([
        api.get('/api/admin/exercises'),
        api.get('/api/admin/grades'),
        api.get('/api/admin/subjects'),
      ]);
      const exData = await exRes.json();
      const gData = await gRes.json();
      const sData = await sRes.json();
      if (exRes.ok) setExercises(exData.exercises);
      if (gRes.ok) setGrades(gData.grades || []);
      if (sRes.ok) setSubjects(sData.subjects || []);
    } catch (e) { console.error("Failed to load:", e); }
    finally { setLoading(false); }
  };

  const filtered = exercises.filter((ex) => {
    if (filter === "published" && !ex.is_published) return false;
    if (filter === "unpublished" && ex.is_published) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      ex.exercise_title?.toLowerCase().includes(q) ||
      ex.exercise_name?.toLowerCase().includes(q) ||
      ex.subject_name?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const pageItems = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  // ── Create form handlers ─────────────────────────────────────
  const addQuestion = () => {
    if (questions.length >= 10) return;
    setQuestions([...questions, {
      text: "", option_a: "", option_b: "", option_c: "", option_d: "", answer: "",
      image_url: null, image_filename: null,
    }]);
  };

  const updateQuestion = (i, field, value) => {
    const copy = [...questions];
    copy[i][field] = value;
    setQuestions(copy);
  };

  const removeQuestion = (i) => setQuestions(questions.filter((_, idx) => idx !== i));

  const handleImageUpload = async (i, file) => {
    if (!file) return;
    if (file.size > 500 * 1024) { alert("Image too large (max 500KB)."); return; }
    if (!file.type.startsWith('image/')) { alert("Please select an image file."); return; }

    const fd = new FormData();
    fd.append('image', file);
    setUploadingImage(true);
    try {
      const res = await api.post('/api/upload/question-image', fd);
      const data = await res.json();
      if (res.ok) {
        const copy = [...questions];
        copy[i].image_url = data.image_url;
        copy[i].image_filename = data.filename;
        setQuestions(copy);
      } else { alert(data.error || "Upload failed"); }
    } catch (e) { console.error(e); alert("Upload failed"); }
    finally { setUploadingImage(false); }
  };

  const resetForm = () => {
    setGradeId(""); setSubjectId(""); setTopicName(""); setTopicUrl("");
    setExerciseName(""); setExerciseTitle(""); setQuestions([]);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!topicUrl.trim() || !topicUrl.match(/^[a-z0-9_]+$/)) {
      alert("Topic URL must be lowercase letters, numbers, and underscores only.");
      return;
    }
    if (questions.length !== 10) { alert(`Add ${10 - questions.length} more questions.`); return; }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim() || !q.option_a.trim() || !q.option_b.trim() ||
          !q.option_c.trim() || !q.option_d.trim() || !q.answer) {
        alert(`Question ${i + 1} is incomplete.`);
        return;
      }
    }

    const payload = {
      grade_id: parseInt(gradeId),
      subject_id: parseInt(subjectId),
      topic_name: topicName.trim() || null,
      topic_url: topicUrl.trim().toLowerCase(),
      exercise_name: exerciseName.replace(/\s+/g, '_').toLowerCase(),
      exercise_title: exerciseTitle,
      questions: questions.map(q => ({
        text: q.text, option_a: q.option_a, option_b: q.option_b,
        option_c: q.option_c, option_d: q.option_d, answer: q.answer,
        image_url: q.image_url || null,
      })),
    };

    try {
      const res = await api.post('/api/admin/exercises', payload);
      if (res.ok) {
        alert("Exercise created.");
        setShowForm(false);
        resetForm();
        fetchAll();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create");
      }
    } catch (e) { console.error(e); }
  };

  // ── Edit handlers ────────────────────────────────────────────
  const startEdit = (ex) => {
    setEditTarget(ex);
    setEditName(ex.exercise_name);
    setEditTitle(ex.exercise_title);
  };

  const saveEdit = async () => {
    if (!editName.trim() || !editTitle.trim()) {
      alert("Both fields are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await api.put(`/api/admin/exercises/${editTarget.exercise_id}`, {
        exercise_name: editName.trim(),
        exercise_title: editTitle.trim(),
      });
      if (res.ok) { setEditTarget(null); fetchAll(); }
      else { const err = await res.json(); alert(err.error || "Failed to save"); }
    } catch (e) { console.error(e); alert("Network error"); }
    finally { setSaving(false); }
  };

  // ── Delete with usage warning ────────────────────────────────
  const deleteExercise = async (ex) => {
    let usage = null;
    try {
      const res = await api.get(`/api/admin/exercises/${ex.exercise_id}/usage`);
      if (res.ok) usage = await res.json();
    } catch {}

    let msg = `Delete "${ex.exercise_title}"?`;
    if (usage && usage.total > 0) {
      msg =
        `⚠️ This exercise has user data attached:\n\n` +
        `• ${usage.user_progress} progress records\n` +
        `• ${usage.user_notes} notes\n` +
        `• ${usage.user_feedback} feedback entries\n\n` +
        `All of it will be permanently deleted. Consider unpublishing instead.\n\n` +
        `Continue with deletion?`;
    } else {
      msg += "\n\nNo user data attached. Safe to delete.";
    }
    if (!confirm(msg)) return;

    try {
      const res = await api.delete(`/api/admin/exercises/${ex.exercise_id}`);
      if (res.ok) fetchAll();
      else { const err = await res.json(); alert(err.error || "Failed to delete"); }
    } catch (e) { console.error(e); }
  };

  const togglePublish = async (ex) => {
    try {
      const res = await api.put(`/api/admin/exercises/${ex.exercise_id}/publish`, { is_published: !ex.is_published });
      if (res.ok) fetchAll();
    } catch (e) { console.error(e); }
  };

  if (loading) {
    return <div className="adm-loading"><div className="adm-loading__spinner" /><div>Loading exercises…</div></div>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Exercises</h1>
          <p className={styles.subtitle}>{filtered.length} of {exercises.length} exercises</p>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}>
          {showForm ? "Cancel" : "+ New exercise"}
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleCreate} className={styles.form}>
          <h2 className={styles.formTitle}>Create exercise</h2>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Grade *</label>
              <select value={gradeId} onChange={(e) => setGradeId(e.target.value)} className="adm-select" required>
                <option value="">Select grade</option>
                {grades.map(g => <option key={g.grade_id} value={g.grade_id}>Grade {g.grade_level}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>Subject *</label>
              <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="adm-select" required>
                <option value="">Select subject</option>
                {subjects.map(s => <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Topic name</label>
              <input type="text" value={topicName} onChange={(e) => setTopicName(e.target.value)}
                placeholder="e.g. Algebra" className="adm-input" />
            </div>
            <div className={styles.field}>
              <label>Topic URL *</label>
              <input type="text" value={topicUrl} onChange={(e) => setTopicUrl(e.target.value)}
                placeholder="e.g. algebra_grade_10" className="adm-input" required />
              <span className={styles.hint}>Lowercase letters, numbers, underscores only</span>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Exercise name (slug) *</label>
              <input type="text" value={exerciseName} onChange={(e) => setExerciseName(e.target.value)}
                placeholder="e.g. algebra_basics_1" className="adm-input" required />
            </div>
            <div className={styles.field}>
              <label>Exercise title *</label>
              <input type="text" value={exerciseTitle} onChange={(e) => setExerciseTitle(e.target.value)}
                placeholder="e.g. Algebra Basics — Exercise 1" className="adm-input" required />
            </div>
          </div>

          <h3 className={styles.formSection}>Questions ({questions.length}/10)</h3>
          {questions.map((q, i) => (
            <div key={i} className={styles.qCard}>
              <div className={styles.qHeader}>
                <h4>Question {i + 1}</h4>
                <button type="button" className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => removeQuestion(i)}>Remove</button>
              </div>
              <input type="text" value={q.text} onChange={(e) => updateQuestion(i, 'text', e.target.value)}
                placeholder="Question text" className="adm-input" required />

              <div className={styles.imageRow}>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(i, e.target.files[0])} disabled={uploadingImage} />
                {q.image_url && (
                  <div className={styles.imagePreview}>
                    <img src={q.image_url} alt="" />
                    <button type="button" className="adm-btn adm-btn--danger adm-btn--sm"
                      onClick={() => updateQuestion(i, 'image_url', null)}>Remove</button>
                  </div>
                )}
              </div>

              <div className={styles.options}>
                {['a', 'b', 'c', 'd'].map(k => (
                  <input key={k} type="text" value={q[`option_${k}`]}
                    onChange={(e) => updateQuestion(i, `option_${k}`, e.target.value)}
                    placeholder={`Option ${k.toUpperCase()}`} className="adm-input" required />
                ))}
              </div>

              <select value={q.answer} onChange={(e) => updateQuestion(i, 'answer', e.target.value)}
                className="adm-select" required>
                <option value="">Correct answer</option>
                <option value="A">A</option><option value="B">B</option>
                <option value="C">C</option><option value="D">D</option>
              </select>
            </div>
          ))}

          {questions.length < 10 && (
            <button type="button" className="adm-btn" onClick={addQuestion}>
              + Add question ({questions.length}/10)
            </button>
          )}

          <div className={styles.formActions}>
            <button type="submit" className="adm-btn adm-btn--primary"
              disabled={questions.length !== 10 || uploadingImage}>
              {uploadingImage ? "Uploading image…" : "Create exercise"}
            </button>
            <button type="button" className="adm-btn" onClick={() => { setShowForm(false); resetForm(); }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <span className={styles.searchIcon}>⌕</span>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, name, subject…" className="adm-input" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className={`adm-select ${styles.filterSelect}`}>
          <option value="all">All</option>
          <option value="published">Published</option>
          <option value="unpublished">Unpublished</option>
        </select>
      </div>

      {pageItems.length === 0 ? (
        <div className="adm-empty">
          <div className="adm-empty__icon">▤</div>
          <div className="adm-empty__title">No exercises found</div>
          <div className="adm-empty__body">Try a different search or filter.</div>
        </div>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th><th>Title</th><th>Subject</th><th>Grade</th>
                  <th>Q</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((ex) => (
                  <tr key={ex.exercise_id}>
                    <td className={styles.idCell}>#{ex.exercise_id}</td>
                    <td className={styles.titleCell}>{ex.exercise_title}</td>
                    <td>{ex.subject_name}</td>
                    <td className={styles.muted}>Grade {ex.grade_level}</td>
                    <td className={styles.muted}>{ex.question_count}</td>
                    <td>
                      <span className={`adm-badge ${ex.is_published ? 'adm-badge--success' : 'adm-badge--neutral'}`}>
                        {ex.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <button className="adm-btn adm-btn--sm" onClick={() => startEdit(ex)}>Edit</button>
                      <button className="adm-btn adm-btn--sm" onClick={() => togglePublish(ex)}>
                        {ex.is_published ? "Unpublish" : "Publish"}
                      </button>
                      <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => deleteExercise(ex)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <div className={styles.pageInfo}>Page {page} of {totalPages}</div>
              <div className={styles.pageControls}>
                <button className={styles.pageBtn} disabled={page === 1} onClick={() => setPage(page - 1)}>←</button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i + 1}
                    className={`${styles.pageBtn} ${page === i + 1 ? styles.pageActive : ''}`}
                    onClick={() => setPage(i + 1)}>{i + 1}</button>
                ))}
                <button className={styles.pageBtn} disabled={page === totalPages} onClick={() => setPage(page + 1)}>→</button>
              </div>
            </div>
          )}
        </>
      )}

      {editTarget && (
        <div className={styles.overlay} onClick={() => setEditTarget(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <header className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Edit exercise #{editTarget.exercise_id}</h2>
              <button className={styles.modalClose} onClick={() => setEditTarget(null)}>✕</button>
            </header>
            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label>Exercise name (slug)</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="adm-input" />
              </div>
              <div className={styles.field}>
                <label>Exercise title</label>
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="adm-input" />
              </div>
              <p className={styles.hint}>Editing individual questions is not yet supported.</p>
            </div>
            <div className={styles.modalFooter}>
              <button className="adm-btn" onClick={() => setEditTarget(null)} disabled={saving}>Cancel</button>
              <button className="adm-btn adm-btn--primary" onClick={saveEdit} disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminExercises;