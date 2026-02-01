export interface Deal {
  id: string
  title: string
  clientId: string
  stageId: string
  valueAmount?: string | null
}

export interface PipelineStage {
  id: string
  name: string
  position: number
  color?: string | null
}

export interface Pipeline {
  id: string
  name: string
  stages: PipelineStage[]
}
