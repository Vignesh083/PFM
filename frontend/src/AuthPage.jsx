import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from './api/auth';
import './AuthPage.css';
import './components/Loader.css';

const EyeIcon = ({ open }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export default function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const clear = () => { setError(''); setSuccess(''); };

  const handleSignIn = async (e) => {
    e.preventDefault();
    clear();
    setLoading(true);
    try {
      const res = await login(username, password);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    clear();
    setLoading(true);
    try {
      await register(username, password);
      setSuccess('Account created! You can now sign in.');
      setTab('signin');
      setUsername('');
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-brand">PFM</h1>
        <p className="auth-subtitle">Personal Finance Manager</p>

        <div className="tab-bar">
          <button className={tab === 'signin' ? 'tab active' : 'tab'}
            onClick={() => { setTab('signin'); clear(); setShowPw(false); }}>Sign In</button>
          <button className={tab === 'signup' ? 'tab active' : 'tab'}
            onClick={() => { setTab('signup'); clear(); setShowPw(false); }}>Sign Up</button>
        </div>

        <form onSubmit={tab === 'signin' ? handleSignIn : handleSignUp} className="auth-form">
          <label>Username</label>
          <input type="text" value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username" required autoFocus />

          <label>Password</label>
          <div className="pw-input-wrap">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
            <button type="button" className="eye-toggle" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
              <EyeIcon open={showPw} />
            </button>
          </div>

          {error && <p className="msg error">{error}</p>}
          {success && <p className="msg success">{success}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : (tab === 'signin' ? 'Sign In' : 'Create Account')}
          </button>
        </form>
      </div>
    </div>
  );
}
