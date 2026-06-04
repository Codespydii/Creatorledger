'use client'

import { useActionState } from 'react'
import { updateProfile } from '@/app/actions/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { CURRENCY_OPTIONS } from '@/lib/currencies'
import { NICHES } from '@/lib/benchmarks-constants'

interface Props {
  name: string
  channelName: string
  platform: string
  defaultCurrency: string
  niche: string
  businessAddress: string
  ein: string
  website: string
}

export function ProfileForm({ name, channelName, platform, defaultCurrency, niche, businessAddress, ein, website }: Props) {
  const [state, action, pending] = useActionState(updateProfile, undefined)

  return (
    <form action={action} className="space-y-4">
      {state && !state.success && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300">
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
      <div className="flex flex-col gap-1.5">
        <Select
          id="niche"
          name="niche"
          label="Content niche"
          placeholder="Not set"
          options={NICHES.map((n) => ({ value: n.value, label: n.label }))}
          defaultValue={niche}
        />
        <p className="text-xs text-muted-foreground">Used to pre-fill rate-benchmark contributions and tailor comparisons.</p>
      </div>

      <div className="border-t border-border pt-4 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Invoice details</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Shown in the &ldquo;From&rdquo; block on every invoice PDF you send.</p>
        </div>
        <Input
          id="businessAddress"
          name="businessAddress"
          label="Business address"
          defaultValue={businessAddress}
          placeholder="123 Main St, City, State ZIP"
        />
        <Input
          id="ein"
          name="ein"
          label="EIN / Tax ID"
          defaultValue={ein}
          placeholder="88-1234567"
        />
        <Input
          id="website"
          name="website"
          label="Website"
          defaultValue={website}
          placeholder="yourdomain.com"
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Save Changes'}
      </Button>
    </form>
  )
}
