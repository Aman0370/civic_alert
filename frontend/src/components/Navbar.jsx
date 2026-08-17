import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Radio, Bell, LogOut, ShieldCheck, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { liveNotifications, connected } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors ${
        location.pathname === to ? 'text-verified' : 'text-text-muted hover:text-text-primary'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-ink-border bg-ink/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-verified" />
          <span className="font-display font-bold text-lg tracking-tight">
            Civic<span className="text-verified">Alert</span>
          </span>
          <span
            className={`ml-2 w-1.5 h-1.5 rounded-full ${connected ? 'bg-verified' : 'bg-text-faint'}`}
            title={connected ? 'Live' : 'Offline'}
          />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLink('/map', 'Live Map')}
          {user?.role === 'citizen' && navLink('/dashboard', 'My Reports')}
          {user?.role === 'citizen' && navLink('/report/new', 'Report Incident')}
          {(user?.role === 'authority' || user?.role === 'admin') && navLink('/authority', 'Verification Queue')}
        </nav>

        <div className="flex items-center gap-3">
          {user && (
            <div className="relative">
              <button
                onClick={() => setOpen((o) => !o)}
                className="relative p-2 rounded-md hover:bg-ink-surface transition-colors"
              >
                <Bell className="w-5 h-5 text-text-muted" />
                {liveNotifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-severity-critical" />
                )}
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto card p-2">
                  {liveNotifications.length === 0 ? (
                    <p className="text-xs text-text-faint p-3">No new notifications yet.</p>
                  ) : (
                    liveNotifications.map((n) => (
                      <div key={n.id} className="p-3 border-b border-ink-border last:border-0">
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="text-xs text-text-muted mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-text-muted">
                {user.role === 'authority' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-verified" />
                ) : (
                  <MapPin className="w-3.5 h-3.5 text-severity-low" />
                )}
                <span className="font-mono">{user.name}</span>
              </div>
              <button onClick={handleLogout} className="p-2 rounded-md hover:bg-ink-surface transition-colors">
                <LogOut className="w-4 h-4 text-text-muted" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-text-muted hover:text-text-primary">
                Log in
              </Link>
              <Link to="/register" className="btn-primary !py-2 !px-4">
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
