import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState, useCallback } from 'react';
import { getAlerts, markAllRead, markRead } from './api/alerts';
import './Layout.css';

const NAV = [
  { to: '/dashboard',  label: 'Dashboard',   icon: '📊' },
  { to: '/expenses',   label: 'Expenses',     icon: '💸' },
  { to: '/categories', label: 'Categories',   icon: '🏷️' },
  { to: '/budget',     label: 'Budget',       icon: '🎯' },
  { to: '/reports',    label: 'Reports',      icon: '📈' },
  { to: '/recurring',  label: 'Recurring',    icon: '🔁' },
  { to: '/settings',   label: 'Settings',     icon: '⚙️' },
];

// Session timeout constants
const SESSION_MS  = 30 * 60 * 1000; // 30 minutes of inactivity
const WARN_MS     =  5 * 60 * 1000; // show warning 5 min before logout
const WARN_SECS   = 300;             // countdown seconds

function AlertBell() {
  const [alerts, setAlerts] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const load = () => getAlerts().then(r => setAlerts(r.data)).catch(() => {});

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = alerts.filter(a => !a.read);

  const handleMarkRead = async (id) => { await markRead(id); load(); };
  const handleMarkAll  = async ()    => { await markAllRead(); load(); };

  return (
    <div className="alert-bell-wrap" ref={ref}>
      <button className="alert-bell" onClick={() => setOpen(o => !o)}>
        🔔
        {unread.length > 0 && <span className="alert-badge">{unread.length}</span>}
      </button>

      {open && (
        <div className="alert-dropdown">
          <div className="alert-dropdown-header">
            <span>Alerts</span>
            {unread.length > 0 && (
              <button className="alert-mark-all" onClick={handleMarkAll}>Mark all read</button>
            )}
          </div>
          {alerts.length === 0 ? (
            <p className="alert-empty">No alerts yet.</p>
          ) : (
            <ul className="alert-list">
              {alerts.slice(0, 10).map(a => (
                <li key={a.id} className={`alert-item ${a.read ? 'read' : 'unread'}`}>
                  <span className="alert-msg">{a.message}</span>
                  <span className="alert-time">{new Date(a.triggeredAt).toLocaleDateString()}</span>
                  {!a.read && (
                    <button className="alert-read-btn" onClick={() => handleMarkRead(a.id)}>✓</button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const navigate = useNavigate();

  // ── Logout confirmation modal ──────────────────────────
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // ── Session timeout ────────────────────────────────────
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(WARN_SECS);
  const warnTimerRef    = useRef(null);
  const logoutTimerRef  = useRef(null);
  const countdownRef    = useRef(null);

  const doLogout = useCallback(() => {
    localStorage.removeItem('token');
    navigate('/login');
  }, [navigate]);

  const clearAllTimers = () => {
    clearTimeout(warnTimerRef.current);
    clearTimeout(logoutTimerRef.current);
    clearInterval(countdownRef.current);
  };

  const scheduleTimers = useCallback(() => {
    clearTimeout(warnTimerRef.current);
    clearTimeout(logoutTimerRef.current);
    clearInterval(countdownRef.current);
    setShowSessionWarning(false);

    // Warning fires 5 min before session expires
    warnTimerRef.current = setTimeout(() => {
      setSecondsLeft(WARN_SECS);
      setShowSessionWarning(true);
      countdownRef.current = setInterval(() => {
        setSecondsLeft(s => Math.max(0, s - 1));
      }, 1000);
    }, SESSION_MS - WARN_MS);

    // Auto-logout after full inactivity period
    logoutTimerRef.current = setTimeout(doLogout, SESSION_MS);
  }, [doLogout]);

  useEffect(() => {
    scheduleTimers();
    const events = ['mousedown', 'keydown', 'touchstart'];
    const resetActivity = () => scheduleTimers();
    events.forEach(e => window.addEventListener(e, resetActivity));
    return () => {
      clearAllTimers();
      events.forEach(e => window.removeEventListener(e, resetActivity));
    };
  }, [scheduleTimers]);

  const handleLogoutClick = () => setShowLogoutModal(true);

  const confirmLogout = () => {
    clearAllTimers();
    doLogout();
  };

  const stayLoggedIn = () => {
    setShowSessionWarning(false);
    scheduleTimers();
  };

  const fmtCountdown = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="app-shell">
      {/* ── Mobile top bar ── */}
      <div className="mobile-topbar">
        <div className="mobile-brand">PFM</div>
        <AlertBell />
      </div>

      {/* ── Desktop sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand">PFM</div>
          <AlertBell />
        </div>
        <nav className="sidebar-nav">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
            >
              <span className="nav-icon">{n.icon}</span>
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <button className="sidebar-logout" onClick={handleLogoutClick}>
          🚪 Logout
        </button>
      </aside>

      {/* ── Page content ── */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* ── Mobile bottom navigation ── */}
      <nav className="mobile-bottom-nav">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) => 'mob-nav-item' + (isActive ? ' active' : '')}
          >
            <span className="mob-nav-icon">{n.icon}</span>
            <span className="mob-nav-label">{n.label}</span>
          </NavLink>
        ))}
        <button className="mob-nav-logout" onClick={handleLogoutClick}>
          <span className="mob-nav-icon">🚪</span>
          <span className="mob-nav-label">Logout</span>
        </button>
      </nav>

      {/* ── Logout confirmation modal ── */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">🚪</div>
            <h3 className="modal-title">Log out?</h3>
            <p className="modal-body">Are you sure you want to log out of your account?</p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmLogout}>Yes, Log Out</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Session timeout warning modal ── */}
      {showSessionWarning && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-icon">⏱️</div>
            <h3 className="modal-title">Session Expiring Soon</h3>
            <p className="modal-body">
              You've been inactive. You'll be automatically logged out in
            </p>
            <div className="session-countdown">{fmtCountdown(secondsLeft)}</div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={confirmLogout}>Logout Now</button>
              <button className="btn btn-primary" onClick={stayLoggedIn}>Stay Logged In</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
