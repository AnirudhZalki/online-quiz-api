import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Clock, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

const QuizRoom = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);

    const startSession = useCallback(async () => {
        try {
            const { data } = await api.post('/student/start', { quiz_id: id });
            setSession(data.session_id);
            setQuestions(data.questions);

            const end = new Date(data.end_time).getTime();
            const now = new Date().getTime();
            setTimeLeft(Math.max(0, Math.floor((end - now) / 1000)));
        } catch (err) {
            console.error(err);
            navigate('/student');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        startSession();
    }, [startSession]);

    useEffect(() => {
        if (timeLeft <= 0 && session && !submitted) {
            handleSubmit();
            return;
        }

        const timer = timeLeft > 0 && setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, session, submitted]);

    const handleSubmit = async () => {
        if (submitted) return;
        setSubmitted(true);

        const submissions = Object.entries(answers).map(([qId, ansArray]) => ({
            question_id: qId,
            answers: ansArray
        }));

        try {
            const { data } = await api.post('/student/submit', {
                session_id: session,
                answers: submissions
            });
            setResult(data);
        } catch (err) {
            console.error(err);
            alert('Failed to submit quiz. Time might have expired.');
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) return <div className="loader">Initializing Secure Session...</div>;

    if (result) {
        return (
            <div className="result-page container">
                <div className="result-card card glass-morphism animate-in">
                    <CheckCircle2 size={64} className="success-icon" />
                    <h1>Quiz Completed!</h1>
                    <p>Your assessment has been auto-graded by our system.</p>
                    <div className="score-display">
                        <span className="score">{result.score}</span>
                        <span className="total">/ {result.total}</span>
                    </div>
                    <button onClick={() => navigate('/student')} className="btn-primary">Return to Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div className="quiz-room container">
            <div className="quiz-header glass-morphism">
                <div className="timer-box">
                    <Clock className={timeLeft < 60 ? 'warning-icon' : ''} />
                    <span className={timeLeft < 60 ? 'time warning' : 'time'}>
                        {formatTime(timeLeft)}
                    </span>
                </div>
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}></div>
                </div>
                <button onClick={handleSubmit} className="btn-primary submit-btn">
                    Finish Quiz <Send size={18} />
                </button>
            </div>

            <div className="questions-container">
                {questions.map((q, idx) => (
                    <div key={q.id} className="question-card card glass-morphism">
                        <div className="q-head">
                            <span className="q-number">Question {idx + 1}</span>
                        </div>
                        <p className="q-text">{q.text}</p>
                        <div className="options-list">
                            {q.options.map((opt, i) => (
                                <label key={i} className={`option-item ${(answers[q.id] || []).includes(i) ? 'selected' : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={(answers[q.id] || []).includes(i)}
                                        onChange={() => {
                                            const current = answers[q.id] || [];
                                            const updated = current.includes(i)
                                                ? current.filter(idx => idx !== i)
                                                : [...current, i];
                                            setAnswers({ ...answers, [q.id]: updated });
                                        }}
                                    />
                                    <span className="option-label">{String.fromCharCode(65 + i)}</span>
                                    <span className="option-text">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
        .container { max-width: 900px; margin: 0 auto; padding: 2rem; }
        .quiz-header { 
          display: flex; align-items: center; justify-content: space-between; 
          padding: 1.5rem 2rem; borderRadius: 20px; position: sticky; top: 100px; z-index: 50;
          margin-bottom: 3rem; gap: 2rem;
        }
        .timer-box { display: flex; align-items: center; gap: 0.8rem; font-size: 1.5rem; font-weight: 700; width: 150px; }
        .time.warning { color: var(--accent); animation: pulse 1s infinite; }
        .progress-bar { flex: 1; height: 10px; background: rgba(255, 255, 255, 0.05); borderRadius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; background: var(--primary); transition: width 0.3s ease; }
        
        .question-card { margin-bottom: 2rem; animation: slideUp 0.5s ease backwards; }
        .q-head { margin-bottom: 1rem; }
        .q-number { background: var(--primary); color: white; padding: 0.3rem 0.8rem; borderRadius: 20px; font-size: 0.8rem; font-weight: 600; }
        .q-text { font-size: 1.2rem; font-weight: 500; margin-bottom: 2rem; }
        
        .options-list { display: grid; gap: 1rem; }
        .option-item { 
          display: flex; align-items: center; gap: 1rem; padding: 1.2rem; 
          background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); 
          borderRadius: 15px; cursor: pointer; transition: all 0.2s ease;
        }
        .option-item:hover { background: rgba(255, 255, 255, 0.05); border-color: var(--primary); }
        .option-item.selected { background: rgba(99, 102, 241, 0.1); border-color: var(--primary); }
        .option-item input { display: none; }
        .option-label { 
          width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
          background: var(--bg-dark); borderRadius: 50%; font-weight: 700; font-size: 0.9rem;
        }
        .option-item.selected .option-label { background: var(--primary); color: white; }

        .result-page { min-height: 70vh; display: flex; align-items: center; justify-content: center; }
        .result-card { text-align: center; padding: 4rem; max-width: 500px; }
        .success-icon { color: var(--success); margin-bottom: 2rem; }
        .score-display { margin: 2rem 0; font-size: 4rem; font-weight: 800; }
        .score { color: var(--primary); }
        .total { color: var(--text-muted); font-size: 2rem; }

        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
        </div>
    );
};

export default QuizRoom;
