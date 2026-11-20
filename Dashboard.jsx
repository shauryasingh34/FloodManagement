import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { Bars, PriorityBadge, SeverityBadge, StatusBadge, fmt, label } from '../components/ui';

export default function Dashboard() {
  const { user } = useAuth();
  const staff = user.role !== 'resident';
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api('/stats'), api('/alerts'), api('/incidents'), api('/requests')])
      .then(([stats, alerts, incidents, requests]) => setData({ stats, alerts, incidents, requests }))
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p className="muted">Loading dashboard…</p>;
  const { stats, alerts, incidents, requests } = data;

  return (
    <>
      <h1>{staff ? 'Response dashboard' : `Hello, ${user.name.split(' ')[0]}`}</h1>
      <p className="muted lead">
        {staff ? 'All reports and help requests across the area.' : 'Your reports and help requests, plus the latest alerts.'}
      </p>

      <section className="grid three">
        <div className="card stat c-orange"><b>{stats.activeAlerts}</b><span>Active alerts</span></div>
        <div className="card stat c-blue"><b>{stats.incidents}</b><span>{staff ? 'Reports' : 'My reports'}</span></div>
        <div className="card stat c-red"><b>{stats.requests}</b><span>{staff ? 'Help requests' : 'My help requests'}</span></div>
      </section>

      <section className="grid two">
        <div className="card c-orange">
          <h2>Active alerts</h2>
          {alerts.length === 0 && <p className="muted">No active alerts right now.</p>}
          <ul className="rows">
            {alerts.slice(0, 5).map((a) => (
              <li className="row" key={a._id}>
                <div className="grow"><strong>{a.title}</strong><small>{a.location}</small></div>
                <SeverityBadge value={a.severity} />
              </li>
            ))}
          </ul>
          <Link to="/alerts">All alerts</Link>
        </div>

        <div className="card c-blue">
          <h2>{staff ? 'Latest reports' : 'My latest reports'}</h2>
          {incidents.length === 0 && <p className="muted">No reports yet. <Link to="/report">Report a flood incident</Link></p>}
          <ul className="rows">
            {incidents.slice(0, 5).map((i) => (
              <li className="row" key={i._id}>
                <div className="grow"><strong>{label(i.category)}</strong><small>{i.location.text}, {fmt(i.createdAt)}</small></div>
                <StatusBadge value={i.status} />
              </li>
            ))}
          </ul>
          <Link to={staff ? '/manage' : '/report'}>{staff ? 'Manage reports' : 'New report'}</Link>
        </div>
      </section>

      <section className="card c-red">
        <h2>{staff ? 'Latest help requests' : 'My help requests'}</h2>
        {requests.length === 0 && <p className="muted">No help requests. <Link to="/help">Ask for help</Link></p>}
        <ul className="rows">
          {requests.slice(0, 5).map((r) => (
            <li className="row" key={r._id}>
              <div className="grow"><strong>{label(r.need)} for {r.peopleCount}</strong><small>{r.location.text}</small></div>
              <PriorityBadge value={r.priority} />
              <StatusBadge value={r.status} />
            </li>
          ))}
        </ul>
      </section>

      {staff && (
        <>
          <h2 className="section">Reports and analytics</h2>
          <section className="grid two">
            <div className="card"><h3>Reports by status</h3><Bars rows={Object.entries(stats.incidentsByStatus)} /></div>
            <div className="card"><h3>Reports by type</h3><Bars rows={Object.entries(stats.incidentsByCategory).map(([k, n]) => [label(k), n])} /></div>
            <div className="card">
              <h3>Reports, last 7 days</h3>
              <Bars rows={stats.trend.map((t) => [new Date(t.day + 'T00:00:00Z').toLocaleDateString([], { weekday: 'short', day: 'numeric', timeZone: 'UTC' }), t.n])} />
            </div>
            <div className="card"><h3>Most affected areas</h3><Bars rows={stats.hotspots.map((h) => [label(h.location), h.n])} /></div>
          </section>
        </>
      )}
    </>
  );
}
