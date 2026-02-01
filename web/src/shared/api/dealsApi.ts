import { apiRequest } from './apiClient'
type Deal = import('../../entities/deal/model/types').Deal
type Pipeline = import('../../entities/deal/model/types').Pipeline

export async function getPipelines(): Promise<Pipeline[]> {
  return apiRequest({
    url: '/kanban/pipelines',
    method: 'GET',
  })
}

export async function getDeals(pipelineId?: string): Promise<Deal[]> {
  return apiRequest({
    url: '/crm/deals',
    method: 'GET',
    params: pipelineId ? { pipelineId } : undefined,
  })
}

export async function updateDealStage(
  dealId: string,
  stageId: string,
): Promise<Deal> {
  return apiRequest({
    url: `/crm/deals/${dealId}/stage`,
    method: 'PATCH',
    data: { stageId },
  })
}
