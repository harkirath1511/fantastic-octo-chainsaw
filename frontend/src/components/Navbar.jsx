import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav style={{
      borderBottom: '1px solid var(--border)',
      padding: '0 2rem',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--surface)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <span style={{ fontWeight: 600, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
          TaskFlow
        </span>
        {user?.role === 'admin' && (
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {[{ to: '/dashboard', label: 'Tasks' }, { to: '/users', label: 'Users' }].map(({ to, label }) => (
              <Link key={to} to={to} style={{
                padding: '0.3rem 0.75rem',
                borderRadius: '99px',
                fontSize: '0.82rem',
                fontWeight: 500,
                color: pathname === to ? 'var(--text)' : 'var(--text-muted)',
                background: pathname === to ? 'var(--surface2)' : 'transparent',
                border: `1px solid ${pathname === to ? 'var(--border-hover)' : 'transparent'}`,
                transition: 'all var(--transition)',
              }}>
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {user?.name}
          {user?.role === 'admin' && (
            <span style={{
              marginLeft: '0.5rem',
              fontSize: '0.65rem',
              background: 'var(--accent-soft)',
              border: '1px solid var(--border-hover)',
              color: 'var(--text-muted)',
              padding: '0.1rem 0.45rem',
              borderRadius: '99px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>Admin</span>
          )}
        </span>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
