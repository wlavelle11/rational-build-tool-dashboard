import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva('btn', {
  variants: {
    variant: {
      primary:   'btn-primary',
      brand:     'btn-brand',
      secondary: 'btn-secondary',
      ghost:     'btn-ghost',
    },
    size: {
      sm:      'btn-sm',
      default: '',
      lg:      'btn-lg',
    },
  },
  defaultVariants: { variant: 'primary', size: 'default' },
})

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
}

// Link variant for Next.js Link wrapping
interface ButtonLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof buttonVariants> {}

export function ButtonLink({ className, variant, size, ...props }: ButtonLinkProps) {
  return <a className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
