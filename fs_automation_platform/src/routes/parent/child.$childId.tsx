import * as React from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { AuthContext } from '../__root'
import { ArrowLeft, Calendar, FileText, CheckCircle2, AlertTriangle, Download, Award } from 'lucide-react'

export const Route = createFileRoute('/parent/child/$childId')({
  component: ChildProgress,
})

function ChildProgress() {
  const auth = React.useContext(AuthContext)
  const navigate = useNavigate()
  const { childId } = Route.useParams()
  const [downloading, setDownloading] = React.useState(false)

  React.useEffect(() => {
    if (!auth?.user || auth.user.role !== 'parent') {
      navigate({ to: '/' })
    }
  }, [auth, navigate])

  if (!auth || !auth.user || !auth.db) return null
  const { db } = auth

  // Verify child is linked to this parent
  if (!auth.user.linkedChildren?.includes(childId)) {
    return (
      <div className="p-8 text-center text-sm text-neutral-500 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md mx-auto">
        Unauthorized access to student record.
        <div className="mt-4">
          <Link to="/parent/dashboard" className="text-xs text-indigo-600 hover:underline">Return to Dashboard</Link>
        </div>
      </div>
    )
  }

  // Get student details
  const child = db.users?.find((u: any) => u.id === childId)
  if (!child) {
    return (
      <div className="p-8 text-center text-xs text-neutral-500">
        Student record not found.
      </div>
    )
  }

  // Get attendance
  const attendance = db.attendance?.filter((a: any) => a.studentId === child.id) || []
  
  // Get submissions
  const submissions = db.submissions?.filter((s: any) => s.studentId === child.id) || []

  const handleDownloadReport = () => {
    setDownloading(true)
    setTimeout(() => {
      setDownloading(false)
      
      // Simulate file download by creating a fake report card
      const element = document.createElement('a')
      const file = new Blob([
        `FACULTYFLOW REPORT CARD - ACADEMIC YEAR 2026\n` +
        `=============================================\n` +
        `Student Name: ${child.name}\n` +
        `Student Code: ${child.studentCode}\n` +
        `Current Semester: Semester 4\n` +
        `GPA Cumulative: ${child.gpa}\n` +
        `=============================================\n` +
        attendance.map((a: any) => `${a.subject}: Attendance ${Math.round((a.present/a.total)*100)}%, Present: ${a.present}/${a.total}`).join('\n') +
        `\n=============================================\n` +
        `STATUS: ELIGIBLE FOR ADVANCEMENT`
      ], {type: 'text/plain'})
      element.href = URL.createObjectURL(file)
      element.download = `${child.name.replace(' ', '_')}_ReportCard.txt`
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    }, 1500)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Back Button */}
      <div className="flex items-center gap-3 select-none">
        <Link
          to="/parent/dashboard"
          className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 text-neutral-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-neutral-850 dark:text-white">Academic Tracking Profile</h1>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Detailed overview of attendance, assignments and grades.</p>
        </div>
      </div>

      {/* Child Information Header Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
          <img
            src={child.avatar || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'}
            alt={child.name}
            className="h-16 w-16 rounded-full object-cover ring-2 ring-indigo-500/20"
          />
          <div className="space-y-1">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">{child.name}</h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 justify-center sm:justify-start text-xs text-neutral-500 dark:text-neutral-400 select-none">
              <span>ID Code: <strong className="font-semibold text-neutral-800 dark:text-neutral-200">{child.studentCode}</strong></span>
              <span>•</span>
              <span>Current Term: Sem 4</span>
              <span>•</span>
              <span className="flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400"><Award className="h-3.5 w-3.5" /> GPA: {child.gpa}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleDownloadReport}
          disabled={downloading}
          className="w-full sm:w-auto py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-xs font-bold text-white rounded-xl shadow transition-colors flex items-center justify-center gap-2 select-none"
        >
          {downloading ? (
            <>
              <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" /> Download Report Card
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Attendance Breakdown Column */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm lg:col-span-1 space-y-4">
          <h3 className="text-sm font-bold text-neutral-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5 select-none">
            <Calendar className="h-4.5 w-4.5 text-indigo-500" /> Attendance Ledger
          </h3>
          
          <div className="space-y-4">
            {attendance.map((item: any) => {
              const itemPercent = Math.round((item.present / item.total) * 100)
              return (
                <div key={item.subject} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-neutral-700 dark:text-neutral-300 truncate max-w-[150px]">{item.subject}</span>
                    <span className={itemPercent >= 75 ? 'text-emerald-600' : 'text-amber-600'}>{itemPercent}%</span>
                  </div>
                  <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${itemPercent >= 75 ? 'bg-indigo-600' : 'bg-amber-500'}`}
                      style={{ width: `${itemPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-neutral-400">
                    <span>{item.present}/{item.total} lectures attended</span>
                    {itemPercent < 75 && (
                      <span className="text-amber-600 dark:text-amber-400 flex items-center gap-0.5"><AlertTriangle className="h-3 w-3" /> Shortage</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Assignments Submissions & AI Grades */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-neutral-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5 select-none">
            <FileText className="h-4.5 w-4.5 text-indigo-500" /> Work Submissions ({submissions.length})
          </h3>
          
          {submissions.length === 0 ? (
            <div className="text-center py-12 text-xs text-neutral-400">
              No assignment submissions recorded for this semester.
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {submissions.map((sub: any) => {
                const a = db.assignments?.find((asg: any) => asg.id === sub.assignmentId)
                return (
                  <div
                    key={sub.id}
                    className="p-4 border border-neutral-100 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/30 space-y-2.5 text-left"
                  >
                    <div className="flex justify-between items-center select-none">
                      <div>
                        <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded">
                          {a?.subject}
                        </span>
                        <h4 className="text-xs font-bold text-neutral-850 dark:text-white mt-1.5">{a?.title}</h4>
                      </div>
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded border border-emerald-100 dark:border-emerald-900/40">
                        Grade: {sub.grade}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 p-2.5 rounded-lg whitespace-pre-wrap font-mono">
                      {sub.content}
                    </div>

                    {sub.feedback && (
                      <div className="text-[11px] text-neutral-600 dark:text-neutral-400 border-l-2 border-indigo-500 pl-3 leading-relaxed">
                        <strong className="text-indigo-600 dark:text-indigo-400 font-bold block text-[10px] uppercase select-none">Tutor Review / AI Evaluator</strong>
                        {sub.feedback}
                      </div>
                    )}
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
