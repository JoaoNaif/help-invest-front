import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createAccount, createSession, fetchMe, type LoginInput, type RegisterInput } from '../api/auth'
import { currentUserKey } from './useCurrentUser'

/** Abre a sessão e já carrega o usuário no cache, para o guarda de rota liberar a navegação. */
function useStartSession() {
  const queryClient = useQueryClient()

  return async (input: LoginInput) => {
    await createSession(input)
    const user = await fetchMe()
    queryClient.setQueryData(currentUserKey, user)
  }
}

export function useLogin() {
  const startSession = useStartSession()
  return useMutation({ mutationFn: startSession })
}

/** Cadastro com login automático (sem confirmação de e-mail). */
export function useRegister() {
  const startSession = useStartSession()

  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      await createAccount(input)
      await startSession({ email: input.email, password: input.password })
    },
  })
}
