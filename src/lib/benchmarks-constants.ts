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
