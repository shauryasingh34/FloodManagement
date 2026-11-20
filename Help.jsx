import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { NEEDS } from '../constants';
import { PriorityBadge, StatusTrack, fmt, label } from '../components/ui';

const blank = { need: 'rescue', peopleCount: '1', locationText: '', contactPhone: '', description: '', lat: '', lng: '' };

export default function Help() {
  const { user } = useAuth();
  const [form, setForm] = useState({ ...blank, contactPhone: user.phone || '' });
  const [mine, setMine] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const load = () =>
    api('/requests')
      .then((all) => setMine(all.filter((r) => r.requester?._id === user._id)))
      .catch((e) => setError(e.message));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const locate = () =>
    navigator.geolocation?.getCurrentPosition(
      (p) => setForm((f) => ({ ...f, lat: p.coords.latitude.toFixed(5), lng: p.coords.longitude.toFixed(5) })),
      () => setError('Could not read your location. Please describe it in words instead.')
    );

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const body = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ''));
    try {
      await api('/requests', { method: 'POST', body });
      setForm({ ...blank, contactPhone: user.phone || '' });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <form className="card form c-red" onSubmit={submit}>
        <h1>Request help</h1>
        <p className="muted">Not an emergency line. If lives are at risk, call your local emergency number.</p>
        <div className="grid two">
          <label>What do you need?
            <select value={form.need} onChange={set('need')}>{NEEDS.map((n) => <option key={n} value={n}>{label(n)}</option>)}</select>
          </label>
          <label>People affected
            <input type="number" min="1" max="500" value={form.peopleCount} onChange={set('peopleCount')} />
          </label>
        </div>
        <label>Where are you?
          <input required minLength={3} maxLength={160} placeholder="Address or landmark" value={form.locationText} onChange={set('locationText')} />
        </label>
        <div className="actions">
          <button type="button" className="btn ghost" onClick={locate}>Use my current location</button>
          {form.lat && <small className="muted">Saved {form.lat}, {form.lng}</small>}
        </div>
        <label>Contact phone<input type="tel" maxLength={20} value={form.contactPhone} onChange={set('contactPhone')} /></label>
        <label>Details
          <textarea required minLength={5} maxLength={1000} rows={3} value={form.description} onChange={set('description')} />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Sending…' : 'Send request'}</button>
      </form>

      <h2 className="section">My requests</h2>
      {!mine ? <p className="muted">Loading…</p> : mine.length === 0 ? <p className="muted">You have not requested help yet.</p> : (
        <ul className="stack">
          {mine.map((r) => (
            <li className="card" key={r._id}>
              <div className="between"><h3>{label(r.need)} for {r.peopleCount}</h3><PriorityBadge value={r.priority} /></div>
              <p>{r.description}</p>
              <small className="muted">{r.location.text}, {fmt(r.createdAt)}{r.assignedTo && `, assigned to ${r.assignedTo.name}`}</small>
              <StatusTrack value={r.status} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
