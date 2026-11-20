import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const from = useLocation().state?.from?.pathname || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { token, user } = await api('/auth/login', { method: 'POST', body: form });
      signIn(token, user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form className="card narrow form" onSubmit={submit}>
      <h1>Sign in</h1>
      <label>Email
        <input type="email" required autoComplete="email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </label>
      <label>Password
        <input type="password" required autoComplete="current-password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="btn" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      <p className="muted">New here? <Link to="/register">Create a resident account</Link></p>
    </form>
  );
}
