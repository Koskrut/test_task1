import { ButtonHTMLAttributes } from 'react'
import { clsx } from '../lib/clsx'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' &&
          'bg-brand-600 text-white hover:bg-brand-700',
        variant === 'secondary' &&
          'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
        variant === 'ghost' &&
          'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        className,
      )}
      {...props}
    />
  )
}
