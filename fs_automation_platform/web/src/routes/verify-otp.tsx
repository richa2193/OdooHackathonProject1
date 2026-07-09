import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/verify-otp')({
  component: VerifyOtp,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      email: search.email as string | undefined,
    }
  },
})

function VerifyOtp() {
  const { email } = Route.useSearch()
  const navigate = useNavigate()
  
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  if (!email) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4">No email provided for verification.</p>
        <button onClick={() => navigate({ to: '/login' })} className="text-primary hover:underline">
          Go to login
        </button>
      </div>
    )
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) {
      setError("Please enter a 6-digit code")
      return
    }
    
    setLoading(true)
    setError(null)
    
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'signup'
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // On success, redirect to login so they can log in
    navigate({ to: '/login' })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-card border border-border bg-surface p-8 shadow-sm">
        <h2 className="mb-2 text-2xl font-bold text-text">Check your email</h2>
        <p className="mb-6 text-sm text-text-muted">
          We sent a 6-digit verification code to <span className="font-medium text-text">{email}</span>.
        </p>
        
        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-text text-center">Verification Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="mx-auto block w-32 rounded-md border border-border bg-background px-3 py-2 text-center text-2xl tracking-widest focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="000000"
              required
              maxLength={6}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full rounded-md bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>
    </div>
  )
}
