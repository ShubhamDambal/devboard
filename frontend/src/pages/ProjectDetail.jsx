import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import tasksAPI from '../services/tasksAPI'

const STATUS_LABELS = {
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done',
}

const STATUS_COLORS = {
  todo: { bg: '#1e3a5f', color: '#93c5fd' },
  in_progress: { bg: '#3b1f5e', color: '#c4b5fd' },
  done: { bg: '#14532d', color: '#86efac' },
}

const ProjectDetail = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const [modalError, setModalError] = useState('')

  // ─── FETCH TASKS ON MOUNT ──────────────────────────────────
  useEffect(() => {
    fetchTasks()
  }, [projectId])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await tasksAPI.getAll(projectId)
      setTasks(response.data)
    } catch (err) {
      setError('Failed to load tasks.')
    } finally {
      setLoading(false)
    }
  }

  // ─── CREATE TASK ───────────────────────────────────────────
  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) {
      setModalError('Task title cannot be empty')
      return
    }

    try {
      setCreating(true)
      const response = await tasksAPI.create(projectId, newTaskTitle.trim())
      setTasks([response.data, ...tasks])
      setNewTaskTitle('')
      setShowModal(false)
      setModalError('')
    } catch (err) {
      setModalError(err.response?.data?.error || 'Failed to create task')
    } finally {
      setCreating(false)
    }
  }

  // ─── DELETE TASK ───────────────────────────────────────────
  const handleDeleteTask = async (e, taskId) => {
    e.stopPropagation()
    if (!window.confirm('Delete this task and all its notes?')) return

    try {
      await tasksAPI.remove(projectId, taskId)
      setTasks(tasks.filter((t) => t.id !== taskId))
    } catch (err) {
      setError('Failed to delete task.')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Filter tasks by status
  const filteredTasks = filter === 'all'
    ? tasks
    : tasks.filter((t) => t.status === filter)

  return (
    <div style={styles.page}>

      {/* Navbar */}
      <nav style={styles.navbar}>
        <span style={styles.brand}>DevBoard</span>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </nav>

      <div style={styles.content}>

        {/* Back + Title */}
        <div style={styles.topRow}>
          <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
            ← Back
          </button>
          <h2 style={styles.heading}>Project Tasks</h2>
        </div>

        {/* Error Banner */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Filter Tabs + New Task Button */}
        <div style={styles.controlRow}>
          <div style={styles.tabs}>
            {['all', 'todo', 'in_progress', 'done'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                style={{
                  ...styles.tab,
                  ...(filter === tab ? styles.activeTab : {}),
                }}
              >
                {tab === 'all' ? 'All' : STATUS_LABELS[tab]}
              </button>
            ))}
          </div>
          <button onClick={() => setShowModal(true)} style={styles.newBtn}>
            + New Task
          </button>
        </div>

        {/* Task List */}
        {loading ? (
          <div style={styles.empty}>Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div style={styles.empty}>No tasks here yet.</div>
        ) : (
          <div style={styles.taskList}>
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                style={styles.taskRow}
                onClick={() => navigate(`/projects/${projectId}/tasks/${task.id}`)}
              >
                <span style={styles.taskTitle}>{task.title}</span>
                <div style={styles.taskRight}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: STATUS_COLORS[task.status].bg,
                    color: STATUS_COLORS[task.status].color,
                  }}>
                    {STATUS_LABELS[task.status]}
                  </span>
                  <button
                    onClick={(e) => handleDeleteTask(e, task.id)}
                    style={styles.deleteBtn}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>New Task</h3>

            {modalError && <div style={styles.error}>{modalError}</div>}

            <input
              type="text"
              placeholder="Task title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
              style={styles.input}
              autoFocus
            />

            <div style={styles.modalActions}>
              <button
                onClick={() => { setShowModal(false); setModalError('') }}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                style={styles.createBtn}
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#0f172a' },
  navbar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1rem 2rem', backgroundColor: '#1e293b', borderBottom: '1px solid #334155',
  },
  brand: { fontSize: '1.3rem', fontWeight: '700', color: '#6366f1' },
  logoutBtn: {
    padding: '0.4rem 1rem', backgroundColor: 'transparent', color: '#94a3b8',
    border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem',
  },
  content: { maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' },
  topRow: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' },
  backBtn: {
    padding: '0.4rem 0.85rem', backgroundColor: 'transparent', color: '#94a3b8',
    border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem',
  },
  heading: { fontSize: '1.4rem', fontWeight: '600', color: '#e2e8f0' },
  error: {
    backgroundColor: '#450a0a', color: '#fca5a5', padding: '0.75rem',
    borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem',
  },
  controlRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '1.25rem',
  },
  tabs: { display: 'flex', gap: '0.5rem' },
  tab: {
    padding: '0.4rem 0.85rem', backgroundColor: 'transparent', color: '#64748b',
    border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem',
  },
  activeTab: { backgroundColor: '#6366f1', color: 'white', border: '1px solid #6366f1' },
  newBtn: {
    padding: '0.5rem 1.1rem', backgroundColor: '#6366f1', color: 'white',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem',
  },
  taskList: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  taskRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1rem 1.25rem', backgroundColor: '#1e293b', borderRadius: '8px',
    border: '1px solid #334155', cursor: 'pointer',
  },
  taskTitle: { color: '#e2e8f0', fontSize: '0.95rem' },
  taskRight: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  badge: { padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' },
  deleteBtn: {
    background: 'transparent', border: 'none', color: '#475569',
    cursor: 'pointer', fontSize: '0.8rem', padding: '0 0.25rem',
  },
  empty: { color: '#64748b', textAlign: 'center', marginTop: '4rem', fontSize: '0.95rem' },
  overlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
  },
  modal: {
    backgroundColor: '#1e293b', padding: '2rem', borderRadius: '12px',
    width: '100%', maxWidth: '380px', border: '1px solid #334155',
  },
  modalTitle: { fontSize: '1.1rem', fontWeight: '600', color: '#e2e8f0', marginBottom: '1rem' },
  input: {
    width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px',
    border: '1px solid #334155', backgroundColor: '#0f172a', color: '#e2e8f0',
    fontSize: '0.95rem', outline: 'none', marginBottom: '1rem', boxSizing: 'border-box',
  },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' },
  cancelBtn: {
    padding: '0.5rem 1rem', backgroundColor: 'transparent', color: '#94a3b8',
    border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer',
  },
  createBtn: {
    padding: '0.5rem 1rem', backgroundColor: '#6366f1', color: 'white',
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600',
  },
}

export default ProjectDetail