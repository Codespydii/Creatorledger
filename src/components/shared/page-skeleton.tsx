interface PageSkeletonProps {
  title: string
  subtitle?: string
  rows?: number
}

export function PageSkeleton({ title, subtitle, rows = 3 }: PageSkeletonProps) {
  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <div className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur px-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-6">
              <div className="h-3 w-20 rounded bg-muted animate-pulse" />
              <div className="mt-3 h-7 w-32 rounded bg-muted animate-pulse" />
              <div className="mt-4 h-3 w-24 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>

        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-6">
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
            <div className="mt-2 h-3 w-48 rounded bg-muted animate-pulse" />
            <div className="mt-6 space-y-2">
              <div className="h-3 w-full rounded bg-muted animate-pulse" />
              <div className="h-3 w-5/6 rounded bg-muted animate-pulse" />
              <div className="h-3 w-4/6 rounded bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
