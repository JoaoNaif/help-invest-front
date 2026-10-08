import { Eye, EyeOff } from 'lucide-react'
import { useId, useState, type InputHTMLAttributes, type Ref } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  ref?: Ref<HTMLInputElement>
}

export function Input({ label, error, className = '', type, ref, ...props }: InputProps) {
  const id = useId()
  const errorId = `${id}-error`
  const [visible, setVisible] = useState(false)

  const isPassword = type === 'password'
  const Icon = visible ? EyeOff : Eye

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm text-muted">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          ref={ref}
          type={isPassword && visible ? 'text' : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`h-11 w-full rounded-lg border bg-surface-2 px-3 text-base text-text placeholder:text-muted/60 focus:border-gold focus:outline-none ${isPassword ? 'pr-11' : ''} ${error ? 'border-danger' : 'border-border'} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={visible}
            className="absolute inset-y-0 right-0 grid w-11 cursor-pointer place-items-center rounded-r-lg text-muted hover:text-text"
          >
            <Icon className="size-4" aria-hidden />
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
