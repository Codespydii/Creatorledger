import { verifySession } from '@/lib/session'
import { Sidebar } from '@/components/shared/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await verifySession()

  return (
    <div className="flex h-screen bg-muted overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
