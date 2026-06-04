import { PageSkeleton } from '@/components/shared/page-skeleton'

export default function Loading() {
  return <PageSkeleton title="Contract Analysis" subtitle="Loading the analysis…" rows={3} />
}
