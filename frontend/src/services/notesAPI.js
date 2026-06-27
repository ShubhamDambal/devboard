import api from './api'

const notesAPI = {
  getAll: (taskId) =>
    api.get(`/tasks/${taskId}/notes/`),

  create: (taskId, content) =>
    api.post(`/tasks/${taskId}/notes/`, { content }),

  remove: (taskId, noteId) =>
    api.delete(`/tasks/${taskId}/notes/${noteId}`),
}

export default notesAPI