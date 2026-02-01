import { PageHeader } from '../../shared/ui/PageHeader'
import { OrdersSummary } from '../../features/orders/ui/OrdersSummary'

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of recent CRM activity."
      />
      <OrdersSummary />
    </div>
  )
}
