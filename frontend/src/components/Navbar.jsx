import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Layout, BookOpen } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (!token) return null;

    return (
        <nav className="navbar glass-morphism">
            <div className="nav-brand" onClick={() => navigate(role === 'teacher' ? '/teacher' : '/student')}>
                <div className="brand-icon">Q</div>
                <span>QuizMaster API</span>
            </div>
            <div className="nav-links">
                {role === 'teacher' ? (
                    <button onClick={() => navigate('/teacher')} className="nav-item">
                        <Layout size={20} /> Dashboard
                    </button>
                ) : (
                    <button onClick={() => navigate('/student')} className="nav-item">
                        <BookOpen size={20} /> MyQuizzes
                    </button>
                )}
                <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={20} /> Logout
                </button>
            </div>

            <style jsx>{`
        .navbar {
          display: flex;
          justify-content: space-between;
          padding: 1rem 5%;
          position: sticky;
          top: 0;
          z-index: 100;
          margin-bottom: 2rem;
        }
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          font-weight: 700;
          font-size: 1.4rem;
          color: var(--primary);
          cursor: pointer;
        }
        .brand-icon {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          borderRadius: 10px;
        }
        .nav-links {
          display: flex;
          gap: 1.5rem;
        }
        .nav-item {
          background: transparent;
          color: var(--text-main);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }
        .logout-btn {
          background: rgba(244, 63, 94, 0.1);
          color: var(--accent);
          padding: 0.5rem 1rem;
          borderRadius: 8px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .logout-btn:hover {
          background: var(--accent);
          color: white;
        }
      `}</style>
        </nav>
    );
};

export default Navbar;
