import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { UserRole } from '../../types/auth'
import { Button } from '../ui/Button'

const navItems = [
  { label: 'Dashboard', path: '/', roles: [UserRole.Admin, UserRole.Manager] },
  { label: 'Clients', path: '/clients', roles: [UserRole.Admin, UserRole.Manager] },
  { label: 'Deals', path: '/deals', roles: [UserRole.Admin, UserRole.Manager] },
  { label: 'Orders', path: '/orders', roles: [UserRole.Admin, UserRole.Manager] },
]

export function AppLayout() {
  const [open, setOpen] = useState(false)
  const role = useAuthStore((state) => state.user?.role)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const filtered = navItems.filter((item) => role && item.roles.includes(role))

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside
        className={`fixed inset-y-0 left-0 z-20 w-64 transform border-r border-slate-200 bg-white transition lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="text-sm font-semibold text-slate-900">CRM Suite</div>
          <button
            className="lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        <nav className="px-3 py-4">
          <div className="space-y-1">
            {filtered.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  [
                    'flex items-center rounded-md px-3 py-2 text-sm font-medium',
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:px-6">
          <div className="flex items-center gap-2">
            <button
              className="lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              ☰
            </button>
            <span className="text-sm font-medium text-slate-700">
              Role: {role ?? 'Unknown'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                logout()
                navigate('/login')
              }}
            >
              Sign out
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
