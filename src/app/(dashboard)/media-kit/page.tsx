import { headers } from 'next/headers'
import { Topbar } from '@/components/shared/topbar'
import { MediaKitForm } from '@/components/features/media-kit/media-kit-form'
import { verifySession } from '@/lib/session'
import { db } from '@/lib/db'

function centsToDollars(cents: number | null | undefined): string {
  if (cents == null) return ''
  return (cents / 100).toString()
}

function numToStr(n: number | bigint | null | undefined): string {
  return n == null ? '' : String(n)
}

export default async function MediaKitPage() {
  const session = await verifySession()

  const [user, mediaKit] = await Promise.all([
    db.user.findUnique({
      where: { id: session.userId },
      select: { name: true, channelName: true, email: true },
    }),
    db.mediaKit.findUnique({ where: { userId: session.userId } }),
  ])

  const defaultSlug = (user?.channelName || user?.name || session.email.split('@')[0])
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'creator'

  const hdrs = await headers()
  const host = hdrs.get('host') ?? 'localhost:3000'
  const proto = hdrs.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  const slug = mediaKit?.slug ?? defaultSlug
  const publicUrl = mediaKit ? `${proto}://${host}/m/${slug}` : null

  const initial = {
    slug,
    isPublic: mediaKit?.isPublic ?? false,
    displayName: mediaKit?.displayName ?? user?.channelName ?? user?.name ?? '',
    tagline: mediaKit?.tagline ?? '',
    bio: mediaKit?.bio ?? '',
    niche: mediaKit?.niche ?? '',
    location: mediaKit?.location ?? '',
    subscriberCount: numToStr(mediaKit?.subscriberCount),
    avgViews: numToStr(mediaKit?.avgViews),
    totalViews: numToStr(mediaKit?.totalViews),
    engagementRate: mediaKit?.engagementRate != null ? String(mediaKit.engagementRate) : '',
    audienceAge: mediaKit?.audienceAge ?? '',
    audienceGender: mediaKit?.audienceGender ?? '',
    topCountries: mediaKit?.topCountries ?? '',
    rateIntegrated: centsToDollars(mediaKit?.rateIntegratedCents),
    rateDedicated: centsToDollars(mediaKit?.rateDedicatedCents),
    rateShorts: centsToDollars(mediaKit?.rateShortsCents),
    sampleWorkUrls: mediaKit?.sampleWorkUrls ?? '',
    socialLinks: mediaKit?.socialLinks ?? '',
    contactEmail: mediaKit?.contactEmail ?? user?.email ?? '',
    accentColor: mediaKit?.accentColor ?? '#7c3aed',
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="Media Kit" subtitle="A professional pitch page brands can view and download" />
      <main className="flex-1 p-4 sm:p-6 max-w-4xl">
        <MediaKitForm initial={initial} publicUrl={publicUrl} />
      </main>
    </div>
  )
}
