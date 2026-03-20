import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import './SettingsPage.css';

const EyeIcon = ({ open }) => open ? (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const PencilIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

export default function SettingsPage() {
  const [username, setUsername] = useState('');
  const [usernameChangedAt, setUsernameChangedAt] = useState(null);

  // Username edit state
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [unMsg, setUnMsg] = useState('');
  const [unError, setUnError] = useState('');
  const [unSubmitting, setUnSubmitting] = useState(false);

  // Password change state
  const [currentPw, setCurrentPw]   = useState('');
  const [newPw, setNewPw]           = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw]         = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwMsg, setPwMsg]     = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSubmitting, setPwSubmitting] = useState(false);

  const loadUser = async () => {
    try {
      const res = await axiosClient.get('/api/users/me');
      setUsername(res.data.username);
      setUsernameChangedAt(res.data.usernameChangedAt);
    } catch {
      // Fallback: decode from token
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUsername(payload.sub || '');
        } catch {}
      }
    }
  };

  useEffect(() => { loadUser(); }, []);

  // --- Username cooldown helpers ---
  const daysUntilNextChange = () => {
    if (!usernameChangedAt) return 0;
    const changed = new Date(usernameChangedAt);
    const now = new Date();
    const daysSince = Math.floor((now - changed) / (1000 * 60 * 60 * 24));
    return Math.max(0, 30 - daysSince);
  };

  const nextChangeDate = () => {
    if (!usernameChangedAt) return null;
    const changed = new Date(usernameChangedAt);
    changed.setDate(changed.getDate() + 30);
    return changed.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const canChangeUsername = daysUntilNextChange() === 0;

  const startEditUsername = () => {
    setNewUsername(username);
    setUnMsg('');
    setUnError('');
    setEditingUsername(true);
  };

  const cancelEditUsername = () => {
    setEditingUsername(false);
    setUnMsg('');
    setUnError('');
  };

  const handleChangeUsername = async (e) => {
    e.preventDefault();
    setUnMsg(''); setUnError('');
    if (!newUsername.trim() || newUsername.trim() === username) {
      setUnError('Enter a different username.');
      return;
    }
    setUnSubmitting(true);
    try {
      const res = await axiosClient.put('/api/users/me/username', { username: newUsername.trim() });
      // Store new JWT so future requests use new username
      localStorage.setItem('token', res.data.token);
      setUsername(newUsername.trim());
      setUnMsg('Username updated successfully!');
      setEditingUsername(false);
      await loadUser();
    } catch (err) {
      setUnError(err.response?.data?.error || 'Failed to update username.');
    } finally {
      setUnSubmitting(false);
    }
  };

  // --- Password change ---
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg(''); setPwError('');
    if (newPw !== confirmPw) { setPwError('New passwords do not match.'); return; }
    if (newPw.length < 6) { setPwError('Password must be at least 6 characters.'); return; }
    setPwSubmitting(true);
    try {
      await axiosClient.put('/api/users/me/password', { currentPassword: currentPw, newPassword: newPw });
      setPwMsg('Password changed successfully!');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setShowCurrentPw(false); setShowNewPw(false); setShowConfirmPw(false);
    } catch (err) {
      setPwError(err.response?.data?.error || 'Failed to change password.');
    } finally {
      setPwSubmitting(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      {/* ── Account Info ── */}
      <div className="card settings-section">
        <h2 className="section-title">Account Info</h2>

        {!editingUsername ? (
          <>
            <div className="info-row">
              <span className="info-label">Username</span>
              <span className="info-val">{username}</span>
              <button
                className="edit-username-btn"
                onClick={startEditUsername}
                title={canChangeUsername ? 'Edit username' : `Available on ${nextChangeDate()}`}
              >
                <PencilIcon />
                {canChangeUsername ? 'Edit' : `Available in ${daysUntilNextChange()}d`}
              </button>
            </div>
            {unMsg && <p className="form-success" style={{ marginTop: '0.75rem' }}>{unMsg}</p>}
            {!canChangeUsername && (
              <p className="cooldown-note">
                Username can next be changed on <strong>{nextChangeDate()}</strong>
              </p>
            )}
          </>
        ) : (
          <form className="username-edit-form" onSubmit={handleChangeUsername}>
            <div className="pw-group">
              <label>New Username</label>
              <input
                type="text"
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                placeholder="Enter new username"
                minLength={3}
                maxLength={30}
                autoFocus
                required
              />
              <span className="char-count">{newUsername.length}/30</span>
            </div>
            <p className="cooldown-note">
              After changing, you must wait <strong>30 days</strong> before changing again.
            </p>
            {unError && <p className="form-error">{unError}</p>}
            <div className="username-edit-actions">
              <button type="button" className="btn btn-ghost" onClick={cancelEditUsername}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={unSubmitting}>
                {unSubmitting ? 'Saving…' : 'Save Username'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Change Password ── */}
      <div className="card settings-section">
        <h2 className="section-title">Change Password</h2>
        <form className="pw-form" onSubmit={handleChangePassword}>

          <div className="pw-group">
            <label>Current Password</label>
            <div className="pw-input-wrap">
              <input
                type={showCurrentPw ? 'text' : 'password'}
                value={currentPw}
                onChange={e => setCurrentPw(e.target.value)}
                required placeholder="••••••••"
              />
              <button type="button" className="eye-toggle" onClick={() => setShowCurrentPw(v => !v)} tabIndex={-1}>
                <EyeIcon open={showCurrentPw} />
              </button>
            </div>
          </div>

          <div className="pw-group">
            <label>New Password</label>
            <div className="pw-input-wrap">
              <input
                type={showNewPw ? 'text' : 'password'}
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                required placeholder="••••••••"
              />
              <button type="button" className="eye-toggle" onClick={() => setShowNewPw(v => !v)} tabIndex={-1}>
                <EyeIcon open={showNewPw} />
              </button>
            </div>
          </div>

          <div className="pw-group">
            <label>Confirm New Password</label>
            <div className="pw-input-wrap">
              <input
                type={showConfirmPw ? 'text' : 'password'}
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                required placeholder="••••••••"
              />
              <button type="button" className="eye-toggle" onClick={() => setShowConfirmPw(v => !v)} tabIndex={-1}>
                <EyeIcon open={showConfirmPw} />
              </button>
            </div>
          </div>

          {pwError && <p className="form-error">{pwError}</p>}
          {pwMsg   && <p className="form-success">{pwMsg}</p>}
          <button type="submit" className="btn btn-primary" disabled={pwSubmitting}>
            {pwSubmitting ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
