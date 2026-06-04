'use client'

import { useState, useEffect, useActionState } from 'react'
import { toast } from 'sonner'
import { Mail, Loader2, Sparkles, X, ArrowLeft } from 'lucide-react'
import { createDeal } from '@/app/actions/deals'
import { extractDealFromEmailAction } from '@/app/actions/email-deals'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useEscapeKey } from '@/hooks/use-escape-key'
import type { DealExtraction } from '@/lib/deal-extractor'

const stageOptions = [
  { value: 'prospect', label: 'Prospect' },
  { value: 'outreach', label: 'Outreach' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'contracted', label: 'Contracted' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
]

interface Props {
  geminiConfigured: boolean
}

export function ScanEmailForm({ geminiConfigured }: Props) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState<string | null>(null)
  const [extracted, setExtracted] = useState<DealExtraction | null>(null)
  const [confidence, setConfidence] = useState<'high' | 'medium' | 'low' | null>(null)

  const [saveState, saveAction, saving] = useActionState(createDeal, undefined)

  useEffect(() => {
    if (saveState?.success) {
      toast.success('Deal saved')
      reset()
    } else if (saveState && !saveState.success && saveState.error) {
      toast.error(saveState.error)
    }
  }, [saveState])

  const reset = () => {
    setOpen(false)
    setText('')
    setExtracted(null)
    setExtractError(null)
    setConfidence(null)
  }

  const handleExtract = async () => {
    setExtracting(true)
    setExtractError(null)
    const result = await extractDealFromEmailAction(text)
    setExtracting(false)
    if (!result.success) {
      setExtractError(result.error)
      return
    }
    setExtracted(result.data)
    setConfidence(result.data.confidence)
  }

  const handleBack = () => {
    setExtracted(null)
    setExtractError(null)
  }

  useEscapeKey(reset, open)

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Mail className="h-4 w-4" />
        Scan email
      </Button>

      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby="scan-email-title" className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 overflow-y-auto py-8">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-lg p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 id="scan-email-title" className="text-lg font-semibold text-foreground">
                {extracted ? 'Review extracted deal' : 'Scan sponsorship email'}
              </h2>
              <button onClick={reset} aria-label="Close dialog" className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {!geminiConfigured && (
              <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-200">
                AI is not configured. Add <code className="font-mono text-xs">GEMINI_API_KEY</code> to <code className="font-mono text-xs">.env.local</code>.
              </div>
            )}

            {!extracted ? (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Paste the sponsorship email below. The AI will extract the brand, deliverables, value, and timing — you review before saving.
                </p>

                {extractError && (
                  <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300">
                    {extractError}
                  </div>
                )}

                <Textarea
                  id="emailText"
                  value={text}
                  onChange={(e) => setText(e.currentTarget.value)}
                  placeholder="Paste the full email content here — including subject and signature for best results…"
                  rows={12}
                  className="text-sm"
                />

                <div className="flex items-center gap-3 mt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={reset}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="flex-1"
                    onClick={handleExtract}
                    disabled={extracting || !geminiConfigured || text.trim().length < 30}
                  >
                    {extracting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Extracting…</>
                    ) : (
                      <><Sparkles className="h-4 w-4" /> Extract deal</>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <>
                {confidence && (
                  <div className={`mb-4 rounded-lg border px-3 py-2 text-xs flex items-start gap-2 ${
                    confidence === 'high'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300'
                      : confidence === 'medium'
                      ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-300'
                      : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-300'
                  }`}>
                    <Sparkles className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>
                      {confidence === 'high' && 'High confidence — fields should look right.'}
                      {confidence === 'medium' && 'Medium confidence — double-check the details.'}
                      {confidence === 'low' && 'Low confidence — please verify and edit every field.'}
                    </span>
                  </div>
                )}

                {saveState && !saveState.success && (
                  <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300">
                    {saveState.error}
                  </div>
                )}

                <form action={saveAction} className="space-y-4">
                  <Input
                    id="brandName"
                    name="brandName"
                    label="Brand Name"
                    defaultValue={extracted.brandName}
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      id="contactName"
                      name="contactName"
                      label="Contact Name"
                      defaultValue={extracted.contactName ?? ''}
                    />
                    <Input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      label="Contact Email"
                      defaultValue={extracted.contactEmail ?? ''}
                    />
                  </div>
                  <Select
                    id="stage"
                    name="stage"
                    label="Stage"
                    options={stageOptions}
                    placeholder="Select stage"
                    defaultValue={extracted.stage}
                    required
                  />
                  <Input
                    id="value"
                    name="value"
                    type="number"
                    step="0.01"
                    min="0"
                    label="Deal Value (USD)"
                    defaultValue={extracted.value != null ? extracted.value.toFixed(2) : '0'}
                    required
                  />
                  <Textarea
                    id="deliverables"
                    name="deliverables"
                    label="Deliverables"
                    defaultValue={extracted.deliverables ?? ''}
                    rows={2}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      label="Start Date"
                      defaultValue={extracted.startDate ?? ''}
                    />
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      label="End Date"
                      defaultValue={extracted.endDate ?? ''}
                    />
                  </div>
                  <Textarea
                    id="notes"
                    name="notes"
                    label="Notes"
                    defaultValue={extracted.notes ?? ''}
                    rows={3}
                  />
                  <div className="flex items-center gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={handleBack}>
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={saving}>
                      {saving ? 'Saving…' : 'Save deal'}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
