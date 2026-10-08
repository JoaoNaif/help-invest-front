import { createBrowserRouter, Navigate } from 'react-router'
import { AuthPage } from '@/features/auth/pages/AuthPage'
import { ComparePage } from '@/features/comparison/pages/ComparePage'
import { ComparisonPage } from '@/features/comparison/pages/ComparisonPage'
import { HistoryPage } from '@/features/comparison/pages/HistoryPage'
import { PortfolioPage } from '@/features/portfolio/pages/PortfolioPage'
import { ProfilePage } from '@/features/profile/pages/ProfilePage'
import { AppLayout } from './AppLayout'
import { ProtectedRoute } from './ProtectedRoute'

export const router = createBrowserRouter([
  { path: '/entrar', element: <AuthPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <ComparePage /> },
          { path: 'comparacoes/:id', element: <ComparisonPage /> },
          { path: 'carteira', element: <PortfolioPage /> },
          { path: 'historico', element: <HistoryPage /> },
          { path: 'perfil', element: <ProfilePage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
