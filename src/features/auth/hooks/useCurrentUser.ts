import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { fetchMe } from '../api/auth'

export const currentUserKey = ['me'] as const

/** Única fonte de "está logado?": os cookies são httpOnly e ilegíveis ao JS. */
export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserKey,
    queryFn: fetchMe,
    staleTime: 5 * 60_000,
    // 401 já passou pelo refresh no interceptor: aqui significa "sem sessão".
    retry: (count, error) => !(isAxiosError(error) && error.response?.status === 401) && count < 2,
  })
}
