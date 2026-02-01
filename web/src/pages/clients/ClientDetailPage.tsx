import { useParams } from 'react-router-dom'
import { ClientDetailView } from '../../features/clients/ui/ClientDetailView'

export function ClientDetailPage() {
  const { id } = useParams()

  return <ClientDetailView id={id} />
}
