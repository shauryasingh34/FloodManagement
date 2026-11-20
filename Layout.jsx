import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const staff = user && user.role !== 'resident';

  return (
    <div className="app">
      <header className="top">
        <Link to="/" className="brand">
          <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
            <path fill="currentColor" d="M16 3c5 6.5 8 10.2 8 14a8 8 0 0 1-16 0c0-3.8 3-7.5 8-14z" />
          </svg>
          FloodWatch
        </Link>
        <nav aria-label="Main">
          {user && <NavLink to="/" end>Dashboard</NavLink>}
          <NavLink to="/alerts">Alerts</NavLink>
          {user && <NavLink to="/report">Report</NavLink>}
          {user && <NavLink to="/help">Get help</NavLink>}
          {staff && <NavLink to="/manage">Manage</NavLink>}
        </nav>
        <div className="who">
          {user ? (
            <>
              <span>{user.name} <em>{user.role}</em></span>
              <button className="btn ghost" onClick={() => { signOut(); navigate('/alerts'); }}>Sign out</button>
            </>
          ) : (
            <>
              <Link className="btn ghost" to="/login">Sign in</Link>
              <Link className="btn" to="/register">Register</Link>
            </>
          )}
        </div>
      </header>

      <main className="page"><Outlet /></main>

      <footer className="disclaimer">
        <strong>Prototype project.</strong> FloodWatch is not an official emergency service. In an emergency,
        call your local emergency number and follow warnings from official sources.
      </footer>
    </div>
  );
}
