import type { Metadata } from 'next'
import { verifySession } from '@/lib/session'
import { computeReport, isReportPeriod, type ReportPeriod } from '@/lib/reports'
import { ReportDocument } from '@/components/features/reports/report-document'

export const metadata: Metadata = { title: 'Financial Report — Caelo' }

interface Props {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>
}

export default async function ReportPdfPage({ searchParams }: Props) {
  const { period: rawPeriod, from, to } = await searchParams
  const period: ReportPeriod = isReportPeriod(rawPeriod) ? rawPeriod : 'year'

  const session = await verifySession()
  const data = await computeReport(session.userId, period, from, to)

  return <ReportDocument data={data} />
}
