import axios from 'axios'

// Single axios instance with base URL
// Change this one line to switch between dev and production
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// ─── REQUEST INTERCEPTOR ─────────────────────────────────────
// Runs before EVERY request automatically
// Attaches JWT token from localStorage to Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── RESPONSE INTERCEPTOR ────────────────────────────────────
// Runs after EVERY response automatically
// If token expired (401), clear storage and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api