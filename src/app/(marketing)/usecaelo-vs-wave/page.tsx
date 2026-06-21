import type { Metadata } from 'next'
import { ComparisonView } from '@/components/marketing/comparison-view'
import { getComparison } from '@/components/marketing/compare-data'

const data = getComparison('usecaelo-vs-wave')!
const url = `/${data.slug}`

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
  alternates: { canonical: url },
  openGraph: { title: data.metaTitle, description: data.metaDescription, url, type: 'website' },
  twitter: { card: 'summary_large_image', title: data.metaTitle, description: data.metaDescription },
}

export default function Page() {
  return <ComparisonView data={data} />
}
