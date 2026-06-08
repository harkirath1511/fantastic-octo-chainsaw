import { useState, useEffect } from 'react';

const EMPTY = { title: '', description: '', status: 'pending', priority: 'medium', due_date: '' };

export default function TaskModal({ task, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
      });
    } else {
      setForm(EMPTY);
    }
  }, [task]);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) { setError('Title is required'); return; }
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = { display: 'flex', flexDirection: 'column', gap: '0.35rem' };
  const labelStyle = { fontSize: '0.73rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{task ? 'Edit Task' : 'New Task'}</span>
          <button className="modal-close btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Title</label>
            <input value={form.title} onChange={set('title')} placeholder="What needs to be done?" autoFocus />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Description</label>
            <textarea value={form.description} onChange={set('description')} placeholder="Optional details..." rows={3} style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Status</label>
              <select value={form.status} onChange={set('status')}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Priority</label>
              <select value={form.priority} onChange={set('priority')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Due Date</label>
            <input type="date" value={form.due_date} onChange={set('due_date')} />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : (task ? 'Save changes' : 'Create task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
