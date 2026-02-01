import { Card } from '../../../shared/ui/Card'
import { ErrorState } from '../../../shared/ui/ErrorState'
import { PageHeader } from '../../../shared/ui/PageHeader'
import { Spinner } from '../../../shared/ui/Spinner'
import { useClient } from '../model/queries'

export function ClientDetailView({ id }: { id?: string }) {
  const { data, isLoading, isError, refetch } = useClient(id)

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
              <div className="text-sm font-semibold text-slate-900">
                {data.name}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Company</div>
              <div className="text-sm text-slate-700">
                {data.companyName ?? '—'}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Email</div>
              <div className="text-sm text-slate-700">
                {data.email ?? '—'}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Phone</div>
              <div className="text-sm text-slate-700">
                {data.phone ?? '—'}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Status</div>
              <div className="text-sm text-slate-700">
                {data.status ?? '—'}
              </div>
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
