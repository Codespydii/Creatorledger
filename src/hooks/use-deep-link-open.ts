'use client'

import { useEffect } from 'react'

/**
 * Opens a modal once on mount when the URL carries `?new=1`, then strips the
 * param so a refresh/back doesn't reopen it. Used by the dashboard "+ New"
 * quick-add menu to deep-link straight into an entry form.
 *
 * Pass `enabled` only to the primary (header) instance of a form so pages that
 * render the form twice (header + empty-state) don't open two modals.
 */
export function useDeepLinkOpen(enabled: boolean, open: () => void) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return
    const url = new URL(window.location.href)
    if (url.searchParams.get('new') !== '1') return
    open()
    url.searchParams.delete('new')
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])
}
