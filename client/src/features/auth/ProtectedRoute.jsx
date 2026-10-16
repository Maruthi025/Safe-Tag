import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../store/AuthContext'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}