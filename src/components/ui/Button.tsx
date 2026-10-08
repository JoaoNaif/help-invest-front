import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  loading?: boolean
}

const variants: Record<Variant, string> = {
  primary: 'bg-gold text-on-gold hover:bg-gold-hover font-semibold',
  secondary: 'border border-border bg-surface-2 text-text hover:border-muted/50',
  ghost: 'text-muted hover:text-text hover:bg-surface-2',
}

export function Button({
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex h-11 items-center justify-center gap-2 cursor-pointer rounded-lg px-4 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
}
