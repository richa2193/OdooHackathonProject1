import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/_authenticated/profile')({
  component: Profile,
})

function Profile() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*, user_roles(role)')
          .eq('id', user.id)
          .single()
        
        setProfile(data)
      }
      setLoading(false)
    }

    fetchProfile()
  }, [])

  if (loading) return <div>Loading profile...</div>

  return (
    <div className="max-w-2xl rounded-card border border-border bg-surface p-8 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-text">My Profile</h2>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-text-muted">Full Name</label>
          <p className="mt-1 text-lg font-medium text-text">{profile?.full_name || 'N/A'}</p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-text-muted">Username</label>
          <p className="mt-1 text-lg font-medium text-text">@{profile?.username || 'N/A'}</p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-text-muted">Email</label>
          <p className="mt-1 text-lg font-medium text-text">{profile?.email || 'N/A'}</p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-text-muted">Role</label>
          <p className="mt-1 inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary capitalize">
            {profile?.user_roles?.[0]?.role || 'student'}
          </p>
        </div>
      </div>
    </div>
  )
}
