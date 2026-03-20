import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
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

function AlertBell() {
  const [alerts, setAlerts] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const load = () => getAlerts().then(r => setAlerts(r.data)).catch(() => {});

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  // close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = alerts.filter(a => !a.read);

  const handleMarkRead = async (id) => {
    await markRead(id);
    load();
  };

  const handleMarkAll = async () => {
    await markAllRead();
    load();
  };

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

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="app-shell">
      {/* ── Mobile top bar (hidden on desktop) ── */}
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
        <button className="sidebar-logout" onClick={logout}>
          🚪 Logout
        </button>
      </aside>

      {/* ── Page content ── */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* ── Mobile bottom navigation (hidden on desktop) ── */}
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
        <button className="mob-nav-logout" onClick={logout}>
          <span className="mob-nav-icon">🚪</span>
          <span className="mob-nav-label">Logout</span>
        </button>
      </nav>
    </div>
  );
}
