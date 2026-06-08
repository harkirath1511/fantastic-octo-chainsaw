import { useState, useEffect } from 'react';
import { getUsers, makeAdmin } from '../api/users';
import Navbar from '../components/Navbar';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [promoting, setPromoting] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    try {
      const { data } = await getUsers();
      setUsers(data.users);
    } catch {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleMakeAdmin = async (user) => {
    if (!confirm(`Promote "${user.name}" to admin?`)) return;
    setPromoting(user.id);
    try {
      await makeAdmin(user.id);
      showToast(`${user.name} is now an admin`);
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to promote user', 'error');
    } finally {
      setPromoting(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>
            Users
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}>
            {users.length} registered {users.length === 1 ? 'user' : 'users'}
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <span className="spinner" style={{ width: 28, height: 28 }} />
          </div>
        ) : (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
          }}>
            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr auto auto',
              gap: '1rem',
              padding: '0.65rem 1.25rem',
              borderBottom: '1px solid var(--border)',
              fontSize: '0.72rem',
              fontWeight: 500,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span></span>
            </div>

            {users.map((user, i) => (
              <div key={user.id} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr auto auto',
                gap: '1rem',
                padding: '0.9rem 1.25rem',
                alignItems: 'center',
                borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background var(--transition)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontWeight: 500, fontSize: '0.88rem' }}>{user.name}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user.email}</span>
                <span className={`badge ${user.role === 'admin' ? 'badge-done' : 'badge-low'}`}>
                  {user.role}
                </span>
                <div>
                  {user.role !== 'admin' && (
                    <button
                      className="btn btn-ghost btn-sm"
                      disabled={promoting === user.id}
                      onClick={() => handleMakeAdmin(user)}
                    >
                      {promoting === user.id ? <span className="spinner" /> : 'Make admin'}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.88rem' }}>
                No users found
              </div>
            )}
          </div>
        )}
      </div>

      {toast && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem',
          background: 'var(--surface)',
          border: `1px solid ${toast.type === 'error' ? 'rgba(248,113,113,0.3)' : 'rgba(74,222,128,0.3)'}`,
          color: toast.type === 'error' ? 'var(--red)' : 'var(--green)',
          padding: '0.7rem 1.1rem',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.83rem',
          fontWeight: 500,
          boxShadow: 'var(--shadow)',
          zIndex: 200,
          animation: 'slideUp 0.18s ease',
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
