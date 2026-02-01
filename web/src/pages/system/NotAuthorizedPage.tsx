import { Link } from 'react-router-dom'

export function NotAuthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 p-6 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">
        Access restricted
      </h1>
      <p className="text-sm text-slate-500">
        You do not have permission to view this page.
      </p>
      <Link
        to="/"
        className="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
      >
        Go back home
      </Link>
    </div>
  )
}
