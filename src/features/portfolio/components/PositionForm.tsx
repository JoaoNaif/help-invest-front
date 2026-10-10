import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/DatePicker'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { toApiError } from '@/lib/errors'
import {
  ASSET_TYPES,
  INDEXERS,
  LIQUIDITIES,
  assetTypeLabel,
  indexerLabel,
  liquidityLabel,
  rateHint,
} from '@/lib/labels'
import type { Position } from '../api/portfolio'
import { useCreatePosition, useUpdatePosition } from '../hooks/usePortfolio'
import {
  emptyPosition,
  positionFormSchema,
  toPositionFormValues,
  toPositionInput,
  toPositionPatch,
  type PositionFormValues,
} from '../schemas'

const FIELDS = [
  'assetType',
  'name',
  'investedAmount',
  'issuerName',
  'issuerCnpj',
  'indexer',
  'rate',
  'investedAt',
  'maturityAt',
  'liquidity',
] as const

type Props = {
  /** Posição em edição; ausente = nova posição. */
  position?: Position
  onDone: () => void
}

export function PositionForm({ position, onDone }: Props) {
  const create = useCreatePosition()
  const update = useUpdatePosition()
  const mutation = position ? update : create

  const {
    register,
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<PositionFormValues>({
    resolver: zodResolver(positionFormSchema),
    defaultValues: position ? toPositionFormValues(position) : emptyPosition,
  })

  const indexer = watch('indexer')
  const apiError = mutation.error ? toApiError(mutation.error) : null
  // 400 aparece nos campos; o banner cobre o resto (404, 429, 503, rede...).
  const banner = apiError && apiError.status !== 400 ? apiError.message : undefined

  const onError = (error: unknown) => {
    const { fields } = toApiError(error)
    for (const name of FIELDS) {
      if (fields[name]) setError(name, { message: fields[name] })
    }
  }

  const submit = handleSubmit((values) => {
    if (!position) return create.mutateAsync(toPositionInput(values)).then(onDone, onError)

    const patch = toPositionPatch(position, values)
    if (Object.keys(patch).length === 0) return onDone()

    return update.mutateAsync({ id: position.id, patch }).then(onDone, onError)
  })

  // Ao editar, os detalhes já preenchidos ficam à vista.
  const hasDetails = Boolean(
    position && (position.issuerName || position.issuerCnpj || position.investedAt || position.maturityAt || position.liquidity),
  )

  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-6">
      <h2 className="text-xl">{position ? 'Editar posição' : 'Nova posição'}</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Tipo" error={errors.assetType?.message} {...register('assetType')}>
          {ASSET_TYPES.map((value) => (
            <option key={value} value={value}>
              {assetTypeLabel(value)}
            </option>
          ))}
        </Select>

        <Input
          label="Valor investido (R$)"
          inputMode="decimal"
          placeholder="Ex.: 10.000,00"
          autoComplete="off"
          error={errors.investedAmount?.message}
          {...register('investedAmount')}
        />
      </div>

      <Input
        label="Nome"
        placeholder="Ex.: CDB Banco X 110% CDI"
        autoComplete="off"
        autoFocus={!position}
        error={errors.name?.message}
        {...register('name')}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Indexador (opcional)" error={errors.indexer?.message} {...register('indexer')}>
          <option value="">Nenhum</option>
          {INDEXERS.map((value) => (
            <option key={value} value={value}>
              {indexerLabel(value)}
            </option>
          ))}
        </Select>

        {indexer && (
          <div>
            <Input
              label="Taxa"
              inputMode="decimal"
              autoComplete="off"
              error={errors.rate?.message}
              {...register('rate')}
            />
            <p className="mt-1.5 text-xs text-muted">{rateHint(indexer)}</p>
          </div>
        )}
      </div>

      <details open={hasDetails} className="group rounded-lg border border-border">
        <summary className="cursor-pointer px-3 py-2.5 text-sm text-muted hover:text-text">
          Mais detalhes (emissor, datas, liquidez)
        </summary>
        <div className="space-y-4 border-t border-border p-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Emissor"
              autoComplete="off"
              error={errors.issuerName?.message}
              {...register('issuerName')}
            />
            <Input
              label="CNPJ do emissor"
              inputMode="numeric"
              placeholder="Só números"
              autoComplete="off"
              error={errors.issuerCnpj?.message}
              {...register('issuerCnpj')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="investedAt"
              render={({ field }) => (
                <DatePicker
                  label="Data da aplicação"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.investedAt?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="maturityAt"
              render={({ field }) => (
                <DatePicker
                  label="Vencimento"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.maturityAt?.message}
                />
              )}
            />
          </div>

          <Select label="Liquidez" error={errors.liquidity?.message} {...register('liquidity')}>
            <option value="">Não informar</option>
            {LIQUIDITIES.map((value) => (
              <option key={value} value={value}>
                {liquidityLabel(value)}
              </option>
            ))}
          </Select>
        </div>
      </details>

      {banner && (
        <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {banner}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" loading={mutation.isPending}>
          {position ? 'Salvar alterações' : 'Adicionar posição'}
        </Button>
      </div>
    </form>
  )
}
