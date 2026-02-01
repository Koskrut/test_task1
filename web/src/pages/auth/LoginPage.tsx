import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../api'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { ErrorState } from '../../components/ui/ErrorState'
import { Spinner } from '../../components/ui/Spinner'

export function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const setAuth = useAuthStore((state) => state.setAuth)
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: () => authApi.login(identifier, password),
    onSuccess: (data) => {
      setAuth(data, data.user)
      navigate('/')
    },
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-sm">
        <div className="space-y-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Sign in to CRM
            </h1>
            <p className="text-sm text-slate-500">
              Use your email or phone to continue.
            </p>
          </div>

          {mutation.isError ? (
            <ErrorState
              title="Login failed"
              description="Please check your credentials and try again."
            />
          ) : null}

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-600">
                Email or phone
              </label>
              <Input
                placeholder="manager@example.com"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          </div>

          <Button
            className="w-full"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? <Spinner /> : 'Sign in'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
