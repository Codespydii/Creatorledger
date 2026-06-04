import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary text-secondary-foreground',
        success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
        warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
        destructive: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200',
        outline: 'border border-border text-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

interface BadgeProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
