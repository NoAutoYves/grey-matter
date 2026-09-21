import { useState, useEffect, useRef } from "react";
import { api } from "../../utils/api";
import styles from './AdminExercises.module.css';

function AdminExercises() {
  const [exercises, setExercises] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [gradeId, setGradeId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [topicName, setTopicName] = useState("");
  const [topicUrl, setTopicUrl] = useState("");
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseTitle, setExerciseTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  
  const fileInputRefs = useRef({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState({});

  useEffect(() => {
    fetchExercises();
    fetchDropdownOptions();
  }, []);

  const fetchExercises = async () => {
    try {
      const response = await api.get('/api/admin/exercises');
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
      const [gradesRes, subjectsRes] = await Promise.all([
        api.get('/api/admin/grades'),
        api.get('/api/admin/subjects')
      ]);
      
      const gradesData = await gradesRes.json();
      const subjectsData = await subjectsRes.json();
      
      setGrades(gradesData.grades || []);
      setSubjects(subjectsData.subjects || []);
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
      text: "", option_a: "", option_b: "", option_c: "", option_d: "", answer: "", 
      image_url: null,
      image_filename: null,
      image_base64: ""
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

  const handleImageUpload = async (index, file) => {
    if (!file) return;
    
    if (file.size > 500 * 1024) {
      alert("Image too large. Please use images under 500KB.");
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file.");
      return;
    }
    
    const formData = new FormData();
    formData.append('image', file);
    
    setUploadingImage(true);
    setImageUploadProgress(prev => ({ ...prev, [index]: 'uploading' }));
    
    try {
      const response = await api.post('/api/upload/question-image', formData);
      const data = await response.json();
      
      if (response.ok) {
        const updated = [...questions];
        updated[index].image_url = data.image_url;
        updated[index].image_filename = data.filename;
        updated[index].image_base64 = "";
        setQuestions(updated);
        setImageUploadProgress(prev => ({ ...prev, [index]: 'done' }));
        
        if (fileInputRefs.current[index]) {
          fileInputRefs.current[index].value = "";
        }
      } else {
        alert(data.error || 'Failed to upload image');
        setImageUploadProgress(prev => ({ ...prev, [index]: 'error' }));
      }
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image');
      setImageUploadProgress(prev => ({ ...prev, [index]: 'error' }));
    } finally {
      setUploadingImage(false);
      setTimeout(() => {
        setImageUploadProgress(prev => {
          const newState = { ...prev };
          delete newState[index];
          return newState;
        });
      }, 3000);
    }
  };

  const removeImage = (index) => {
    const updated = [...questions];
    updated[index].image_url = null;
    updated[index].image_filename = null;
    updated[index].image_base64 = "";
    setQuestions(updated);
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index].value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!topicUrl.trim()) {
      alert("Topic URL is required. Use format: topicname_grade_X (e.g., equations_grade_10)");
      return;
    }
    
    if (!topicUrl.match(/^[a-z0-9_]+$/)) {
      alert("Topic URL must contain only lowercase letters, numbers, and underscores");
      return;
    }
    
    if (questions.length !== 10) {
      alert(`Please add ${10 - questions.length} more questions`);
      return;
    }
    
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
    
    const uploading = Object.values(imageUploadProgress).some(status => status === 'uploading');
    if (uploading) {
      alert("Please wait for images to finish uploading before submitting.");
      return;
    }
    
    const exerciseData = {
      grade_id: parseInt(gradeId),
      subject_id: parseInt(subjectId),
      topic_name: topicName.trim() || null,
      topic_url: topicUrl.trim().toLowerCase(),
      exercise_name: exerciseName.replace(/\s+/g, '_').toLowerCase(),
      exercise_title: exerciseTitle,
      questions: questions.map(q => ({
        text: q.text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        answer: q.answer,
        image_url: q.image_url || null
      }))
    };
    
    try {
      const response = await api.post('/api/admin/exercises', exerciseData);
      
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
    setTopicName("");
    setTopicUrl("");
    setExerciseName("");
    setExerciseTitle("");
    setQuestions([]);
    fileInputRefs.current = {};
    setImageUploadProgress({});
  };

  const deleteExercise = async (exerciseId) => {
    if (confirm("Delete this exercise? All questions will be removed.")) {
      try {
        const response = await api.delete(`/api/admin/exercises/${exerciseId}`);
        if (response.ok) {
          fetchExercises();
        }
      } catch (error) {
        console.error("Failed to delete exercise:", error);
      }
    }
  };

  const togglePublish = async (exerciseId, currentStatus) => {
    try {
      const response = await api.put(`/api/admin/exercises/${exerciseId}/publish`, { is_published: !currentStatus });
      if (response.ok) {
        fetchExercises();
      }
    } catch (error) {
      console.error("Failed to toggle publish status:", error);
    }
  };

  if (loading) return <div className={styles.loading}>Loading exercises...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Exercise Management</h1>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add New Exercise"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <h2 className={styles.formTitle}>Create New Exercise</h2>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Grade *</label>
              <select value={gradeId} onChange={(e) => setGradeId(e.target.value)} required>
                <option value="">Select Grade</option>
                {grades.map(g => <option key={g.grade_id} value={g.grade_id}>Grade {g.grade_level}</option>)}
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label>Subject *</label>
              <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required>
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Topic Name (Optional)</label>
              <input 
                type="text" 
                value={topicName} 
                onChange={(e) => setTopicName(e.target.value)} 
                placeholder="e.g., Algebra, Ledgers, Supply & Demand"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Topic URL *</label>
              <input 
                type="text" 
                value={topicUrl} 
                onChange={(e) => setTopicUrl(e.target.value)} 
                placeholder="e.g., equations_grade_10"
                required 
              />
              <span className={styles.hintWarning}>
                ⚠️ Must be unique. Use format: topicname_grade_X (e.g., equations_grade_10)
              </span>
              <span className={styles.hint}>Lowercase letters, numbers, and underscores only</span>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Exercise Name (for URL) *</label>
              <input 
                type="text" 
                value={exerciseName} 
                onChange={(e) => setExerciseName(e.target.value)} 
                placeholder="e.g., algebra_basics_1" 
                required 
              />
              <span className={styles.hint}>Use underscores, no spaces. Example: accounting_exercise_1</span>
            </div>
            
            <div className={styles.formGroup}>
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

          <div className={styles.questionsSection}>
            <h3>Questions (10 required)</h3>
            {questions.map((q, idx) => (
              <div key={idx} className={styles.questionCard}>
                <div className={styles.questionHeader}>
                  <h4>Question {idx + 1}</h4>
                  <button type="button" className={styles.removeBtn} onClick={() => removeQuestion(idx)}>Remove</button>
                </div>
                
                <input 
                  type="text" 
                  placeholder="Question text" 
                  value={q.text} 
                  onChange={(e) => updateQuestion(idx, 'text', e.target.value)} 
                  required 
                />
                
                <div className={styles.imageUploadSection}>
                  <label>Diagram/Image (optional, max 500KB):</label>
                  <div className={styles.imageUploadWrapper}>
                    <input 
                      type="file" 
                      accept="image/*"
                      ref={el => fileInputRefs.current[idx] = el}
                      onChange={(e) => handleImageUpload(idx, e.target.files[0])}
                      disabled={uploadingImage}
                    />
                    {imageUploadProgress[idx] === 'uploading' && (
                      <span className={styles.uploadStatus}>⏳ Uploading...</span>
                    )}
                    {imageUploadProgress[idx] === 'done' && (
                      <span className={styles.uploadStatusSuccess}>✅ Uploaded</span>
                    )}
                    {imageUploadProgress[idx] === 'error' && (
                      <span className={styles.uploadStatusError}>❌ Failed</span>
                    )}
                  </div>
                  
                  {q.image_url && (
                    <div className={styles.imagePreview}>
                      <img src={q.image_url} alt="Preview" />
                      <button type="button" onClick={() => removeImage(idx)} className={styles.removeImageBtn}>
                        Remove Image
                      </button>
                      <span className={styles.imageFilename}>{q.image_filename}</span>
                    </div>
                  )}
                </div>
                
                <div className={styles.optionsRow}>
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
              <button type="button" className={styles.addQuestionBtn} onClick={addQuestion}>
                Add Question ({questions.length}/10)
              </button>
            )}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={questions.length !== 10 || uploadingImage}>
            {uploadingImage ? "Uploading images..." : "Create Exercise"}
          </button>
        </form>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Subject</th>
              <th>Grade</th>
              <th>Questions</th>
              <th>Published</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exercises.map((ex) => (
              <tr key={ex.exercise_id}>
                <td>{ex.exercise_id}</td>
                <td>{ex.exercise_title}</td>
                <td>{ex.subject_name}</td>
                <td>Grade {ex.grade_level}</td>
                <td>{ex.question_count}</td>
                <td>
                  <span className={`${styles.badge} ${ex.is_published ? styles.badgeYes : styles.badgeNo}`}>
                    {ex.is_published ? "Yes" : "No"}
                  </span>
                </td>
                <td className={styles.actionsCell}>
                  <button 
                    className={`${styles.btn} ${ex.is_published ? styles.btnDanger : styles.btnSuccess}`}
                    onClick={() => togglePublish(ex.exercise_id, ex.is_published)}
                  >
                    {ex.is_published ? "Unpublish" : "Publish"}
                  </button>
                  <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => deleteExercise(ex.exercise_id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminExercises;