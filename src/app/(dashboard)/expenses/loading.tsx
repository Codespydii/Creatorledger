import { PageSkeleton } from '@/components/shared/page-skeleton'

export default function Loading() {
  return <PageSkeleton title="Expenses" subtitle="Track and categorize your spending" rows={2} />
}
