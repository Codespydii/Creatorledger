import { Topbar } from '@/components/shared/topbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AddExpenseForm } from '@/components/features/expenses/add-expense-form'
import { ExpenseTable } from '@/components/features/expenses/expense-table'
import { CsvImporter } from '@/components/features/shared/csv-importer'
import { ExportExpensesButton } from '@/components/features/expenses/export-expenses-button'
import { EmptyState } from '@/components/shared/empty-state'
import { verifySession } from '@/lib/session'
import { db } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import { Receipt } from 'lucide-react'

const categoryLabels: Record<string, string> = {
  equipment: 'Equipment',
  software: 'Software',
  travel: 'Travel',
  marketing: 'Marketing',
  contractor: 'Contractor',
  office: 'Office',
  taxes: 'Taxes',
  other: 'Other',
}

export default async function ExpensesPage() {
  const session = await verifySession()

  const [user, expenses] = await Promise.all([
    db.user.findUnique({ where: { id: session.userId }, select: { defaultCurrency: true } }),
    db.expense.findMany({
      where: { userId: session.userId },
      orderBy: { date: 'desc' },
    }),
  ])
  const currency = user?.defaultCurrency ?? 'USD'

  const totalCents = expenses.reduce((s, e) => s + e.amountCents, 0)

  const byCategory: Record<string, number> = {}
  for (const e of expenses) {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amountCents
  }

  const rows = expenses.map((e) => ({
    id: e.id,
    date: e.date.toISOString(),
    category: e.category,
    description: e.description,
    vendor: e.vendor,
    amountCents: e.amountCents,
  }))

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="Expenses" subtitle="Track and categorize your spending" />
      <main className="flex-1 p-4 sm:p-6 space-y-6">
        <div data-tour="expenses" className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <p className="text-3xl font-bold text-foreground">{formatCurrency(totalCents, currency)}</p>
          </div>
          <div className="flex items-center gap-2">
            <CsvImporter type="expense" />
            <ExportExpensesButton rows={rows} currency={currency} />
            <AddExpenseForm currency={currency} autoOpen />
          </div>
        </div>

        {Object.keys(byCategory).length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(byCategory).map(([cat, cents]) => (
              <Card key={cat}>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{categoryLabels[cat] || cat}</p>
                  <p className="text-lg font-bold text-foreground mt-1">{formatCurrency(cents, currency)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Expenses</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {rows.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="No expenses logged"
                description="Snap a receipt with AI scan, or import a CSV. Every category rolls up automatically for tax season."
                action={<AddExpenseForm currency={currency} />}
              />
            ) : (
              <ExpenseTable rows={rows} currency={currency} />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
