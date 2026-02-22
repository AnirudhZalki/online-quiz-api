import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Trash, Database, Users, HelpCircle } from 'lucide-react';

const TeacherDashboard = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [newQuiz, setNewQuiz] = useState({ title: '', description: '', duration: 10, questions: [] });
    const [currentQuestion, setCurrentQuestion] = useState({ text: '', options: ['', '', '', ''], correct_options: [] });
    const [showResults, setShowResults] = useState(false);
    const [selectedResults, setSelectedResults] = useState([]);
    const [loadingResults, setLoadingResults] = useState(false);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const { data } = await api.get('/teacher/quizzes');
            setQuizzes(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchResults = async (quizId) => {
        setLoadingResults(true);
        setShowResults(true);
        try {
            const { data } = await api.get(`/teacher/results/${quizId}`);
            setSelectedResults(data);
        } catch (err) {
            console.error(err);
            alert("Failed to fetch results");
            setShowResults(false);
        } finally {
            setLoadingResults(false);
        }
    };

    const addQuestion = () => {
        setNewQuiz({ ...newQuiz, questions: [...newQuiz.questions, currentQuestion] });
        setCurrentQuestion({ text: '', options: ['', '', '', ''], correct_options: [] });
    };

    const removeQuestion = (index) => {
        const updated = newQuiz.questions.filter((_, i) => i !== index);
        setNewQuiz({ ...newQuiz, questions: updated });
    };

    const handleCreate = async () => {
        try {
            const payload = {
                ...newQuiz,
                questions: newQuiz.questions.map(q => ({
                    text: q.text,
                    options: q.options,
                    correct_options: q.correct_options
                }))
            };
            await api.post('/teacher/quiz', payload);
            setShowCreate(false);
            setNewQuiz({ title: '', description: '', duration: 10, questions: [] });
            fetchQuizzes();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create quiz');
        }
    };

    return (
        <div className="teacher-dashboard container">
            <header className="page-header">
                <div>
                    <h1>Teacher Hub</h1>
                    <p>Design challenges and track student progress.</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="btn-primary">
                    <Plus size={20} /> Create New Quiz
                </button>
            </header>

            <div className="stats-row">
                <div className="stat-card glass-morphism">
                    <Database size={24} className="stat-icon" />
                    <div>
                        <h4>Total Quizzes</h4>
                        <p>{quizzes.length}</p>
                    </div>
                </div>
            </div>

            <div className="quiz-list">
                <h2>Your Quizzes</h2>
                <div className="quiz-table-container glass-morphism">
                    <table className="quiz-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Duration</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quizzes.map(q => (
                                <tr key={q.id}>
                                    <td>{q.title}</td>
                                    <td>{q.duration} mins</td>
                                    <td>{new Date(q.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <button onClick={() => fetchResults(q.id)} className="action-btn view"><Users size={16} /> Results</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showCreate && (
                <div className="modal-overlay">
                    <div className="modal card glass-morphism">
                        <h2>Create New Quiz</h2>
                        <div className="form-group">
                            <input
                                placeholder="Quiz Title"
                                value={newQuiz.title}
                                onChange={e => setNewQuiz({ ...newQuiz, title: e.target.value })}
                            />
                            <textarea
                                placeholder="Description"
                                value={newQuiz.description}
                                onChange={e => setNewQuiz({ ...newQuiz, description: e.target.value })}
                            />
                            <div className="duration-input">
                                <label>Duration (Minutes):</label>
                                <input
                                    type="number"
                                    value={newQuiz.duration}
                                    onChange={e => setNewQuiz({ ...newQuiz, duration: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="questions-section">
                            <h3>Questions ({newQuiz.questions.length})</h3>
                            <div className="add-question card">
                                <input
                                    placeholder="Question Text"
                                    value={currentQuestion.text}
                                    onChange={e => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                                />
                                <div className="options-grid">
                                    {currentQuestion.options.map((opt, i) => (
                                        <div key={i} className="option-field">
                                            <input
                                                placeholder={`Option ${i + 1}`}
                                                value={opt}
                                                onChange={e => {
                                                    const opts = [...currentQuestion.options];
                                                    opts[i] = e.target.value;
                                                    setCurrentQuestion({ ...currentQuestion, options: opts });
                                                }}
                                            />
                                            <input
                                                type="checkbox"
                                                checked={currentQuestion.correct_options.includes(i)}
                                                onChange={() => {
                                                    const current = currentQuestion.correct_options;
                                                    const updated = current.includes(i)
                                                        ? current.filter(idx => idx !== i)
                                                        : [...current, i];
                                                    setCurrentQuestion({ ...currentQuestion, correct_options: updated });
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <button onClick={addQuestion} className="btn-secondary"><Plus size={16} /> Add to Quiz</button>
                            </div>

                            <div className="question-preview-list">
                                {newQuiz.questions.map((q, i) => (
                                    <div key={i} className="preview-item">
                                        <span>{i + 1}. {q.text}</span>
                                        <button onClick={() => removeQuestion(i)}><Trash size={16} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button onClick={() => setShowCreate(false)} className="cancel-btn">Cancel</button>
                            <button onClick={handleCreate} className="btn-primary">Create Quiz</button>
                        </div>
                    </div>
                </div>
            )}

            {showResults && (
                <div className="modal-overlay">
                    <div className="modal card glass-morphism">
                        <header className="modal-header">
                            <h2>Quiz Results</h2>
                            <button onClick={() => setShowResults(false)} className="close-btn"><Plus size={24} style={{ transform: 'rotate(45deg)' }} /></button>
                        </header>

                        {loadingResults ? (
                            <div className="loader">Loading student performance...</div>
                        ) : selectedResults.length === 0 ? (
                            <div className="no-data">No submissions yet for this quiz.</div>
                        ) : (
                            <div className="results-table-container">
                                <table className="results-table">
                                    <thead>
                                        <tr>
                                            <th>Student</th>
                                            <th>Score</th>
                                            <th>Status</th>
                                            <th>Submitted At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedResults.map(res => (
                                            <tr key={res.id}>
                                                <td>{res.student_username}</td>
                                                <td><span className="score-badge">{res.score}</span></td>
                                                <td><span className={`status-pill ${res.status}`}>{res.status}</span></td>
                                                <td>{new Date(res.end_time).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem; }
        .stats-row { display: flex; gap: 2rem; margin-bottom: 3rem; }
        .stat-card { flex: 1; padding: 1.5rem; borderRadius: 15px; display: flex; gap: 1rem; align-items: center; }
        .stat-icon { color: var(--primary); }
        
        .quiz-table-container { borderRadius: 20px; overflow: hidden; margin-top: 1rem; }
        .quiz-table { width: 100%; border-collapse: collapse; text-align: left; }
        .quiz-table th { background: rgba(255, 255, 255, 0.05); padding: 1rem; color: var(--text-muted); font-size: 0.9rem; }
        .quiz-table td { padding: 1.2rem 1rem; border-bottom: 1px solid var(--border); }
        .action-btn { background: rgba(99, 102, 241, 0.1); color: var(--primary); padding: 0.5rem 1rem; borderRadius: 8px; display: flex; align-items: center; gap: 0.5rem; }
        
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 2rem; }
        .modal { width: 100%; max-width: 800px; max-height: 90vh; overflow-y: auto; padding: 2.5rem; }
        .form-group { display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem; }
        input, textarea { background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border); padding: 1rem; borderRadius: 12px; color: white; width: 100%; }
        .duration-input { display: flex; align-items: center; gap: 1rem; color: var(--text-muted); }
        .duration-input input { width: 100px; }
        
        .questions-section { margin-top: 2rem; }
        .add-question { background: rgba(255, 255, 255, 0.03); padding: 1.5rem; margin-top: 1rem; display: flex; flex-direction: column; gap: 1rem; }
        .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .option-field { display: flex; align-items: center; gap: 0.5rem; }
        .btn-secondary { background: var(--bg-dark); color: white; border: 1px solid var(--border); padding: 0.8rem; borderRadius: 10px; }
        
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .close-btn { background: transparent; color: var(--text-muted); }
        .loader, .no-data { text-align: center; padding: 3rem; color: var(--text-muted); }

        .results-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        .results-table th { text-align: left; padding: 1rem; color: var(--text-muted); border-bottom: 1px solid var(--border); }
        .results-table td { padding: 1.2rem 1rem; border-bottom: 1px solid var(--border); }
        
        .score-badge { background: var(--primary); color: white; padding: 0.3rem 0.8rem; borderRadius: 12px; font-weight: 700; }
        .status-pill { padding: 0.3rem 0.8rem; borderRadius: 20px; font-size: 0.8rem; text-transform: capitalize; }
        .status-pill.completed { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
        .status-pill.active { background: rgba(234, 179, 8, 0.1); color: #eab308; }
        .status-pill.expired { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        
        .preview-item { display: flex; justify-content: space-between; padding: 1rem; background: rgba(99, 102, 241, 0.05); margin-top: 0.5rem; borderRadius: 10px; }
        .preview-item button { color: var(--accent); background: transparent; }
        
        .modal-actions { margin-top: 2.5rem; display: flex; justify-content: flex-end; gap: 1.5rem; }
        .cancel-btn { background: transparent; color: var(--text-muted); font-weight: 600; }
      `}</style>
        </div>
    );
};

export default TeacherDashboard;
