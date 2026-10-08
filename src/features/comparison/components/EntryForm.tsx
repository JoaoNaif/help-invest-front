import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { FormProvider, useForm, useWatch, type Resolver } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { normalizeDecimal, isPositiveDecimal } from '@/lib/decimal-input'
import { toApiError } from '@/lib/errors'
import { formatMoney } from '@/lib/format'
import { GOALS, goalLabel } from '@/lib/labels'
import { useCreateComparison } from '../hooks/useComparison'
import { prepareImage, type PreparedImage } from '../image'
import {
  emptyOption,
  entryBaseSchema,
  entryManualSchema,
  toAmount,
  toOptionInput,
  type EntryFormValues,
} from '../schemas'
import type { CreateComparisonInput } from '../api/comparison'
import { OptionsList } from './OptionsList'
import { PasteArea } from './PasteArea'

type Mode = 'paste' | 'manual'

const modes: { mode: Mode; label: string }[] = [
  { mode: 'paste', label: 'Print ou texto' },
  { mode: 'manual', label: 'Digitar opções' },
]

const HORIZON_SHORTCUTS = [6, 12, 24, 36]

export function EntryForm() {
  const navigate = useNavigate()
  const create = useCreateComparison()

  const [mode, setMode] = useState<Mode>('paste')
  const [text, setText] = useState('')
  const [image, setImage] = useState<PreparedImage | null>(null)
  const [pasteError, setPasteError] = useState<string>()

  const form = useForm<EntryFormValues>({
    resolver: zodResolver(mode === 'manual' ? entryManualSchema : entryBaseSchema) as unknown as Resolver<EntryFormValues>,
    defaultValues: { amount: '', horizonMonths: '12', goal: '', options: [emptyOption] },
  })
  const { register, handleSubmit, setValue, control, formState } = form
  const [amount, horizon] = useWatch({ control, name: ['amount', 'horizonMonths'] })

  async function loadImage(file: File) {
    setPasteError(undefined)
    try {
      setImage(await prepareImage(file))
    } catch {
      setPasteError('Não consegui abrir essa imagem. Tente outro print ou cole o texto.')
    }
  }

  // Ctrl+V em qualquer ponto da tela: imagem sempre vai para a área; texto só se não estiver digitando em outro campo.
  useEffect(() => {
    if (mode !== 'paste') return

    function onPaste(event: ClipboardEvent) {
      const items = Array.from(event.clipboardData?.items ?? [])
      const imageItem = items.find((item) => item.type.startsWith('image/'))
      const file = imageItem?.getAsFile()

      if (file) {
        event.preventDefault()
        void loadImage(file)
      }
    }

    document.addEventListener('paste', onPaste)
    return () => document.removeEventListener('paste', onPaste)
  }, [mode])

  const submit = handleSubmit(async (values) => {
    let input: CreateComparisonInput['input']

    if (mode === 'manual') {
      input = { type: 'manual', options: values.options.map(toOptionInput) }
    } else if (image) {
      input = { type: 'image', base64: image.base64, mediaType: image.mediaType }
    } else if (text.trim()) {
      input = { type: 'text', text: text.trim() }
    } else {
      setPasteError('Cole um print, um texto ou escolha "Digitar opções".')
      return
    }

    setPasteError(undefined)

    try {
      const { comparison } = await create.mutateAsync({
        amount: toAmount(values.amount),
        horizonMonths: Number(values.horizonMonths),
        ...(values.goal ? { goal: values.goal } : {}),
        input,
      })
      navigate(`/comparacoes/${comparison.id}`)
    } catch {
      // O erro fica em create.error e é exibido abaixo.
    }
  })

  const apiError = create.error ? toApiError(create.error) : null
  const amountPreview = isPositiveDecimal(amount) ? formatMoney(normalizeDecimal(amount) as string) : null

  return (
    <FormProvider {...form}>
      <form onSubmit={submit} noValidate className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Input
              label="Quanto você quer investir? (R$)"
              inputMode="decimal"
              placeholder="Ex.: 10.000,00"
              autoComplete="off"
              autoFocus
              error={formState.errors.amount?.message}
              {...register('amount')}
            />
            {amountPreview && !formState.errors.amount && (
              <p className="mt-1.5 text-xs text-muted">{amountPreview}</p>
            )}
          </div>

          <div>
            <Input
              label="Por quantos meses?"
              inputMode="numeric"
              autoComplete="off"
              error={formState.errors.horizonMonths?.message}
              {...register('horizonMonths')}
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {HORIZON_SHORTCUTS.map((months) => (
                <button
                  key={months}
                  type="button"
                  onClick={() => setValue('horizonMonths', String(months), { shouldValidate: true })}
                  aria-pressed={horizon === String(months)}
                  className={`cursor-pointer rounded-full border px-3 py-1 text-xs transition-colors ${
                    horizon === String(months)
                      ? 'border-gold text-gold'
                      : 'border-border text-muted hover:text-text'
                  }`}
                >
                  {months} meses
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <Select
            label="Qual o objetivo desse dinheiro? (opcional)"
            {...register('goal')}
          >
            <option value="">Prefiro não dizer</option>
            {GOALS.map((value) => (
              <option key={value} value={value}>
                {goalLabel(value)}
              </option>
            ))}
          </Select>
          <p className="mt-1.5 text-xs text-muted">
            Com o objetivo, a explicação indica a opção que mais combina com você.
          </p>
        </div>

        <div>
          <div
            role="tablist"
            aria-label="Como informar as opções"
            className="mb-4 grid grid-cols-2 rounded-lg bg-surface p-1"
          >
            {modes.map((item) => (
              <button
                key={item.mode}
                type="button"
                role="tab"
                aria-selected={mode === item.mode}
                onClick={() => setMode(item.mode)}
                className={`h-9 cursor-pointer rounded-md text-sm transition-colors ${
                  mode === item.mode ? 'bg-surface-2 text-gold shadow-sm' : 'text-muted hover:text-text'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {mode === 'paste' ? (
            <PasteArea
              text={text}
              onTextChange={(value) => {
                setText(value)
                setPasteError(undefined)
              }}
              image={image}
              onImageFile={(file) => void loadImage(file)}
              onClearImage={() => setImage(null)}
              error={pasteError}
            />
          ) : (
            <OptionsList />
          )}
        </div>

        {apiError && (
          <p
            role="alert"
            className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
          >
            {apiError.status === 400 ? 'Confira os dados informados.' : apiError.message}
            {apiError.status === 422 && ' Você também pode usar "Digitar opções".'}
          </p>
        )}

        <Button type="submit" loading={create.isPending} className="w-full sm:w-auto sm:min-w-48">
          Continuar
          <ArrowRight className="size-4" aria-hidden />
        </Button>
      </form>
    </FormProvider>
  )
}
