import { ReactNode } from 'react'
import { clsx } from '../lib/clsx'

export function Card({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-slate-200 bg-white p-4 shadow-sm',
        className,
      )}
    >
      {children}
    </div>
  )
}
