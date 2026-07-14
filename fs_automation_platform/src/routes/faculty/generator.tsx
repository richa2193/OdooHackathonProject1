import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AuthContext } from '../__root'
import { BrainCircuit, Loader2, Copy, CheckCircle2 } from 'lucide-react'

export const Route = createFileRoute('/faculty/generator')({
  component: AIGenerator,
})

function AIGenerator() {
  const auth = React.useContext(AuthContext)
  const navigate = useNavigate()
  
  const [topic, setTopic] = React.useState('')
  const [count, setCount] = React.useState(5)
  const [isLoading, setIsLoading] = React.useState(false)
  const [questions, setQuestions] = React.useState<any[]>([])
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!auth?.user || auth.user.role !== 'faculty') {
      navigate({ to: '/' })
    }
  }, [auth, navigate])

  if (!auth || !auth.user) return null

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return
    setIsLoading(true)
    setQuestions([])
    
    try {
      const tokenStr = localStorage.getItem('ff_tokens')
      const token = tokenStr ? JSON.parse(tokenStr).access : ''
      
      const res = await fetch('http://127.0.0.1:8000/api/generate-questions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic, count })
      })
      
      if (res.ok) {
        const data = await res.json()
        setQuestions(data.generated_questions)
      } else {
        console.error('Failed to generate questions')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    const text = questions.map((q, i) => `${i + 1}. ${q.question}`).join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="select-none">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-indigo-500" />
          AI Question Generator
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Instantly generate assignment and quiz questions using AI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Input Form */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm space-y-4">
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-1.5 select-none">
                  Topic / Subject
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Photosynthesis, Database Normalization..."
                  className="block w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-850 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-1.5 select-none">
                  Number of Questions
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="block w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !topic.trim()}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all select-none disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Generating...</span>
                ) : (
                  'Generate Questions'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results Area */}
        <div className="md:col-span-2">
          {questions.length > 0 ? (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                  Generated Output
                </h3>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-semibold rounded-lg transition-colors text-neutral-700 dark:text-neutral-300"
                >
                  {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied!' : 'Copy Text'}
                </button>
              </div>
              
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-100 dark:border-neutral-800 flex gap-3">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">{idx + 1}.</span>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
                      {q.question}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl h-full flex flex-col items-center justify-center p-12 text-center shadow-sm">
              <BrainCircuit className="h-12 w-12 text-neutral-200 dark:text-neutral-800 mb-4" />
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 max-w-xs">
                Enter a topic on the left to generate customized questions using AI.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
