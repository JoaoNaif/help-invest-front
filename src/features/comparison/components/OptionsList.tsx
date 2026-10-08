import { ChevronUp, History, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/DatePicker'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import {
  ASSET_TYPES,
  COMPARABLE_ASSET_TYPES,
  INDEXERS,
  LIQUIDITIES,
  assetTypeLabel,
  indexerLabel,
  liquidityLabel,
  rateHint,
} from '@/lib/labels'
import { normalizeDecimal } from '@/lib/decimal-input'
import { formatCalendarDate, formatRate, type Indexer } from '@/lib/format'
import type { RecentOption } from '../api/comparison'
import { useRecentOptions } from '../hooks/useComparison'
import { MAX_OPTIONS, emptyOption, recentToFormValues, type OptionsFormValues } from '../schemas'

/** Lista editável de opções (entrada manual e conferência). Precisa de um FormProvider com `options`. */
export function OptionsList({ collapsible = false }: { collapsible?: boolean }) {
  const {
    control,
    getValues,
    formState: { errors },
  } = useFormContext<OptionsFormValues>()
  const { fields, append, remove, replace } = useFieldArray({ control, name: 'options' })
  const { data: recent = [] } = useRecentOptions()

  // Se só existe um cartão e ele está vazio, a opção recente ocupa o lugar dele em vez de criar mais um.
  function applyRecent(option: RecentOption) {
    const [first] = getValues('options')
    const firstIsBlank = fields.length === 1 && !first?.rate.trim() && !first?.issuerName.trim()

    const values = recentToFormValues(option)

    if (firstIsBlank) replace([values])
    else if (fields.length < MAX_OPTIONS) append(values)
  }

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <OptionCard
          key={field.id}
          index={index}
          canRemove={fields.length > 1}
          collapsible={collapsible}
          onRemove={() => remove(index)}
        />
      ))}

      {errors.options?.message && (
        <p role="alert" className="text-sm text-danger">
          {errors.options.message}
        </p>
      )}

      <Button
        type="button"
        variant="secondary"
        onClick={() => append(emptyOption)}
        disabled={fields.length >= MAX_OPTIONS}
        className="w-full"
      >
        <Plus className="size-4" aria-hidden />
        Adicionar opção
      </Button>

      {recent.length > 0 && (
        <section aria-labelledby="recent-options" className="space-y-2">
          <h3 id="recent-options" className="flex items-center gap-1.5 text-sm text-muted">
            <History className="size-4" aria-hidden />
            Usadas recentemente
          </h3>
          <ul className="flex flex-wrap gap-2">
            {recent.map((option, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => applyRecent(option)}
                  className="cursor-pointer rounded-full border border-border bg-surface px-3 py-1.5 text-sm hover:border-gold hover:text-gold"
                >
                  {recentLabel(option)}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function recentLabel(option: RecentOption) {
  const rate = normalizeDecimal(option.rate)
  const parts = [
    assetTypeLabel(option.assetType),
    option.issuerName?.trim() || null,
    rate ? formatRate(rate, option.indexer as Indexer) : null,
  ]
  return parts.filter(Boolean).join(' · ')
}

function OptionCard({
  index,
  canRemove,
  collapsible,
  onRemove,
}: {
  index: number
  canRemove: boolean
  collapsible: boolean
  onRemove: () => void
}) {
  const {
    register,
    control,
    getValues,
    formState: { errors },
  } = useFormContext<OptionsFormValues>()

  const path = `options.${index}` as const
  const fieldErrors = errors.options?.[index]
  const [indexer, liquidity, assetType, source, issuerName, rate, maturityAt] = useWatch({
    control,
    name: [
      `${path}.indexer`,
      `${path}.liquidity`,
      `${path}.assetType`,
      `${path}.source`,
      `${path}.issuerName`,
      `${path}.rate`,
      `${path}.maturityAt`,
    ],
  })

  // Na conferência, a opção já preenchida aparece como resumo; só abre os campos ao tocar em "Editar".
  const [editing, setEditing] = useState(() => !collapsible || !getValues(`${path}.rate`).trim())
  const expanded = !collapsible || editing || Boolean(fieldErrors)

  const isComparable = (COMPARABLE_ASSET_TYPES as readonly string[]).includes(assetType)
  const fromLlm = source === 'LLM_EXTRACTED'

  if (!expanded) {
    const normalized = normalizeDecimal(rate)
    const summary = [
      assetTypeLabel(assetType),
      normalized ? formatRate(normalized, indexer as Indexer) : null,
      maturityAt ? `vence em ${formatCalendarDate(maturityAt)}` : null,
      liquidity ? liquidityLabel(liquidity) : null,
    ].filter(Boolean)

    return (
      <div
        className={`flex items-center justify-between gap-3 rounded-xl border bg-surface-2/40 p-4 ${fromLlm ? 'border-info/50' : 'border-border'}`}
      >
        <div className="min-w-0">
          <p className="truncate font-medium">{issuerName.trim() || 'Emissor não informado'}</p>
          <p className="mt-0.5 text-sm text-muted">{summary.join(' · ')}</p>
          {fromLlm && (
            <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-info">
              <Sparkles className="size-3" aria-hidden />
              Lida pela IA — confira os valores
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm text-muted hover:bg-surface-2 hover:text-text"
          >
            <Pencil className="size-3.5" aria-hidden />
            Editar
          </button>
          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remover opção ${index + 1}`}
              className="grid size-9 cursor-pointer place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-danger"
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <fieldset
      className={`rounded-xl border bg-surface p-4 sm:p-5 ${fromLlm ? 'border-info/50' : 'border-border'}`}
    >
      <legend className="sr-only">Opção {index + 1}</legend>

      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Opção {index + 1}</span>
          {fromLlm && (
            <span className="inline-flex items-center gap-1 rounded-full bg-info/15 px-2 py-0.5 text-xs text-info">
              <Sparkles className="size-3" aria-hidden />
              Lida pela IA — confira
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {collapsible && !fieldErrors && (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm text-muted hover:bg-surface-2 hover:text-text"
            >
              <ChevronUp className="size-3.5" aria-hidden />
              Fechar
            </button>
          )}
          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remover opção ${index + 1}`}
              className="grid size-9 cursor-pointer place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-danger"
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Tipo" error={fieldErrors?.assetType?.message} {...register(`${path}.assetType`)}>
          {COMPARABLE_ASSET_TYPES.map((type) => (
            <option key={type} value={type}>
              {assetTypeLabel(type)}
            </option>
          ))}
          {!isComparable && ASSET_TYPES.includes(assetType) && (
            <option value={assetType}>{assetTypeLabel(assetType)} (fora do comparador)</option>
          )}
        </Select>

        <Input
          label="Emissor (opcional)"
          placeholder="Ex.: Banco Inter"
          error={fieldErrors?.issuerName?.message}
          {...register(`${path}.issuerName`)}
        />

        <Select label="Indexador" error={fieldErrors?.indexer?.message} {...register(`${path}.indexer`)}>
          {INDEXERS.map((value) => (
            <option key={value} value={value}>
              {indexerLabel(value)}
            </option>
          ))}
        </Select>

        <Input
          label="Taxa"
          inputMode="decimal"
          placeholder={rateHint(indexer)}
          error={fieldErrors?.rate?.message}
          {...register(`${path}.rate`)}
        />

        <Controller
          control={control}
          name={`${path}.maturityAt`}
          render={({ field }) => (
            <DatePicker
              label="Vencimento (opcional)"
              value={field.value}
              onChange={field.onChange}
              error={fieldErrors?.maturityAt?.message}
            />
          )}
        />

        <Select
          label="Liquidez (opcional)"
          error={fieldErrors?.liquidity?.message}
          {...register(`${path}.liquidity`)}
        >
          <option value="">Não informada</option>
          {LIQUIDITIES.map((value) => (
            <option key={value} value={value}>
              {liquidityLabel(value)}
            </option>
          ))}
        </Select>

        {liquidity === 'GRACE_PERIOD' && (
          <Input
            label="Carência (dias)"
            inputMode="numeric"
            placeholder="Ex.: 90"
            error={fieldErrors?.graceDays?.message}
            {...register(`${path}.graceDays`)}
          />
        )}
      </div>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-muted hover:text-text">Mais campos</summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input
            label="CNPJ do emissor"
            inputMode="numeric"
            placeholder="Só números ou com máscara"
            error={fieldErrors?.issuerCnpj?.message}
            {...register(`${path}.issuerCnpj`)}
          />
          <Input
            label="Aplicação mínima (R$)"
            inputMode="decimal"
            placeholder="Ex.: 1000"
            error={fieldErrors?.minAmount?.message}
            {...register(`${path}.minAmount`)}
          />
        </div>
      </details>
    </fieldset>
  )
}
