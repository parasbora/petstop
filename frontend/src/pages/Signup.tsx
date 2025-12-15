import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useRegisterMutation } from '@/api/authApi'

const Signup = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [register, { isLoading, error: apiError }] = useRegisterMutation()
  const navigate = useNavigate()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await register({ 
        email, 
        password, 
        name: name || undefined 
      }).unwrap()
      
      navigate('/browse')
    } catch (err) {
      console.error('Signup failed:', err)
    }
  }

  // Get error message - now it should be a string from transformErrorResponse
  const errorMessage = apiError 
    ? (typeof apiError === 'string' 
        ? apiError 
        : ('data' in apiError && apiError.data) 
        || ('status' in apiError && `Error ${apiError.status}`) 
        || 'Signup failed')
    : null

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
              <Label htmlFor="name">Name (Optional)</Label>
              <Input 
                id="name" 
                type="text" 
                placeholder="Jane Doe" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
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
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
              <p className="text-xs text-muted-foreground mt-1">
                Password must contain at least one uppercase letter
              </p>
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
              {isLoading ? 'Creating account...' : 'Sign up'}
            </Button>
            <a href="/login" className="block w-full text-center text-sm underline mt-1">
              Already have an account? Log in
            </a>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Signup