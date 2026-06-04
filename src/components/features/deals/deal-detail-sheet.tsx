'use client'

import { useState } from 'react'
import { ShieldCheck, CheckCircle2, Wallet } from 'lucide-react'
import { DetailSheet, DetailField } from '@/components/ui/detail-sheet'
import { Button } from '@/components/ui/button'
import { ContributeForm } from '@/components/features/benchmarks/contribute-form'
import { AddRevenueForm } from '@/components/features/revenue/add-revenue-form'
import { DealRowActions } from './deal-row-actions'
import { getStage } from './stages'
import { formatCurrency, formatDate } from '@/lib/utils'

export interface DealDetail {
  id: string
  brandName: string
  contactName?: string | null
  contactEmail?: string | null
  stage: string
  valueCents: number
  currency?: string
  deliverables?: string | null
  startDate?: string | null
  endDate?: string | null
  notes?: string | null
  /** Has at least one payment logged against it (eligible for a verified rate). */
  hasRevenue?: boolean
  /** Already contributed to the rate benchmarks. */
  alreadyContributed?: boolean
}

/** Best-guess benchmark dimensions for the logged-in creator, used to pre-fill. */
export interface ContributeDefaults {
  platform?: string
  subscriberTier?: string
  niche?: string
}

export function DealDetailSheet({
  deal,
  currency,
  onClose,
  contributeDefaults,
}: {
  deal: DealDetail
  currency: string
  onClose: () => void
  contributeDefaults?: ContributeDefaults
}) {
  const st = getStage(deal.stage)
  const [contribOpen, setContribOpen] = useState(false)
  const [payOpen, setPayOpen] = useState(false)

  const isCompleted = deal.stage === 'completed'
  const isUsd = (deal.currency ?? 'USD') === 'USD'
  const canContribute = isCompleted && !!deal.hasRevenue && isUsd && !deal.alreadyContributed
  const canLogPayment = isCompleted && !deal.hasRevenue

  return (
    <>
      <DetailSheet
        open
        // Keep the sheet open while a modal is layered on top of it.
        onClose={() => { if (!contribOpen && !payOpen) onClose() }}
        title={deal.brandName}
        subtitle={`Brand deal · ${st.label}`}
        footer={
          <div className="space-y-3">
            {deal.alreadyContributed ? (
              <p className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 py-2 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Contributed to rate benchmarks
              </p>
            ) : canContribute ? (
              <Button type="button" variant="outline" className="w-full" onClick={() => setContribOpen(true)}>
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Contribute this rate to benchmarks
              </Button>
            ) : canLogPayment ? (
              <div className="space-y-1.5">
                <Button type="button" variant="outline" className="w-full" onClick={() => setPayOpen(true)}>
                  <Wallet className="h-4 w-4" aria-hidden="true" />
                  Log payment for this deal
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Records the income and unlocks contributing this rate to benchmarks.
                </p>
              </div>
            ) : isCompleted && !isUsd ? (
              <p className="text-center text-xs text-muted-foreground">
                Verified benchmark contributions support USD deals only for now.
              </p>
            ) : null}

            <DealRowActions
              labeled
              onDone={onClose}
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
        }
      >
        <p className="mb-5 text-3xl font-bold text-primary">{formatCurrency(deal.valueCents, currency)}</p>
        <dl>
          <DetailField label="Stage">
            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${st.color}`}>{st.label}</span>
          </DetailField>
          {(deal.contactName || deal.contactEmail) && (
            <DetailField label="Contact">
              {deal.contactName || deal.contactEmail}
              {deal.contactName && deal.contactEmail && (
                <span className="block text-xs text-muted-foreground">{deal.contactEmail}</span>
              )}
            </DetailField>
          )}
          {deal.deliverables && (
            <DetailField label="Deliverables">
              <span className="whitespace-pre-wrap">{deal.deliverables}</span>
            </DetailField>
          )}
          {(deal.startDate || deal.endDate) && (
            <DetailField label="Timeline">
              {deal.startDate ? formatDate(deal.startDate) : '—'} → {deal.endDate ? formatDate(deal.endDate) : '—'}
            </DetailField>
          )}
          {deal.notes && (
            <DetailField label="Notes">
              <span className="whitespace-pre-wrap text-muted-foreground">{deal.notes}</span>
            </DetailField>
          )}
        </dl>
      </DetailSheet>

      {canContribute && (
        <ContributeForm
          hideTrigger
          open={contribOpen}
          onOpenChange={setContribOpen}
          verified={{
            dealId: deal.id,
            brandName: deal.brandName,
            amount: (deal.valueCents / 100).toString(),
            platform: contributeDefaults?.platform || undefined,
            subscriberTier: contributeDefaults?.subscriberTier || undefined,
            niche: contributeDefaults?.niche || undefined,
          }}
        />
      )}

      {canLogPayment && (
        <AddRevenueForm
          hideTrigger
          open={payOpen}
          onOpenChange={setPayOpen}
          currency={deal.currency ?? 'USD'}
          // Close the sheet on success so the refreshed board reflects the payment
          // (and the "Contribute this rate" action) next time it's opened.
          onSuccess={onClose}
          linkedDeal={{
            dealId: deal.id,
            brandName: deal.brandName,
            amount: (deal.valueCents / 100).toString(),
          }}
        />
      )}
    </>
  )
}
