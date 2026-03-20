import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import './SettingsPage.css';

export default function SettingsPage() {
  const [username, setUsername] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    // decode username from JWT
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUsername(payload.sub || '');
      } catch {}
    }
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg(''); setPwError('');
    if (newPw !== confirmPw) { setPwError('New passwords do not match.'); return; }
    if (newPw.length < 6) { setPwError('Password must be at least 6 characters.'); return; }
    try {
      await axiosClient.put('/api/users/me/password', { currentPassword: currentPw, newPassword: newPw });
      setPwMsg('Password changed successfully!');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      setPwError(err.response?.data?.error || 'Failed to change password.');
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="card settings-section">
        <h2 className="section-title">Account Info</h2>
        <div className="info-row">
          <span className="info-label">Username</span>
          <span className="info-val">{username}</span>
        </div>
      </div>

      <div className="card settings-section">
        <h2 className="section-title">Change Password</h2>
        <form className="pw-form" onSubmit={handleChangePassword}>
          <div className="pw-group">
            <label>Current Password</label>
            <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} required placeholder="••••••••" />
          </div>
          <div className="pw-group">
            <label>New Password</label>
            <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} required placeholder="••••••••" />
          </div>
          <div className="pw-group">
            <label>Confirm New Password</label>
            <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required placeholder="••••••••" />
          </div>
          {pwError && <p className="form-error">{pwError}</p>}
          {pwMsg && <p className="form-success">{pwMsg}</p>}
          <button type="submit" className="btn btn-primary">Update Password</button>
        </form>
      </div>
    </div>
  );
}
