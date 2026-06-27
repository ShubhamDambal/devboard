import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import projectsAPI from '../services/projectsAPI'

const Dashboard = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [creating, setCreating] = useState(false)
  const [modalError, setModalError] = useState('')

  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // ─── FETCH PROJECTS ON MOUNT ───────────────────────────────
  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await projectsAPI.getAll()
      setProjects(response.data)
    } catch (err) {
      setError('Failed to load projects. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ─── CREATE PROJECT ────────────────────────────────────────
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      setModalError('Project name cannot be empty')
      return
    }

    try {
      setCreating(true)
      const response = await projectsAPI.create(newProjectName.trim())
      setProjects([response.data, ...projects])
      setNewProjectName('')
      setShowModal(false)
      setModalError('')
    } catch (err) {
      setModalError(err.response?.data?.error || 'Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  // ─── DELETE PROJECT ────────────────────────────────────────
  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation()   // prevent card click from firing
    if (!window.confirm('Delete this project and all its tasks?')) return

    try {
      await projectsAPI.remove(projectId)
      setProjects(projects.filter((p) => p.id !== projectId))
    } catch (err) {
      setError('Failed to delete project')
    }
  }

  // ─── LOGOUT ────────────────────────────────────────────────
  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // ─── RENDER ────────────────────────────────────────────────
  return (
    <div style={styles.page}>

      {/* Navbar */}
      <nav style={styles.navbar}>
        <span style={styles.brand}>DevBoard</span>
        <div style={styles.navRight}>
          <span style={styles.greeting}>Hi, {user?.name}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </nav>

      <div style={styles.content}>

        {/* Header Row */}
        <div style={styles.headerRow}>
          <h2 style={styles.heading}>My Projects</h2>
          <button onClick={() => setShowModal(true)} style={styles.newBtn}>
            + New Project
          </button>
        </div>

        {/* Error Banner */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Loading State */}
        {loading ? (
          <div style={styles.empty}>Loading projects...</div>
        ) : projects.length === 0 ? (
          <div style={styles.empty}>
            No projects yet. Create your first one!
          </div>
        ) : (
          <div style={styles.grid}>
            {projects.map((project) => (
              <div
                key={project.id}
                style={styles.card}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div style={styles.cardTop}>
                  <h3 style={styles.cardTitle}>{project.name}</h3>
                  <button
                    onClick={(e) => handleDeleteProject(e, project.id)}
                    style={styles.deleteBtn}
                  >
                    ✕
                  </button>
                </div>
                <p style={styles.cardMeta}>{project.task_count} tasks</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>New Project</h3>

            {modalError && <div style={styles.error}>{modalError}</div>}

            <input
              type="text"
              placeholder="Project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
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
                onClick={handleCreateProject}
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
  page: {
    minHeight: '100vh',
    backgroundColor: '#0f172a',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#1e293b',
    borderBottom: '1px solid #334155',
  },
  brand: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#6366f1',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  greeting: {
    color: '#94a3b8',
    fontSize: '0.875rem',
  },
  logoutBtn: {
    padding: '0.4rem 1rem',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    border: '1px solid #334155',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  heading: {
    fontSize: '1.4rem',
    fontWeight: '600',
    color: '#e2e8f0',
  },
  newBtn: {
    padding: '0.5rem 1.1rem',
    backgroundColor: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  error: {
    backgroundColor: '#450a0a',
    color: '#fca5a5',
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontSize: '0.875rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1rem',
  },
  card: {
    backgroundColor: '#1e293b',
    padding: '1.5rem',
    borderRadius: '10px',
    cursor: 'pointer',
    border: '1px solid #334155',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#e2e8f0',
  },
  deleteBtn: {
    background: 'transparent',
    border: 'none',
    color: '#475569',
    cursor: 'pointer',
    fontSize: '0.8rem',
    padding: '0 0.25rem',
    lineHeight: 1,
  },
  cardMeta: {
    fontSize: '0.8rem',
    color: '#64748b',
  },
  empty: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: '4rem',
    fontSize: '0.95rem',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  modal: {
    backgroundColor: '#1e293b',
    padding: '2rem',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '380px',
    border: '1px solid #334155',
  },
  modalTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: '1rem',
  },
  input: {
    width: '100%',
    padding: '0.65rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: '#0f172a',
    color: '#e2e8f0',
    fontSize: '0.95rem',
    outline: 'none',
    marginBottom: '1rem',
    boxSizing: 'border-box',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
  },
  cancelBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    border: '1px solid #334155',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  createBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
  },
}

export default Dashboard