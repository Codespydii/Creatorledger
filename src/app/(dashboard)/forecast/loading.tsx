import { PageSkeleton } from '@/components/shared/page-skeleton'

export default function Loading() {
  return <PageSkeleton title="Cash Flow Forecast" subtitle="Where your money is headed over the next 90 days" rows={2} />
}
