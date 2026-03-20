export default function Dashboard({ username, onLogout }) {
  return (
    <div className="dashboard">
      <nav className="dash-nav">
        <span className="dash-brand">PFM</span>
        <div className="dash-right">
          {username && <span className="dash-user">Hi, {username}</span>}
          <button className="btn-logout" onClick={onLogout}>Logout</button>
        </div>
      </nav>
      <main className="dash-main">
        <h2>Welcome to your dashboard</h2>
        <p>You are signed in. Your finance features will appear here.</p>
      </main>
    </div>
  );
}
