import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import tasksAPI from '../services/tasksAPI'
import notesAPI from '../services/notesAPI'

const STATUS_OPTIONS = [
  { value: 'todo', label: 'Todo', bg: '#1e3a5f', color: '#93c5fd' },
  { value: 'in_progress', label: 'In Progress', bg: '#3b1f5e', color: '#c4b5fd' },
  { value: 'done', label: 'Done', bg: '#14532d', color: '#86efac' },
]

const formatDate = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleString('en-IN', {
    day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })
}

const TaskDetail = () => {
  const { projectId, taskId } = useParams()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [task, setTask] = useState(null)
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [creating, setCreating] = useState(false)
  const [modalError, setModalError] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // ─── FETCH TASK + NOTES ON MOUNT ───────────────────────────
  useEffect(() => {
    fetchData()
  }, [taskId])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch tasks list to find current task
      const tasksResponse = await tasksAPI.getAll(projectId)
      const currentTask = tasksResponse.data.find(
        (t) => t.id === parseInt(taskId)
      )

      if (!currentTask) {
        setError('Task not found.')
        return
      }

      // Fetch notes for this task
      const notesResponse = await notesAPI.getAll(taskId)

      setTask(currentTask)
      setNotes(notesResponse.data)

    } catch (err) {
      setError('Failed to load task.')
    } finally {
      setLoading(false)
    }
  }

  // ─── UPDATE STATUS ─────────────────────────────────────────
  const handleStatusChange = async (newStatus) => {
    if (newStatus === task.status) return
    if (updatingStatus) return

    try {
      setUpdatingStatus(true)
      const response = await tasksAPI.updateStatus(projectId, taskId, newStatus)
      setTask(response.data)
    } catch (err) {
      setError('Failed to update status.')
    } finally {
      setUpdatingStatus(false)
    }
  }

  // ─── ADD NOTE ──────────────────────────────────────────────
  const handleAddNote = async () => {
    if (!newNote.trim()) {
      setModalError('Note cannot be empty')
      return
    }

    try {
      setCreating(true)
      const response = await notesAPI.create(taskId, newNote.trim())
      setNotes([response.data, ...notes])
      setNewNote('')
      setShowModal(false)
      setModalError('')
    } catch (err) {
      setModalError(err.response?.data?.error || 'Failed to add note')
    } finally {
      setCreating(false)
    }
  }

  // ─── DELETE NOTE ───────────────────────────────────────────
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) return

    try {
      await notesAPI.remove(taskId, noteId)
      setNotes(notes.filter((n) => n.id !== noteId))
    } catch (err) {
      setError('Failed to delete note.')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // ─── RENDER ────────────────────────────────────────────────
  if (loading) return <div style={styles.centered}>Loading task...</div>
  if (error) return <div style={styles.centered}>{error}</div>
  if (!task) return null

  return (
    <div style={styles.page}>

      {/* Navbar */}
      <nav style={styles.navbar}>
        <span style={styles.brand}>DevBoard</span>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </nav>

      <div style={styles.content}>

        {/* Back Button */}
        <button
          onClick={() => navigate(`/projects/${projectId}`)}
          style={styles.backBtn}
        >
          ← Back
        </button>

        {/* Task Header */}
        <div style={styles.taskHeader}>
          <h2 style={styles.taskTitle}>{task.title}</h2>
          <p style={styles.taskMeta}>Task #{taskId} · Project #{projectId}</p>
        </div>

        {/* Status Changer */}
        <div style={styles.section}>
          <p style={styles.sectionLabel}>Status</p>
          <div style={styles.statusRow}>
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                disabled={updatingStatus}
                style={{
                  ...styles.statusBtn,
                  backgroundColor: task.status === option.value
                    ? option.bg : 'transparent',
                  color: task.status === option.value
                    ? option.color : '#64748b',
                  border: task.status === option.value
                    ? `1px solid ${option.color}33`
                    : '1px solid #334155',
                  opacity: updatingStatus ? 0.6 : 1,
                }}
              >
                {task.status === option.value && '✓ '}
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.divider} />

        {/* Notes Section */}
        <div style={styles.section}>
          <div style={styles.notesHeader}>
            <p style={styles.sectionLabel}>Notes ({notes.length})</p>
            <button onClick={() => setShowModal(true)} style={styles.newBtn}>
              + Add Note
            </button>
          </div>

          {notes.length === 0 ? (
            <div style={styles.empty}>No notes yet. Add one!</div>
          ) : (
            <div style={styles.notesList}>
              {notes.map((note) => (
                <div key={note.id} style={styles.noteCard}>
                  <div style={styles.noteTop}>
                    <p style={styles.noteContent}>{note.content}</p>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      style={styles.deleteBtn}
                    >
                      ✕
                    </button>
                  </div>
                  <p style={styles.noteDate}>{formatDate(note.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Note Modal */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>New Note</h3>

            {modalError && <div style={styles.error}>{modalError}</div>}

            <textarea
              placeholder="Write your note here..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              style={styles.textarea}
              rows={4}
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
                onClick={handleAddNote}
                style={styles.createBtn}
                disabled={creating}
              >
                {creating ? 'Adding...' : 'Add Note'}
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
  centered: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: '#94a3b8', backgroundColor: '#0f172a',
  },
  navbar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1rem 2rem', backgroundColor: '#1e293b', borderBottom: '1px solid #334155',
  },
  brand: { fontSize: '1.3rem', fontWeight: '700', color: '#6366f1' },
  logoutBtn: {
    padding: '0.4rem 1rem', backgroundColor: 'transparent', color: '#94a3b8',
    border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem',
  },
  content: { maxWidth: '700px', margin: '0 auto', padding: '2rem 1.5rem' },
  backBtn: {
    padding: '0.4rem 0.85rem', backgroundColor: 'transparent', color: '#94a3b8',
    border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer',
    fontSize: '0.875rem', marginBottom: '1.5rem',
  },
  taskHeader: { marginBottom: '1.5rem' },
  taskTitle: { fontSize: '1.6rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '0.25rem' },
  taskMeta: { fontSize: '0.8rem', color: '#64748b' },
  section: { marginBottom: '1.5rem' },
  sectionLabel: {
    fontSize: '0.75rem', fontWeight: '600', color: '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem',
  },
  statusRow: { display: 'flex', gap: '0.6rem' },
  statusBtn: {
    padding: '0.45rem 1rem', borderRadius: '8px', cursor: 'pointer',
    fontSize: '0.85rem', fontWeight: '500',
  },
  divider: { height: '1px', backgroundColor: '#1e293b', margin: '0.5rem 0 1.5rem' },
  notesHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '0.75rem',
  },
  newBtn: {
    padding: '0.4rem 0.9rem', backgroundColor: '#6366f1', color: 'white',
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
  },
  notesList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  noteCard: {
    backgroundColor: '#1e293b', padding: '1rem 1.25rem',
    borderRadius: '8px', border: '1px solid #334155',
  },
  noteTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' },
  noteContent: { color: '#e2e8f0', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '0.5rem' },
  noteDate: { fontSize: '0.75rem', color: '#64748b' },
  deleteBtn: {
    background: 'transparent', border: 'none', color: '#475569',
    cursor: 'pointer', fontSize: '0.8rem', flexShrink: 0,
  },
  empty: { color: '#64748b', textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' },
  error: {
    backgroundColor: '#450a0a', color: '#fca5a5', padding: '0.75rem',
    borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem',
  },
  overlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
  },
  modal: {
    backgroundColor: '#1e293b', padding: '2rem', borderRadius: '12px',
    width: '100%', maxWidth: '420px', border: '1px solid #334155',
  },
  modalTitle: { fontSize: '1.1rem', fontWeight: '600', color: '#e2e8f0', marginBottom: '1rem' },
  textarea: {
    width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px',
    border: '1px solid #334155', backgroundColor: '#0f172a', color: '#e2e8f0',
    fontSize: '0.95rem', outline: 'none', marginBottom: '1rem',
    boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit',
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

export default TaskDetail