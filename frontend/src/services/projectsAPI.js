import api from './api'

const projectsAPI = {
  getAll: () =>
    api.get('/projects/'),

  create: (name) =>
    api.post('/projects/', { name }),

  remove: (projectId) =>
    api.delete(`/projects/${projectId}`),
}

export default projectsAPI