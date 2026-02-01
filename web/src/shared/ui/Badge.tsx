import { ReactNode } from 'react'
import { clsx } from '../lib/clsx'

export function Badge({
  tone = 'default',
  className,
  children,
}: {
  tone?: 'default' | 'success' | 'warning' | 'danger'
  className?: string
  children: ReactNode
}) {
  const toneClasses = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-rose-100 text-rose-700',
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
