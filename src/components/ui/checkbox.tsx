'use client'

import { Check, Minus } from 'lucide-react'
import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  indeterminate?: boolean
  /** Optional visible label rendered next to the checkbox. Pass `aria-label` instead for SR-only labels. */
  label?: React.ReactNode
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, indeterminate = false, checked, label, ...props },
  ref,
) {
  return (
    <label className={cn('inline-flex items-center gap-2 cursor-pointer select-none', props.disabled && 'cursor-not-allowed opacity-50')}>
      <span className="relative inline-flex">
        <input
          ref={(node) => {
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
            if (node) node.indeterminate = indeterminate
          }}
          type="checkbox"
          checked={checked}
          className="peer sr-only"
          {...props}
        />
        <span
          aria-hidden="true"
          className={cn(
            'flex h-4 w-4 items-center justify-center rounded border border-input bg-background transition-colors',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-focus-visible:border-primary',
            (checked || indeterminate) && 'border-primary bg-primary text-primary-foreground',
            className,
          )}
        >
          {indeterminate ? (
            <Minus className="h-3 w-3" />
          ) : checked ? (
            <Check className="h-3 w-3" />
          ) : null}
        </span>
      </span>
      {label && <span className="text-sm text-foreground">{label}</span>}
    </label>
  )
})
