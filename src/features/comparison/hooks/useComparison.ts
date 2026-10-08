import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import {
  chooseOption,
  createComparison,
  evaluateComparison,
  explainComparison,
  fetchComparison,
  fetchComparisons,
  fetchRecentOptions,
  reviewOptions,
  type ComparisonDetail,
  type CreateComparisonInput,
  type OptionInput,
} from '../api/comparison'

export const comparisonKey = (id: string) => ['comparison', id] as const
export const comparisonsKey = ['comparisons'] as const
export const recentOptionsKey = ['comparison-options', 'recent'] as const

export function useComparison(id: string) {
  return useQuery({
    queryKey: comparisonKey(id),
    queryFn: () => fetchComparison(id),
    retry: (count, error) =>
      !(isAxiosError(error) && [403, 404].includes(error.response?.status ?? 0)) && count < 2,
  })
}

export function useCreateComparison() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateComparisonInput) => createComparison(body),
    onSuccess: ({ comparison, options }) => {
      queryClient.setQueryData<ComparisonDetail>(comparisonKey(comparison.id), {
        comparison,
        options,
        explanation: null,
      })
      void queryClient.invalidateQueries({ queryKey: comparisonsKey })
      void queryClient.invalidateQueries({ queryKey: recentOptionsKey })
    },
  })
}

/** "Comparar": salva as correções da conferência e já calcula. */
export function useReviewAndEvaluate(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (options: OptionInput[]) => {
      await reviewOptions(id, options)
      return evaluateComparison(id)
    },
    onSuccess: ({ comparison, options }) => {
      queryClient.setQueryData<ComparisonDetail>(comparisonKey(id), (prev) => ({
        comparison,
        options,
        explanation: prev?.explanation ?? null,
      }))
      void queryClient.invalidateQueries({ queryKey: comparisonsKey })
      void queryClient.invalidateQueries({ queryKey: recentOptionsKey })
    },
  })
}

/** Gasta crédito da API: só é chamado por botão. */
export function useExplain(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => explainComparison(id),
    onSuccess: (explanation) => {
      queryClient.setQueryData<ComparisonDetail>(comparisonKey(id), (prev) =>
        prev ? { ...prev, explanation } : prev,
      )
    },
  })
}

export function useChooseOption(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (optionId: string) => chooseOption(id, optionId),
    onSuccess: (comparison) => {
      queryClient.setQueryData<ComparisonDetail>(comparisonKey(id), (prev) =>
        prev ? { ...prev, comparison } : prev,
      )
      void queryClient.invalidateQueries({ queryKey: comparisonsKey })
    },
  })
}

const PAGE_SIZE = 20

/** Últimas comparações (atalho na tela inicial). */
export function useRecentComparisons(limit = 3) {
  return useQuery({
    queryKey: [...comparisonsKey, 'recent', limit],
    queryFn: async () => (await fetchComparisons(1)).slice(0, limit),
  })
}

/** Histórico completo, 20 por página, carregado sob demanda. */
export function useComparisonHistory() {
  return useInfiniteQuery({
    queryKey: [...comparisonsKey, 'history'],
    queryFn: ({ pageParam }) => fetchComparisons(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => (lastPage.length === PAGE_SIZE ? pages.length + 1 : undefined),
  })
}

/** Opções que o usuário já usou, para preencher o formulário sem redigitar (vem do backend). */
export function useRecentOptions() {
  return useQuery({ queryKey: recentOptionsKey, queryFn: fetchRecentOptions, staleTime: 60_000 })
}
