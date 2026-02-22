import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { User, Lock, Mail, ChevronRight } from 'lucide-react';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                const { data } = await api.post('/login', { username, password });
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                navigate(data.role === 'teacher' ? '/teacher' : '/student');
            } else {
                await api.post('/register', { username, password, role });
                setIsLogin(true);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong');
        }
    };

    return (
        <div className="login-page">
            <div className="login-card card glass-morphism">
                <h2 className="login-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                <p className="login-subtitle">
                    {isLogin ? 'Login to continue your learning journey' : 'Join thousands of students and teachers'}
                </p>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <User className="input-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <Lock className="input-icon" size={20} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div className="role-selector">
                            <label>Role:</label>
                            <div className="roles">
                                <button
                                    type="button"
                                    className={role === 'student' ? 'active' : ''}
                                    onClick={() => setRole('student')}
                                >Student</button>
                                <button
                                    type="button"
                                    className={role === 'teacher' ? 'active' : ''}
                                    onClick={() => setRole('teacher')}
                                >Teacher</button>
                            </div>
                        </div>
                    )}

                    <button type="submit" className="btn-primary login-btn">
                        {isLogin ? 'Login' : 'Sign Up'} <ChevronRight size={20} />
                    </button>
                </form>

                <p className="toggle-auth">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'Sign Up' : 'Login'}</span>
                </p>
            </div>

            <style jsx>{`
        .login-page {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .login-card {
          width: 100%;
          max-width: 450px;
          text-align: center;
        }
        .login-title {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, white, var(--text-muted));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .login-subtitle {
          color: var(--text-muted);
          margin-bottom: 2rem;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .input-group {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          borderRadius: 12px;
          color: white;
          transition: all 0.3s ease;
        }
        input:focus {
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.1);
          outline: none;
        }
        .role-selector {
          text-align: left;
        }
        .roles {
          display: flex;
          gap: 1rem;
          margin-top: 0.5rem;
        }
        .roles button {
          flex: 1;
          padding: 0.8rem;
          borderRadius: 10px;
          background: var(--bg-dark);
          color: var(--text-muted);
          border: 1px solid var(--border);
        }
        .roles button.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }
        .login-btn {
          margin-top: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .toggle-auth {
          margin-top: 1.5rem;
          color: var(--text-muted);
        }
        .toggle-auth span {
          color: var(--primary);
          cursor: pointer;
          font-weight: 600;
        }
        .error-msg {
          background: rgba(244, 63, 94, 0.1);
          color: var(--accent);
          padding: 0.8rem;
          borderRadius: 10px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }
      `}</style>
        </div>
    );
};

export default Login;
