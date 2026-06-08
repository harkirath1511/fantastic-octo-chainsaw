import { useState, useEffect, useCallback } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

const STATUS_TABS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9 };
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const { data } = await getTasks(params);
      setTasks(data.tasks);
      setPagination(data.pagination);
    } catch {
      showToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, priorityFilter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleSave = async (form) => {
    if (editingTask) {
      await updateTask(editingTask.id, form);
      showToast('Task updated');
    } else {
      await createTask(form);
      showToast('Task created');
    }
    fetchTasks();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    await deleteTask(id);
    showToast('Task deleted');
    fetchTasks();
  };

  const openCreate = () => { setEditingTask(null); setModalOpen(true); };
  const openEdit = (task) => { setEditingTask(task); setModalOpen(true); };

  const tabStyle = (active) => ({
    padding: '0.4rem 0.85rem',
    borderRadius: '99px',
    fontSize: '0.8rem',
    fontWeight: 500,
    cursor: 'pointer',
    border: '1px solid',
    borderColor: active ? 'var(--border-hover)' : 'transparent',
    background: active ? 'var(--surface2)' : 'transparent',
    color: active ? 'var(--text)' : 'var(--text-muted)',
    transition: 'all var(--transition)',
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>
              {user?.role === 'admin' ? 'All Tasks' : 'My Tasks'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}>
              {pagination.total ?? '—'} tasks {pagination.total !== 1 ? '' : ''}
            </p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>+ New task</button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem' }}>
          {STATUS_TABS.map((t) => (
            <button key={t.key} style={tabStyle(statusFilter === t.key)}
              onClick={() => { setStatusFilter(t.key); setPage(1); }}>
              {t.label}
            </button>
          ))}

          <div style={{ marginLeft: 'auto' }}>
            <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
              style={{ width: 'auto', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
              <option value="">All priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Task grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <span className="spinner" style={{ width: 28, height: 28 }} />
          </div>
        ) : tasks.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '5rem 2rem',
            border: '1px dashed var(--border)', borderRadius: 'var(--radius)',
            color: 'var(--text-dim)',
          }}>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>No tasks found</p>
            <button className="btn btn-ghost" onClick={openCreate}>Create your first task</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {tasks.map((t) => (
              <TaskCard key={t.id} task={t} onEdit={openEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '2rem' }}>
            <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Page {page} of {pagination.pages}
            </span>
            <button className="btn btn-ghost btn-sm" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <TaskModal
          task={editingTask}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}

      {/* Toast */}
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
