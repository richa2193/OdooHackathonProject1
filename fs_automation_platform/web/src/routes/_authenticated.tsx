import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate({ to: '/login' })
      } else {
        setSession(session)
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate({ to: '/login' })
      } else {
        setSession(session)
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Placeholder */}
      <aside className="w-64 border-r border-border bg-surface hidden md:block">
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold text-primary">FacultyFlow</h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <a href="/profile" className="block rounded-md px-3 py-2 hover:bg-background text-sm font-medium">Profile</a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Topbar Placeholder */}
        <header className="h-16 border-b border-border bg-surface flex items-center px-6">
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-sm font-medium text-text-muted hover:text-text"
            >
              Sign out
            </button>
          </div>
        </header>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
