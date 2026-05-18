'use client'

import { useState, useActionState, useEffect } from 'react'
import Papa from 'papaparse'
import { Upload, FileText, X, Check, Loader2, AlertCircle } from 'lucide-react'
import { importCsv } from '@/app/actions/csv-import'
import { Button } from '@/components/ui/button'
import { useEscapeKey } from '@/hooks/use-escape-key'

interface Props {
  type: 'revenue' | 'expense'
}

// Map common column-name variants to our canonical fields
const COLUMN_ALIASES: Record<string, string[]> = {
  date:        ['date', 'transaction_date', 'transaction date', 'when', 'day'],
  amount:      ['amount', 'value', 'total', 'price', 'sum'],
  description: ['description', 'desc', 'memo', 'note', 'notes', 'details', 'item'],
  category:    ['category', 'source', 'type', 'kind'],
  platform:    ['platform', 'vendor', 'merchant', 'company', 'brand', 'where'],
}

function findColumn(headers: string[], key: keyof typeof COLUMN_ALIASES): string | null {
  const aliases = COLUMN_ALIASES[key]
  const lower = headers.map(h => h.toLowerCase().trim())
  for (const alias of aliases) {
    const idx = lower.indexOf(alias)
    if (idx >= 0) return headers[idx]
  }
  return null
}

type ParsedRow = Record<string, string>
type MappedRow = { date: string; amount: string; description: string; category: string | null; platform: string | null }

export function CsvImporter({ type }: Props) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [rows, setRows] = useState<MappedRow[]>([])
  const [columnMap, setColumnMap] = useState<{ date: string | null; amount: string | null; description: string | null; category: string | null; platform: string | null }>({
    date: null, amount: null, description: null, category: null, platform: null,
  })
  const [headers, setHeaders] = useState<string[]>([])
  const [state, action, pending] = useActionState(importCsv, undefined)
  useEscapeKey(() => setOpen(false), open)

  const resetState = () => {
    setFile(null); setParseError(null); setRows([]); setHeaders([])
    setColumnMap({ date: null, amount: null, description: null, category: null, platform: null })
  }

  useEffect(() => {
    if (state?.success) {
      const t = setTimeout(() => { setOpen(false); resetState() }, 2500)
      return () => clearTimeout(t)
    }
  }, [state])

  const handleFile = (f: File) => {
    setFile(f)
    setParseError(null)
    setParsing(true)
    Papa.parse<ParsedRow>(f, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setParsing(false)
        if (results.errors.length > 0) {
          setParseError(`CSV parse error: ${results.errors[0].message}`)
          return
        }
        const data = results.data
        if (data.length === 0) {
          setParseError('CSV is empty or has no rows')
          return
        }
        const hs = results.meta.fields ?? Object.keys(data[0])
        setHeaders(hs)
        const cm = {
          date:        findColumn(hs, 'date'),
          amount:      findColumn(hs, 'amount'),
          description: findColumn(hs, 'description'),
          category:    findColumn(hs, 'category'),
          platform:    findColumn(hs, 'platform'),
        }
        setColumnMap(cm)
        const mapped: MappedRow[] = data.map((row) => ({
          date: cm.date ? row[cm.date] ?? '' : '',
          amount: cm.amount ? row[cm.amount] ?? '' : '',
          description: cm.description ? row[cm.description] ?? '' : '',
          category: cm.category ? row[cm.category] ?? null : null,
          platform: cm.platform ? row[cm.platform] ?? null : null,
        }))
        setRows(mapped)
      },
      error: (err) => {
        setParsing(false)
        setParseError(`Failed to read CSV: ${err.message}`)
      },
    })
  }

  const canImport = rows.length > 0 && columnMap.date && columnMap.amount && columnMap.description

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4" />
        Import CSV
      </Button>

      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby="csv-import-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 overflow-y-auto py-8">
          <div className="w-full max-w-2xl rounded-2xl bg-card border border-border shadow-lg p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 id="csv-import-title" className="text-lg font-semibold text-foreground">
                  Import {type === 'revenue' ? 'revenue' : 'expenses'} from CSV
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Required columns: <strong>date</strong>, <strong>amount</strong>, <strong>description</strong>. Optional: <strong>{type === 'revenue' ? 'source' : 'category'}</strong>, <strong>{type === 'revenue' ? 'platform' : 'vendor'}</strong>.
                </p>
              </div>
              <button onClick={() => { setOpen(false); resetState() }} aria-label="Close dialog" className="text-muted-foreground hover:text-foreground shrink-0 ml-2">
                <X className="h-5 w-5" />
              </button>
            </div>

            {state?.success && state.data ? (
              <div className="flex items-start gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300">
                <Check className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  Imported {state.data.inserted} row{state.data.inserted === 1 ? '' : 's'}.
                  {state.data.skipped > 0 && ` Skipped ${state.data.skipped} invalid row${state.data.skipped === 1 ? '' : 's'}.`}
                </span>
              </div>
            ) : (
              <>
                {parseError && (
                  <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{parseError}</span>
                  </div>
                )}
                {state && !state.success && (
                  <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 whitespace-pre-wrap dark:bg-red-950/30 dark:border-red-900 dark:text-red-300">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{state.error}</span>
                  </div>
                )}

                {!file ? (
                  <label
                    htmlFor="csv-file"
                    className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-10 text-sm text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Upload className="h-5 w-5" />
                    <span className="font-medium">Click to choose a CSV file</span>
                    <span className="text-xs">Max 2,000 rows per import</span>
                  </label>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm text-foreground truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">{rows.length} rows</span>
                      </div>
                      <button type="button" onClick={resetState} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Column-detection summary */}
                    <div className="rounded-lg border border-border bg-background p-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Detected columns</p>
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                        <DetectedCol label="Date"       value={columnMap.date} ok required />
                        <DetectedCol label="Amount"     value={columnMap.amount} ok required />
                        <DetectedCol label="Description" value={columnMap.description} ok required />
                        <DetectedCol label={type === 'revenue' ? 'Source' : 'Category'} value={columnMap.category} ok={false} />
                        <DetectedCol label={type === 'revenue' ? 'Platform' : 'Vendor'} value={columnMap.platform} ok={false} />
                      </dl>
                      {!canImport && (
                        <p className="text-xs text-amber-600 mt-2">
                          A required column wasn&apos;t detected. Rename your CSV headers to <code>date</code>, <code>amount</code>, <code>description</code> and re-upload.
                        </p>
                      )}
                    </div>

                    {/* Preview first 3 rows */}
                    {rows.length > 0 && canImport && (
                      <div className="rounded-lg border border-border bg-background overflow-hidden">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 pt-3">Preview (first 3)</p>
                        <table className="w-full text-xs mt-2">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="px-3 py-1.5 text-left text-muted-foreground">Date</th>
                              <th className="px-3 py-1.5 text-right text-muted-foreground">Amount</th>
                              <th className="px-3 py-1.5 text-left text-muted-foreground">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.slice(0, 3).map((r, i) => (
                              <tr key={i} className="border-b border-border last:border-0">
                                <td className="px-3 py-1.5">{r.date}</td>
                                <td className="px-3 py-1.5 text-right font-medium">{r.amount}</td>
                                <td className="px-3 py-1.5 truncate max-w-[280px]">{r.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <input type="hidden" />
                  </div>
                )}

                <input
                  type="file"
                  id="csv-file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => { const f = e.currentTarget.files?.[0]; if (f) handleFile(f) }}
                />

                {parsing && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Parsing CSV…
                  </div>
                )}

                <form action={action} className="mt-5 flex gap-3">
                  <input type="hidden" name="type" value={type} />
                  <input type="hidden" name="rows" value={JSON.stringify(rows.map(r => ({
                    date: r.date,
                    amount: r.amount,
                    description: r.description,
                    category: r.category,
                    platform: r.platform,
                  })))} />
                  <Button type="button" variant="outline" className="flex-1" onClick={() => { setOpen(false); resetState() }}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={!canImport || pending || parsing}>
                    {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Importing…</> : `Import ${rows.length} row${rows.length === 1 ? '' : 's'}`}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function DetectedCol({ label, value, ok, required }: { label: string; value: string | null; ok?: boolean; required?: boolean }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}{required && <span className="text-red-500">*</span>}</dt>
      <dd className={value ? 'font-medium text-foreground' : 'text-amber-600'}>
        {value ? `→ ${value}` : (required ? 'not found' : 'optional')}
      </dd>
    </>
  )
}
