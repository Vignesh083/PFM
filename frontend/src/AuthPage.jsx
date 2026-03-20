import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from './api/auth';
import './AuthPage.css';
import './components/Loader.css';

export default function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
            onClick={() => { setTab('signin'); clear(); }}>Sign In</button>
          <button className={tab === 'signup' ? 'tab active' : 'tab'}
            onClick={() => { setTab('signup'); clear(); }}>Sign Up</button>
        </div>

        <form onSubmit={tab === 'signin' ? handleSignIn : handleSignUp} className="auth-form">
          <label>Username</label>
          <input type="text" value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username" required autoFocus />

          <label>Password</label>
          <input type="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password" required />

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
