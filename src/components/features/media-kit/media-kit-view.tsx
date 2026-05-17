import { Mail, MapPin, Users, Eye, TrendingUp, BarChart3 } from 'lucide-react'
import { PrintButton } from './print-button'
import type { MediaKit, User } from '@/generated/prisma/models'

type MediaKitWithUser = MediaKit & {
  user: Pick<User, 'id' | 'name' | 'channelName' | 'avatarUrl'>
}

function formatNumber(n: number | bigint | null | undefined): string | null {
  if (n == null) return null
  const num = typeof n === 'bigint' ? Number(n) : n
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(num >= 10_000_000_000 ? 0 : 1)}B`
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(num >= 10_000_000 ? 0 : 1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(num >= 10_000 ? 0 : 1)}K`
  return String(num)
}

function formatRate(cents: number | null | undefined): string | null {
  if (cents == null) return null
  const dollars = cents / 100
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(dollars)
}

function parseLines(s: string | null | undefined): string[] {
  if (!s) return []
  return s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
}

function parseSocialLines(s: string | null | undefined): { label: string; url: string }[] {
  if (!s) return []
  return parseLines(s).map((line) => {
    const m = line.match(/^([^:]+):\s*(https?:\/\/.+)$/i)
    if (m) return { label: m[1].trim(), url: m[2].trim() }
    return { label: 'Link', url: line }
  }).filter((l) => /^https?:\/\//i.test(l.url))
}

function youtubeEmbed(url: string): string | null {
  try {
    const u = new URL(url)
    let id: string | null = null
    if (u.hostname.includes('youtu.be')) {
      id = u.pathname.slice(1)
    } else if (u.hostname.includes('youtube.com')) {
      id = u.searchParams.get('v')
      if (!id && u.pathname.startsWith('/shorts/')) {
        id = u.pathname.slice('/shorts/'.length)
      }
    }
    if (!id) return null
    return `https://www.youtube.com/embed/${id}`
  } catch {
    return null
  }
}

interface Props {
  mediaKit: MediaKitWithUser
}

export function MediaKitView({ mediaKit }: Props) {
  const accent = mediaKit.accentColor || '#7c3aed'
  const displayName = mediaKit.displayName || mediaKit.user.channelName || mediaKit.user.name

  const stats = [
    { label: 'Subscribers', value: formatNumber(mediaKit.subscriberCount), icon: Users },
    { label: 'Avg views', value: formatNumber(mediaKit.avgViews), icon: Eye },
    { label: 'Total views', value: formatNumber(mediaKit.totalViews), icon: BarChart3 },
    {
      label: 'Engagement',
      value: mediaKit.engagementRate != null ? `${mediaKit.engagementRate.toFixed(1)}%` : null,
      icon: TrendingUp,
    },
  ].filter((s) => s.value != null)

  const rates = [
    { label: 'Integrated mid-roll', value: formatRate(mediaKit.rateIntegratedCents) },
    { label: 'Dedicated video', value: formatRate(mediaKit.rateDedicatedCents) },
    { label: 'YouTube Short', value: formatRate(mediaKit.rateShortsCents) },
  ].filter((r) => r.value != null)

  const sampleUrls = parseLines(mediaKit.sampleWorkUrls).slice(0, 3)
  const socials = parseSocialLines(mediaKit.socialLinks)

  return (
    <>
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white !important; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
        }
      `}</style>

      <div className="min-h-screen bg-slate-50">
        <div className="no-print sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
            <span className="text-sm text-slate-500">Media Kit</span>
            <PrintButton />
          </div>
        </div>

        <article className="mx-auto max-w-4xl bg-white shadow-sm print:shadow-none">
          {/* Hero */}
          <header
            className="px-10 py-12 text-white"
            style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}dd 100%)` }}
          >
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="min-w-0">
                <h1 className="text-4xl font-bold tracking-tight">{displayName}</h1>
                {mediaKit.tagline && (
                  <p className="mt-3 text-lg text-white/90 max-w-2xl">{mediaKit.tagline}</p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/80">
                  {mediaKit.niche && <span>{mediaKit.niche}</span>}
                  {mediaKit.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {mediaKit.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Stats */}
          {stats.length > 0 && (
            <section className="grid grid-cols-2 gap-px bg-slate-200 md:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="bg-white p-6">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500">
                      <Icon className="h-3.5 w-3.5" />
                      {stat.label}
                    </div>
                    <div className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</div>
                  </div>
                )
              })}
            </section>
          )}

          <div className="px-10 py-10 space-y-10">
            {/* Bio */}
            {mediaKit.bio && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">About</h2>
                <p className="mt-3 text-base leading-relaxed text-slate-700 whitespace-pre-line">{mediaKit.bio}</p>
              </section>
            )}

            {/* Audience */}
            {(mediaKit.audienceAge || mediaKit.audienceGender || mediaKit.topCountries) && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Audience</h2>
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {mediaKit.audienceAge && (
                    <div className="rounded-xl border border-slate-200 p-4">
                      <div className="text-xs font-medium text-slate-500">Age</div>
                      <div className="mt-1 text-sm text-slate-800">{mediaKit.audienceAge}</div>
                    </div>
                  )}
                  {mediaKit.audienceGender && (
                    <div className="rounded-xl border border-slate-200 p-4">
                      <div className="text-xs font-medium text-slate-500">Gender</div>
                      <div className="mt-1 text-sm text-slate-800">{mediaKit.audienceGender}</div>
                    </div>
                  )}
                  {mediaKit.topCountries && (
                    <div className="rounded-xl border border-slate-200 p-4">
                      <div className="text-xs font-medium text-slate-500">Top countries</div>
                      <div className="mt-1 text-sm text-slate-800">{mediaKit.topCountries}</div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Rate card */}
            {rates.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Rate Card</h2>
                <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                  {rates.map((rate, i) => (
                    <div
                      key={rate.label}
                      className={`flex items-center justify-between p-4 ${i > 0 ? 'border-t border-slate-200' : ''}`}
                    >
                      <span className="text-sm font-medium text-slate-700">{rate.label}</span>
                      <span className="text-base font-semibold" style={{ color: accent }}>{rate.value}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-500">All rates in USD. Packages and exclusivity priced separately.</p>
              </section>
            )}

            {/* Sample work */}
            {sampleUrls.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sample Work</h2>
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {sampleUrls.map((url) => {
                    const embed = youtubeEmbed(url)
                    return (
                      <div key={url} className="overflow-hidden rounded-xl border border-slate-200">
                        {embed ? (
                          <div className="aspect-video bg-slate-100">
                            <iframe
                              src={embed}
                              className="h-full w-full"
                              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              loading="lazy"
                              title="Sample video"
                            />
                          </div>
                        ) : (
                          <div className="aspect-video bg-slate-100 flex items-center justify-center text-xs text-slate-500 p-2 text-center break-all">
                            {url}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Contact */}
            <section
              className="rounded-2xl p-6"
              style={{ backgroundColor: `${accent}10`, border: `1px solid ${accent}30` }}
            >
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Get in touch</h2>
              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
                {mediaKit.contactEmail && (
                  <a
                    href={`mailto:${mediaKit.contactEmail}`}
                    className="inline-flex items-center gap-2 text-base font-semibold"
                    style={{ color: accent }}
                  >
                    <Mail className="h-4 w-4" />
                    {mediaKit.contactEmail}
                  </a>
                )}
                {socials.map((s) => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-sm text-slate-700 hover:text-slate-900"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </section>
          </div>

          <footer className="border-t border-slate-200 px-10 py-5 text-xs text-slate-400 flex items-center justify-between flex-wrap gap-2">
            <span>Updated {mediaKit.updatedAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            <span>Powered by Creator Ledger</span>
          </footer>
        </article>
      </div>
    </>
  )
}
