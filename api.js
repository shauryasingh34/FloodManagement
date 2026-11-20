const SERVER = import.meta.env.VITE_SERVER_URL || '';
const TOKEN_KEY = 'floodwatch_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));
export const fileUrl = (path) => SERVER + path;

// Small fetch wrapper: JSON in/out, attaches the JWT, throws Error(message) on failures.
export async function api(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form; // FormData: the browser sets the multipart boundary
  else if (body) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${SERVER}/api${path}`, { method, headers, body: payload });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}
