'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { ExternalLink, Eye, EyeOff } from 'lucide-react'
import { saveMediaKit, togglePublish } from '@/app/actions/media-kit'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface Props {
  initial: {
    slug: string
    isPublic: boolean
    displayName: string
    tagline: string
    bio: string
    niche: string
    location: string
    subscriberCount: string
    avgViews: string
    totalViews: string
    engagementRate: string
    audienceAge: string
    audienceGender: string
    topCountries: string
    rateIntegrated: string
    rateDedicated: string
    rateShorts: string
    sampleWorkUrls: string
    socialLinks: string
    contactEmail: string
    accentColor: string
  }
  publicUrl: string | null
}

export function MediaKitForm({ initial, publicUrl }: Props) {
  const [state, action, pending] = useActionState(saveMediaKit, undefined)
  const [pubState, pubAction, pubPending] = useActionState(togglePublish, undefined)
  const [accentColor, setAccentColor] = useState(initial.accentColor || '#7c3aed')

  return (
    <div className="space-y-6">
      {publicUrl && (
        <Card>
          <CardContent className="p-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-sm font-medium text-foreground">
                {initial.isPublic ? 'Live at' : 'Preview at'}
              </span>
              <Link
                href={publicUrl}
                target="_blank"
                className="text-sm text-primary hover:underline flex items-center gap-1.5 truncate"
              >
                {publicUrl} <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </Link>
            </div>
            <form action={pubAction}>
              <input type="hidden" name="isPublic" value={initial.isPublic ? 'false' : 'true'} />
              <Button type="submit" variant={initial.isPublic ? 'outline' : 'default'} disabled={pubPending}>
                {initial.isPublic ? (
                  <><EyeOff className="h-4 w-4" /> Unpublish</>
                ) : (
                  <><Eye className="h-4 w-4" /> Publish</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <form action={action} className="space-y-6">
        {state && !state.success && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300">
            {state.error}
          </div>
        )}
        {state?.success && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300">
            Media kit saved.
          </div>
        )}
        {pubState && !pubState.success && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300">
            {pubState.error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Identity</CardTitle>
            <CardDescription>How brands recognize you at a glance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input id="slug" name="slug" label="Public URL slug" defaultValue={initial.slug} placeholder="your-name" />
              <Input id="displayName" name="displayName" label="Display Name" defaultValue={initial.displayName} placeholder="Your channel or creator name" />
            </div>
            <Input id="tagline" name="tagline" label="Tagline" defaultValue={initial.tagline} placeholder="Tech reviews for first-time builders" maxLength={140} />
            <Textarea id="bio" name="bio" label="Bio" defaultValue={initial.bio} placeholder="One paragraph about your channel, audience, and what you do best." rows={4} maxLength={1000} />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input id="niche" name="niche" label="Niche / Category" defaultValue={initial.niche} placeholder="Tech, Gaming, Beauty…" />
              <Input id="location" name="location" label="Location" defaultValue={initial.location} placeholder="Los Angeles, CA" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Channel Stats</CardTitle>
            <CardDescription>Pull these from YouTube Studio. Update monthly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Input id="subscriberCount" name="subscriberCount" label="Subscribers" type="number" min={0} defaultValue={initial.subscriberCount} placeholder="125000" />
              <Input id="avgViews" name="avgViews" label="Avg views / video" type="number" min={0} defaultValue={initial.avgViews} placeholder="45000" />
              <Input id="totalViews" name="totalViews" label="Total channel views" type="number" min={0} defaultValue={initial.totalViews} placeholder="12000000" />
              <Input id="engagementRate" name="engagementRate" label="Engagement %" type="number" min={0} max={100} step="0.1" defaultValue={initial.engagementRate} placeholder="8.4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audience</CardTitle>
            <CardDescription>Free text — describe your audience like you would in a pitch email.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input id="audienceAge" name="audienceAge" label="Age breakdown" defaultValue={initial.audienceAge} placeholder="60% age 18-34, 30% age 35-44" />
            <Input id="audienceGender" name="audienceGender" label="Gender breakdown" defaultValue={initial.audienceGender} placeholder="55% male, 43% female, 2% other" />
            <Input id="topCountries" name="topCountries" label="Top countries" defaultValue={initial.topCountries} placeholder="65% US, 12% UK, 8% Canada, 5% Australia" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rate Card</CardTitle>
            <CardDescription>Optional. Enter in dollars — shown to brands as USD.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Input id="rateIntegrated" name="rateIntegrated" label="Integrated mid-roll ($)" type="number" min={0} step="50" defaultValue={initial.rateIntegrated} placeholder="3500" />
              <Input id="rateDedicated" name="rateDedicated" label="Dedicated video ($)" type="number" min={0} step="100" defaultValue={initial.rateDedicated} placeholder="8000" />
              <Input id="rateShorts" name="rateShorts" label="YouTube Short ($)" type="number" min={0} step="50" defaultValue={initial.rateShorts} placeholder="1200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sample Work & Links</CardTitle>
            <CardDescription>One URL per line. Top 3 videos work best.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea id="sampleWorkUrls" name="sampleWorkUrls" label="Sample video URLs" defaultValue={initial.sampleWorkUrls} placeholder={'https://youtube.com/watch?v=abc123\nhttps://youtube.com/watch?v=def456'} rows={4} />
            <Textarea id="socialLinks" name="socialLinks" label="Social links" defaultValue={initial.socialLinks} placeholder={'YouTube: https://youtube.com/@you\nInstagram: https://instagram.com/you\nTikTok: https://tiktok.com/@you'} rows={4} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact & Style</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input id="contactEmail" name="contactEmail" label="Contact email" type="email" defaultValue={initial.contactEmail} placeholder="brands@yourchannel.com" />
            <div className="flex items-end gap-3">
              <Input id="accentColor" name="accentColor" label="Accent color" defaultValue={accentColor} placeholder="#7c3aed" onChange={(e) => setAccentColor(e.currentTarget.value)} className="font-mono" />
              <div className="h-10 w-10 rounded-lg border border-border shrink-0" style={{ backgroundColor: accentColor }} />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? 'Saving…' : 'Save Media Kit'}
          </Button>
          {publicUrl && (
            <Link href={publicUrl} target="_blank" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
              Preview <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </form>
    </div>
  )
}
