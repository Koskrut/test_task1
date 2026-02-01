import { Button } from './Button'

export function ErrorState({
  title,
  description,
  onRetry,
}: {
  title: string
  description?: string
  onRetry?: () => void
}) {
  return (
    <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
      <div className="font-semibold">{title}</div>
      {description ? <div className="mt-1">{description}</div> : null}
      {onRetry ? (
        <div className="mt-3">
          <Button variant="secondary" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : null}
    </div>
  )
}
