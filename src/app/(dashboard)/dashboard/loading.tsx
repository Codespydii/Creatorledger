import { PageSkeleton } from '@/components/shared/page-skeleton'

export default function Loading() {
  return <PageSkeleton title="Dashboard" subtitle="Your creator business at a glance" rows={3} />
}
