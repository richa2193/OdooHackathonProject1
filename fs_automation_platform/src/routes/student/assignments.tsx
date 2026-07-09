import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AuthContext } from '../__root'
import { submitAssignment } from '~/utils/db'
import { FileText, CheckCircle2, AlertCircle, Clock, UploadCloud, BrainCircuit } from 'lucide-react'

export const Route = createFileRoute('/student/assignments')({
  component: StudentAssignments,
})

function StudentAssignments() {
  const auth = React.useContext(AuthContext)
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = React.useState<'pending' | 'graded'>('pending')
  const [selectedAsg, setSelectedAsg] = React.useState<any>(null)
  const [content, setContent] = React.useState('')
  const [fileName, setFileName] = React.useState('')
  const [isGrading, setIsGrading] = React.useState(false)
  const [gradingResult, setGradingResult] = React.useState<any>(null)

  React.useEffect(() => {
    if (!auth?.user || auth.user.role !== 'student') {
      navigate({ to: '/' })
    }
  }, [auth, navigate])

  if (!auth || !auth.user || !auth.db) return null
  const { user, db, refreshDb } = auth

  // Get assignments
  const submissions = db.submissions?.filter((s: any) => s.studentId === user.id) || []
  
  const gradedSubmissions = submissions.filter((s: any) => s.status === 'graded')
  const pendingAssignments = db.assignments?.filter(
    (a: any) => !submissions.find((s: any) => s.assignmentId === a.id)
  ) || []

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAsg) return

    setIsGrading(true)
    setGradingResult(null)

    // Simulate AI grading micro-animation (runs for 2.5 seconds)
    setTimeout(async () => {
      try {
        const res = await submitAssignment({
          data: {
            assignmentId: selectedAsg.id,
            studentId: user.id,
            content,
            fileName: fileName || undefined,
            fileData: fileName ? 'base64-mock-file-data' : undefined
          }
        })
        if (res.success) {
          setGradingResult(res.submission)
          await refreshDb()
          setContent('')
          setFileName('')
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsGrading(false)
      }
    }, 2500)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="select-none">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <FileText className="h-6 w-6 text-indigo-500" />
          Assignments & Submissions
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Submit files or text for pending assignments and view instant AI grades & tutor feedback.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 select-none">
        <button
          onClick={() => {
            setActiveTab('pending')
            setSelectedAsg(null)
            setGradingResult(null)
          }}
          className={`px-5 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'pending'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Pending ({pendingAssignments.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('graded')
            setSelectedAsg(null)
            setGradingResult(null)
          }}
          className={`px-5 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'graded'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Graded ({gradedSubmissions.length})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: List */}
        <div className="md:col-span-1 space-y-3 select-none">
          {activeTab === 'pending' ? (
            pendingAssignments.length === 0 ? (
              <div className="text-center py-10 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-xs text-neutral-500 dark:text-neutral-400">
                No pending assignments!
              </div>
            ) : (
              pendingAssignments.map((a: any) => (
                <button
                  key={a.id}
                  onClick={() => {
                    setSelectedAsg(a)
                    setGradingResult(null)
                  }}
                  className={`w-full p-4 text-left border rounded-2xl transition-all ${
                    selectedAsg?.id === a.id
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/10 dark:bg-neutral-800/80 shadow-sm'
                      : 'border-neutral-200 dark:border-neutral-850 bg-white dark:bg-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  <span className="text-[10px] font-bold text-indigo-500 uppercase">{a.subject}</span>
                  <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mt-1 line-clamp-1">{a.title}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-neutral-500 dark:text-neutral-400 mt-2">
                    <Clock className="h-3 w-3" /> Due: {a.dueDate}
                  </div>
                </button>
              ))
            )
          ) : (
            gradedSubmissions.length === 0 ? (
              <div className="text-center py-10 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-xs text-neutral-500 dark:text-neutral-400">
                No graded assignments yet.
              </div>
            ) : (
              gradedSubmissions.map((s: any) => {
                const a = db.assignments?.find((asg: any) => asg.id === s.assignmentId)
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedAsg(s)}
                    className={`w-full p-4 text-left border rounded-2xl transition-all ${
                      selectedAsg?.id === s.id
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/10 dark:bg-neutral-800/80 shadow-sm'
                        : 'border-neutral-200 dark:border-neutral-850 bg-white dark:bg-neutral-900 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-indigo-500 uppercase">{a?.subject || 'Course'}</span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/40">
                        Grade: {s.grade}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mt-1 line-clamp-1">{a?.title}</h3>
                    <div className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-2">
                      Submitted: {s.submittedAt}
                    </div>
                  </button>
                )
              })
            )
          )}
        </div>

        {/* RIGHT COLUMN: Action Details */}
        <div className="md:col-span-2">
          {isGrading ? (
            /* AI Grading Simulator Animation */
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[300px] shadow-sm select-none">
              <div className="relative flex items-center justify-center mb-6">
                <BrainCircuit className="h-14 w-14 text-indigo-600 dark:text-indigo-400 animate-bounce" />
                <span className="absolute h-20 w-20 rounded-full border-4 border-indigo-600/30 border-t-indigo-600 animate-spin" />
              </div>
              <h3 className="text-base font-bold text-neutral-850 dark:text-white">AI Grading Agent Processing</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 max-w-sm leading-relaxed">
                Analyzing syntax, calculating relational complexities, checking requirements constraints, and compiling feedback...
              </p>
            </div>
          ) : gradingResult ? (
            /* Grading success result screen */
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
                <h2 className="text-base font-bold">Assignment AI Evaluation Complete!</h2>
              </div>
              
              <div className="p-4 bg-indigo-50/20 dark:bg-neutral-800/40 rounded-xl space-y-2 border border-indigo-100/30 dark:border-neutral-800">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-neutral-500">Grading Output</span>
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{gradingResult.grade}</span>
                </div>
                <hr className="border-neutral-200 dark:border-neutral-800" />
                <div className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
                  {gradingResult.feedback}
                </div>
              </div>

              <button
                onClick={() => setGradingResult(null)}
                className="py-2 px-4 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-850 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          ) : selectedAsg ? (
            activeTab === 'pending' ? (
              /* Submission Form */
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">{selectedAsg.subject}</span>
                  <h2 className="text-base font-bold text-neutral-900 dark:text-white mt-0.5">{selectedAsg.title}</h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed bg-neutral-50 dark:bg-neutral-850/40 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800/50">
                    {selectedAsg.description}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-1.5 select-none">
                      Written Submission / Notes
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your explanation or code snippets here..."
                      className="block w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-850 dark:text-white placeholder-neutral-450 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs transition-all resize-none"
                    />
                  </div>

                  {/* File Upload Mock (representing Lovable Storage) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide select-none">
                      Upload Document (Lovable Storage)
                    </label>
                    <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-xl p-6 transition-all text-center relative select-none">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept=".pdf,.zip,.doc,.docx,.png,.jpg,.jpeg,.ipynb"
                      />
                      <UploadCloud className="h-8 w-8 text-neutral-400 mx-auto" />
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
                        {fileName ? (
                          <strong className="text-indigo-600 dark:text-indigo-450">{fileName}</strong>
                        ) : (
                          'Drag & drop document or Click to upload'
                        )}
                      </p>
                      <p className="text-[10px] text-neutral-400 mt-1">PDF, ZIP, IPYNB, DOCX up to 10MB</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-xl shadow transition-colors flex items-center gap-2 select-none"
                  >
                    <BrainCircuit className="h-4 w-4" />
                    Submit & Evaluate with AI
                  </button>
                </form>
              </div>
            ) : (
              /* Graded Submission View */
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm space-y-4">
                {/* Graded Details */}
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                        {db.assignments?.find((asg: any) => asg.id === selectedAsg.assignmentId)?.subject}
                      </span>
                      <h2 className="text-base font-bold text-neutral-900 dark:text-white mt-0.5">
                        {db.assignments?.find((asg: any) => asg.id === selectedAsg.assignmentId)?.title}
                      </h2>
                    </div>
                    <span className="text-lg font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1 rounded border border-emerald-100 dark:border-emerald-900/40 select-none">
                      {selectedAsg.grade}
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-2 select-none">
                    Submitted: {selectedAsg.submittedAt}
                  </div>
                </div>

                <hr className="border-neutral-200 dark:border-neutral-800" />

                {/* Submission Content */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-neutral-700 dark:text-neutral-300 select-none">Your Submission</h4>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-850/40 border border-neutral-100 dark:border-neutral-800 rounded-xl text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-mono whitespace-pre-wrap">
                    {selectedAsg.content}
                  </div>
                  {selectedAsg.fileName && (
                    <div className="flex items-center gap-2 p-2 bg-indigo-50/10 dark:bg-neutral-800/30 border border-indigo-50/20 dark:border-neutral-800 rounded-lg text-xs max-w-xs select-none">
                      <FileText className="h-4 w-4 text-indigo-500" />
                      <span className="text-neutral-700 dark:text-neutral-300 truncate font-semibold">{selectedAsg.fileName}</span>
                    </div>
                  )}
                </div>

                {/* AI Tutor Feedback */}
                <div className="p-4 bg-indigo-50/20 dark:bg-neutral-800/40 rounded-xl space-y-1.5 border border-indigo-100/30 dark:border-neutral-800">
                  <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 select-none">
                    <BrainCircuit className="h-4 w-4" /> AI Tutor Evaluation Feedback
                  </h4>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
                    {selectedAsg.feedback}
                  </p>
                </div>
              </div>
            )
          ) : (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center text-xs text-neutral-500 dark:text-neutral-400 shadow-sm select-none">
              Select an assignment from the list to view instructions and start evaluation.
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
