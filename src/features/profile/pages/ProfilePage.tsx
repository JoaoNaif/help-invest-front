import { TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toApiError } from '@/lib/errors'
import { formatTimestampDate } from '@/lib/format'
import { ProfileForm } from '../components/ProfileForm'
import { useProfile } from '../hooks/useProfile'

export function ProfilePage() {
  const { data, isPending, error, refetch } = useProfile()

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl">Perfil</h1>
        <p className="mt-2 text-muted">
          Com seu perfil, os alertas e a explicação das comparações ficam mais úteis. Leva menos de um minuto.
        </p>
      </header>

      {isPending && (
        <div className="space-y-4" aria-busy aria-label="Carregando">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
      )}

      {error && (
        <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
          <p className="text-sm text-danger">{toApiError(error).message}</p>
          <Button type="button" variant="secondary" onClick={() => void refetch()}>
            Tentar de novo
          </Button>
        </div>
      )}

      {data?.isOutdated && (
        <p className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            Seu perfil foi atualizado pela última vez em {formatTimestampDate(data.profile.updatedAt)}. Confira se
            ainda faz sentido e salve de novo.
          </span>
        </p>
      )}

      {!isPending && !error && (
        <div className="max-w-2xl rounded-xl border border-border bg-surface p-4 sm:p-6">
          <ProfileForm profile={data?.profile ?? null} />
        </div>
      )}

      <p className="max-w-2xl text-xs text-muted">
        Conteúdo informativo, não é recomendação formal de investimento. Nunca pedimos senha de corretora.
      </p>
    </div>
  )
}
