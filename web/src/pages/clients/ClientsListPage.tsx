import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { clientsApi } from '../../api'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Spinner } from '../../components/ui/Spinner'

export function ClientsListPage() {
  const [search, setSearch] = useState('')
  const [page] = useState(1)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['clients', { page, search }],
    queryFn: () => clientsApi.getClients({ page, limit: 20, search }),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Manage client profiles and contacts."
        right={<Input placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} />}
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
          <EmptyState title="No clients found" description="Try adjusting your search." />
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
