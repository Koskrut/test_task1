import { Card } from '../../../shared/ui/Card'
import { ErrorState } from '../../../shared/ui/ErrorState'
import { Spinner } from '../../../shared/ui/Spinner'
import { useOrders } from '../model/queries'

export function OrdersSummary() {
  const { data, isLoading, isError, refetch } = useOrders({
    page: 1,
    limit: 5,
  })

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Spinner /> Loading dashboard...
      </div>
    )
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load dashboard data"
        onRetry={() => refetch()}
      />
    )
  }

  if (!data) {
    return null
  }

  return (
    <Card>
      <div className="text-sm font-semibold text-slate-900">Recent orders</div>
      <div className="mt-3 divide-y divide-slate-100">
        {data.items.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between py-2 text-sm"
          >
            <div>
              <div className="font-medium text-slate-900">
                {order.orderNumber}
              </div>
              <div className="text-xs text-slate-500">
                {order.status} • {order.totalAmount} {order.currency}
              </div>
            </div>
            <div className="text-xs text-slate-500">
              {new Date(order.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
