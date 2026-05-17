'use client'

import { useActionState } from 'react'
import { updateProfile } from '@/app/actions/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { CURRENCY_OPTIONS } from '@/lib/currencies'

interface Props {
  name: string
  channelName: string
  platform: string
  defaultCurrency: string
}

export function ProfileForm({ name, channelName, platform, defaultCurrency }: Props) {
  const [state, action, pending] = useActionState(updateProfile, undefined)

  return (
    <form action={action} className="space-y-4">
      {state && !state.success && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
          Profile updated successfully.
        </div>
      )}
      <Input id="name" name="name" label="Full Name" defaultValue={name} required />
      <Input
        id="channelName"
        name="channelName"
        label="Channel / Creator Name"
        defaultValue={channelName}
        placeholder="Your YouTube channel name"
      />
      <Input
        id="platform"
        name="platform"
        label="Primary Platform"
        defaultValue={platform}
        placeholder="YouTube, TikTok, Instagram…"
      />
      <div className="flex flex-col gap-1.5">
        <Select
          id="defaultCurrency"
          name="defaultCurrency"
          label="Display currency"
          options={CURRENCY_OPTIONS}
          defaultValue={defaultCurrency}
        />
        <p className="text-xs text-muted-foreground">Used everywhere amounts appear. You can change this anytime.</p>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Save Changes'}
      </Button>
    </form>
  )
}
