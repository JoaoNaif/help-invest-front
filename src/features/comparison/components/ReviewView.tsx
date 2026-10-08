import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Sparkles } from 'lucide-react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { Link } from 'react-router'
import { Button } from '@/components/ui/Button'
import { toApiError } from '@/lib/errors'
import type { ComparisonDetail } from '../api/comparison'
import { useReviewAndEvaluate } from '../hooks/useComparison'
import {
  optionsFormSchema,
  toOptionFormValues,
  toOptionInput,
  type OptionsFormValues,
} from '../schemas'
import { OptionsList } from './OptionsList'

/** Conferência (DRAFT): resumo do que será comparado; só abre os campos de quem quiser corrigir algo. */
export function ReviewView({ detail }: { detail: ComparisonDetail }) {
  const { comparison, options } = detail
  const evaluate = useReviewAndEvaluate(comparison.id)

  const form = useForm<OptionsFormValues>({
    resolver: zodResolver(optionsFormSchema),
    defaultValues: { options: options.map(toOptionFormValues) },
  })

  const count = useWatch({ control: form.control, name: 'options' }).length
  const hasLlmOptions = options.some((option) => option.source === 'LLM_EXTRACTED')
  const apiError = evaluate.error ? toApiError(evaluate.error) : null

  const submit = form.handleSubmit((values) =>
    evaluate.mutateAsync(values.options.map(toOptionInput)).then(
      () => undefined,
      () => undefined,
    ),
  )

  return (
    <FormProvider {...form}>
      <form onSubmit={submit} noValidate className="space-y-6">
        {hasLlmOptions && (
          <p className="flex items-start gap-2 rounded-lg border border-info/30 bg-info/10 px-3 py-2 text-sm text-info">
            <Sparkles className="mt-0.5 size-4 shrink-0" aria-hidden />
            A IA pode errar na leitura. Confira taxa, indexador e vencimento das opções marcadas antes de
            comparar.
          </p>
        )}

        <OptionsList collapsible />

        {apiError && (
          <p
            role="alert"
            className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
          >
            {apiError.status === 400 ? 'Confira os campos das opções.' : apiError.message}
          </p>
        )}

        <div className="sticky bottom-24 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/40 bg-surface/95 p-3 shadow-xl backdrop-blur md:bottom-4">
          <p className="pl-1 text-sm text-muted">
            {count} {count === 1 ? 'opção será comparada' : 'opções serão comparadas'}
          </p>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex h-11 items-center rounded-lg px-3 text-sm text-muted hover:text-text"
            >
              Recomeçar
            </Link>
            <Button type="submit" loading={evaluate.isPending}>
              <Check className="size-4" aria-hidden />
              Confirmar e comparar
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
