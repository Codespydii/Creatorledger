'use client'

import { useState, useActionState, useEffect } from 'react'
import { Send, X, Check, Loader2 } from 'lucide-react'
import { sendInvoiceEmail } from '@/app/actions/invoices'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useEscapeKey } from '@/hooks/use-escape-key'

interface Props {
  invoiceId: string
  invoiceNumber: string
  clientName: string
  clientEmail: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  hideTrigger?: boolean
}

export function SendInvoiceButton({ invoiceId, invoiceNumber, clientName, clientEmail, open: controlledOpen, onOpenChange, hideTrigger = false }: Props) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  const [state, action, pending] = useActionState(sendInvoiceEmail, undefined)
  useEscapeKey(() => setOpen(false), open)

  useEffect(() => {
    if (state?.success) {
      const t = setTimeout(() => setOpen(false), 1500)
      return () => clearTimeout(t)
    }
  }, [state])

  return (
    <>
      {!hideTrigger && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          title="Send invoice to client by email"
          className="inline-flex items-center justify-center rounded-full border border-border p-1.5 text-muted-foreground hover:border-violet-300 hover:text-violet-600 transition-colors"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      )}

      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby="send-inv-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-lg p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 id="send-inv-title" className="text-lg font-semibold text-foreground">Send invoice {invoiceNumber}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sends an HTML email with the PDF attached and a public view link.
                </p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close dialog" className="text-muted-foreground hover:text-foreground shrink-0 ml-2">
                <X className="h-5 w-5" />
              </button>
            </div>

            {state?.success ? (
              <div className="flex items-start gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300">
                <Check className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Sent to <strong>{clientName}</strong>. Invoice marked as &ldquo;sent.&rdquo;</span>
              </div>
            ) : (
              <form action={action} className="space-y-4">
                <input type="hidden" name="invoiceId" value={invoiceId} />
                {state && !state.success && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300">
                    {state.error}
                  </div>
                )}
                <Input
                  id="toEmail"
                  name="toEmail"
                  type="email"
                  label="Send to"
                  defaultValue={clientEmail}
                  placeholder={clientEmail || 'client@example.com'}
                  required
                />
                <Textarea
                  id="message"
                  name="message"
                  label="Personal message (optional)"
                  placeholder="Hi Mara, attaching the invoice for the Q3 video. Net 30 — let me know if you need a different format."
                  rows={5}
                />
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={pending}>
                    {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <><Send className="h-4 w-4" /> Send invoice</>}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
