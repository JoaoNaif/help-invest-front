import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createPosition,
  deletePosition,
  fetchPositions,
  fetchSummary,
  updatePosition,
  type PositionInput,
  type PositionPatch,
} from '../api/portfolio'

export const positionsKey = ['positions'] as const
export const summaryKey = ['portfolio-summary'] as const

export function usePositions() {
  return useQuery({ queryKey: positionsKey, queryFn: fetchPositions })
}

export function useSummary() {
  return useQuery({ queryKey: summaryKey, queryFn: fetchSummary })
}

/** Qualquer mudança em posição invalida a lista e o resumo (que é calculado no backend). */
function useRefreshPortfolio() {
  const queryClient = useQueryClient()

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: positionsKey }),
      queryClient.invalidateQueries({ queryKey: summaryKey }),
    ])
}

export function useCreatePosition() {
  const refresh = useRefreshPortfolio()

  return useMutation({
    mutationFn: (input: PositionInput) => createPosition(input),
    onSuccess: refresh,
  })
}

export function useUpdatePosition() {
  const refresh = useRefreshPortfolio()

  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: PositionPatch }) => updatePosition(id, patch),
    onSuccess: refresh,
  })
}

export function useDeletePosition() {
  const refresh = useRefreshPortfolio()

  return useMutation({
    mutationFn: (id: string) => deletePosition(id),
    onSuccess: refresh,
  })
}
