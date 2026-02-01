import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute, RoleGuard } from './guards'
import { MainLayout } from '../layouts/MainLayout'
import { LoginPage } from '../../pages/auth/LoginPage'
import { DashboardPage } from '../../pages/dashboard/DashboardPage'
import { ClientsListPage } from '../../pages/clients/ClientsListPage'
import { ClientDetailPage } from '../../pages/clients/ClientDetailPage'
import { DealsKanbanPage } from '../../pages/deals/DealsKanbanPage'
import { OrdersListPage } from '../../pages/orders/OrdersListPage'
import { OrderDetailPage } from '../../pages/orders/OrderDetailPage'
import { NotFoundPage } from '../../pages/system/NotFoundPage'
import { NotAuthorizedPage } from '../../pages/system/NotAuthorizedPage'
import { UserRole } from '../../entities/user/model/types'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: 'clients',
        element: (
          <RoleGuard roles={[UserRole.Admin, UserRole.Manager]}>
            <ClientsListPage />
          </RoleGuard>
        ),
      },
      {
        path: 'clients/:id',
        element: (
          <RoleGuard roles={[UserRole.Admin, UserRole.Manager]}>
            <ClientDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: 'deals',
        element: (
          <RoleGuard roles={[UserRole.Admin, UserRole.Manager]}>
            <DealsKanbanPage />
          </RoleGuard>
        ),
      },
      {
        path: 'orders',
        element: (
          <RoleGuard roles={[UserRole.Admin, UserRole.Manager]}>
            <OrdersListPage />
          </RoleGuard>
        ),
      },
      {
        path: 'orders/:id',
        element: (
          <RoleGuard roles={[UserRole.Admin, UserRole.Manager]}>
            <OrderDetailPage />
          </RoleGuard>
        ),
      },
    ],
  },
  { path: '/not-authorized', element: <NotAuthorizedPage /> },
  { path: '*', element: <NotFoundPage /> },
])
