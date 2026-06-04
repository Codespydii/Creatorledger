'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

interface Props {
  publicId: string | null | undefined
}

export function ShareLinkButton({ publicId }: Props) {
  const [copied, setCopied] = useState(false)

  if (!publicId) return null

  const handleCopy = async () => {
    const url = `${window.location.origin}/i/${publicId}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers without clipboard API
      window.prompt('Copy this link to share with the client:', url)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy public share link"
      title={copied ? 'Copied!' : 'Copy public share link'}
      className="inline-flex items-center justify-center rounded-full border border-border p-1.5 text-muted-foreground hover:border-violet-300 hover:text-violet-600 transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
    </button>
  )
}
