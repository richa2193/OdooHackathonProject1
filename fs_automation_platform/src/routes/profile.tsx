import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AuthContext } from './__root'
import { changePassword, uploadAvatar } from '~/utils/db'
import { User, KeyRound, UploadCloud, CheckCircle2, ShieldAlert, BadgeAlert } from 'lucide-react'

export const Route = createFileRoute('/profile')({
  component: ProfileSettings,
})

function ProfileSettings() {
  const auth = React.useContext(AuthContext)
  const navigate = useNavigate()

  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [passError, setPassError] = React.useState<string | null>(null)
  const [passSuccess, setPassSuccess] = React.useState<string | null>(null)
  const [isPassLoading, setIsPassLoading] = React.useState(false)

  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null)
  const [avatarSuccess, setAvatarSuccess] = React.useState<string | null>(null)
  const [isAvatarLoading, setIsAvatarLoading] = React.useState(false)

  React.useEffect(() => {
    if (!auth?.user) {
      navigate({ to: '/' })
    }
  }, [auth, navigate])

  if (!auth || !auth.user) return null
  const { user, refreshDb } = auth

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPassError(null)
    setPassSuccess(null)

    if (password !== confirmPassword) {
      setPassError('Passwords do not match.')
      return
    }

    if (password.length < 5) {
      setPassError('Password must be at least 5 characters.')
      return
    }

    setIsPassLoading(true)
    try {
      const res = await changePassword({ data: { userId: user.id, newPass: password } })
      if (res.success) {
        setPassSuccess('Password updated successfully!')
        setPassword('')
        setConfirmPassword('')
        await refreshDb()
      } else {
        setPassError(res.error || 'Failed to change password.')
      }
    } catch (err) {
      setPassError('An error occurred.')
    } finally {
      setIsPassLoading(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarSuccess(null)
    setIsAvatarLoading(true)

    // Convert file to base64 to mock Lovable Storage uploads
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64String = reader.result as string
      setAvatarPreview(base64String)

      try {
        const res = await uploadAvatar({ data: { userId: user.id, avatarUrl: base64String } })
        if (res.success) {
          setAvatarSuccess('Avatar updated in storage successfully!')
          await refreshDb()
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsAvatarLoading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="select-none">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <User className="h-6 w-6 text-indigo-500" />
          My Profile Settings
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Manage your account profile picture, update password credentials, and customize settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Profile Info & Storage Avatar Upload */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm text-center space-y-4">
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider select-none">
              Profile Avatar
            </h3>
            
            <div className="relative inline-block select-none">
              <img
                src={avatarPreview || user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={user.name}
                className="h-28 w-28 rounded-full object-cover ring-4 ring-indigo-500/10 mx-auto"
              />
              {isAvatarLoading && (
                <div className="absolute inset-0 bg-neutral-950/60 rounded-full flex items-center justify-center">
                  <span className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {avatarSuccess && (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl flex items-start gap-2 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span className="text-[10px] leading-normal font-medium">{avatarSuccess}</span>
              </div>
            )}

            {/* Avatar Input File */}
            <div className="relative border-2 border-dashed border-neutral-200 dark:border-neutral-800 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-xl p-4 transition-all text-center select-none cursor-pointer">
              <input
                type="file"
                onChange={handleAvatarChange}
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="h-5 w-5 text-neutral-400 mx-auto" />
              <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 block mt-1.5">
                Upload New Image
              </span>
            </div>
            
            <div className="text-left pt-2 space-y-1.5 select-none">
              <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wide">Full Name</div>
              <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{user.name}</div>
              <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wide mt-2">Email Address</div>
              <div className="text-xs text-neutral-700 dark:text-neutral-300 truncate">{user.email}</div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Change Password */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider flex items-center gap-1.5 select-none">
              <KeyRound className="h-4.5 w-4.5 text-indigo-500" /> Change Credentials Password
            </h3>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {passError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-xl flex items-start gap-2 text-red-700 dark:text-red-300">
                  <BadgeAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="text-xs leading-normal font-medium">{passError}</span>
                </div>
              )}
              {passSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl flex items-start gap-2 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="text-xs leading-normal font-medium">{passSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-1.5 select-none">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs text-neutral-850 dark:text-white placeholder-neutral-450 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-1.5 select-none">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs text-neutral-850 dark:text-white placeholder-neutral-450 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isPassLoading}
                className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-xl shadow transition-colors flex items-center justify-center gap-2 select-none disabled:opacity-50"
              >
                {isPassLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}
