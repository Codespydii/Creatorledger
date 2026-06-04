'use client'

import { useEffect } from 'react'
import { Download } from 'lucide-react'

// A4 content box at 96dpi with the 8mm @page margins used in the print stylesheet.
const PRINT_WIDTH = 733
const PAGE_HEIGHT = 1040 // slightly conservative so borders/rounding never spill to page 2

export function PrintButton() {
  // Switch the kit into its compact PDF layout right before printing (covers both
  // the Download button and the browser's own Ctrl+P), measure it at the real print
  // width, and pick a zoom that keeps it on a single page. Reverts after printing.
  useEffect(() => {
    const before = () => {
      const el = document.getElementById('mk-article')
      if (!el) return
      el.classList.add('mk-pdf')
      el.style.width = `${PRINT_WIDTH}px`
      const zoom = Math.min(1, PAGE_HEIGHT / el.scrollHeight) // scrollHeight forces a sync reflow
      el.style.setProperty('--mk-zoom', String(zoom))
    }
    const after = () => {
      const el = document.getElementById('mk-article')
      if (!el) return
      el.classList.remove('mk-pdf')
      el.style.width = ''
      el.style.removeProperty('--mk-zoom')
    }
    window.addEventListener('beforeprint', before)
    window.addEventListener('afterprint', after)
    return () => {
      window.removeEventListener('beforeprint', before)
      window.removeEventListener('afterprint', after)
    }
  }, [])

  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
    >
      <Download className="h-4 w-4" />
      Download PDF
    </button>
  )
}
