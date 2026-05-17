import { Topbar } from '@/components/shared/topbar'
import { verifySession } from '@/lib/session'
import { db } from '@/lib/db'
import { computeForecast } from '@/lib/forecast'
import { ForecastChart } from '@/components/features/forecast/forecast-chart'
import { ForecastStats } from '@/components/features/forecast/forecast-stats'
import { ForecastSources } from '@/components/features/forecast/forecast-sources'
import { ForecastInsights } from '@/components/features/forecast/forecast-insights'

export default async function ForecastPage() {
  const session = await verifySession()

  const [user, revenues, expenses, invoices, deals] = await Promise.all([
    db.user.findUnique({ where: { id: session.userId }, select: { defaultCurrency: true } }),
    db.revenueEntry.findMany({ where: { userId: session.userId } }),
    db.expense.findMany({ where: { userId: session.userId } }),
    db.invoice.findMany({ where: { userId: session.userId } }),
    db.deal.findMany({ where: { userId: session.userId } }),
  ])
  const currency = user?.defaultCurrency ?? 'USD'

  const forecast = computeForecast({ revenues, expenses, invoices, deals })

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar
        title="Cash Flow Forecast"
        subtitle="Where your money is headed over the next 90 days"
      />
      <main className="flex-1 p-6 space-y-6">
        <ForecastStats forecast={forecast} currency={currency} />
        <ForecastChart days={forecast.days} currency={currency} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ForecastSources sources={forecast.inflowsBySource} totalInflows={forecast.totalInflows} currency={currency} />
          <ForecastInsights insights={forecast.insights} />
        </div>
      </main>
    </div>
  )
}
