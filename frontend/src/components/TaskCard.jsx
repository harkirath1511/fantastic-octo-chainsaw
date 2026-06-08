const STATUS_LABEL = { pending: 'Pending', in_progress: 'In Progress', done: 'Done' };

export default function TaskCard({ task, onEdit, onDelete }) {
  const due = task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
  const isOverdue = due && task.status !== 'done' && new Date(task.due_date) < new Date();

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '1.1rem 1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.65rem',
      transition: 'border-color var(--transition)',
      cursor: 'default',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
        <p style={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.4, flex: 1,
          textDecoration: task.status === 'done' ? 'line-through' : 'none',
          color: task.status === 'done' ? 'var(--text-muted)' : 'var(--text)',
        }}>
          {task.title}
        </p>
        <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => onEdit(task)}>Edit</button>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(task.id)}>Delete</button>
        </div>
      </div>

      {task.description && (
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {task.description}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span className={`badge badge-${task.status}`}>{STATUS_LABEL[task.status]}</span>
        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
        {due && (
          <span style={{ fontSize: '0.75rem', color: isOverdue ? 'var(--red)' : 'var(--text-dim)', marginLeft: 'auto' }}>
            {isOverdue ? '⚠ ' : ''}Due {due}
          </span>
        )}
      </div>

      {task.owner_name && (
        <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
          {task.owner_name}
        </p>
      )}
    </div>
  );
}
