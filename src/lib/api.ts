import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3333',
  // Sessão vai em cookie httpOnly: toda chamada precisa levar credenciais.
  withCredentials: true,
})

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

let onSessionExpired: () => void = () => {}

/** O app registra aqui o que fazer quando o refresh falha (limpar cache e ir ao login). */
export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler
}

// Uma renovação por vez: requisições 401 simultâneas esperam a mesma promessa.
let refreshing: Promise<boolean> | null = null

function refreshSession() {
  refreshing ??= api
    .post('/sessions/refresh')
    .then(() => true)
    .catch(() => false)
    .finally(() => {
      refreshing = null
    })

  return refreshing
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined
    const isSessionRoute = config?.url?.startsWith('/sessions') ?? false

    if (error.response?.status === 401 && config && !config._retried && !isSessionRoute) {
      config._retried = true

      if (await refreshSession()) return api(config)

      onSessionExpired()
    }

    return Promise.reject(error)
  },
)
