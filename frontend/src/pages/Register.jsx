import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { saveAuth } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await register(form);
      saveAuth(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
            TaskFlow
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Create your account</p>
        </div>

        <div className="card" style={{ padding: '1.75rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div className="form-group">
              <label>Full Name</label>
              <input value={form.name} onChange={set('name')} placeholder="John Doe" autoFocus />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input type="password" value={form.password} onChange={set('password')} placeholder="Min. 8 characters with a number" />
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.25rem' }}>
              {loading ? <span className="spinner" /> : 'Create account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.83rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--text)', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
