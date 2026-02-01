import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { dealsApi } from '../../api'
import { Deal, PipelineStage } from '../../api/types'
import { Card } from '../../components/ui/Card'
import { ErrorState } from '../../components/ui/ErrorState'
import { PageHeader } from '../../components/ui/PageHeader'
import { Spinner } from '../../components/ui/Spinner'

function DealCard({ deal }: { deal: Deal }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: deal.id,
      data: { stageId: deal.stageId },
    })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab rounded-md border border-slate-200 bg-white p-3 shadow-sm"
    >
      <div className="text-sm font-medium text-slate-900">{deal.title}</div>
      <div className="mt-1 text-xs text-slate-500">
        Client: {deal.clientId}
      </div>
      {deal.valueAmount ? (
        <div className="mt-2 text-xs font-semibold text-slate-700">
          {deal.valueAmount}
        </div>
      ) : null}
    </div>
  )
}

function Column({
  stage,
  deals,
}: {
  stage: PipelineStage
  deals: Deal[]
}) {
  const { setNodeRef } = useDroppable({
    id: stage.id,
    data: { stageId: stage.id },
  })
  return (
    <div
      ref={setNodeRef}
      className="flex min-h-[400px] flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
    >
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-900">
          {stage.name}
        </div>
        <div className="text-xs text-slate-500">{deals.length}</div>
      </div>
      <SortableContext items={deals.map((deal) => deal.id)}>
        <div className="flex flex-1 flex-col gap-3">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

export function DealsKanbanPage() {
  const queryClient = useQueryClient()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))
  const pipelinesQuery = useQuery({
    queryKey: ['pipelines'],
    queryFn: () => dealsApi.getPipelines(),
  })

  const pipeline = pipelinesQuery.data?.[0]
  const dealsQuery = useQuery({
    queryKey: ['deals', pipeline?.id],
    queryFn: () => dealsApi.getDeals(pipeline?.id),
    enabled: Boolean(pipeline?.id),
  })

  const [boardDeals, setBoardDeals] = useState<Deal[]>([])

  useEffect(() => {
    if (dealsQuery.data) {
      setBoardDeals(dealsQuery.data)
    }
  }, [dealsQuery.data])

  const stages = useMemo(
    () =>
      (pipeline?.stages ?? []).slice().sort((a, b) => a.position - b.position),
    [pipeline],
  )

  const mutation = useMutation({
    mutationFn: ({ dealId, stageId }: { dealId: string; stageId: string }) =>
      dealsApi.updateDealStage(dealId, stageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] })
    },
  })

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const dealId = String(active.id)
    const newStageId = String(
      (over.data.current?.stageId as string | undefined) ?? over.id,
    )
    const deal = boardDeals.find((item) => item.id === dealId)
    if (!deal || deal.stageId === newStageId) return

    setBoardDeals((prev) =>
      prev.map((item) =>
        item.id === dealId ? { ...item, stageId: newStageId } : item,
      ),
    )
    mutation.mutate({ dealId, stageId: newStageId })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deals Kanban"
        description="Drag deals between stages to update status."
      />

      {pipelinesQuery.isLoading || dealsQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner /> Loading kanban...
        </div>
      ) : null}

      {pipelinesQuery.isError || dealsQuery.isError ? (
        <ErrorState
          title="Failed to load kanban data"
          onRetry={() => {
            pipelinesQuery.refetch()
            dealsQuery.refetch()
          }}
        />
      ) : null}

      {pipeline ? (
        <Card className="overflow-hidden">
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="grid gap-4 lg:grid-cols-3">
              {stages.map((stage) => (
                <div key={stage.id} id={stage.id}>
                  <Column
                    stage={stage}
                    deals={boardDeals.filter(
                      (deal) => deal.stageId === stage.id,
                    )}
                  />
                </div>
              ))}
            </div>
          </DndContext>
        </Card>
      ) : null}
    </div>
  )
}
