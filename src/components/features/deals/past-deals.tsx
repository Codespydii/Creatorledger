'use client'

import { useState } from 'react'
import { ChevronDown, Archive } from 'lucide-react'
import { DealDetailSheet, type DealDetail, type ContributeDefaults } from './deal-detail-sheet'
import { getStage } from './stages'
import { formatCurrency, formatDate, cn } from '@/lib/utils'

interface PastDeal extends DealDetail {
  closedAt: string | null
}

interface Props {
  deals: PastDeal[]
  total: number
  wonCount: number
  lostCount: number
  currency: string
  contributeDefaults?: ContributeDefaults
}

export function PastDeals({ deals, total, wonCount, lostCount, currency, contributeDefaults }: Props) {
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState<PastDeal | null>(null)

  if (total === 0) return null

  const decided = wonCount + lostCount
  const winRate = decided > 0 ? Math.round((wonCount / decided) * 100) : 0

  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Archive className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-sm font-semibold text-foreground">Past deals</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{total}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs text-muted-foreground">
            Win rate {winRate}% · {wonCount} won · {lostCount} lost
          </span>
          <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')} aria-hidden="true" />
        </div>
      </button>

      {open && (
        <div className="border-t border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-4 py-2 font-medium">Brand</th>
                <th className="px-4 py-2 font-medium">Outcome</th>
                <th className="px-4 py-2 font-medium text-right">Value</th>
                <th className="px-4 py-2 font-medium text-right pr-4">Closed</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((d) => {
                const st = getStage(d.stage)
                return (
                  <tr
                    key={d.id}
                    onClick={() => setDetail(d)}
                    className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 py-2.5 font-medium text-foreground">{d.brandName}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-foreground">{formatCurrency(d.valueCents, currency)}</td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground pr-4">{d.closedAt ? formatDate(d.closedAt) : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {total > deals.length && (
            <p className="px-4 py-2.5 text-xs text-muted-foreground">Showing the {deals.length} most recent of {total}.</p>
          )}
        </div>
      )}

      {detail && <DealDetailSheet deal={detail} currency={currency} onClose={() => setDetail(null)} contributeDefaults={contributeDefaults} />}
    </div>
  )
}
