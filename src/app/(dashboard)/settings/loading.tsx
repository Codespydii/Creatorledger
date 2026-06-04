import { PageSkeleton } from '@/components/shared/page-skeleton'

export default function Loading() {
  return <PageSkeleton title="Settings" subtitle="Manage your account preferences" rows={4} />
}
