'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Select } from '@/components/ui/select'
import { NICHES, PLATFORMS, FORMATS, SUBSCRIBER_TIERS } from '@/lib/benchmarks-constants'

interface Props {
  initial: {
    niche?: string
    platform?: string
    format?: string
    subscriberTier?: string
  }
}

export function BenchmarkFilters({ initial }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    if (key === 'platform') {
      params.delete('format')
    }
    startTransition(() => {
      router.push(`/benchmarks?${params.toString()}`)
    })
  }

  const formatOptions = FORMATS
    .filter((f) => !initial.platform || f.platform === initial.platform)
    .map(({ value, label }) => ({ value, label }))

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Select
        id="niche"
        label="Niche"
        placeholder="All niches"
        options={NICHES.map((n) => ({ value: n.value, label: n.label }))}
        value={initial.niche ?? ''}
        onChange={(e) => update('niche', e.currentTarget.value)}
        disabled={pending}
      />
      <Select
        id="platform"
        label="Platform"
        placeholder="All platforms"
        options={PLATFORMS.map((p) => ({ value: p.value, label: p.label }))}
        value={initial.platform ?? ''}
        onChange={(e) => update('platform', e.currentTarget.value)}
        disabled={pending}
      />
      <Select
        id="format"
        label="Format"
        placeholder={initial.platform ? 'All formats' : 'Pick platform first'}
        options={formatOptions}
        value={initial.format ?? ''}
        onChange={(e) => update('format', e.currentTarget.value)}
        disabled={pending || !initial.platform}
      />
      <Select
        id="subscriberTier"
        label="Creator size"
        placeholder="All sizes"
        options={SUBSCRIBER_TIERS.map((t) => ({ value: t.value, label: t.label }))}
        value={initial.subscriberTier ?? ''}
        onChange={(e) => update('subscriberTier', e.currentTarget.value)}
        disabled={pending}
      />
    </div>
  )
}
