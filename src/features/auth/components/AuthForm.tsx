import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toApiError } from '@/lib/errors'
import { useLogin, useRegister } from '../hooks/useAuthMutations'
import { loginSchema, registerSchema, type LoginValues, type RegisterValues } from '../schemas'

type Props = { onSuccess: () => void }

export function LoginForm({ onSuccess }: Props) {
  const login = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  const apiError = login.error ? toApiError(login.error) : null
  const banner = apiError?.status === 401 ? 'E-mail ou senha incorretos.' : apiError?.message

  const submit = handleSubmit((values) => login.mutateAsync(values).then(onSuccess, () => {}))

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Input
        label="E-mail"
        type="email"
        autoComplete="email"
        inputMode="email"
        autoFocus
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Senha"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <FormError message={banner} />
      <Button type="submit" loading={login.isPending} className="w-full">
        Entrar
      </Button>
    </form>
  )
}

export function RegisterForm({ onSuccess }: Props) {
  const registerAccount = useRegister()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) })

  const apiError = registerAccount.error ? toApiError(registerAccount.error) : null
  // 409 e 400 aparecem no campo; o banner cobre o resto (429, 503, rede...).
  const banner = apiError && apiError.status !== 409 && apiError.status !== 400 ? apiError.message : undefined

  const submit = handleSubmit((values) =>
    registerAccount.mutateAsync(values).then(onSuccess, (error) => {
      const { status, fields } = toApiError(error)

      if (status === 409) {
        setError('email', { message: 'Este e-mail já está cadastrado.' })
        return
      }

      for (const name of ['name', 'email', 'password'] as const) {
        if (fields[name]) setError(name, { message: fields[name] })
      }
    }),
  )

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Input
        label="Nome"
        autoComplete="name"
        autoFocus
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        label="E-mail"
        type="email"
        autoComplete="email"
        inputMode="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Senha"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <FormError message={banner} />
      <Button type="submit" loading={registerAccount.isPending} className="w-full">
        Criar conta
      </Button>
    </form>
  )
}

function FormError({ message }: { message?: string }) {
  if (!message) return null

  return (
    <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
      {message}
    </p>
  )
}
