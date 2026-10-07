import { isAxiosError } from 'axios'

export type FieldErrors = Record<string, string>

export type ApiError = {
  status: number | null
  message: string
  /** Erros de validação (400) por campo, a partir de errors.details[].path. */
  fields: FieldErrors
}

const FRIENDLY: Record<number, string> = {
  403: 'Você não tem permissão para isso.',
  404: 'Não encontramos o que você procura.',
  409: 'Essa ação não é possível no estado atual.',
  422: 'Não conseguimos processar essa entrada. Tente digitar as opções manualmente.',
  429: 'Muitas tentativas. Aguarde um instante e tente de novo.',
  502: 'Resposta inválida do serviço. Tente de novo.',
  503: 'Serviço indisponível no momento. Tente novamente mais tarde.',
}

type ValidationBody = {
  message?: string
  errors?: { details?: { path: (string | number)[]; message: string }[] }
}

export function toApiError(error: unknown): ApiError {
  if (!isAxiosError(error)) {
    return { status: null, message: 'Algo deu errado. Tente de novo.', fields: {} }
  }

  if (!error.response) {
    return { status: null, message: 'Sem conexão com o servidor.', fields: {} }
  }

  const { status, data } = error.response as { status: number; data: ValidationBody }
  const fields: FieldErrors = {}

  for (const detail of data?.errors?.details ?? []) {
    fields[detail.path.join('.')] = detail.message
  }

  const message =
    status === 400
      ? 'Confira os campos destacados.'
      : status === 401
        ? (data?.message ?? 'Sessão inválida.')
        : (FRIENDLY[status] ?? data?.message ?? 'Algo deu errado. Tente de novo.')

  return { status, message, fields }
}
