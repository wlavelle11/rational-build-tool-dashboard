import { cn } from '@/lib/utils'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'brand'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  dot?: boolean
}

const variantClass: Record<BadgeVariant, string> = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger:  'badge-danger',
  neutral: 'badge-neutral',
  brand:   'badge-brand',
}

export function Badge({ variant = 'neutral', dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span className={cn('badge', variantClass[variant], className)} {...props}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  )
}
