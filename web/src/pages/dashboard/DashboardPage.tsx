import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '../../api'
import { Card } from '../../components/ui/Card'
import { ErrorState } from '../../components/ui/ErrorState'
import { PageHeader } from '../../components/ui/PageHeader'
import { Spinner } from '../../components/ui/Spinner'

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['orders', { page: 1, limit: 5 }],
    queryFn: () => ordersApi.getOrders({ page: 1, limit: 5 }),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of recent CRM activity."
      />

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner /> Loading dashboard...
        </div>
      ) : null}

      {isError ? (
        <ErrorState
          title="Failed to load dashboard data"
          onRetry={() => refetch()}
        />
      ) : null}

      {data ? (
        <Card>
          <div className="text-sm font-semibold text-slate-900">
            Recent orders
          </div>
          <div className="mt-3 divide-y divide-slate-100">
            {data.items.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 text-sm">
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
      ) : null}
    </div>
  )
}
