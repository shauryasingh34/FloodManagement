import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { SEVERITIES } from '../constants';
import { SeverityBadge, fmt } from '../components/ui';

const blank = { title: '', message: '', location: '', severity: 'Moderate' };

export default function Alerts() {
  const { user } = useAuth();
  const staff = user && user.role !== 'resident';
  const [alerts, setAlerts] = useState(null);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const load = () => api(staff ? '/alerts/all' : '/alerts').then(setAlerts).catch((e) => setError(e.message));
  useEffect(() => { load(); }, [staff]); // eslint-disable-line react-hooks/exhaustive-deps

  const act = async (fn) => {
    setError('');
    try { await fn(); await load(); } catch (e) { setError(e.message); }
  };
  const publish = (e) => {
    e.preventDefault();
    act(async () => { await api('/alerts', { method: 'POST', body: form }); setForm(blank); });
  };
  const toggle = (a) => act(() => api(`/alerts/${a._id}`, { method: 'PATCH', body: { active: !a.active } }));
  const remove = (a) => window.confirm(`Delete "${a.title}"?`) && act(() => api(`/alerts/${a._id}`, { method: 'DELETE' }));

  return (
    <>
      <h1>Flood alerts</h1>
      <p className="muted lead">Severity and affected location for every active alert.</p>
      {!user && <p className="notice"><Link to="/login">Sign in</Link> to report an incident or request help.</p>}
      {error && <p className="error" role="alert">{error}</p>}

      {staff && (
        <form className="card form c-orange" onSubmit={publish}>
          <h2>Publish an alert</h2>
          <div className="grid two">
            <label>Title<input required minLength={3} maxLength={120} value={form.title} onChange={set('title')} /></label>
            <label>Affected location<input required maxLength={160} value={form.location} onChange={set('location')} /></label>
          </div>
          <label>Safety guidance<textarea required minLength={5} maxLength={1000} rows={3} value={form.message} onChange={set('message')} /></label>
          <label>Severity
            <select value={form.severity} onChange={set('severity')}>{SEVERITIES.map((s) => <option key={s}>{s}</option>)}</select>
          </label>
          <button className="btn">Publish alert</button>
        </form>
      )}

      {!alerts ? <p className="muted">Loading…</p> : alerts.length === 0 ? <p className="muted">No active alerts right now.</p> : (
        <ul className="stack">
          {alerts.map((a) => (
            <li key={a._id} className={`card alert v-${a.severity.toLowerCase()} ${a.active ? '' : 'withdrawn'}`}>
              <div className="between">
                <h2>{a.title}</h2>
                <SeverityBadge value={a.severity} />
              </div>
              <p>{a.message}</p>
              <small className="muted">{a.location}, {fmt(a.createdAt)}{!a.active && ' (withdrawn)'}</small>
              {staff && (
                <div className="actions">
                  <button className="btn ghost" onClick={() => toggle(a)}>{a.active ? 'Withdraw' : 'Re-activate'}</button>
                  {user.role === 'admin' && <button className="btn ghost danger" onClick={() => remove(a)}>Delete</button>}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
