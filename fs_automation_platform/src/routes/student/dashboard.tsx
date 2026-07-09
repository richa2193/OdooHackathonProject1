import * as React from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { AuthContext } from '../__root'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { 
  GraduationCap, 
  Calendar, 
  FileText, 
  AlertCircle, 
  ChevronRight, 
  BookOpen, 
  CheckCircle2 
} from 'lucide-react'

export const Route = createFileRoute('/student/dashboard')({
  component: StudentDashboard,
})

function StudentDashboard() {
  const auth = React.useContext(AuthContext)
  const navigate = useNavigate()

  React.useEffect(() => {
    if (!auth?.user || auth.user.role !== 'student') {
      navigate({ to: '/' })
    }
  }, [auth, navigate])

  if (!auth || !auth.user || !auth.db) return null
  const { user, db } = auth

  // Get student attendance
  const studentAttendance = db.attendance?.filter((a: any) => a.studentId === user.id) || []
  
  // Calculate total attendance %
  const totalPresent = studentAttendance.reduce((acc: number, curr: any) => acc + curr.present, 0)
  const totalClasses = studentAttendance.reduce((acc: number, curr: any) => acc + curr.total, 0)
  const attendancePercent = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0

  // Subjects with attendance shortage (< 75%)
  const shortageSubjects = studentAttendance.filter((s: any) => (s.present / s.total) < 0.75)

  // Get student submissions to find pending assignments
  const submissions = db.submissions?.filter((s: any) => s.studentId === user.id) || []
  const pendingAssignments = db.assignments?.filter(
    (a: any) => !submissions.find((s: any) => s.assignmentId === a.id)
  ) || []

  // Get today's classes from timetable
  // In demo mode we assume today is Monday
  const todayClasses = db.timetable?.filter((t: any) => t.day === 'Monday') || []

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center pr-6">
          <GraduationCap className="h-64 w-64" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'}
            alt={user.name}
            className="h-16 w-16 md:h-20 md:w-20 rounded-full object-cover ring-4 ring-white/30"
          />
          <div className="text-center sm:text-left space-y-1">
            <span className="text-indigo-200 text-xs font-bold tracking-widest uppercase">Student Portal</span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Welcome, {user.name}!</h1>
            <p className="text-indigo-100 text-sm">
              Student Code: <strong className="font-semibold text-white">{user.studentCode}</strong> | GPA Sem 4: <strong className="font-semibold text-white">{user.gpa}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Attendance Shortage Warning Banner */}
      {shortageSubjects.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4 flex items-start gap-3 shadow-sm animate-in fade-in duration-300">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">Attendance Shortage Alert</h4>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
              You are below the 75% attendance requirement in: <strong className="font-semibold">{shortageSubjects.map((s: any) => `${s.subject} (${Math.round((s.present/s.total)*100)}%)`).join(', ')}</strong>. Please attend regular classes to avoid shortages.
            </p>
          </div>
        </div>
      )}

      {/* Grid Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Classes & Timetable */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Lectures */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-500" />
                Today's Lectures
              </h3>
              <Link to="/student/timetable" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center hover:underline">
                View Timetable <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            
            {todayClasses.length === 0 ? (
              <div className="text-center py-6 text-sm text-neutral-500 dark:text-neutral-400">
                No classes scheduled for today.
              </div>
            ) : (
              <div className="space-y-3.5">
                {todayClasses.map((c: any) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700 transition-all flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/30"
                  >
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{c.subject}</div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {c.time} • Room: <strong className="font-semibold text-neutral-700 dark:text-neutral-300">{c.room}</strong>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
                        {c.teacher.split(' ').slice(-1)[0]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Performance chart */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <LineChart className="h-5 w-5 text-indigo-500" />
                GPA Progress Trend
              </h3>
              <Link to="/student/performance" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center hover:underline">
                Analysis <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="h-64 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={user.gpaHistory || []}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" className="hidden dark:block" />
                  <XAxis dataKey="semester" stroke="#9ca3af" />
                  <YAxis domain={[0, 10]} stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: '#111827'
                    }}
                    itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="gpa"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Attendance & Assignments */}
        <div className="space-y-6">
          {/* Circular Attendance Gauge */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm text-center flex flex-col items-center">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-6 self-start">
              Overall Attendance
            </h3>
            
            <div className="relative h-32 w-32 flex items-center justify-center select-none">
              {/* SVG Ring Gauge */}
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="52"
                  className="stroke-neutral-100 dark:stroke-neutral-800 fill-none"
                  strokeWidth="10"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="52"
                  className={`fill-none transition-all duration-1000 ${
                    attendancePercent >= 75
                      ? 'stroke-indigo-600 dark:stroke-indigo-500'
                      : 'stroke-amber-500 dark:stroke-amber-600'
                  }`}
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  strokeDashoffset={`${2 * Math.PI * 52 * (1 - attendancePercent / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="flex flex-col items-center justify-center space-y-0.5 z-10">
                <span className="text-3xl font-extrabold text-neutral-850 dark:text-white">{attendancePercent}%</span>
                <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Present</span>
              </div>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-6 max-w-xs">
              Checked in for <strong className="font-semibold text-neutral-700 dark:text-neutral-300">{totalPresent}</strong> out of <strong className="font-semibold text-neutral-700 dark:text-neutral-300">{totalClasses}</strong> lectures this semester.
            </p>
            <Link
              to="/student/attendance"
              className="mt-4 w-full py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors"
            >
              Analyze Log
            </Link>
          </div>

          {/* Pending Assignments */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-indigo-500" />
                Pending Actions
              </h3>
              <span className="text-[10px] font-bold text-white bg-indigo-600 px-2 py-0.5 rounded-full">
                {pendingAssignments.length}
              </span>
            </div>
            
            {pendingAssignments.length === 0 ? (
              <div className="text-center py-6 text-xs text-neutral-500 dark:text-neutral-400 flex flex-col items-center gap-1.5">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                All caught up! No pending assignments.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingAssignments.map((a: any) => (
                  <div
                    key={a.id}
                    className="p-3.5 border border-neutral-100 dark:border-neutral-800 rounded-xl hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-all space-y-1.5 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                        {a.subject}
                      </span>
                      <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                        Due: {a.dueDate}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 line-clamp-1">
                      {a.title}
                    </h4>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1">
                      {a.description}
                    </p>
                    <Link
                      to="/student/assignments"
                      className="inline-flex items-center text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline pt-1"
                    >
                      Submit Now <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
