import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.5rem',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <p style={{
        fontSize: 'clamp(7rem, 20vw, 12rem)',
        fontWeight: 700,
        letterSpacing: '-0.05em',
        lineHeight: 1,
        color: 'var(--surface2)',
        userSelect: 'none',
      }}>
        404
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)' }}>
          Page not found
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '320px' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      <button className="btn btn-ghost" onClick={() => navigate(-1)}>
        ← Go back
      </button>
    </div>
  );
}
