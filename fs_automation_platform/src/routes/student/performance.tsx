import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AuthContext } from '../__root'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import { LineChart, Line } from 'recharts'
import { LineChart as ChartIcon, BrainCircuit, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react'

export const Route = createFileRoute('/student/performance')({
  component: StudentPerformance,
})

function StudentPerformance() {
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

  // Map attendance logs and grades
  // Ayushi Sharma has Web Dev (Present 18/20 = 90%, Grade: A), Database (Present 17/20 = 85%, Grade: B), AI (Present 12/20 = 60%, Grade: B)
  const performanceData = [
    { subject: 'Web Dev', attendancePercent: 90, gradePoint: 9.0, label: 'A' },
    { subject: 'Database Systems', attendancePercent: 85, gradePoint: 8.0, label: 'B+' },
    { subject: 'Artificial Intelligence', attendancePercent: 60, gradePoint: 7.0, label: 'B' },
    { subject: 'Computer Networks', attendancePercent: 95, gradePoint: 9.0, label: 'A' }
  ]

  // Construct Radar data
  const radarData = performanceData.map(p => ({
    subject: p.subject,
    Grade: p.gradePoint * 10, // scale to 100 for visual comparison
    Attendance: p.attendancePercent
  }))

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="select-none">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <ChartIcon className="h-6 w-6 text-indigo-500" />
          My Academic Performance
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Review semantic GPA records, subject progress statistics, and AI performance reports.
          </p>
      </div>

      {/* Grid: Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GPA Progress Trend Line Chart */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5 select-none">
            <TrendingUp className="h-4 w-4 text-indigo-500" /> Semester GPA Progress
          </h3>
          <div className="h-60 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={user.gpaHistory || []} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" className="hidden dark:block" />
                <XAxis dataKey="semester" stroke="#9ca3af" />
                <YAxis domain={[0, 10]} stroke="#9ca3af" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="gpa"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade vs Attendance Radar / Bar Chart */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5 select-none">
            <Sparkles className="h-4 w-4 text-indigo-500" /> Attendance vs Grade Points
          </h3>
          <div className="h-60 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performanceData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" className="hidden dark:block" />
                <XAxis dataKey="subject" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Legend />
                <Bar dataKey="attendancePercent" name="Attendance %" fill="#818cf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gradePoint" name="Grade Point (Out of 10)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Performance Insight Report Card */}
      <div className="bg-gradient-to-br from-indigo-50/50 to-indigo-100/10 dark:from-neutral-900/50 dark:to-neutral-900/20 border border-indigo-100/60 dark:border-neutral-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start">
        <div className="p-3 bg-white dark:bg-neutral-800 rounded-2xl shrink-0 shadow-sm border border-indigo-50 dark:border-neutral-700/50 select-none">
          <BrainCircuit className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="space-y-1 select-none">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">System Report</span>
            <h2 className="text-base font-bold text-neutral-850 dark:text-white">AI Performance Insight Summary</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 select-none">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Key Strengths
              </h4>
              <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5 pl-3.5 list-disc leading-relaxed">
                <li>Excellent architectural styling in <strong className="font-semibold text-neutral-800 dark:text-neutral-300">Web Development</strong> (Grade A).</li>
                <li>Highly consistent class attendance in <strong className="font-semibold text-neutral-800 dark:text-neutral-300">Computer Networks</strong> (95% attendance).</li>
                <li>Logical database optimization skills are above average.</li>
              </ul>
            </div>

            {/* Weaknesses / Improvements */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 select-none">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" /> Areas of Improvement
              </h4>
              <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5 pl-3.5 list-disc leading-relaxed">
                <li>Critical attendance warning in <strong className="font-semibold text-neutral-800 dark:text-neutral-300">Artificial Intelligence</strong> (currently at 60%).</li>
                <li>Lack of attendance impairs physical lab evaluation score compliance.</li>
                <li>Submit the pending Linear Regression classifier assignment on time to avoid grade drops.</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-white dark:bg-neutral-850 border border-neutral-100 dark:border-neutral-800/80 rounded-xl p-3 flex gap-2 items-start shadow-sm">
            <ShieldAlert className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal">
              <strong>Recommendation:</strong> Attending the next AI lecture on Wednesday (09:00 AM) and submitting the classifier assignment is expected to raise your AI grade point to 8.0+ and resolve eligibility concerns.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
