'use client'

import { useActionState, useEffect, useRef } from 'react'
import { changePassword } from '@/app/actions/settings'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) formRef.current?.reset()
  }, [state])

  return (
    <form ref={formRef} action={action} className="space-y-4">
      {state && !state.success && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300">
          Password changed successfully.
        </div>
      )}
      <PasswordInput
        id="currentPassword"
        name="currentPassword"
        label="Current Password"
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <PasswordInput
          id="newPassword"
          name="newPassword"
          label="New Password"
          placeholder="Min. 10 characters, with a letter & number"
          required
        />
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm New Password"
          required
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? 'Updating…' : 'Update Password'}
      </Button>
    </form>
  )
}
