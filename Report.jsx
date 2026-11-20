import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { CATEGORIES } from '../constants';
import { label } from '../components/ui';

const blank = { category: 'river_flooding', locationText: '', waterLevelCm: '', description: '', lat: '', lng: '' };

export default function Report() {
  const [form, setForm] = useState(blank);
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const locate = () =>
    navigator.geolocation?.getCurrentPosition(
      (p) => setForm((f) => ({ ...f, lat: p.coords.latitude.toFixed(5), lng: p.coords.longitude.toFixed(5) })),
      () => setError('Could not read your location. Please describe it in words instead.')
    );

  const pickPhoto = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 3 * 1024 * 1024) { setError('Photo must be 3 MB or smaller'); e.target.value = ''; return; }
    setError('');
    setPhoto(file || null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => v !== '' && fd.append(k, v));
    if (photo) fd.append('photo', photo);
    try {
      await api('/incidents', { method: 'POST', form: fd });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="card narrow c-green">
        <h1>Report submitted</h1>
        <p>Thank you. Responders will review it and the status will update on your dashboard.</p>
        <div className="actions">
          <Link className="btn" to="/">View my reports</Link>
          <button className="btn ghost" onClick={() => { setForm(blank); setPhoto(null); setDone(false); }}>Report another</button>
        </div>
      </div>
    );
  }

  return (
    <form className="card form c-blue" onSubmit={submit}>
      <h1>Report a flood incident</h1>
      <p className="muted">If someone is in danger, call your local emergency number first.</p>
      <div className="grid two">
        <label>What are you seeing?
          <select value={form.category} onChange={set('category')}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{label(c)}</option>)}
          </select>
        </label>
        <label>Water level (cm, optional)
          <input type="number" min="0" max="2000" step="any" value={form.waterLevelCm} onChange={set('waterLevelCm')} />
        </label>
      </div>
      <label>Location
        <input required minLength={3} maxLength={160} placeholder="Street, landmark or area" value={form.locationText} onChange={set('locationText')} />
      </label>
      <div className="actions">
        <button type="button" className="btn ghost" onClick={locate}>Use my current location</button>
        {form.lat && <small className="muted">Saved {form.lat}, {form.lng}</small>}
      </div>
      <label>Description
        <textarea required minLength={10} maxLength={1000} rows={4} value={form.description} onChange={set('description')} />
      </label>
      <label>Photo (optional, JPG/PNG/WebP, up to 3 MB)
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pickPhoto} />
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="btn" disabled={busy}>{busy ? 'Submitting…' : 'Submit report'}</button>
    </form>
  );
}
