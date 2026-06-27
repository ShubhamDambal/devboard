import api from './api'

const tasksAPI = {
  getAll: (projectId) =>
    api.get(`/projects/${projectId}/tasks/`),

  create: (projectId, title) =>
    api.post(`/projects/${projectId}/tasks/`, { title }),

  updateStatus: (projectId, taskId, status) =>
    api.patch(`/projects/${projectId}/tasks/${taskId}`, { status }),

  remove: (projectId, taskId) =>
    api.delete(`/projects/${projectId}/tasks/${taskId}`),
}

export default tasksAPI