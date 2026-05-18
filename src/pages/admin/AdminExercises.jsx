import { useState, useEffect, useRef } from "react";
import { apiRequest } from "../../utils/api";

function AdminExercises() {
  const [exercises, setExercises] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [gradeId, setGradeId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [termId, setTermId] = useState("");
  const [topicName, setTopicName] = useState("");
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseTitle, setExerciseTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  
  // Dropdown options
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [terms, setTerms] = useState([]);
  
  // File input refs for each question
  const fileInputRefs = useRef({});

  useEffect(() => {
    fetchExercises();
    fetchDropdownOptions();
  }, []);

  const fetchExercises = async () => {
    try {
      const response = await apiRequest(`/api/admin/exercises`);
      const data = await response.json();
      if (response.ok) {
        setExercises(data.exercises);
      }
    } catch (error) {
      console.error("Failed to fetch exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownOptions = async () => {
    try {
      const [gradesRes, subjectsRes, termsRes] = await Promise.all([
        apiRequest(`/api/admin/grades`),
        apiRequest(`/api/admin/subjects`),
        apiRequest(`/api/admin/terms`)
      ]);
      
      const gradesData = await gradesRes.json();
      const subjectsData = await subjectsRes.json();
      const termsData = await termsRes.json();
      
      setGrades(gradesData.grades || []);
      setSubjects(subjectsData.subjects || []);
      setTerms(termsData.terms || []);
    } catch (error) {
      console.error("Failed to fetch dropdown options:", error);
    }
  };

  const addQuestion = () => {
    if (questions.length >= 10) {
      alert("Maximum 10 questions per exercise");
      return;
    }
    setQuestions([...questions, {
      text: "", option_a: "", option_b: "", option_c: "", option_d: "", answer: "", image_base64: ""
    }]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const handleImageUpload = (index, file) => {
    if (!file) return;
    
    // Check file size (max 200KB)
    if (file.size > 200 * 1024) {
      alert("Image too large. Please use images under 200KB.");
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file.");
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      updateQuestion(index, 'image_base64', base64String);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index) => {
    updateQuestion(index, 'image_base64', "");
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index].value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (questions.length !== 10) {
      alert(`Please add ${10 - questions.length} more questions`);
      return;
    }
    
    // Validate all questions have text and options
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        alert(`Question ${i + 1} has no text`);
        return;
      }
      if (!q.option_a.trim() || !q.option_b.trim() || !q.option_c.trim() || !q.option_d.trim()) {
        alert(`Question ${i + 1} has missing options`);
        return;
      }
      if (!q.answer) {
        alert(`Question ${i + 1} has no correct answer selected`);
        return;
      }
    }
    
    const exerciseData = {
      grade_id: parseInt(gradeId),
      subject_id: parseInt(subjectId),
      term_id: parseInt(termId),
      topic_name: topicName.trim() || null,
      exercise_name: exerciseName.replace(/\s+/g, '_').toLowerCase(),
      exercise_title: exerciseTitle,
      questions: questions.map(q => ({
        text: q.text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        answer: q.answer,
        image_base64: q.image_base64 || ""
      }))
    };
    
    try {
      const response = await apiRequest(`/api/admin/exercises`, {
        method: "POST",
        body: JSON.stringify(exerciseData)
      });
      
      if (response.ok) {
        alert("Exercise created successfully!");
        setShowForm(false);
        resetForm();
        fetchExercises();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create exercise");
      }
    } catch (error) {
      console.error("Failed to create exercise:", error);
    }
  };

  const resetForm = () => {
    setGradeId("");
    setSubjectId("");
    setTermId("");
    setTopicName("");
    setExerciseName("");
    setExerciseTitle("");
    setQuestions([]);
    fileInputRefs.current = {};
  };

  const deleteExercise = async (exerciseId) => {
    if (confirm("Delete this exercise? All questions will be removed.")) {
      try {
        const response = await apiRequest(`/api/admin/exercises/${exerciseId}`, {
          method: "DELETE"
        });
        if (response.ok) {
          fetchExercises();
        }
      } catch (error) {
        console.error("Failed to delete exercise:", error);
      }
    }
  };

  if (loading) return <div className="admin-loading">Loading exercises...</div>;

  return (
    <div className="admin-exercises">
      <div className="admin-header">
        <h1>Exercise Management</h1>
        <button className="admin-btn primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add New Exercise"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="exercise-form">
          <h2>Create New Exercise</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Grade *</label>
              <select value={gradeId} onChange={(e) => setGradeId(e.target.value)} required>
                <option value="">Select Grade</option>
                {grades.map(g => <option key={g.grade_id} value={g.grade_id}>Grade {g.grade_level}</option>)}
              </select>
            </div>
            
            <div className="form-group">
              <label>Subject *</label>
              <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required>
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Term *</label>
              <select value={termId} onChange={(e) => setTermId(e.target.value)} required>
                <option value="">Select Term</option>
                {terms.map(t => <option key={t.term_id} value={t.term_id}>{t.term_name}</option>)}
              </select>
            </div>
            
            <div className="form-group">
              <label>Topic (Optional)</label>
              <input 
                type="text" 
                value={topicName} 
                onChange={(e) => setTopicName(e.target.value)} 
                placeholder="e.g., Algebra, Ledgers, Supply & Demand"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Exercise Name (for URL) *</label>
              <input 
                type="text" 
                value={exerciseName} 
                onChange={(e) => setExerciseName(e.target.value)} 
                placeholder="e.g., algebra_basics_1" 
                required 
              />
              <small>Use underscores, no spaces. Example: accounting_exercise_1</small>
            </div>
            
            <div className="form-group">
              <label>Exercise Title (display name) *</label>
              <input 
                type="text" 
                value={exerciseTitle} 
                onChange={(e) => setExerciseTitle(e.target.value)} 
                placeholder="e.g., Algebra Basics - Exercise 1" 
                required 
              />
            </div>
          </div>

          <div className="questions-section">
            <h3>Questions (10 required)</h3>
            {questions.map((q, idx) => (
              <div key={idx} className="question-card">
                <div className="question-header">
                  <h4>Question {idx + 1}</h4>
                  <button type="button" className="remove-btn" onClick={() => removeQuestion(idx)}>Remove</button>
                </div>
                
                <input 
                  type="text" 
                  placeholder="Question text" 
                  value={q.text} 
                  onChange={(e) => updateQuestion(idx, 'text', e.target.value)} 
                  required 
                />
                
                {/* Image upload section */}
                <div className="image-upload-section">
                  <label>Diagram/Image (optional, max 200KB):</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    ref={el => fileInputRefs.current[idx] = el}
                    onChange={(e) => handleImageUpload(idx, e.target.files[0])}
                  />
                  {q.image_base64 && (
                    <div className="image-preview">
                      <img src={q.image_base64} alt="Preview" />
                      <button type="button" onClick={() => removeImage(idx)} className="remove-image-btn">Remove Image</button>
                    </div>
                  )}
                </div>
                
                <div className="options-row">
                  <input type="text" placeholder="Option A" value={q.option_a} onChange={(e) => updateQuestion(idx, 'option_a', e.target.value)} required />
                  <input type="text" placeholder="Option B" value={q.option_b} onChange={(e) => updateQuestion(idx, 'option_b', e.target.value)} required />
                  <input type="text" placeholder="Option C" value={q.option_c} onChange={(e) => updateQuestion(idx, 'option_c', e.target.value)} required />
                  <input type="text" placeholder="Option D" value={q.option_d} onChange={(e) => updateQuestion(idx, 'option_d', e.target.value)} required />
                </div>
                
                <select value={q.answer} onChange={(e) => updateQuestion(idx, 'answer', e.target.value)} required>
                  <option value="">Correct Answer</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
            ))}
            {questions.length < 10 && (
              <button type="button" className="add-question-btn" onClick={addQuestion}>
                Add Question ({questions.length}/10)
              </button>
            )}
          </div>

          <button type="submit" className="submit-btn" disabled={questions.length !== 10}>
            Create Exercise
          </button>
        </form>
      )}

      <table className="admin-table">
        <thead>
          <tr><th>ID</th><th>Title</th><th>Subject</th><th>Grade</th><th>Term</th><th>Questions</th><th>Published</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {exercises.map((ex) => (
            <tr key={ex.exercise_id}>
              <td>{ex.exercise_id}</td>
              <td>{ex.exercise_title}</td>
              <td>{ex.subject_name}</td>
              <td>Grade {ex.grade_level}</td>
              <td>{ex.term_name}</td>
              <td>{ex.question_count}</td>
              <td>{ex.is_published ? "Yes" : "No"}</td>
              <td>
                <button className="admin-btn delete" onClick={() => deleteExercise(ex.exercise_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminExercises;