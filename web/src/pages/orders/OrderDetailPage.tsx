import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ordersApi, shipmentsApi } from '../../api'
import { Card } from '../../components/ui/Card'
import { ErrorState } from '../../components/ui/ErrorState'
import { PageHeader } from '../../components/ui/PageHeader'
import { Spinner } from '../../components/ui/Spinner'

export function OrderDetailPage() {
  const { id } = useParams()

  const orderQuery = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getOrderById(id ?? ''),
    enabled: Boolean(id),
  })

  const ttn = orderQuery.data?.delivery?.ttn
  const shipmentQuery = useQuery({
    queryKey: ['shipment', ttn],
    queryFn: () => shipmentsApi.getShipmentStatus(ttn ?? ''),
    enabled: Boolean(ttn),
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Order details" description="Order and shipment status." />

      {orderQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner /> Loading order...
        </div>
      ) : null}

      {orderQuery.isError ? (
        <ErrorState
          title="Failed to load order"
          onRetry={() => orderQuery.refetch()}
        />
      ) : null}

      {orderQuery.data ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs text-slate-500">Order</div>
                <div className="text-lg font-semibold text-slate-900">
                  {orderQuery.data.orderNumber}
                </div>
              </div>
              <div className="text-sm text-slate-600">
                {orderQuery.data.status}
              </div>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-400">
                  <tr>
                    <th className="py-2">Product</th>
                    <th className="py-2">Qty</th>
                    <th className="py-2">Price</th>
                    <th className="py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orderQuery.data.items?.map((item) => (
                    <tr key={item.id} className="border-t border-slate-100">
                      <td className="py-3 text-slate-700">
                        {item.productId ?? '—'}
                      </td>
                      <td className="py-3 text-slate-600">{item.qty}</td>
                      <td className="py-3 text-slate-600">
                        {item.priceAmount}
                      </td>
                      <td className="py-3 text-slate-600">
                        {item.totalAmount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <div className="text-sm font-semibold text-slate-900">
              Shipment status
            </div>
            {ttn ? (
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <div>
                  <span className="text-xs text-slate-500">TTN</span>
                  <div className="font-medium text-slate-900">{ttn}</div>
                </div>
                {shipmentQuery.isLoading ? (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Spinner /> Loading shipment...
                  </div>
                ) : null}
                {shipmentQuery.data ? (
                  <>
                    <div>
                      <span className="text-xs text-slate-500">Delivery</span>
                      <div className="font-medium text-slate-900">
                        {shipmentQuery.data.deliveryStatus}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">
                        Nova Poshta
                      </span>
                      <div className="font-medium text-slate-900">
                        {shipmentQuery.data.providerStatus ?? '—'}
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            ) : (
              <div className="mt-3 text-sm text-slate-500">
                Shipment not created yet.
              </div>
            )}
          </Card>
        </div>
      ) : null}
    </div>
  )
}
