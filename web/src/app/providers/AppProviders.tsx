import { AuthProvider } from './AuthProvider'
import { QueryProvider } from './QueryProvider'
import { RouterProvider } from './RouterProvider'

export function AppProviders() {
  return (
    <AuthProvider>
      <QueryProvider>
        <RouterProvider />
      </QueryProvider>
    </AuthProvider>
  )
}
