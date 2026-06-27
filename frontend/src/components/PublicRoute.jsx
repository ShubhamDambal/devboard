import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PublicRoute = ({ children }) => {
  const { user } = useAuth()
  const token = localStorage.getItem('access_token')

  // If already logged in → redirect to dashboard
  if (user || token) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default PublicRoute