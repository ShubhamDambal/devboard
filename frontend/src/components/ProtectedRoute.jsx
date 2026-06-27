import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth()
  const token = localStorage.getItem('access_token')

  // If no user in context AND no token in storage → redirect
  if (!user && !token) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute