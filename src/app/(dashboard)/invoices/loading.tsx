import { PageSkeleton } from '@/components/shared/page-skeleton'

export default function Loading() {
  return <PageSkeleton title="Invoices" subtitle="Create and manage client invoices" rows={2} />
}
