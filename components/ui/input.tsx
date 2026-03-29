import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export function Input({ error, className, ...props }: InputProps) {
  return (
    <div className="form-field">
      <input className={cn('input', error && 'error', className)} {...props} />
      {error && <p className="form-error">{error}</p>}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
}

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select className={cn('select', className)} {...props}>
      {children}
    </select>
  )
}
