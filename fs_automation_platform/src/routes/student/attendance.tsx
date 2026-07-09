import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AuthContext } from '../__root'
import { CheckCircle2, XCircle, AlertTriangle, Calendar } from 'lucide-react'

export const Route = createFileRoute('/student/attendance')({
  component: StudentAttendance,
})

function StudentAttendance() {
  const auth = React.useContext(AuthContext)
  const navigate = useNavigate()
  const [selectedSubject, setSelectedSubject] = React.useState<string>('all')

  React.useEffect(() => {
    if (!auth?.user || auth.user.role !== 'student') {
      navigate({ to: '/' })
    }
  }, [auth, navigate])

  if (!auth || !auth.user || !auth.db) return null
  const { user, db } = auth

  // Get student attendance
  const studentAttendance = db.attendance?.filter((a: any) => a.studentId === user.id) || []
  
  // Filter logs
  const logs = db.attendanceLogs?.filter(
    (log: any) => log.studentId === user.id && (selectedSubject === 'all' || log.subject === selectedSubject)
  ) || []

  // Subjects lists
  const subjects = ['all', ...Array.from(new Set(studentAttendance.map((a: any) => a.subject))) as string[]]

  const getAttendanceStats = () => {
    if (selectedSubject === 'all') {
      const present = studentAttendance.reduce((acc: number, curr: any) => acc + curr.present, 0)
      const total = studentAttendance.reduce((acc: number, curr: any) => acc + curr.total, 0)
      return { present, total, percent: total > 0 ? Math.round((present / total) * 100) : 0 }
    } else {
      const item = studentAttendance.find((a: any) => a.subject === selectedSubject)
      return {
        present: item ? item.present : 0,
        total: item ? item.total : 0,
        percent: item && item.total > 0 ? Math.round((item.present / item.total) * 100) : 0
      }
    }
  }

  const { present, total, percent } = getAttendanceStats()

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-6 w-6 text-indigo-500" />
            My Attendance Tracker
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Check subject wise attendance statistics and daily log history.
          </p>
        </div>

        {/* Subject Filter Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Subject:</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub === 'all' ? 'All Subjects' : sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Present Card */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm text-center">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Present Lectures</span>
          <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">{present}</div>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 inline-block">attended regularly</span>
        </div>

        {/* Absent Card */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm text-center">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Absent Lectures</span>
          <div className="text-3xl font-extrabold text-neutral-500 dark:text-neutral-400 mt-2">{total - present}</div>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 inline-block">missed class</span>
        </div>

        {/* Percentage Card */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm text-center relative overflow-hidden">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Attendance Percentage</span>
          <div className={`text-3xl font-extrabold mt-2 ${percent >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {percent}%
          </div>
          <span className="text-xs mt-1 inline-flex items-center gap-1 font-medium">
            {percent >= 75 ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5"><CheckCircle2 className="h-3 w-3" /> Safe Status</span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-0.5"><AlertTriangle className="h-3 w-3" /> Shortage Warning</span>
            )}
          </span>
        </div>
      </div>

      {/* Grid: Shortage Warning Details & Logs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Subjects breakdown list */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm md:col-span-1 space-y-4">
          <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">Subject Breakdown</h3>
          <div className="space-y-3">
            {studentAttendance.map((item: any) => {
              const itemPercent = Math.round((item.present / item.total) * 100)
              return (
                <div key={item.subject} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-neutral-700 dark:text-neutral-300 truncate max-w-[120px]">{item.subject}</span>
                    <span className={itemPercent >= 75 ? 'text-emerald-600' : 'text-amber-600'}>{itemPercent}%</span>
                  </div>
                  <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${itemPercent >= 75 ? 'bg-indigo-600' : 'bg-amber-500'}`}
                      style={{ width: `${itemPercent}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    {item.present}/{item.total} lectures attended
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Daily Log list */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm md:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">Attendance Logs</h3>
          
          {logs.length === 0 ? (
            <div className="text-center py-12 text-xs text-neutral-400">
              No recent attendance logs recorded.
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-96 overflow-y-auto pr-1">
              {logs.map((log: any, idx: number) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{log.subject}</div>
                    <div className="text-[10px] text-neutral-400 dark:text-neutral-500">Date: {log.date}</div>
                  </div>
                  <div>
                    {log.status === 'present' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/40">
                        <CheckCircle2 className="h-3 w-3" /> PRESENT
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-full border border-red-100 dark:border-red-900/40">
                        <XCircle className="h-3 w-3" /> ABSENT
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
