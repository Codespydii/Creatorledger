import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { Topbar } from '@/components/shared/topbar'
import { ContractAnalysisView } from '@/components/features/contracts/contract-analysis-view'
import { verifySession } from '@/lib/session'
import { db } from '@/lib/db'
import { ContractAnalysisSchema } from '@/lib/contract-analyzer'
import { deleteContractAction } from '@/app/actions/contracts'
import { formatDate } from '@/lib/utils'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ContractDetailPage({ params }: Props) {
  const { id } = await params
  const session = await verifySession()

  const contract = await db.contract.findUnique({ where: { id } })
  if (!contract || contract.userId !== session.userId) notFound()

  const parsed = ContractAnalysisSchema.safeParse(JSON.parse(contract.analysisJson))
  if (!parsed.success) {
    return (
      <div className="flex flex-col flex-1 overflow-auto">
        <Topbar title={contract.title} subtitle="Stored analysis is malformed" />
        <main className="flex-1 p-6 max-w-4xl">
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t read this analysis. Try re-uploading the contract.
          </p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar
        title={contract.title}
        subtitle={`${contract.brandName ? contract.brandName + ' · ' : ''}Analyzed ${formatDate(contract.createdAt.toISOString())}`}
      />
      <main className="flex-1 p-6 max-w-4xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link href="/contracts" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to contracts
          </Link>
          <form action={deleteContractAction}>
            <input type="hidden" name="id" value={contract.id} />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </form>
        </div>
        <ContractAnalysisView analysis={parsed.data} />
      </main>
    </div>
  )
}
