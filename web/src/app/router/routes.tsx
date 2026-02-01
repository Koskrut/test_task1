import { createBrowserRouter } from 'react-router-dom'
import { RequireAuth, RequireRole } from './guards'
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
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: 'clients',
        element: (
          <RequireRole roles={[UserRole.Admin, UserRole.Manager]}>
            <ClientsListPage />
          </RequireRole>
        ),
      },
      {
        path: 'clients/:id',
        element: (
          <RequireRole roles={[UserRole.Admin, UserRole.Manager]}>
            <ClientDetailPage />
          </RequireRole>
        ),
      },
      {
        path: 'deals',
        element: (
          <RequireRole roles={[UserRole.Admin, UserRole.Manager]}>
            <DealsKanbanPage />
          </RequireRole>
        ),
      },
      {
        path: 'orders',
        element: (
          <RequireRole roles={[UserRole.Admin, UserRole.Manager]}>
            <OrdersListPage />
          </RequireRole>
        ),
      },
      {
        path: 'orders/:id',
        element: (
          <RequireRole roles={[UserRole.Admin, UserRole.Manager]}>
            <OrderDetailPage />
          </RequireRole>
        ),
      },
    ],
  },
  { path: '/not-authorized', element: <NotAuthorizedPage /> },
  { path: '*', element: <NotFoundPage /> },
])
