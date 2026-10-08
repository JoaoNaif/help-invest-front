import { ChevronDown } from 'lucide-react'
import { useId, type Ref, type SelectHTMLAttributes } from 'react'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  error?: string
  ref?: Ref<HTMLSelectElement>
}

export function Select({ label, error, className = '', children, ref, ...props }: SelectProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm text-muted">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`h-11 w-full cursor-pointer appearance-none rounded-lg border bg-surface-2 pr-9 pl-3 text-base text-text focus:border-gold focus:outline-none ${error ? 'border-danger' : 'border-border'} ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
      </div>
      {error && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
