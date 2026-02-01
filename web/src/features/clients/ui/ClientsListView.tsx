import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { PageHeader } from '../../../shared/ui/PageHeader'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { ErrorState } from '../../../shared/ui/ErrorState'
import { Spinner } from '../../../shared/ui/Spinner'
import { useClients } from '../model/queries'

export function ClientsListView() {
  const [search, setSearch] = useState('')
  const [page] = useState(1)

  const { data, isLoading, isError, refetch } = useClients({
    page,
    limit: 20,
    search,
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Manage client profiles and contacts."
        right={
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        }
      />

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner /> Loading clients...
        </div>
      ) : null}

      {isError ? (
        <ErrorState title="Failed to load clients" onRetry={() => refetch()} />
      ) : null}

      {data ? (
        data.items.length === 0 ? (
          <EmptyState
            title="No clients found"
            description="Try adjusting your search."
          />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-400">
                  <tr>
                    <th className="py-2">Name</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Phone</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((client) => (
                    <tr key={client.id} className="border-t border-slate-100">
                      <td className="py-3">
                        <Link
                          to={`/clients/${client.id}`}
                          className="font-medium text-brand-700 hover:text-brand-800"
                        >
                          {client.name}
                        </Link>
                      </td>
                      <td className="py-3 text-slate-600">
                        {client.email ?? '—'}
                      </td>
                      <td className="py-3 text-slate-600">
                        {client.phone ?? '—'}
                      </td>
                      <td className="py-3 text-slate-600">
                        {client.status ?? '—'}
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
