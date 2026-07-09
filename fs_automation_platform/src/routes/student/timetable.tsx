import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AuthContext } from '../__root'
import { Clock, MapPin, User, Bookmark } from 'lucide-react'

export const Route = createFileRoute('/student/timetable')({
  component: StudentTimetable,
})

function StudentTimetable() {
  const auth = React.useContext(AuthContext)
  const navigate = useNavigate()
  const [activeDay, setActiveDay] = React.useState<string>('Monday')

  React.useEffect(() => {
    if (!auth?.user || auth.user.role !== 'student') {
      navigate({ to: '/' })
    }
  }, [auth, navigate])

  if (!auth || !auth.user || !auth.db) return null
  const { db } = auth

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  // Get lectures for active day
  const lectures = db.timetable?.filter((t: any) => t.day === activeDay) || []

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="select-none">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Clock className="h-6 w-6 text-indigo-500" />
          Weekly Class Timetable
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Stay on top of your class lectures, classroom locations, and teachers.
        </p>
      </div>

      {/* Weekdays Tab Selector */}
      <div className="grid grid-cols-5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl select-none">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all ${
              activeDay === day
                ? 'bg-white dark:bg-neutral-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Lectures List */}
      <div className="space-y-4">
        {lectures.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center text-xs text-neutral-500 dark:text-neutral-400 select-none">
            No lectures scheduled for {activeDay}. Enjoy your day off!
          </div>
        ) : (
          lectures.map((lecture: any) => (
            <div
              key={lecture.id}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-indigo-600" />
                  <h3 className="text-sm font-bold text-neutral-850 dark:text-white">{lecture.subject}</h3>
                </div>
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-neutral-500 dark:text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-neutral-400" /> {lecture.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-neutral-400" /> {lecture.room}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-100 dark:border-neutral-800">
                <div className="h-8 w-8 rounded-full bg-indigo-555/10 dark:bg-neutral-800 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 text-xs shrink-0 select-none">
                  {lecture.teacher.split(' ').slice(-1)[0][0]}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">{lecture.teacher}</div>
                  <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wide select-none">Instructor</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
