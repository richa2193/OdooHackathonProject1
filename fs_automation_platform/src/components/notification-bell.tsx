import * as React from 'react'
import { Bell, Check, Trash } from 'lucide-react'
import { markNotificationRead, getDb } from '~/utils/db'

interface Notification {
  id: string
  userId: string
  title: string
  content: string
  unread: boolean
  timestamp: string
}

interface NotificationBellProps {
  userId: string
  notifications: Notification[]
  onRefresh: () => void
}

export function NotificationBell({ userId, notifications, onRefresh }: NotificationBellProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => n.unread).length

  // Close when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const res = await markNotificationRead({ data: { id } })
    if (res.success) {
      onRefresh()
    }
  }

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHrs = Math.floor(diffMins / 60)

      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHrs < 24) return `${diffHrs}h ago`
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    } catch {
      return ''
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-neutral-900 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg ring-1 ring-black/5 z-50 divide-y divide-neutral-100 dark:divide-neutral-800 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-neutral-500 dark:text-neutral-400">{unreadCount} unread</span>
            )}
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-xs text-neutral-500 dark:text-neutral-400">
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors flex gap-2 ${
                    n.unread ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
                  }`}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${n.unread ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-700 dark:text-neutral-300'}`}>
                        {n.title}
                      </span>
                      <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                        {formatTime(n.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {n.content}
                    </p>
                  </div>
                  {n.unread && (
                    <button
                      onClick={(e) => handleMarkAsRead(n.id, e)}
                      className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 hover:text-indigo-600 self-start transition-colors"
                      title="Mark as read"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
