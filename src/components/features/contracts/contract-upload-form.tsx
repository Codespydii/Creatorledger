'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { FileText, Loader2, Upload, X, CheckCircle2 } from 'lucide-react'
import { analyzeContractAction } from '@/app/actions/contracts'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const ANALYSIS_STEPS = [
  'Reading the document…',
  'Checking payment terms…',
  'Looking for usage and exclusivity clauses…',
  'Flagging risky language…',
  'Drafting recommendations…',
]

interface Props {
  geminiConfigured: boolean
}

const ACCEPT = '.pdf,.txt,.docx,.png,.jpg,.jpeg,.webp,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg,image/webp'

export function ContractUploadForm({ geminiConfigured }: Props) {
  const [state, action, pending] = useActionState(analyzeContractAction, undefined)
  const [file, setFile] = useState<File | null>(null)
  const [stepIdx, setStepIdx] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!pending) {
      setStepIdx(0)
      return
    }
    const id = setInterval(() => {
      setStepIdx((i) => Math.min(i + 1, ANALYSIS_STEPS.length - 1))
    }, 3500)
    return () => clearInterval(id)
  }, [pending])

  const handleSelectFile = (f: File | null) => {
    setFile(f)
    if (fileInputRef.current && !f) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyze a contract or brief</CardTitle>
        <CardDescription>
          Upload a PDF, Word document, image of a contract, or paste the text. The AI reviews it from your side and flags risky terms.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!geminiConfigured && (
          <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-3 py-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-200">
            AI analysis is not configured yet. Get a free key at{' '}
            <a href="https://aistudio.google.com/apikey" target="_blank" className="underline font-medium">
              aistudio.google.com/apikey
            </a>{' '}
            and add <code className="font-mono text-xs">GEMINI_API_KEY</code> to your <code className="font-mono text-xs">.env.local</code> file.
          </div>
        )}
        {state && !state.success && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300">
            {state.error}
          </div>
        )}

        <form action={action} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Upload file</label>
            <p className="text-xs text-muted-foreground mt-1 mb-2">PDF, Word (.docx), text, or image. Max 10MB.</p>
            {file ? (
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm text-foreground truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectFile(null)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="file"
                className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <Upload className="h-4 w-4" />
                Click to choose a file
              </label>
            )}
            <input
              ref={fileInputRef}
              type="file"
              name="file"
              id="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => handleSelectFile(e.currentTarget.files?.[0] ?? null)}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Textarea
            id="text"
            name="text"
            label="Paste contract text"
            placeholder="Paste the full text of the brief, scope of work, or contract here…"
            rows={8}
          />

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={pending || !geminiConfigured}>
              {pending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing…</>
              ) : (
                'Analyze contract'
              )}
            </Button>
            {!pending && (
              <span className="text-xs text-muted-foreground">Usually takes 10-20 seconds.</span>
            )}
          </div>

          {pending && (
            <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
              <ul className="space-y-1.5">
                {ANALYSIS_STEPS.map((step, i) => {
                  const done = i < stepIdx
                  const active = i === stepIdx
                  return (
                    <li key={step} className="flex items-center gap-2 text-xs">
                      {done ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      ) : active ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full border-2 border-muted shrink-0" />
                      )}
                      <span className={done ? 'text-foreground' : active ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                        {step}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
