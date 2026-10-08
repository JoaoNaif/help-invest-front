import { TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { LoginForm, RegisterForm } from '../components/AuthForm'
import { useCurrentUser } from '../hooks/useCurrentUser'

type Mode = 'login' | 'register'

const tabs: { mode: Mode; label: string }[] = [
  { mode: 'login', label: 'Entrar' },
  { mode: 'register', label: 'Criar conta' },
]

export function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const { data: user } = useCurrentUser()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  if (user) return <Navigate to={from} replace />

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <header className="mb-8 text-center">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-gold/15 text-gold">
          <TrendingUp className="size-6" aria-hidden />
        </div>
        <h1 className="text-3xl">Help Invest</h1>
        <p className="mt-2 text-sm text-muted">Compare renda fixa em segundos, não em horas.</p>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div
          role="tablist"
          aria-label="Acesso"
          className="mb-6 grid grid-cols-2 rounded-lg bg-surface-2 p-1"
        >
          {tabs.map((tab) => (
            <button
              key={tab.mode}
              role="tab"
              type="button"
              id={`tab-${tab.mode}`}
              aria-selected={mode === tab.mode}
              aria-controls="auth-panel"
              onClick={() => setMode(tab.mode)}
              className={`h-9 rounded-md text-sm transition-colors cursor-pointer ${
                mode === tab.mode ? 'bg-surface text-gold shadow-sm' : 'text-muted hover:text-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div role="tabpanel" id="auth-panel" aria-labelledby={`tab-${mode}`}>
          {mode === 'login' ? (
            <LoginForm key="login" onSuccess={() => navigate(from, { replace: true })} />
          ) : (
            <RegisterForm key="register" onSuccess={() => navigate(from, { replace: true })} />
          )}
        </div>
      </section>

      <p className="mt-6 text-center text-xs text-muted">
        Nunca pedimos a senha da sua corretora. As explicações são informativas e não constituem
        recomendação de investimento.
      </p>
    </main>
  )
}
