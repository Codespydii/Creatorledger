'use client'

import { useActionState, useEffect, useRef } from 'react'
import { changePassword } from '@/app/actions/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) formRef.current?.reset()
  }, [state])

  return (
    <form ref={formRef} action={action} className="space-y-4">
      {state && !state.success && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
          Password changed successfully.
        </div>
      )}
      <Input
        id="currentPassword"
        name="currentPassword"
        type="password"
        label="Current Password"
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          label="New Password"
          placeholder="Min. 8 characters"
          required
        />
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
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
