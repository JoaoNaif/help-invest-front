import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toApiError } from '@/lib/errors'
import { useCreateStockAnalysis } from '../hooks/useStocks'
import { emptyStockForm, stockFormSchema, toStockInput, type StockFormValues } from '../schemas'

export function StockForm() {
  const navigate = useNavigate()
  const create = useCreateStockAnalysis()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<StockFormValues>({ resolver: zodResolver(stockFormSchema), defaultValues: emptyStockForm })
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  const apiError = create.error ? toApiError(create.error) : null
  const banner =
    apiError?.status === 404
      ? 'Não encontramos um desses tickers. Confira o código e tente de novo.'
      : apiError?.status === 422
        ? 'Escolha duas ações diferentes.'
        : apiError?.status === 503
          ? 'A fonte de dados de ações está fora do ar. Tente de novo em instantes.'
          : apiError?.message

  const submit = handleSubmit((values) =>
    create.mutateAsync(toStockInput(values)).then(
      (analysis) => navigate(`/acoes/${analysis.id}`),
      () => {},
    ),
  )

  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-6">
      {fields.map((field, index) => (
        <div key={field.id} className="space-y-1.5">
          <div className="grid items-start gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <Input
              label={index === 0 ? 'Ação (ticker)' : 'Comparar com (ticker)'}
              placeholder="Ex.: BBAS3"
              autoCapitalize="characters"
              autoComplete="off"
              autoFocus={index === 0}
              error={errors.items?.[index]?.ticker?.message}
              {...register(`items.${index}.ticker`)}
            />
            <Input
              label="Quanto pretende investir (opcional)"
              inputMode="decimal"
              placeholder="Ex.: 5.000,00"
              autoComplete="off"
              error={errors.items?.[index]?.amount?.message}
              {...register(`items.${index}.amount`)}
            />
            {index > 0 && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => remove(index)}
                aria-label="Remover segunda ação"
                className="sm:mt-[1.625rem]"
              >
                <X className="size-4" aria-hidden />
              </Button>
            )}
          </div>
        </div>
      ))}

      {fields.length < 2 && (
        <button
          type="button"
          onClick={() => append({ ticker: '', amount: '' })}
          className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-gold hover:text-gold-hover"
        >
          <Plus className="size-4" aria-hidden />
          Comparar com outra ação
        </button>
      )}

      {banner && (
        <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {banner}
        </p>
      )}

      <div className="space-y-2">
        <Button type="submit" loading={create.isPending} className="w-full sm:w-auto">
          {create.isPending ? 'Analisando...' : 'Analisar'}
        </Button>
        {create.isPending && (
          <p role="status" className="text-sm text-muted">
            Buscando cotação, dividendos e concorrentes. Leva cerca de 3 segundos.
          </p>
        )}
      </div>
    </form>
  )
}
