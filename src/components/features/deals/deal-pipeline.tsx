'use client'

import { useOptimistic, useState, useTransition } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { toast } from 'sonner'
import { CalendarDays, GripVertical, User } from 'lucide-react'
import { updateDealStage } from '@/app/actions/deals'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { STAGES, type StageId } from './stages'
import { DealDetailSheet, type ContributeDefaults } from './deal-detail-sheet'

interface DealCard {
  id: string
  brandName: string
  contactName?: string | null
  contactEmail?: string | null
  stage: string
  valueCents: number
  currency: string
  endDate?: string | null
  startDate?: string | null
  deliverables?: string | null
  notes?: string | null
  hasRevenue?: boolean
  alreadyContributed?: boolean
}

interface DealPipelineProps {
  deals: DealCard[]
  currency?: string
  contributeDefaults?: ContributeDefaults
}

export function DealPipeline({ deals, currency = 'USD', contributeDefaults }: DealPipelineProps) {
  const [items, setItemStage] = useOptimistic(
    deals,
    (state: DealCard[], move: { id: string; stage: string }) =>
      state.map((d) => (d.id === move.id ? { ...d, stage: move.stage } : d)),
  )
  const [activeId, setActiveId] = useState<string | null>(null)
  const [detail, setDetail] = useState<DealCard | null>(null)
  const [, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  )

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm font-medium text-foreground">No deals yet</p>
        <p className="text-xs text-muted-foreground mt-1">Add your first brand deal to start tracking your pipeline.</p>
      </div>
    )
  }

  const activeDeal = activeId ? items.find((d) => d.id === activeId) ?? null : null

  const handleDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id))

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = e
    if (!over) return

    const dealId = String(active.id)
    const newStage = String(over.id) as StageId
    const deal = items.find((d) => d.id === dealId)
    if (!deal || deal.stage === newStage) return
    if (!STAGES.find((s) => s.id === newStage)) return

    startTransition(async () => {
      setItemStage({ id: dealId, stage: newStage })
      const result = await updateDealStage(dealId, newStage)
      const newStageLabel = STAGES.find((s) => s.id === newStage)?.label ?? newStage
      if (result?.success) {
        toast.success(`Moved to ${newStageLabel}`)
      } else {
        toast.error(result?.error ?? 'Could not move deal')
        // useOptimistic auto-reverts when transition ends without confirmation
      }
    })
  }

  const handleDragCancel = () => setActiveId(null)

  return (
    <>
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
        <div className="flex gap-3 min-w-max pb-4">
          {STAGES.map((stage) => {
            const stageDeals = items.filter((d) => d.stage === stage.id)
            const stageValue = stageDeals.reduce((s, d) => s + d.valueCents, 0)
            return (
              <StageColumn
                key={stage.id}
                stage={stage}
                deals={stageDeals}
                stageValue={stageValue}
                currency={currency}
                draggedId={activeId}
                onOpenDetail={setDetail}
              />
            )
          })}
        </div>
      </div>

      <DragOverlay>
        {activeDeal ? (
          <DealCardView
            deal={activeDeal}
            stage={STAGES.find((s) => s.id === activeDeal.stage) ?? STAGES[0]}
            currency={currency}
            isOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>

    {detail && (
      <DealDetailSheet deal={detail} currency={currency} onClose={() => setDetail(null)} contributeDefaults={contributeDefaults} />
    )}
    </>
  )
}

interface StageColumnProps {
  stage: typeof STAGES[number]
  deals: DealCard[]
  stageValue: number
  currency: string
  draggedId: string | null
  onOpenDetail: (deal: DealCard) => void
}

function StageColumn({ stage, deals, stageValue, currency, draggedId, onOpenDetail }: StageColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })

  return (
    <div className="w-64 flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${stage.dot}`} />
          <span className="text-sm font-semibold text-foreground">{stage.label}</span>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
            {deals.length}
          </span>
        </div>
        {deals.length > 0 && (
          <span className="text-xs text-muted-foreground">{formatCurrency(stageValue, currency)}</span>
        )}
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex flex-col gap-2 min-h-20 rounded-xl p-1 transition-colors',
          isOver && 'bg-primary/5 ring-2 ring-primary/30 ring-inset',
        )}
      >
        {deals.map((deal) => (
          <DraggableCard
            key={deal.id}
            deal={deal}
            stage={stage}
            currency={currency}
            isDragging={draggedId === deal.id}
            onOpenDetail={onOpenDetail}
          />
        ))}

        {deals.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/60 p-4 text-center">
            <p className="text-xs text-muted-foreground/60">{isOver ? 'Drop here' : 'Empty'}</p>
          </div>
        )}
      </div>
    </div>
  )
}

interface DraggableCardProps {
  deal: DealCard
  stage: typeof STAGES[number]
  currency: string
  isDragging: boolean
  onOpenDetail: (deal: DealCard) => void
}

function DraggableCard({ deal, stage, currency, isDragging, onOpenDetail }: DraggableCardProps) {
  const { setNodeRef, attributes, listeners, transform } = useDraggable({ id: deal.id })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button, a, input, label, select, textarea, [role="menu"], [role="dialog"]')) return
        onOpenDetail(deal)
      }}
      className={cn(
        'cursor-pointer rounded-xl border border-border bg-card p-3 shadow-sm hover:shadow-md transition-shadow group',
        isDragging && 'opacity-30',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-1.5 min-w-0">
          <button
            {...attributes}
            {...listeners}
            type="button"
            aria-label={`Drag ${deal.brandName}`}
            className="mt-0.5 cursor-grab active:cursor-grabbing rounded p-0.5 text-muted-foreground/40 hover:text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity touch-none"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
          <p className="text-sm font-semibold text-foreground leading-snug">{deal.brandName}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${stage.color}`}>
          {stage.label}
        </span>
      </div>

      {deal.contactName && (
        <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
          <User className="h-3 w-3 shrink-0" />
          <span className="truncate">{deal.contactName}</span>
        </div>
      )}

      {deal.deliverables && (
        <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {deal.deliverables}
        </p>
      )}

      <div className="mt-2.5 flex items-center justify-between">
        <span className="text-sm font-bold text-primary">{formatCurrency(deal.valueCents, currency)}</span>
        {deal.endDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="h-3 w-3" />
            <span>{formatDate(deal.endDate)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

interface DealCardViewProps {
  deal: DealCard
  stage: typeof STAGES[number]
  currency: string
  isOverlay?: boolean
}

function DealCardView({ deal, stage, currency, isOverlay }: DealCardViewProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-3 shadow-sm w-64',
        isOverlay && 'shadow-2xl ring-2 ring-primary/40 rotate-2 cursor-grabbing',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-foreground leading-snug">{deal.brandName}</p>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${stage.color}`}>
          {stage.label}
        </span>
      </div>
      {deal.contactName && (
        <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
          <User className="h-3 w-3 shrink-0" />
          <span className="truncate">{deal.contactName}</span>
        </div>
      )}
      <div className="mt-2.5 flex items-center justify-between">
        <span className="text-sm font-bold text-primary">{formatCurrency(deal.valueCents, currency)}</span>
        {deal.endDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="h-3 w-3" />
            <span>{formatDate(deal.endDate)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
