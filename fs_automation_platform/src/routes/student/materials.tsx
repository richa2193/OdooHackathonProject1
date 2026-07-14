import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AuthContext } from '../__root'
import { BookOpen, Search, Download, FileText, CheckCircle2 } from 'lucide-react'

export const Route = createFileRoute('/student/materials')({
  component: StudentMaterials,
})

function StudentMaterials() {
  const auth = React.useContext(AuthContext)
  const navigate = useNavigate()
  
  const [query, setQuery] = React.useState('')
  const [subjectFilter, setSubjectFilter] = React.useState('all')
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null)
  const [downloadedId, setDownloadedId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!auth?.user || auth.user.role !== 'student') {
      navigate({ to: '/' })
    }
  }, [auth, navigate])

  if (!auth || !auth.user || !auth.db) return null
  const { db } = auth

  const subjects = ['all', ...Array.from(new Set(db.materials?.map((m: any) => m.subject))) as string[]]

  const handleDownload = (id: string, fileName: string) => {
    setDownloadingId(id)
    setDownloadedId(null)
    
    // Simulate downloading latency
    setTimeout(() => {
      setDownloadingId(null)
      setDownloadedId(id)
      
      // Simulate file download by creating a fake element
      const element = document.createElement('a')
      const file = new Blob(['Mock file content representing: ' + fileName], {type: 'text/plain'})
      element.href = URL.createObjectURL(file)
      element.download = fileName.replace('/mock-downloads/', '') + '.txt'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)

      // Reset downloaded tag after 3 seconds
      setTimeout(() => setDownloadedId(null), 3000)
    }, 1500)
  }

  const filteredMaterials = db.materials?.filter((m: any) => {
    const matchesQuery = m.title.toLowerCase().includes(query.toLowerCase()) || 
                         m.subject.toLowerCase().includes(query.toLowerCase())
    const matchesSubject = subjectFilter === 'all' || m.subject === subjectFilter
    return matchesQuery && matchesSubject
  }) || []

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-500" />
            Study Materials & Question Papers
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Browse and download past semester question papers, reference guides, and lecture notes.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center select-none">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search resources by title or subject..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-800 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Category:</span>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs text-neutral-700 dark:text-neutral-300 focus:outline-none"
          >
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s === 'all' ? 'All Subjects' : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Materials */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMaterials.length === 0 ? (
          <div className="md:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center text-xs text-neutral-550 dark:text-neutral-400 select-none">
            No resources match your search query.
          </div>
        ) : (
          filteredMaterials.map((m: any) => (
            <div
              key={m.id}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-start gap-4"
            >
              <div className="p-3 bg-indigo-50/50 dark:bg-neutral-800 rounded-xl shrink-0 select-none">
                <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-450 uppercase">{m.subject}</span>
                  <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 select-none">
                    {m.type}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-neutral-850 dark:text-white line-clamp-1">{m.title}</h3>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 select-none">File Size: {m.size}</p>
                
                <div className="pt-2 select-none">
                  {downloadingId === m.id ? (
                    <button disabled className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-neutral-100 dark:bg-neutral-800 text-[10px] font-bold text-neutral-500 rounded-lg">
                      <span className="h-3 w-3 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
                      Downloading...
                    </button>
                  ) : downloadedId === m.id ? (
                    <span className="inline-flex items-center gap-1 py-1.5 px-3 bg-emerald-50 dark:bg-emerald-950/20 text-[10px] font-bold text-emerald-600 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Downloaded!
                    </span>
                  ) : (
                    <button
                      onClick={() => handleDownload(m.id, m.url)}
                      className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-indigo-50 dark:bg-indigo-950/20 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" /> Download PDF
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
