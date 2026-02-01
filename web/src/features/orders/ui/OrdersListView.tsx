import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../../shared/ui/Card'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { ErrorState } from '../../../shared/ui/ErrorState'
import { PageHeader } from '../../../shared/ui/PageHeader'
import { Select } from '../../../shared/ui/Select'
import { Spinner } from '../../../shared/ui/Spinner'
import { useOrders } from '../model/queries'

export function OrdersListView() {
  const [status, setStatus] = useState('')

  const { data, isLoading, isError, refetch } = useOrders({
    page: 1,
    limit: 20,
    status,
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Track orders and fulfillment status."
        right={
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="pending_payment">Pending payment</option>
            <option value="paid">Paid</option>
            <option value="processing">Processing</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </Select>
        }
      />

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner /> Loading orders...
        </div>
      ) : null}

      {isError ? (
        <ErrorState title="Failed to load orders" onRetry={() => refetch()} />
      ) : null}

      {data ? (
        data.items.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="Orders will appear here once created."
          />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-400">
                  <tr>
                    <th className="py-2">Order</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((order) => (
                    <tr key={order.id} className="border-t border-slate-100">
                      <td className="py-3">
                        <Link
                          to={`/orders/${order.id}`}
                          className="font-medium text-brand-700 hover:text-brand-800"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 text-slate-600">{order.status}</td>
                      <td className="py-3 text-slate-600">
                        {order.totalAmount} {order.currency}
                      </td>
                      <td className="py-3 text-slate-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      ) : null}
    </div>
  )
}
