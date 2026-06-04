'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { MoreHorizontal, Send, Share2, Link2, Download, Loader2 } from 'lucide-react'
import { SendInvoiceButton } from './send-invoice-button'
import { generatePayLink } from '@/app/actions/stripe-actions'
import { cn } from '@/lib/utils'

interface Props {
  invoice: {
    id: string
    invoiceNumber: string
    clientName: string
    clientEmail: string
    dueDate: string
    status: string
    publicId: string | null
    paymentLinkUrl: string | null
    notes: string | null
    taxPercent: number
    items: { description: string; quantity: number; unitPrice: string }[]
  }
}

const itemClass = 'flex w-full items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors text-left disabled:opacity-60'
const iconClass = 'h-4 w-4 shrink-0 text-muted-foreground'

export function InvoiceActionsMenu({ invoice }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const payEligible = invoice.status !== 'draft' && invoice.status !== 'cancelled'

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label={`Actions for invoice ${invoice.invoiceNumber}`}
        title="More actions"
        className={cn(
          'inline-flex items-center justify-center rounded-full border border-border p-1.5 text-muted-foreground hover:border-violet-300 hover:text-violet-600 transition-colors',
          menuOpen && 'border-violet-300 text-violet-600',
        )}
      >
        <MoreHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      {menuOpen && (
        <div
          role="menu"
          className="absolute right-0 top-9 z-50 w-52 overflow-hidden rounded-xl border border-border bg-card shadow-lg animate-in fade-in zoom-in-95 duration-100"
        >
          <button type="button" role="menuitem" className={itemClass} onClick={() => { setMenuOpen(false); setSendOpen(true) }}>
            <Send className={iconClass} aria-hidden="true" /> Send to client
          </button>
          {invoice.publicId && <ShareItem publicId={invoice.publicId} onDone={() => setMenuOpen(false)} />}
          {payEligible && <PayItem invoiceId={invoice.id} existingUrl={invoice.paymentLinkUrl} onClose={() => setMenuOpen(false)} />}
          <a
            role="menuitem"
            href={`/api/invoices/${invoice.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className={itemClass}
            onClick={() => setMenuOpen(false)}
          >
            <Download className={iconClass} aria-hidden="true" /> Download PDF
          </a>
        </div>
      )}

      {/* Controlled Send modal — sibling of the menu so it stays mounted when it closes */}
      <SendInvoiceButton
        invoiceId={invoice.id}
        invoiceNumber={invoice.invoiceNumber}
        clientName={invoice.clientName}
        clientEmail={invoice.clientEmail}
        hideTrigger
        open={sendOpen}
        onOpenChange={setSendOpen}
      />
    </div>
  )
}

function ShareItem({ publicId, onDone }: { publicId: string; onDone: () => void }) {
  const handle = async () => {
    const url = `${window.location.origin}/i/${publicId}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Share link copied')
    } catch {
      window.prompt('Copy this link to share with the client:', url)
    }
    onDone()
  }
  return (
    <button type="button" role="menuitem" className={itemClass} onClick={handle}>
      <Share2 className={iconClass} aria-hidden="true" /> Copy share link
    </button>
  )
}

function PayItem({ invoiceId, existingUrl, onClose }: { invoiceId: string; existingUrl: string | null; onClose: () => void }) {
  const [pending, startTransition] = useTransition()

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Payment link copied')
    } catch {
      window.prompt('Copy this payment link:', url)
    }
  }

  const handle = () => {
    if (existingUrl) {
      copy(existingUrl)
      onClose()
      return
    }
    startTransition(async () => {
      const result = await generatePayLink(invoiceId)
      if (result.error) toast.error(result.error)
      else if (result.url) await copy(result.url)
      onClose()
    })
  }

  return (
    <button type="button" role="menuitem" className={itemClass} onClick={handle} disabled={pending}>
      {pending ? <Loader2 className={cn(iconClass, 'animate-spin')} aria-hidden="true" /> : <Link2 className={iconClass} aria-hidden="true" />}
      {existingUrl ? 'Copy pay link' : 'Generate pay link'}
    </button>
  )
}
