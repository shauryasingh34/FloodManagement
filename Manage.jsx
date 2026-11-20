import { useEffect, useState } from 'react';
import { api, fileUrl } from '../api';
import { useAuth } from '../AuthContext';
import { PRIORITIES, STATUSES } from '../constants';
import { fmt, label } from '../components/ui';

// Responder/admin triage: filter, search, and update status, priority and assignee.
export default function Manage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('incidents');
  const [filters, setFilters] = useState({ status: '', priority: '', q: '' });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v));
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
      api(`/${tab}?${params}`).then(setItems).catch((e) => setError(e.message)).finally(() => setLoading(false));
    }, 250); // debounce typing in the search box
    return () => clearTimeout(timer);
  }, [tab, filters]);

  const update = async (id, patch) => {
    setError('');
    try {
      const doc = await api(`/${tab}/${id}`, { method: 'PATCH', body: patch });
      setItems((list) => list.map((i) => (i._id === id ? doc : i)));
    } catch (e) {
      setError(e.message);
    }
  };

  const switchTab = (t) => { setItems([]); setTab(t); };
  const setFilter = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });

  return (
    <>
      <h1>Manage reports</h1>
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'incidents'} onClick={() => switchTab('incidents')}>Incident reports</button>
        <button role="tab" aria-selected={tab === 'requests'} onClick={() => switchTab('requests')}>Help requests</button>
      </div>

      <div className="filters">
        <input type="search" placeholder="Search location or description" value={filters.q} onChange={setFilter('q')} aria-label="Search" />
        <select value={filters.status} onChange={setFilter('status')} aria-label="Filter by status">
          <option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={filters.priority} onChange={setFilter('priority')} aria-label="Filter by priority">
          <option value="">All priorities</option>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>

      {error && <p className="error" role="alert">{error}</p>}
      {loading ? <p className="muted">Loading…</p> : items.length === 0 ? <p className="muted">Nothing matches these filters.</p> : (
        <ul className="stack">
          {items.map((it) => {
            const owner = it.reporter || it.requester;
            return (
              <li className={`card p-edge-${it.priority.toLowerCase()}`} key={it._id}>
                <div className="between">
                  <h3>{label(it.category || it.need)}{it.peopleCount ? ` for ${it.peopleCount}` : ''}</h3>
                  <small className="muted">{fmt(it.createdAt)}</small>
                </div>
                <p><strong>{it.location.text}</strong></p>
                <p>{it.description}</p>
                <small className="muted">
                  From {owner?.name || 'unknown'}
                  {(it.contactPhone || owner?.phone) && `, ${it.contactPhone || owner.phone}`}
                  {it.waterLevelCm != null && `, water level ${it.waterLevelCm} cm`}
                  {it.assignedTo && `, assigned to ${it.assignedTo.name}`}
                </small>
                {it.photo && <a className="photo" href={fileUrl(it.photo)} target="_blank" rel="noreferrer"><img src={fileUrl(it.photo)} alt="Photo attached to the report" loading="lazy" /></a>}
                <div className="actions">
                  <label className="inline">Status
                    <select value={it.status} onChange={(e) => update(it._id, { status: e.target.value })}>
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </label>
                  <label className="inline">Priority
                    <select value={it.priority} onChange={(e) => update(it._id, { priority: e.target.value })}>
                      {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </label>
                  {it.assignedTo?._id !== user._id && (
                    <button className="btn ghost" onClick={() => update(it._id, { assignedTo: user._id, status: 'Assigned' })}>Assign to me</button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
