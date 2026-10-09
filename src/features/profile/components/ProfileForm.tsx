import { zodResolver } from '@hookform/resolvers/zod'
import { Check } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { toApiError } from '@/lib/errors'
import { GOALS, RISK_LEVELS, goalLabel, riskHint, riskLabel } from '@/lib/labels'
import type { InvestorProfile } from '../api/profile'
import { useSaveProfile } from '../hooks/useProfile'
import {
  emptyProfileValues,
  profileFormSchema,
  toProfileFormValues,
  toSaveInput,
  type ProfileFormValues,
} from '../schemas'

const HORIZON_SHORTCUTS = [12, 24, 60, 120]
const FIELDS = ['monthlyIncome', 'emergencyReserve', 'goal', 'horizonMonths', 'riskTolerance'] as const

type Props = { profile: InvestorProfile | null }

export function ProfileForm({ profile }: Props) {
  const save = useSaveProfile()
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: profile ? toProfileFormValues(profile) : emptyProfileValues,
  })

  const horizon = watch('horizonMonths')
  const apiError = save.error ? toApiError(save.error) : null
  // 400 aparece nos campos; o banner cobre o resto (429, 503, rede...).
  const banner = apiError && apiError.status !== 400 ? apiError.message : undefined

  const submit = handleSubmit((values) =>
    save.mutateAsync(toSaveInput(values)).then(
      (saved) => reset(toProfileFormValues(saved)),
      (error) => {
        const { fields } = toApiError(error)
        for (const name of FIELDS) {
          if (fields[name]) setError(name, { message: fields[name] })
        }
      },
    ),
  )

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Renda mensal (R$)"
          inputMode="decimal"
          placeholder="Ex.: 5.000,00"
          autoComplete="off"
          autoFocus={!profile}
          error={errors.monthlyIncome?.message}
          {...register('monthlyIncome')}
        />
        <Input
          label="Reserva de emergência atual (R$)"
          inputMode="decimal"
          placeholder="Ex.: 10.000,00"
          autoComplete="off"
          error={errors.emergencyReserve?.message}
          {...register('emergencyReserve')}
        />
      </div>

      <Select label="Qual seu principal objetivo?" error={errors.goal?.message} {...register('goal')}>
        <option value="">Escolha...</option>
        {GOALS.map((value) => (
          <option key={value} value={value}>
            {goalLabel(value)}
          </option>
        ))}
      </Select>

      <div>
        <Input
          label="Em quantos meses você pretende usar esse dinheiro?"
          inputMode="numeric"
          autoComplete="off"
          error={errors.horizonMonths?.message}
          {...register('horizonMonths')}
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {HORIZON_SHORTCUTS.map((months) => (
            <button
              key={months}
              type="button"
              onClick={() =>
                setValue('horizonMonths', String(months), { shouldValidate: true, shouldDirty: true })
              }
              aria-pressed={horizon === String(months)}
              className={`cursor-pointer rounded-full border px-3 py-1 text-xs transition-colors ${
                horizon === String(months) ? 'border-gold text-gold' : 'border-border text-muted hover:text-text'
              }`}
            >
              {months} meses
            </button>
          ))}
        </div>
      </div>

      <fieldset>
        <legend className="mb-1.5 text-sm text-muted">Como você lida com oscilações?</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {RISK_LEVELS.map((value) => (
            <label key={value} className="cursor-pointer">
              <input type="radio" value={value} className="peer sr-only" {...register('riskTolerance')} />
              <span className="block h-full rounded-lg border border-border bg-surface-2 p-3 transition-colors hover:border-muted/50 peer-checked:border-gold peer-focus-visible:outline-2 peer-focus-visible:outline-gold">
                <span className="block text-sm font-medium">{riskLabel(value)}</span>
                <span className="mt-1 block text-xs text-muted">{riskHint(value)}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.riskTolerance && <p className="mt-1.5 text-sm text-danger">{errors.riskTolerance.message}</p>}
      </fieldset>

      {banner && (
        <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {banner}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={save.isPending} className="w-full sm:w-auto">
          Salvar perfil
        </Button>
        {save.isSuccess && !isDirty && (
          <p role="status" className="inline-flex items-center gap-1.5 text-sm text-gain">
            <Check className="size-4" aria-hidden />
            Perfil salvo.
          </p>
        )}
      </div>
    </form>
  )
}
