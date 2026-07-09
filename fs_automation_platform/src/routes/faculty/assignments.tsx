import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AuthContext } from '../__root'
import { FileText, CheckCircle2, AlertCircle, Clock, BookOpen } from 'lucide-react'

export const Route = createFileRoute('/faculty/assignments')({
  component: FacultyAssignments,
})

function FacultyAssignments() {
  const auth = React.useContext(AuthContext)
  const navigate = useNavigate()
  
  const [selectedSub, setSelectedSub] = React.useState<any>(null)
  const [grade, setGrade] = React.useState('A')
  const [feedback, setFeedback] = React.useState('')
  const [success, setSuccess] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!auth?.user || auth.user.role !== 'faculty') {
      navigate({ to: '/' })
    }
  }, [auth, navigate])

  if (!auth || !auth.user || !auth.db) return null
  const { db, refreshDb } = auth

  // Get all submissions
  const submissionsList = db.submissions || []
  const students = db.users?.filter((u: any) => u.role === 'student') || []
  const assignments = db.assignments || []

  const handleGradeSubmission = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSub) return
    setSuccess(null)

    // Find submission in db
    const subRecord = db.submissions?.find((s: any) => s.id === selectedSub.id)
    if (subRecord) {
      subRecord.status = 'graded'
      subRecord.grade = grade
      subRecord.feedback = feedback

      // Notify student
      const asgTitle = assignments.find((a: any) => a.id === selectedSub.assignmentId)?.title || 'Assignment'
      db.notifications.push({
        id: 'notif_grade_' + Date.now(),
        userId: selectedSub.studentId,
        title: '📝 Assignment Graded',
        content: `Your tutor Sarah Jenkins evaluated your submission for '${asgTitle}' with grade '${grade}'.`,
        unread: true,
        timestamp: new Date().toISOString()
      })

      // Notify linked parent
      const parents = db.users?.filter(
        (u: any) => u.role === 'parent' && u.linkedChildren?.includes(selectedSub.studentId)
      )
      parents?.forEach((p: any) => {
        db.notifications.push({
          id: 'notif_grade_p_' + Date.now() + '_' + p.id,
          userId: p.id,
          title: '📝 Child Assignment Graded',
          content: `Tutor Sarah Jenkins graded your child's assignment '${asgTitle}' with grade '${grade}'.`,
          unread: true,
          timestamp: new Date().toISOString()
        })
      })

      auth.refreshDb()
      setSuccess('Successfully submitted grade and feedback!')
      setSelectedSub(subRecord)
      setFeedback('')
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="select-none">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <FileText className="h-6 w-6 text-indigo-500" />
          Student Work Evaluator
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Review written code, papers, and zip file submissions. Assign semantic grades and detailed feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Submissions List */}
        <div className="md:col-span-1 space-y-3 select-none">
          <h3 className="text-sm font-bold text-neutral-805 dark:text-neutral-200 uppercase tracking-wider">Submissions Feed</h3>
          
          {submissionsList.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 text-center text-xs text-neutral-450">
              No submissions recorded.
            </div>
          ) : (
            submissionsList.map((sub: any) => {
              const studentName = students.find((s: any) => s.id === sub.studentId)?.name || 'Unknown student'
              const asgTitle = assignments.find((a: any) => a.id === sub.assignmentId)?.title || 'Assignment'
              
              return (
                <button
                  key={sub.id}
                  onClick={() => {
                    setSelectedSub(sub)
                    setGrade(sub.grade || 'A')
                    setFeedback(sub.feedback || '')
                    setSuccess(null)
                  }}
                  className={`w-full p-4 text-left border rounded-2xl transition-all ${
                    selectedSub?.id === sub.id
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/10 dark:bg-neutral-800/80 shadow-sm'
                      : 'border-neutral-200 dark:border-neutral-850 bg-white dark:bg-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase truncate max-w-[120px]">{asgTitle}</span>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                      sub.status === 'graded' 
                        ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20' 
                        : 'text-amber-600 bg-amber-50 dark:bg-amber-950/20'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mt-2 truncate">{studentName}</h4>
                  <div className="text-[10px] text-neutral-450 mt-1">Submitted: {sub.submittedAt}</div>
                </button>
              )
            })
          )}
        </div>

        {/* Evaluation Board */}
        <div className="md:col-span-2">
          {selectedSub ? (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm space-y-4">
              
              {/* Header */}
              <div className="flex justify-between items-start select-none">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-405 uppercase">
                    {assignments.find((a: any) => a.id === selectedSub.assignmentId)?.subject}
                  </span>
                  <h2 className="text-base font-bold text-neutral-850 dark:text-white mt-1">
                    {assignments.find((a: any) => a.id === selectedSub.assignmentId)?.title}
                  </h2>
                  <div className="text-[11px] text-neutral-500 mt-1">
                    Submitted by: <strong className="font-semibold">{students.find((s: any) => s.id === selectedSub.studentId)?.name}</strong>
                  </div>
                </div>
                
                {selectedSub.status === 'graded' && (
                  <span className="text-sm font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1 rounded border border-emerald-100 dark:border-emerald-900/40">
                    Grade: {selectedSub.grade}
                  </span>
                )}
              </div>

              <hr className="border-neutral-100 dark:border-neutral-800" />

              {/* Submissions Content */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-neutral-700 dark:text-neutral-300 select-none">Submitted Code & Explanations</h4>
                <div className="p-3 bg-neutral-50 dark:bg-neutral-850/40 border border-neutral-150 dark:border-neutral-800 rounded-xl text-xs text-neutral-700 dark:text-neutral-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {selectedSub.content}
                </div>
                {selectedSub.fileName && (
                  <div className="flex items-center gap-2 p-2 bg-indigo-50/10 dark:bg-neutral-800/30 border border-indigo-50/20 dark:border-neutral-800 rounded-lg text-xs max-w-xs select-none">
                    <BookOpen className="h-4 w-4 text-indigo-500" />
                    <span className="text-neutral-700 dark:text-neutral-300 truncate font-semibold">{selectedSub.fileName}</span>
                  </div>
                )}
              </div>

              {/* Grade Submission Form */}
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
                <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider select-none">Evaluation Panel</h3>
                
                {success && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-800/40 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-1.5 leading-normal font-medium select-none">
                    <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                    <span>{success}</span>
                  </div>
                )}

                <form onSubmit={handleGradeSubmission} className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 select-none">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-1.5">
                        Assign Grade
                      </label>
                      <select
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="block w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs text-neutral-800 dark:text-white focus:outline-none"
                      >
                        <option value="A">Grade A (Excellent)</option>
                        <option value="B+">Grade B+ (Very Good)</option>
                        <option value="B">Grade B (Good)</option>
                        <option value="C">Grade C (Needs Work)</option>
                        <option value="F">Grade F (Failed)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-1.5 select-none">
                      Tutor Evaluation Feedback
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Write evaluation review criteria remarks..."
                      className="block w-full px-4 py-2.5 rounded-xl border border-neutral-305 dark:border-neutral-700 bg-transparent text-xs text-neutral-850 dark:text-white placeholder-neutral-450 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-xl shadow transition-colors flex items-center gap-1.5 select-none"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Submit Evaluation
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center text-xs text-neutral-500 dark:text-neutral-400 shadow-sm select-none">
              Select a student submission from the feed list on the left to start grading.
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
