import * as React from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { AuthContext } from '../__root'
import { linkChild } from '~/utils/db'
import { Users, UserPlus, GraduationCap, ChevronRight, CheckCircle2, ShieldAlert } from 'lucide-react'

export const Route = createFileRoute('/parent/dashboard')({
  component: ParentDashboard,
})

function ParentDashboard() {
  const auth = React.useContext(AuthContext)
  const navigate = useNavigate()
  
  const [studentCode, setStudentCode] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    if (!auth?.user || auth.user.role !== 'parent') {
      navigate({ to: '/' })
    }
  }, [auth, navigate])

  if (!auth || !auth.user || !auth.db) return null
  const { user, db, refreshDb } = auth

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    try {
      const res = await linkChild({
        data: {
          parentId: user.id,
          studentCode: studentCode.trim()
        }
      })
      
      if (res.success && res.student) {
        setSuccess(`Successfully linked to child: ${res.student.name}!`)
        setStudentCode('')
        await refreshDb()
      } else {
        setError(res.error || 'Failed to link child. Check student code.')
      }
    } catch (err) {
      setError('An error occurred during linking.')
    } finally {
      setIsLoading(false)
    }
  }

  // Get children details
  const childrenList = db.users?.filter(
    (u: any) => u.role === 'student' && user.linkedChildren?.includes(u.id)
  ) || []

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="select-none">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Users className="h-6 w-6 text-indigo-500" />
          Parent Portal
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Monitor linked student academic progress, attendance compliance, and view school announcements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Link Child Card */}
        <div className="md:col-span-1 space-y-6 select-none">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus className="h-4.5 w-4.5 text-indigo-500" /> Link Student
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-normal">
              Enter the unique student code provided by the administrator (e.g. <strong className="font-semibold text-indigo-500">STU102</strong>) to link your account.
            </p>

            <form onSubmit={handleLink} className="space-y-3">
              {error && (
                <div className="p-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-xl flex items-start gap-2 text-red-700 dark:text-red-300">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-normal font-medium">{error}</span>
                </div>
              )}
              {success && (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl flex items-start gap-2 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-normal font-medium">{success}</span>
                </div>
              )}

              <div>
                <input
                  type="text"
                  required
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  placeholder="Student Code (STU102)"
                  className="block w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs text-neutral-800 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all uppercase"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-xs font-bold text-white rounded-xl shadow transition-colors"
              >
                {isLoading ? 'Linking...' : 'Link Child'}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Linked Children List */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider select-none">
            Linked Students ({childrenList.length})
          </h3>

          {childrenList.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center text-xs text-neutral-550 dark:text-neutral-400 select-none">
              No students linked to this account. Use the student code entry form on the left to add your children.
            </div>
          ) : (
            <div className="space-y-4">
              {childrenList.map((child: any) => {
                // Calculate attendance percent for this child
                const childAttendance = db.attendance?.filter((a: any) => a.studentId === child.id) || []
                const present = childAttendance.reduce((acc: number, curr: any) => acc + curr.present, 0)
                const total = childAttendance.reduce((acc: number, curr: any) => acc + curr.total, 0)
                const attendancePercent = total > 0 ? Math.round((present / total) * 100) : 0

                return (
                  <div
                    key={child.id}
                    className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={child.avatar || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'}
                        alt={child.name}
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-indigo-500/20 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-neutral-850 dark:text-white truncate">{child.name}</h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-neutral-500 dark:text-neutral-400 select-none">
                          <span>Code: {child.studentCode}</span>
                          <span>•</span>
                          <span>Sem 4 GPA: <strong className="font-semibold text-neutral-850 dark:text-white">{child.gpa}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-100 dark:border-neutral-800 select-none">
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 block uppercase font-bold tracking-wide">Attendance</span>
                        <span className={`text-base font-extrabold ${attendancePercent >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {attendancePercent}%
                        </span>
                      </div>
                      
                      <Link
                        to="/parent/child/$childId"
                        params={{ childId: child.id }}
                        className="ml-auto sm:ml-0 inline-flex items-center gap-1 py-2 px-4 bg-indigo-50 dark:bg-indigo-950/20 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/40 rounded-xl transition-colors"
                      >
                        Academic Profile <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
