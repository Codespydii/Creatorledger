'use client'

import { useState, useTransition } from 'react'
import { deleteAccount } from '@/app/actions/settings'
import { Button } from '@/components/ui/button'
import { useEscapeKey } from '@/hooks/use-escape-key'

export function DeleteAccount() {
  const [open, setOpen] = useState(false)
  const [confirmed, setConfirmed] = useState('')
  const [isPending, startTransition] = useTransition()

  const close = () => { setOpen(false); setConfirmed('') }
  useEscapeKey(close, open && !isPending)

  const handle = () => {
    startTransition(async () => {
      await deleteAccount()
    })
  }

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        Delete Account
      </Button>

      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby="delete-account-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-card border border-border shadow-xl p-6 space-y-4">
            <h3 id="delete-account-title" className="text-base font-semibold text-foreground">Delete your account?</h3>
            <p className="text-sm text-muted-foreground">
              This will permanently delete your account, all invoices, revenue, expenses, and deals.
              <strong className="text-foreground"> This cannot be undone.</strong>
            </p>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Type <span className="font-mono font-semibold text-foreground">delete my account</span> to confirm
              </p>
              <input
                value={confirmed}
                onChange={(e) => setConfirmed(e.target.value)}
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="delete my account"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setOpen(false); setConfirmed('') }}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handle}
                disabled={confirmed !== 'delete my account' || isPending}
              >
                {isPending ? 'Deleting…' : 'Yes, delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
