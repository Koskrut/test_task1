import { useParams } from 'react-router-dom'
import { OrderDetailView } from '../../features/orders/ui/OrderDetailView'

export function OrderDetailPage() {
  const { id } = useParams()

  return <OrderDetailView id={id} />
}
