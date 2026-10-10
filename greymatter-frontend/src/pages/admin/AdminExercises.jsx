import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import "../../styles/admin/AdminShared.css";
import "../../styles/admin/AdminExercises.css";

const EMPTY_QUESTION = () => ({
  text: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  answer: "A",
});

const EMPTY_FORM = () => ({
  grade_id: "",
  subject_id: "",
  topic_name: "",
  topic_url: "",
  exercise_name: "",
  exercise_title: "",
  questions: Array.from({ length: 10 }, EMPTY_QUESTION),
});

function ConfirmModal({ title, text, confirmLabel = "Confirm", danger, onConfirm, onCancel, busy }) {
  return (
    <div className="admin-modal-backdrop" onClick={busy ? undefined : onCancel}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">{title}</h3>
          <button className="admin-modal-close" onClick={onCancel} disabled={busy}>×</button>
        </div>
        <div className="admin-modal-body"><p>{text}</p></div>
        <div className="admin-modal-footer">
          <button className="admin-btn admin-btn-secondary" onClick={onCancel} disabled={busy}>Cancel</button>
          <button
            className={`admin-btn ${danger ? "admin-btn-danger" : "admin-btn-primary"}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ exercise, onSaved, onClose }) {
  const [name, setName] = useState(exercise.exercise_name);
  const [title, setTitle] = useState(exercise.exercise_title);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    if (!name.trim() || !title.trim()) {
      setError("Name and title are required");
      return;
    }
    setSaving(true);
    try {
      const res = await api.put(`/api/admin/exercises/${exercise.exercise_id}`, {
        exercise_name: name.trim(),
        exercise_title: title.trim(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      onSaved({ ...exercise, exercise_name: name.trim(), exercise_title: title.trim() });
    } catch (e) {
      setError(e.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" onClick={saving ? undefined : onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">Edit Exercise</h3>
          <button className="admin-modal-close" onClick={onClose} disabled={saving}>×</button>
        </div>
        <div className="admin-modal-body">
          {error && <div className="admin-error-banner">{error}</div>}
          <div className="admin-field">
            <label>Exercise name (unique slug)</label>
            <input className="admin-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="admin-field">
            <label>Exercise title</label>
            <input className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="admin-btn admin-btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="admin-btn admin-btn-primary" onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function UsageModal({ exercise, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/api/admin/exercises/${exercise.exercise_id}/usage`);
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || "Failed to load usage");
        setData(d);
      } catch (e) {
        setError(e.message || "Failed to load usage");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [exercise.exercise_id]);

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">Usage — {exercise.exercise_title}</h3>
          <button className="admin-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="admin-modal-body">
          {loading ? (
            <div className="admin-loading">Loading...</div>
          ) : error ? (
            <div className="admin-error-banner">{error}</div>
          ) : (
            <div className="admin-usage-grid">
              <div className="admin-usage-item">
                <span className="admin-stat-label">Progress records</span>
                <span className="admin-stat-value">{data.user_progress}</span>
              </div>
              <div className="admin-usage-item">
                <span className="admin-stat-label">Notes</span>
                <span className="admin-stat-value">{data.user_notes}</span>
              </div>
              <div className="admin-usage-item">
                <span className="admin-stat-label">Feedback</span>
                <span className="admin-stat-value">{data.user_feedback}</span>
              </div>
              <div className="admin-usage-item">
                <span className="admin-stat-label">Total interactions</span>
                <span className="admin-stat-value">{data.total}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateModal({ grades, subjects, onCreated, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const setQuestion = (index, key, value) => {
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q, i) => i === index ? { ...q, [key]: value } : q),
    }));
  };

  const submit = async () => {
    setError("");

    if (!form.grade_id || !form.subject_id) {
      setError("Grade and subject are required");
      return;
    }
    if (!form.exercise_name.trim() || !form.exercise_title.trim()) {
      setError("Exercise name and title are required");
      return;
    }
    for (let i = 0; i < form.questions.length; i++) {
      const q = form.questions[i];
      if (!q.text.trim() || !q.option_a.trim() || !q.option_b.trim() || !q.option_c.trim() || !q.option_d.trim()) {
        setError(`Question ${i + 1} is incomplete`);
        return;
      }
    }

    setSaving(true);
    try {
      const res = await api.post("/api/admin/exercises", {
        grade_id: parseInt(form.grade_id),
        subject_id: parseInt(form.subject_id),
        topic_name: form.topic_name.trim(),
        topic_url: form.topic_url.trim(),
        exercise_name: form.exercise_name.trim(),
        exercise_title: form.exercise_title.trim(),
        questions: form.questions,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create exercise");
      onCreated();
    } catch (e) {
      setError(e.message || "Failed to create exercise");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" onClick={saving ? undefined : onClose}>
      <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">Create Exercise</h3>
          <button className="admin-modal-close" onClick={onClose} disabled={saving}>×</button>
        </div>
        <div className="admin-modal-body">
          {error && <div className="admin-error-banner">{error}</div>}

          <h4 className="admin-section-title">Metadata</h4>
          <div className="admin-field-row">
            <div className="admin-field">
              <label>Grade</label>
              <select className="admin-select" value={form.grade_id} onChange={(e) => setField("grade_id", e.target.value)}>
                <option value="">Select grade</option>
                {grades.map((g) => (
                  <option key={g.grade_id} value={g.grade_id}>{g.display_name}</option>
                ))}
              </select>
            </div>
            <div className="admin-field">
              <label>Subject</label>
              <select className="admin-select" value={form.subject_id} onChange={(e) => setField("subject_id", e.target.value)}>
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-field-row">
            <div className="admin-field">
              <label>Topic name</label>
              <input className="admin-input" value={form.topic_name} onChange={(e) => setField("topic_name", e.target.value)} placeholder="e.g. Business Cycles" />
            </div>
            <div className="admin-field">
              <label>Topic URL slug</label>
              <input className="admin-input" value={form.topic_url} onChange={(e) => setField("topic_url", e.target.value)} placeholder="e.g. business_cycles_economics_grade_12" />
            </div>
          </div>

          <div className="admin-field">
            <label>Exercise name (globally unique)</label>
            <input className="admin-input" value={form.exercise_name} onChange={(e) => setField("exercise_name", e.target.value)} placeholder="business_cycles_economics_grade_12_exercise_1" />
          </div>

          <div className="admin-field">
            <label>Exercise title</label>
            <input className="admin-input" value={form.exercise_title} onChange={(e) => setField("exercise_title", e.target.value)} placeholder="Business Cycles (Grade 12 Economics) - Exercise 1" />
          </div>

          <h4 className="admin-section-title" style={{ marginTop: "2rem" }}>Questions (10 required)</h4>
          {form.questions.map((q, i) => (
            <div key={i} className="admin-question-block">
              <div className="admin-question-header">Question {i + 1}</div>
              <div className="admin-field">
                <label>Question text</label>
                <textarea
                  className="admin-textarea"
                  value={q.text}
                  onChange={(e) => setQuestion(i, "text", e.target.value)}
                  rows={2}
                />
              </div>
              <div className="admin-field-row">
                <div className="admin-field">
                  <label>Option A</label>
                  <input className="admin-input" value={q.option_a} onChange={(e) => setQuestion(i, "option_a", e.target.value)} />
                </div>
                <div className="admin-field">
                  <label>Option B</label>
                  <input className="admin-input" value={q.option_b} onChange={(e) => setQuestion(i, "option_b", e.target.value)} />
                </div>
              </div>
              <div className="admin-field-row">
                <div className="admin-field">
                  <label>Option C</label>
                  <input className="admin-input" value={q.option_c} onChange={(e) => setQuestion(i, "option_c", e.target.value)} />
                </div>
                <div className="admin-field">
                  <label>Option D</label>
                  <input className="admin-input" value={q.option_d} onChange={(e) => setQuestion(i, "option_d", e.target.value)} />
                </div>
              </div>
              <div className="admin-field">
                <label>Correct answer</label>
                <select className="admin-select" value={q.answer} onChange={(e) => setQuestion(i, "answer", e.target.value)}>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
            </div>
          ))}
        </div>
        <div className="admin-modal-footer">
          <button className="admin-btn admin-btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="admin-btn admin-btn-primary" onClick={submit} disabled={saving}>
            {saving ? "Creating..." : "Create exercise"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminExercises() {
  const [exercises, setExercises] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [usageTarget, setUsageTarget] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const loadAll = async () => {
    try {
      const [exRes, grRes, suRes] = await Promise.all([
        api.get("/api/admin/exercises"),
        api.get("/api/admin/grades"),
        api.get("/api/admin/subjects"),
      ]);
      const [exData, grData, suData] = await Promise.all([
        exRes.json(), grRes.json(), suRes.json(),
      ]);
      if (!exRes.ok) throw new Error(exData.error || "Failed to load exercises");
      setExercises(exData.exercises || []);
      if (grRes.ok) setGrades(grData.grades || []);
      if (suRes.ok) setSubjects(suData.subjects || []);
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(t);
  }, [message]);

  const togglePublish = async (ex) => {
    setBusyId(ex.exercise_id);
    try {
      const next = !ex.is_published;
      const res = await api.put(`/api/admin/exercises/${ex.exercise_id}/publish`, { is_published: next });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      setExercises((prev) => prev.map((e) => e.exercise_id === ex.exercise_id ? { ...e, is_published: next } : e));
      setMessage(`${next ? "Published" : "Unpublished"} ${ex.exercise_title}`);
    } catch (e) {
      setError(e.message || "Failed to update");
    } finally {
      setBusyId(null);
    }
  };

  const deleteExercise = (ex) => {
    setConfirm({
      title: "Delete exercise?",
      text: `Permanently delete "${ex.exercise_title}"? All 10 questions, user progress, and notes for this exercise will be removed.`,
      confirmLabel: "Delete exercise",
      danger: true,
      onConfirm: async () => {
        setBusyId(ex.exercise_id);
        try {
          const res = await api.delete(`/api/admin/exercises/${ex.exercise_id}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to delete");
          setExercises((prev) => prev.filter((e) => e.exercise_id !== ex.exercise_id));
          setMessage(`Deleted ${ex.exercise_title}`);
          setConfirm(null);
        } catch (e) {
          setError(e.message || "Failed to delete");
        } finally {
          setBusyId(null);
        }
      },
    });
  };

  if (loading) return <div className="admin-loading">Loading exercises...</div>;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Exercises</h1>
          <p className="admin-page-subtitle">{exercises.length} total</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={() => setShowCreate(true)}>
          + New exercise
        </button>
      </header>

      {error && <div className="admin-error-banner">{error}</div>}
      {message && <div className="admin-success-banner">{message}</div>}

      {exercises.length === 0 ? (
        <div className="admin-empty">No exercises yet</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Name</th>
                <th>Subject</th>
                <th>Grade</th>
                <th>Qs</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exercises.map((ex) => (
                <tr key={ex.exercise_id}>
                  <td className="admin-cell-num">{ex.exercise_id}</td>
                  <td>{ex.exercise_title}</td>
                  <td className="admin-cell-details">{ex.exercise_name}</td>
                  <td>{ex.subject_name}</td>
                  <td className="admin-cell-num">{ex.grade_level}</td>
                  <td className="admin-cell-num">{ex.question_count}</td>
                  <td>
                    <span className={`admin-badge ${ex.is_published ? "admin-badge-success" : "admin-badge-neutral"}`}>
                      {ex.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        className="admin-btn admin-btn-ghost admin-btn-sm"
                        onClick={() => togglePublish(ex)}
                        disabled={busyId === ex.exercise_id}
                      >
                        {ex.is_published ? "Unpublish" : "Publish"}
                      </button>
                      <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setEditTarget(ex)}>Edit</button>
                      <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setUsageTarget(ex)}>Usage</button>
                      <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => deleteExercise(ex)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <CreateModal
          grades={grades}
          subjects={subjects}
          onCreated={() => {
            setShowCreate(false);
            setMessage("Exercise created");
            loadAll();
          }}
          onClose={() => setShowCreate(false)}
        />
      )}

      {editTarget && (
        <EditModal
          exercise={editTarget}
          onSaved={(updated) => {
            setExercises((prev) => prev.map((e) => e.exercise_id === updated.exercise_id ? updated : e));
            setMessage("Exercise updated");
            setEditTarget(null);
          }}
          onClose={() => setEditTarget(null)}
        />
      )}

      {usageTarget && (
        <UsageModal exercise={usageTarget} onClose={() => setUsageTarget(null)} />
      )}

      {confirm && (
        <ConfirmModal
          title={confirm.title}
          text={confirm.text}
          confirmLabel={confirm.confirmLabel}
          danger={confirm.danger}
          busy={busyId !== null}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

export default AdminExercises;