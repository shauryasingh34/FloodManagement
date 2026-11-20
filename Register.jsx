import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function Register() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { token, user } = await api('/auth/register', { method: 'POST', body: form });
      signIn(token, user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form className="card narrow form" onSubmit={submit}>
      <h1>Create account</h1>
      <label>Full name
        <input required minLength={2} maxLength={80} autoComplete="name" value={form.name} onChange={set('name')} />
      </label>
      <label>Email
        <input type="email" required autoComplete="email" value={form.email} onChange={set('email')} />
      </label>
      <label>Phone (optional)
        <input type="tel" maxLength={20} autoComplete="tel" value={form.phone} onChange={set('phone')} />
      </label>
      <label>Password
        <input type="password" required minLength={8} maxLength={72} autoComplete="new-password"
          value={form.password} onChange={set('password')} />
        <small>At least 8 characters</small>
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="btn" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
      <p className="muted">Already registered? <Link to="/login">Sign in</Link></p>
    </form>
  );
}
