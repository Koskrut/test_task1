import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getDeals, getPipelines, updateDealStage } from '../api'

export function usePipelines() {
  return useQuery({
    queryKey: ['pipelines'],
    queryFn: () => getPipelines(),
  })
}

export function useDeals(pipelineId?: string) {
  return useQuery({
    queryKey: ['deals', pipelineId],
    queryFn: () => getDeals(pipelineId),
    enabled: Boolean(pipelineId),
  })
}

export function useUpdateDealStage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ dealId, stageId }: { dealId: string; stageId: string }) =>
      updateDealStage(dealId, stageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] })
    },
  })
}
