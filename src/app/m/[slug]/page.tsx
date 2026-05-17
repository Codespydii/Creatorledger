import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { getOptionalSession } from '@/lib/session'
import { MediaKitView } from '@/components/features/media-kit/media-kit-view'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const mk = await db.mediaKit.findUnique({
    where: { slug },
    select: { displayName: true, tagline: true, isPublic: true },
  })
  if (!mk) return { title: 'Media Kit' }
  return {
    title: `${mk.displayName ?? 'Creator'} — Media Kit`,
    description: mk.tagline ?? undefined,
  }
}

export default async function PublicMediaKitPage({ params }: Props) {
  const { slug } = await params

  const mediaKit = await db.mediaKit.findUnique({
    where: { slug },
    include: {
      user: { select: { id: true, name: true, channelName: true, avatarUrl: true } },
    },
  })

  if (!mediaKit) notFound()

  if (!mediaKit.isPublic) {
    const session = await getOptionalSession()
    if (!session || session.userId !== mediaKit.userId) {
      notFound()
    }
  }

  return <MediaKitView mediaKit={mediaKit} />
}
