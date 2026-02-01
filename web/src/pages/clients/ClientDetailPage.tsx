import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { clientsApi } from '../../api'
import { Card } from '../../components/ui/Card'
import { ErrorState } from '../../components/ui/ErrorState'
import { PageHeader } from '../../components/ui/PageHeader'
import { Spinner } from '../../components/ui/Spinner'

export function ClientDetailPage() {
  const { id } = useParams()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['client', id],
    queryFn: () => clientsApi.getClientById(id ?? ''),
    enabled: Boolean(id),
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Client details" description="Client profile summary." />

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner /> Loading client...
        </div>
      ) : null}

      {isError ? (
        <ErrorState title="Failed to load client" onRetry={() => refetch()} />
      ) : null}

      {data ? (
        <Card>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-xs text-slate-500">Name</div>
              <div className="text-sm font-semibold text-slate-900">{data.name}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Company</div>
              <div className="text-sm text-slate-700">{data.companyName ?? '—'}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Email</div>
              <div className="text-sm text-slate-700">{data.email ?? '—'}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Phone</div>
              <div className="text-sm text-slate-700">{data.phone ?? '—'}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Status</div>
              <div className="text-sm text-slate-700">{data.status ?? '—'}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Assigned manager</div>
              <div className="text-sm text-slate-700">
                {data.assignedManagerId ?? '—'}
              </div>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  )
}
