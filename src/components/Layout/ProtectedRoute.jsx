import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const bypassAuth = import.meta.env.VITE_AUTH_BYPASS === 'true'

  if (!isAuthenticated && !bypassAuth) {
    return <Navigate to="/login" replace />
  }

  return children
}
