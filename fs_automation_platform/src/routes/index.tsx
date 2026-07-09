import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { AuthContext } from './__root'
import { loginUser } from '~/utils/db'
import { GraduationCap, ShieldAlert, Users, School } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const auth = React.useContext(AuthContext)
  const [role, setRole] = React.useState<'student' | 'parent' | 'faculty'>('student')
  const [username, setUsername] = React.useState('ayushi')
  const [password, setPassword] = React.useState('password')
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  // Update default credentials when role changes for easy testing
  React.useEffect(() => {
    if (role === 'student') {
      setUsername('ayushi')
    } else if (role === 'parent') {
      setUsername('parent_sharma')
    } else if (role === 'faculty') {
      setUsername('sarah')
    }
    setPassword('password')
    setError(null)
  }, [role])

  if (!auth) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Connect to Django backend via loginUser server function
      const res = await loginUser({ data: { username, role, password } })
      if (res.success && res.user) {
        // Store JWT tokens in localStorage for future client-side requests
        if (res.tokens) {
            localStorage.setItem('ff_tokens', JSON.stringify(res.tokens))
        }
        auth.login(res.user)
      } else {
        setError(res.error || 'Invalid credentials')
      }
    } catch (err) {
      setError('An error occurred. Please check database connection.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 w-full items-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2 select-none">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 font-bold text-white text-xl shadow-lg ring-4 ring-indigo-500/10">
          FF
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          FacultyFlow
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Next-Gen Academic Automation Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-neutral-900 py-8 px-6 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl space-y-6">
          {/* Role selector tabs */}
          <div className="grid grid-cols-3 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl select-none">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex flex-col items-center justify-center gap-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                role === 'student'
                  ? 'bg-white dark:bg-neutral-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole('parent')}
              className={`flex flex-col items-center justify-center gap-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                role === 'parent'
                  ? 'bg-white dark:bg-neutral-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              <Users className="h-4 w-4" />
              Parent
            </button>
            <button
              type="button"
              onClick={() => setRole('faculty')}
              className={`flex flex-col items-center justify-center gap-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                role === 'faculty'
                  ? 'bg-white dark:bg-neutral-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              <School className="h-4 w-4" />
              Faculty
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-3 border border-red-200 dark:border-red-800/40 flex items-start gap-2.5 animate-in shake duration-200">
                <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <span className="text-xs font-medium text-red-700 dark:text-red-300 leading-normal">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-1.5 select-none">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="block w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-850 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-1.5 select-none">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-850 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all select-none disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Quick login assistant */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 text-center select-none">
            <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/20 px-2.5 py-1 rounded-full">
              Demo Mode Credentials
            </span>
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              Username: <strong className="font-semibold text-neutral-700 dark:text-neutral-300">{username}</strong> & Password: <strong className="font-semibold text-neutral-700 dark:text-neutral-300">password</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
