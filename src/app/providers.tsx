import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { setSessionExpiredHandler } from '@/lib/api'
import { currentUserKey } from '@/features/auth/hooks/useCurrentUser'

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { refetchOnWindowFocus: false } },
    })

    // Refresh falhou: derruba o cache e o guarda de rota manda para o login.
    setSessionExpiredHandler(() => {
      queryClient.clear()
      queryClient.setQueryData(currentUserKey, null)
    })

    return queryClient
  })

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
