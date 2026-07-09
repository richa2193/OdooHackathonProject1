import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AuthContext } from '../__root'
import { School, Send, Bell, Plus, Users, Clock, Award } from 'lucide-react'

export const Route = createFileRoute('/faculty/dashboard')({
  component: FacultyDashboard,
})

function FacultyDashboard() {
  const auth = React.useContext(AuthContext)
  const navigate = useNavigate()
  
  const [announcementText, setAnnouncementText] = React.useState('')
  const [announcementsList, setAnnouncementsList] = React.useState<any[]>([])

  React.useEffect(() => {
    if (!auth?.user || auth.user.role !== 'faculty') {
      navigate({ to: '/' })
    }
  }, [auth, navigate])

  React.useEffect(() => {
    if (auth?.db?.notifications) {
      // Mock announcements list using database notifications of category "Timetable" or general
      const ann = auth.db.notifications.filter((n: any) => n.userId === 'student1' || n.title.includes('Timetable'))
      setAnnouncementsList(ann.slice(0, 5))
    }
  }, [auth?.db])

  if (!auth || !auth.user || !auth.db) return null
  const { user, db, refreshDb } = auth

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!announcementText.trim()) return

    const newNotification = {
      id: 'ann_' + Date.now(),
      userId: 'student1', // Sent to all students (mocked by writing to student1)
      title: '📢 Department Announcement',
      content: announcementText.trim() + ` (Posted by ${user.name})`,
      unread: true,
      timestamp: new Date().toISOString()
    }

    try {
      if (!db.notifications) db.notifications = []
      db.notifications.push(newNotification)
      
      // Also write to student2
      db.notifications.push({
        ...newNotification,
        id: 'ann_2_' + Date.now(),
        userId: 'student2'
      })

      auth.refreshDb()
      setAnnouncementText('')
    } catch (err) {
      console.error(err)
    }
  }

  // Calculate some workloads stats
  const theoryHours = 8
  const labHours = 12
  const activeStudents = db.users?.filter((u: any) => u.role === 'student')?.length || 0

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-neutral-800 to-indigo-950 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden select-none">
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
            alt={user.name}
            className="h-16 w-16 md:h-20 md:w-20 rounded-full object-cover ring-4 ring-white/30"
          />
          <div className="text-center sm:text-left space-y-1">
            <span className="text-indigo-200 text-xs font-bold tracking-widest uppercase">Faculty Console</span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Welcome, {user.name}</h1>
            <p className="text-neutral-300 text-sm">
              Department of Computer Science & Engineering | Senior Lecturer
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 select-none">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50/50 dark:bg-neutral-800 rounded-xl">
            <Clock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wide">Weekly Workload</div>
            <div className="text-xl font-black text-neutral-850 dark:text-white mt-1">20 Hours</div>
            <div className="text-[10px] text-neutral-500">{theoryHours}h Theory + {labHours}h Labs</div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-neutral-800 rounded-xl">
            <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-450" />
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wide">Enrolled Students</div>
            <div className="text-xl font-black text-neutral-850 dark:text-white mt-1">{activeStudents} Students</div>
            <div className="text-[10px] text-neutral-500">Across 2 active batches</div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50/50 dark:bg-neutral-800 rounded-xl">
            <Award className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wide">Avg Batch GPA</div>
            <div className="text-xl font-black text-neutral-850 dark:text-white mt-1">7.95 GPA</div>
            <div className="text-[10px] text-neutral-500">Sem 4 evaluation cycle</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Post New Announcement */}
        <div className="md:col-span-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-neutral-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5 select-none">
            <Bell className="h-4.5 w-4.5 text-indigo-500" /> Post Announcement
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-normal select-none">
            Broadcast department-wide alerts, test reminders, or assignment updates directly to students.
          </p>

          <form onSubmit={handlePostAnnouncement} className="space-y-3">
            <textarea
              required
              rows={4}
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="Type announcement broadcast..."
              className="block w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs text-neutral-800 dark:text-white placeholder-neutral-455 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-xl shadow transition-colors flex items-center justify-center gap-1.5 select-none"
            >
              <Send className="h-3.5 w-3.5" /> Broadcast Alert
            </button>
          </form>
        </div>

        {/* Announcement Feed Log */}
        <div className="md:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-neutral-850 dark:text-white uppercase tracking-wider select-none">
            Broadcast Log Feed
          </h3>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-80 overflow-y-auto pr-1">
            {announcementsList.length === 0 ? (
              <div className="text-center py-12 text-xs text-neutral-400">
                No recent announcements posted.
              </div>
            ) : (
              announcementsList.map((ann: any, idx: number) => (
                <div key={idx} className="py-3.5 flex items-start gap-3">
                  <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg shrink-0 mt-0.5 select-none">
                    <School className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between select-none">
                      <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        {ann.title}
                      </span>
                      <span className="text-[10px] text-neutral-450 dark:text-neutral-500">
                        {new Date(ann.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      {ann.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
