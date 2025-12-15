import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useLoginMutation } from '@/api/authApi'

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [login, { isLoading, error: apiError }] = useLoginMutation()
  const navigate = useNavigate()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await login({ email, password }).unwrap()
      navigate('/browse')
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  // Get error message - now it should be a string from transformErrorResponse
  const errorMessage = apiError
    ? (typeof apiError === 'string'
      ? apiError
      : ('data' in apiError && apiError.data?.error)
      || ('status' in apiError && `Error ${apiError.status}`)
      || 'Login failed')
    : null

  return (
    <div className='mt-20 mx-auto max-h-full '>
      <Card className="mx-auto max-w-sm backdrop-blur-lg ">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={onSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {errorMessage && (
              <div className="text-sm text-red-500 p-2 bg-red-50 rounded border border-red-200">
                {errorMessage}
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Login'}
            </Button>
            <a href="/signup" className="block w-full text-center text-sm underline mt-1">
              Create an account
            </a>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login