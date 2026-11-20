import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from './api';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) return setReady(true);
    api('/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => setToken(null))
      .finally(() => setReady(true));
  }, []);

  const signIn = (token, u) => { setToken(token); setUser(u); };
  const signOut = () => { setToken(null); setUser(null); };

  return <AuthCtx.Provider value={{ user, ready, signIn, signOut }}>{children}</AuthCtx.Provider>;
}
