import { Topbar } from '@/components/shared/topbar'
import { ContractUploadForm } from '@/components/features/contracts/contract-upload-form'
import { ContractList } from '@/components/features/contracts/contract-list'
import { verifySession } from '@/lib/session'
import { db } from '@/lib/db'
import { isGeminiConfigured } from '@/lib/gemini'

export default async function ContractsPage() {
  const session = await verifySession()

  const contracts = await db.contract.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, brandName: true, overallScore: true, createdAt: true },
    take: 50,
  })

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="Contract Analyzer" subtitle="Spot risky terms before you sign" />
      <main className="flex-1 p-4 sm:p-6 space-y-6 max-w-4xl">
        <div data-tour="contracts">
          <ContractUploadForm geminiConfigured={isGeminiConfigured()} />
        </div>
        <ContractList contracts={contracts} />
      </main>
    </div>
  )
}
