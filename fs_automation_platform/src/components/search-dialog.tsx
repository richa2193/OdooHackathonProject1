import * as React from 'react'
import { Search, FileText, Calendar, MessageSquare, BookOpen, User } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

interface SearchItem {
  id: string
  title: string
  subtitle: string
  category: 'assignments' | 'timetable' | 'messages' | 'materials' | 'profile'
  link: string
}

interface SearchDialogProps {
  isOpen: boolean
  onClose: () => void
  role: 'student' | 'parent' | 'faculty'
  db: any
}

export function SearchDialog({ isOpen, onClose, role, db }: SearchDialogProps) {
  const [query, setQuery] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)
  const dialogRef = React.useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Focus input on open
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Close on Escape or click outside
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
      onClose()
    }
  }

  // Generate searchable items list based on current user role
  const getSearchItems = (): SearchItem[] => {
    if (!db) return []
    const items: SearchItem[] = []

    // Add profile option
    items.push({ id: 'prof', title: 'My Profile Settings', subtitle: 'Update avatar, change password', category: 'profile', link: '/profile' })

    if (role === 'student') {
      // Add assignments
      db.assignments?.forEach((a: any) => {
        items.push({
          id: a.id,
          title: a.title,
          subtitle: `Assignment in ${a.subject} (Due: ${a.dueDate})`,
          category: 'assignments',
          link: '/student/assignments'
        })
      })

      // Add classes
      db.timetable?.forEach((t: any) => {
        items.push({
          id: t.id,
          title: `${t.subject} Lecture`,
          subtitle: `${t.day} at ${t.time} in ${t.room} (${t.teacher})`,
          category: 'timetable',
          link: '/student/timetable'
        })
      })

      // Add materials
      db.materials?.forEach((m: any) => {
        items.push({
          id: m.id,
          title: m.title,
          subtitle: `${m.type} for ${m.subject} (${m.size})`,
          category: 'materials',
          link: '/student/materials'
        })
      })
    } else if (role === 'parent') {
      // Add links
      items.push({ id: 'p-dash', title: 'Parent Dashboard', subtitle: 'View linked student overview', category: 'profile', link: '/parent/dashboard' })
      items.push({ id: 'p-msg', title: 'Faculty Chat Room', subtitle: 'View conversations with teachers', category: 'messages', link: '/parent/messages' })
      
      db.users?.filter((u: any) => u.role === 'student' && db.users.find((p: any) => p.role === 'parent')?.linkedChildren?.includes(u.id)).forEach((s: any) => {
        items.push({
          id: s.id,
          title: `${s.name}'s Attendance & Grades`,
          subtitle: `View report cards and class submissions`,
          category: 'profile',
          link: `/parent/child/${s.id}`
        })
      })

      db.meetings?.forEach((m: any) => {
        items.push({
          id: m.id,
          title: m.title,
          subtitle: `PTM Meeting Scheduled: ${m.date} (${m.time})`,
          category: 'timetable',
          link: '/parent/messages'
        })
      })
    } else if (role === 'faculty') {
      items.push({ id: 'f-dash', title: 'Faculty Workload Dashboard', subtitle: 'Overview of batches and announcements', category: 'profile', link: '/faculty/dashboard' })
      items.push({ id: 'f-att', title: 'Mark Student Attendance', subtitle: 'Register daily presence', category: 'timetable', link: '/faculty/attendance' })
      items.push({ id: 'f-asg', title: 'Grade Student Assignments', subtitle: 'Evaluate submissions and provide feedback', category: 'assignments', link: '/faculty/assignments' })
      items.push({ id: 'f-msg', title: 'Parent Messages', subtitle: 'Communicate with parent accounts', category: 'messages', link: '/faculty/messages' })
    }

    return items
  }

  const filteredItems = getSearchItems().filter(
    item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase())
  )

  const handleSelectItem = (link: string) => {
    navigate({ to: link })
    onClose()
  }

  const getIcon = (category: string) => {
    switch (category) {
      case 'assignments':
        return <FileText className="h-4 w-4 text-orange-500" />
      case 'timetable':
        return <Calendar className="h-4 w-4 text-emerald-500" />
      case 'messages':
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case 'materials':
        return <BookOpen className="h-4 w-4 text-indigo-500" />
      default:
        return <User className="h-4 w-4 text-neutral-500" />
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh] p-4"
      onClick={handleOutsideClick}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[60vh] animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
          <Search className="h-5 w-5 text-neutral-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search classes, assignments, messages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none text-sm"
          />
          <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">
            ESC
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
              No results found for "{query}"
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                Results ({filteredItems.length})
              </div>
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectItem(item.link)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50/50 dark:hover:bg-neutral-800/80 transition-colors text-left focus:outline-none"
                >
                  <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                    {getIcon(item.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 truncate">
                      {item.title}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      {item.subtitle}
                    </div>
                  </div>
                  <div className="text-[10px] text-neutral-400 uppercase border border-neutral-200 dark:border-neutral-700 px-1.5 py-0.5 rounded">
                    {item.category}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
