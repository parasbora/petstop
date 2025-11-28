
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { apiBase, setToken } from '@/lib/auth'
import { useNavigate } from 'react-router'


const Signup = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase()}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: name || undefined })
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Signup failed (${res.status})`)
      }
      const body = await res.json()
      const jwt: string | undefined = body?.data?.jwt
      if (!jwt) throw new Error('Missing token in response')
      setToken(jwt)
      navigate('/browse')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='m-auto max-h-full mx-4'>
       <Card className="mx-auto max-w-sm backdrop-blur-lg">
    <CardHeader>
      <CardTitle className="text-2xl">Create account</CardTitle>
      <CardDescription>
        Sign up with your email and a strong password
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form className="grid gap-4" onSubmit={onSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" type="text" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
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
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <div className="text-sm text-red-500">{error}</div>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign up'}
        </Button>
        <a href="/login" className="block w-full text-center text-sm underline mt-1">Already have an account? Log in</a>
      </form>
      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account?{" "}
        <a href="#" className="underline">
          Sign up
        </a>
      </div>
    </CardContent>
  </Card> 
    </div>
   
  )
}

Signup.propTypes = {}

export default Signup