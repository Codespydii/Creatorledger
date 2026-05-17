'use client'

import { useTransition } from 'react'
import { updateDealStage } from '@/app/actions/deals'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DealRowActions } from './deal-row-actions'
import { CalendarDays, User } from 'lucide-react'

const STAGES = [
  { id: 'prospect',    label: 'Prospect',    color: 'bg-slate-100 text-slate-700',   dot: 'bg-slate-400' },
  { id: 'outreach',    label: 'Outreach',    color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-400' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-400' },
  { id: 'contracted',  label: 'Contracted',  color: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' },
  { id: 'completed',   label: 'Completed',   color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  { id: 'lost',        label: 'Lost',        color: 'bg-red-100 text-red-700',       dot: 'bg-red-400' },
]

const ALL_STAGE_OPTIONS = STAGES.map((s) => ({ value: s.id, label: s.label }))

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
}

interface DealPipelineProps {
  deals: DealCard[]
  currency?: string
}

function StageSelect({ dealId, currentStage }: { dealId: string; currentStage: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <select
      defaultValue={currentStage}
      disabled={pending}
      onChange={(e) => { const val = e.target.value; startTransition(() => { updateDealStage(dealId, val) }) }}
      className="w-full text-xs rounded-lg border border-border bg-background px-2 py-1.5 text-muted-foreground disabled:opacity-50 transition-opacity"
    >
      {ALL_STAGE_OPTIONS.map((s) => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  )
}

export function DealPipeline({ deals, currency = 'USD' }: DealPipelineProps) {
  if (deals.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm font-medium text-foreground">No deals yet</p>
        <p className="text-xs text-muted-foreground mt-1">Add your first brand deal to start tracking your pipeline.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <div className="flex gap-3 min-w-max pb-4">
        {STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage.id)
          const stageValue = stageDeals.reduce((s, d) => s + d.valueCents, 0)

          return (
            <div key={stage.id} className="w-64 flex flex-col gap-2">
              {/* Column header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${stage.dot}`} />
                  <span className="text-sm font-semibold text-foreground">{stage.label}</span>
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
                    {stageDeals.length}
                  </span>
                </div>
                {stageDeals.length > 0 && (
                  <span className="text-xs text-muted-foreground">{formatCurrency(stageValue, currency)}</span>
                )}
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2 min-h-20">
                {stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="rounded-xl border border-border bg-card p-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Brand + stage pill */}
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground leading-snug">{deal.brandName}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${stage.color}`}>
                        {stage.label}
                      </span>
                    </div>

                    {/* Contact */}
                    {deal.contactName && (
                      <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3 shrink-0" />
                        <span className="truncate">{deal.contactName}</span>
                      </div>
                    )}

                    {/* Deliverables preview */}
                    {deal.deliverables && (
                      <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {deal.deliverables}
                      </p>
                    )}

                    {/* Value + end date */}
                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="text-sm font-bold text-primary">{formatCurrency(deal.valueCents, currency)}</span>
                      {deal.endDate && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarDays className="h-3 w-3" />
                          <span>{formatDate(deal.endDate)}</span>
                        </div>
                      )}
                    </div>

                    {/* Move stage */}
                    <div className="mt-2">
                      <StageSelect dealId={deal.id} currentStage={deal.stage} />
                    </div>

                    {/* Edit / Delete */}
                    <DealRowActions
                      id={deal.id}
                      brandName={deal.brandName}
                      contactName={deal.contactName ?? null}
                      contactEmail={deal.contactEmail ?? null}
                      stage={deal.stage}
                      valueCents={deal.valueCents}
                      deliverables={deal.deliverables ?? null}
                      startDate={deal.startDate ?? null}
                      endDate={deal.endDate ?? null}
                      notes={deal.notes ?? null}
                    />
                  </div>
                ))}

                {stageDeals.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border/60 p-4 text-center">
                    <p className="text-xs text-muted-foreground/60">Empty</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
