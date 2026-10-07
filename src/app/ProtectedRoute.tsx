import { Navigate, Outlet, useLocation } from 'react-router'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'

export function ProtectedRoute() {
  const { data: user, isPending } = useCurrentUser()
  const location = useLocation()

  if (isPending) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="size-8 animate-spin rounded-full border-2 border-border border-t-gold" />
      </div>
    )
  }

  if (!user) return <Navigate to="/entrar" replace state={{ from: location.pathname }} />

  return <Outlet />
}
