import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Clock, Play, GraduationCap } from 'lucide-react';

const StudentDashboard = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const { data } = await api.get('/quizzes');
            setQuizzes(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStartQuiz = (id) => {
        navigate(`/quiz/${id}`);
    };

    return (
        <div className="dashboard container">
            <header className="page-header">
                <div>
                    <h1>Welcome, Student!</h1>
                    <p>Sharpen your skills with our timed assessments.</p>
                </div>
                <div className="stats glass-morphism">
                    <GraduationCap size={40} className="stats-icon" />
                    <div>
                        <h3>Available Quizzes</h3>
                        <p>{quizzes.length} Assesments</p>
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="loader">Loading Quizzes...</div>
            ) : (
                <div className="quiz-grid">
                    {quizzes.map(quiz => (
                        <div key={quiz.ID} className="quiz-card card">
                            <div className="quiz-content">
                                <h3>{quiz.Title}</h3>
                                <p>{quiz.Description}</p>
                                <div className="quiz-meta">
                                    <span className="meta-item">
                                        <Clock size={16} /> {quiz.Duration} mins
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleStartQuiz(quiz.ID)}
                                className="btn-primary start-btn"
                            >
                                Start Quiz <Play size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }
        .stats {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem 2rem;
          borderRadius: 20px;
        }
        .stats-icon {
          color: var(--primary);
        }
        .quiz-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }
        .quiz-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
        }
        .quiz-content h3 {
          font-size: 1.4rem;
          margin-bottom: 1rem;
          color: var(--primary);
        }
        .quiz-content p {
          color: var(--text-muted);
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
        }
        .quiz-meta {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          padding: 0.4rem 0.8rem;
          borderRadius: 8px;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .start-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.8rem;
        }
        .loader {
          text-align: center;
          padding: 3rem;
          color: var(--text-muted);
          font-size: 1.2rem;
        }
      `}</style>
        </div>
    );
};

export default StudentDashboard;
