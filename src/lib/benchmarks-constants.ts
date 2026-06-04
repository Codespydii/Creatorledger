export const NICHES = [
  { value: 'tech', label: 'Tech' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'finance', label: 'Finance' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'food', label: 'Food' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'education', label: 'Education' },
  { value: 'business', label: 'Business' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'music', label: 'Music' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'travel', label: 'Travel' },
  { value: 'sports', label: 'Sports' },
  { value: 'news', label: 'News' },
  { value: 'other', label: 'Other' },
] as const

export const PLATFORMS = [
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'podcast', label: 'Podcast' },
] as const

export const FORMATS = [
  { value: 'integrated', label: 'Integrated mid-roll', platform: 'youtube' },
  { value: 'dedicated', label: 'Dedicated video', platform: 'youtube' },
  { value: 'shorts', label: 'YouTube Short', platform: 'youtube' },
  { value: 'post', label: 'Static post', platform: 'instagram' },
  { value: 'reel', label: 'Reel', platform: 'instagram' },
  { value: 'story', label: 'Story (3-frame)', platform: 'instagram' },
  { value: 'organic', label: 'Organic video', platform: 'tiktok' },
  { value: 'host_read', label: 'Host-read ad', platform: 'podcast' },
] as const

export const SUBSCRIBER_TIERS = [
  { value: 'micro', label: '0 – 10K', min: 0, max: 10_000, midpoint: 5_000 },
  { value: 'small', label: '10K – 50K', min: 10_000, max: 50_000, midpoint: 25_000 },
  { value: 'mid', label: '50K – 100K', min: 50_000, max: 100_000, midpoint: 75_000 },
  { value: 'large', label: '100K – 500K', min: 100_000, max: 500_000, midpoint: 250_000 },
  { value: 'macro', label: '500K – 1M', min: 500_000, max: 1_000_000, midpoint: 750_000 },
  { value: 'mega', label: '1M+', min: 1_000_000, max: 10_000_000, midpoint: 2_000_000 },
] as const

export function tierForSubscribers(n: number): string {
  for (const t of SUBSCRIBER_TIERS) {
    if (n < t.max) return t.value
  }
  return 'mega'
}

export function niceLabel(value: string, list: readonly { value: string; label: string }[]): string {
  return list.find((x) => x.value === value)?.label ?? value
}

/**
 * Best-guess map from an onboarding `primaryPlatform` to a benchmark platform.
 * Returns '' when there's no clean equivalent (twitch/substack/twitter/multi/other)
 * so the contribute form leaves it blank for the creator to pick.
 */
export function mapProfilePlatform(p?: string | null): string {
  switch (p) {
    case 'youtube': return 'youtube'
    case 'instagram': return 'instagram'
    case 'tiktok': return 'tiktok'
    case 'podcasts': return 'podcast'
    default: return ''
  }
}

/**
 * Best-guess map from an onboarding `audienceTier` to a benchmark subscriber tier.
 * Onboarding tiers are coarser, so the two straddling buckets return '' (ask).
 */
export function mapProfileTier(t?: string | null): string {
  switch (t) {
    case 'just_starting':
    case 'under_10k': return 'micro' // 0–10K
    case '1m_plus': return 'mega'    // 1M+
    case '10k_to_100k':              // straddles small + mid
    case '100k_to_1m':               // straddles large + macro
    default: return ''
  }
}

/** Only pass a stored niche through if it's still a valid benchmark niche. */
export function validNicheOrEmpty(n?: string | null): string {
  return n && NICHES.some((x) => x.value === n) ? n : ''
}
