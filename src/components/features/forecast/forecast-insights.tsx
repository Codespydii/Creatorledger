import { Lightbulb } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface ForecastInsightsProps {
  insights: string[]
}

export function ForecastInsights({ insights }: ForecastInsightsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights</CardTitle>
        <CardDescription>What the forecast tells you about the next 90 days.</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-3">
          {insights.map((insight, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40 shrink-0">
                <Lightbulb className="h-3.5 w-3.5 text-amber-600 dark:text-amber-300" />
              </div>
              <span className="text-sm text-foreground leading-relaxed">{insight}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
