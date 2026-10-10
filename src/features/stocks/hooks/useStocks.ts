import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import {
  createStockAnalysis,
  fetchStockAnalyses,
  fetchStockAnalysis,
  type StockAnalysis,
  type StockAnalysisInput,
} from '../api/stocks'

const PAGE_SIZE = 20

export const stockAnalysisKey = (id: string) => ['stock-analysis', id] as const
export const stockAnalysesKey = ['stock-analyses'] as const

export function useStockAnalysis(id: string) {
  return useQuery({
    queryKey: stockAnalysisKey(id),
    queryFn: () => fetchStockAnalysis(id),
    retry: (count, error) =>
      !(isAxiosError(error) && [400, 403, 404].includes(error.response?.status ?? 0)) && count < 2,
  })
}

export function useStockAnalyses() {
  return useInfiniteQuery({
    queryKey: stockAnalysesKey,
    queryFn: ({ pageParam }) => fetchStockAnalyses(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => (lastPage.length === PAGE_SIZE ? pages.length + 1 : undefined),
  })
}

export function useCreateStockAnalysis() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: StockAnalysisInput) => createStockAnalysis(input),
    onSuccess: (analysis) => {
      queryClient.setQueryData<StockAnalysis>(stockAnalysisKey(analysis.id), analysis)
      void queryClient.invalidateQueries({ queryKey: stockAnalysesKey })
    },
  })
}
