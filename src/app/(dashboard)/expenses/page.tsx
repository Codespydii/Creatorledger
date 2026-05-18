import { Topbar } from '@/components/shared/topbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AddExpenseForm } from '@/components/features/expenses/add-expense-form'
import { ExpenseRowActions } from '@/components/features/expenses/expense-row-actions'
import { CsvImporter } from '@/components/features/shared/csv-importer'
import { verifySession } from '@/lib/session'
import { db } from '@/lib/db'
import { formatCurrency, formatDate } from '@/lib/utils'

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

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="Expenses" subtitle="Track and categorize your spending" />
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <p className="text-3xl font-bold text-foreground">{formatCurrency(totalCents, currency)}</p>
          </div>
          <div className="flex items-center gap-2">
            <CsvImporter type="expense" />
            <AddExpenseForm currency={currency} />
          </div>
        </div>

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

        <Card>
          <CardHeader>
            <CardTitle>All Expenses</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {expenses.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No expenses logged yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-left font-medium text-muted-foreground">Date</th>
                      <th className="pb-3 text-left font-medium text-muted-foreground">Category</th>
                      <th className="pb-3 text-left font-medium text-muted-foreground">Description</th>
                      <th className="pb-3 text-left font-medium text-muted-foreground">Vendor</th>
                      <th className="pb-3 text-right font-medium text-muted-foreground">Amount</th>
                      <th className="pb-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                        <td className="py-3 text-muted-foreground">{formatDate(exp.date.toISOString())}</td>
                        <td className="py-3">
                          <Badge variant="secondary">{categoryLabels[exp.category] || exp.category}</Badge>
                        </td>
                        <td className="py-3 text-foreground max-w-xs truncate">{exp.description}</td>
                        <td className="py-3 text-muted-foreground">{exp.vendor || '—'}</td>
                        <td className="py-3 text-right font-semibold text-red-500">
                          {formatCurrency(exp.amountCents, currency)}
                        </td>
                        <td className="py-3">
                          <ExpenseRowActions
                            id={exp.id}
                            category={exp.category}
                            amountCents={exp.amountCents}
                            description={exp.description}
                            vendor={exp.vendor}
                            date={exp.date.toISOString().split('T')[0]}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
