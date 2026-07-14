import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AuthContext } from '../__root'
import { Calendar, CheckCircle2, AlertCircle } from 'lucide-react'

export const Route = createFileRoute('/faculty/attendance')({
  component: FacultyAttendance,
})

function FacultyAttendance() {
  const auth = React.useContext(AuthContext)
  const navigate = useNavigate()
  
  const [subject, setSubject] = React.useState('Web Development')
  const [selectedStudent, setSelectedStudent] = React.useState('student1')
  const [status, setStatus] = React.useState<'present' | 'absent'>('present')
  const [success, setSuccess] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!auth?.user || auth.user.role !== 'faculty') {
      navigate({ to: '/' })
    }
  }, [auth, navigate])

  if (!auth || !auth.user || !auth.db) return null
  const { db, refreshDb } = auth

  const studentsList = db.users?.filter((u: any) => u.role === 'student') || []

  const handleRegisterAttendance = (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(null)

    const dateStr = new Date().toISOString().split('T')[0]
    
    // Check if log already exists for this student + subject + date
    const exists = db.attendanceLogs?.some(
      (log: any) => log.studentId === selectedStudent && log.subject === subject && log.date === dateStr
    )

    if (exists) {
      setSuccess('Attendance already registered for this student today.')
      return
    }

    // 1. Add log
    if (!db.attendanceLogs) db.attendanceLogs = []
    db.attendanceLogs.push({
      studentId: selectedStudent,
      date: dateStr,
      subject,
      status
    })

    // 2. Update summary count
    const record = db.attendance?.find(
      (a: any) => a.studentId === selectedStudent && a.subject === subject
    )

    if (record) {
      record.total += 1
      if (status === 'present') record.present += 1
    } else {
      if (!db.attendance) db.attendance = []
      db.attendance.push({
        studentId: selectedStudent,
        subject,
        present: status === 'present' ? 1 : 0,
        total: 1
      })
    }

    // 3. Write and notify student
    const student = studentsList.find((s: any) => s.id === selectedStudent)
    db.notifications.push({
      id: 'notif_att_' + Date.now(),
      userId: selectedStudent,
      title: 'Attendance Registered',
      content: `Your attendance for '${subject}' on ${dateStr} was marked as '${status.toUpperCase()}'.`,
      unread: true,
      timestamp: new Date().toISOString()
    })

    auth.refreshDb()
    setSuccess(`Successfully marked ${student?.name} as ${status.toUpperCase()}!`)
  }

  // Get active logs to show history
  const historyLogs = db.attendanceLogs || []

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="select-none">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Calendar className="h-6 w-6 text-indigo-500" />
          Manage Attendance Sheet
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Register student presence for active lecture batches.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Register Attendance Form */}
        <div className="md:col-span-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-neutral-850 dark:text-white uppercase tracking-wider select-none">Mark Roll Call</h3>

          {success && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-800/40 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-1.5 leading-normal font-medium animate-in fade-in duration-200 select-none">
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleRegisterAttendance} className="space-y-3.5 select-none">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-1.5">
                Lecture Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="block w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs text-neutral-800 dark:text-white focus:outline-none"
              >
                <option value="Web Development">Web Development</option>
                <option value="Database Systems">Database Systems</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Computer Networks">Computer Networks</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-1.5">
                Select Student
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="block w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs text-neutral-800 dark:text-white focus:outline-none"
              >
                {studentsList.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.studentCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-1.5">
                Attendance Status
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('present')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                    status === 'present'
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'border-neutral-250 text-neutral-500 hover:text-neutral-750 dark:border-neutral-750'
                  }`}
                >
                  PRESENT
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('absent')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                    status === 'absent'
                      ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                      : 'border-neutral-250 text-neutral-500 hover:text-neutral-750 dark:border-neutral-750'
                  }`}
                >
                  ABSENT
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" /> Register Attendance
            </button>
          </form>
        </div>

        {/* Attendance Registry Logs */}
        <div className="md:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-neutral-850 dark:text-white uppercase tracking-wider select-none">
            Recent Attendance Ledger Logs
          </h3>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-[350px] overflow-y-auto pr-1">
            {historyLogs.length === 0 ? (
              <div className="text-center py-12 text-xs text-neutral-450">
                No logs recorded yet.
              </div>
            ) : (
              historyLogs.slice().reverse().map((log: any, idx: number) => {
                const s = studentsList.find((stud: any) => stud.id === log.studentId)
                return (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                        {s?.name || 'Unknown Student'}
                      </div>
                      <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
                        Subject: {log.subject} • Date: {log.date}
                      </div>
                    </div>
                    <div>
                      {log.status === 'present' ? (
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/40 select-none">
                          PRESENT
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-red-650 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded border border-red-100 dark:border-red-900/40 select-none">
                          ABSENT
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
