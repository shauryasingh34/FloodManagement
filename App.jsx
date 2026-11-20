import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import Report from './pages/Report';
import Help from './pages/Help';
import Manage from './pages/Manage';

// Role-based access on the client. The API enforces the same rules, so this is only for navigation.
function Protected({ roles, children }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <p className="muted">Loading…</p>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function Home() {
  const { user, ready } = useAuth();
  if (!ready) return <p className="muted">Loading…</p>;
  return user ? <Dashboard /> : <Navigate to="/alerts" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="report" element={<Protected><Report /></Protected>} />
        <Route path="help" element={<Protected><Help /></Protected>} />
        <Route path="manage" element={<Protected roles={['responder', 'admin']}><Manage /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
