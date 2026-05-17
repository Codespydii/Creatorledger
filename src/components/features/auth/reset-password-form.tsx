'use client'

import { useActionState } from 'react'
import { resetPassword } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  token: string
}

export function ResetPasswordForm({ token }: Props) {
  const [state, action, pending] = useActionState(resetPassword, undefined)

  return (
    <>
      {state && !state.success && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}
      <form action={action} className="space-y-4">
        <input type="hidden" name="token" value={token} />
        <Input
          id="password"
          name="password"
          type="password"
          label="New password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          required
          error={state?.success === false ? state.fieldErrors?.password?.[0] : undefined}
        />
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm password"
          placeholder="Type it again"
          autoComplete="new-password"
          required
          error={state?.success === false ? state.fieldErrors?.confirmPassword?.[0] : undefined}
        />
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Saving…' : 'Set new password'}
        </Button>
      </form>
    </>
  )
}
