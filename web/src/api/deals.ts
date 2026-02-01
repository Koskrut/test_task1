import { apiRequest } from './http'
import { Deal, Pipeline } from './types'

export async function getPipelines(): Promise<Pipeline[]> {
  return apiRequest('/kanban/pipelines')
}

export async function getDeals(pipelineId?: string): Promise<Deal[]> {
  const params = new URLSearchParams()
  if (pipelineId) params.set('pipelineId', pipelineId)
  const query = params.toString()
  return apiRequest(`/crm/deals${query ? `?${query}` : ''}`)
}

export async function updateDealStage(
  dealId: string,
  stageId: string,
): Promise<Deal> {
  return apiRequest(`/crm/deals/${dealId}/stage`, {
    method: 'PATCH',
    body: { stageId },
  })
}
