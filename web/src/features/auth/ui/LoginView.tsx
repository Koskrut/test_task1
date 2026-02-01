import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '../model/useLogin'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Card } from '../../../shared/ui/Card'
import { ErrorState } from '../../../shared/ui/ErrorState'
import { Spinner } from '../../../shared/ui/Spinner'

export function LoginView() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const mutation = useLogin()

  const handleSubmit = () => {
    mutation.mutate(
      { identifier, password },
      {
        onSuccess: () => navigate('/'),
      },
    )
  }

  return (
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
          onClick={handleSubmit}
        >
          {mutation.isPending ? <Spinner /> : 'Sign in'}
        </Button>
      </div>
    </Card>
  )
}
