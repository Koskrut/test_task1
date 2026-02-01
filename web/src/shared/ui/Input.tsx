import type { InputHTMLAttributes } from 'react'
import { clsx } from '../lib/clsx'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={clsx(
        'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200',
        className,
      )}
      {...props}
    />
  )
}
