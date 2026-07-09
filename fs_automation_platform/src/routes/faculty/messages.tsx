import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AuthContext } from '../__root'
import { MessageSquare, Calendar, Clock, Send, Plus, Video, CheckCircle2, ShieldAlert } from 'lucide-react'

export const Route = createFileRoute('/faculty/messages')({
  component: FacultyMessages,
})

function FacultyMessages() {
  const auth = React.useContext(AuthContext)
  const navigate = useNavigate()

  const [typedMessage, setTypedMessage] = React.useState('')
  const [meetingTitle, setMeetingTitle] = React.useState('Semester Progress Review Meeting')
  const [meetingDate, setMeetingDate] = React.useState('2026-07-15')
  const [meetingTime, setMeetingTime] = React.useState('03:00 PM - 03:30 PM')
  const [meetingNotes, setMeetingNotes] = React.useState('')
  const [success, setSuccess] = React.useState<string | null>(null)
  
  const chatEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!auth?.user || auth.user.role !== 'faculty') {
      navigate({ to: '/' })
    }
  }, [auth, navigate])

  // Scroll chat to bottom
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [auth?.db?.messages])

  if (!auth || !auth.user || !auth.db) return null
  const { user, db } = auth

  // Hardcode conversation with parent1
  const parent = db.users?.find((u: any) => u.id === 'parent1')
  const conversation = db.messages?.filter(
    (m: any) =>
      (m.senderId === user.id && m.receiverId === 'parent1') ||
      (m.senderId === 'parent1' && m.receiverId === user.id)
  )?.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) || []

  // Get active teacher meetings
  const teacherMeetings = db.meetings?.filter((m: any) => m.teacherId === user.id) || []

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!typedMessage.trim()) return

    const newMessage = {
      id: 'msg_' + Date.now(),
      senderId: user.id,
      receiverId: 'parent1',
      content: typedMessage.trim(),
      timestamp: new Date().toISOString()
    }

    try {
      if (!db.messages) db.messages = []
      db.messages.push(newMessage)

      // Notify parent
      db.notifications.push({
        id: 'n_' + Date.now(),
        userId: 'parent1',
        title: 'New Message from Teacher',
        content: `Dr. Sarah Jenkins sent a message: "${typedMessage.trim().slice(0, 30)}..."`,
        unread: true,
        timestamp: new Date().toISOString()
      })

      auth.refreshDb()
      setTypedMessage('')
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(null)

    const newMeeting = {
      id: 'meet_' + Date.now(),
      teacherId: user.id,
      parentId: 'parent1',
      studentId: 'student1',
      title: meetingTitle,
      date: meetingDate,
      time: meetingTime,
      room: 'Zoom / Virtual Room B',
      status: 'pending',
      notes: meetingNotes
    }

    try {
      if (!db.meetings) db.meetings = []
      
      // Remove older meetings for parent1 if exists to avoid clutter
      db.meetings = db.meetings.filter((m: any) => m.parentId !== 'parent1' || m.status !== 'pending')
      
      db.meetings.push(newMeeting)

      // Notify parent
      db.notifications.push({
        id: 'n_meet_' + Date.now(),
        userId: 'parent1',
        title: '🗓️ New PTM Meeting Requested',
        content: `Dr. Sarah Jenkins requested a PTM session on ${meetingDate} (${meetingTime}).`,
        unread: true,
        timestamp: new Date().toISOString()
      })

      auth.refreshDb()
      setSuccess('Successfully scheduled meeting request!')
      setMeetingNotes('')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="select-none">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-indigo-500" />
          Parent Communications
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Coordinate schedules, discuss student concerns, and schedule progress meetings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Request Meeting Form */}
        <div className="lg:col-span-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-neutral-855 dark:text-white uppercase tracking-wider flex items-center gap-1.5 select-none">
            <Plus className="h-4.5 w-4.5 text-indigo-500" /> Schedule PTM Meeting
          </h3>
          
          {success && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-800/40 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-1.5 leading-normal font-medium select-none">
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleCreateMeeting} className="space-y-3.5 select-none">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-1.5">
                Meeting Title
              </label>
              <input
                type="text"
                required
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                className="block w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs text-neutral-800 dark:text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="block w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs text-neutral-800 dark:text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-1.5">
                  Time Slot
                </label>
                <input
                  type="text"
                  required
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  className="block w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs text-neutral-850 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-1.5">
                PTM Review Notes
              </label>
              <textarea
                required
                rows={3}
                value={meetingNotes}
                onChange={(e) => setMeetingNotes(e.target.value)}
                placeholder="Include agenda for review meeting..."
                className="block w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs text-neutral-800 dark:text-white placeholder-neutral-450 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
            >
              <Calendar className="h-4 w-4" /> Request PTM RSVP
            </button>
          </form>
        </div>

        {/* Messaging Chat Window */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm flex flex-col h-[500px]">
          {/* Parent Info Header */}
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3 select-none">
            <div className="h-9 w-9 rounded-full bg-indigo-650 flex items-center justify-center font-bold text-white shadow-sm">
              P
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-neutral-850 dark:text-white">{parent?.name || 'Linked Parent'}</h4>
              <span className="text-[10px] text-neutral-450 dark:text-neutral-500 uppercase font-bold tracking-wide">Parent of Ayushi Sharma</span>
            </div>
            <span className="ml-auto h-2 w-2 rounded-full bg-emerald-500" title="Online" />
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversation.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-neutral-400">
                No chat messages recorded. Send a greeting to start communicating.
              </div>
            ) : (
              conversation.map((msg: any) => {
                const isMe = msg.senderId === user.id
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-tl-none'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <span
                        className={`text-[9px] block text-right mt-1.5 font-medium select-none ${
                          isMe ? 'text-indigo-200' : 'text-neutral-400 dark:text-neutral-500'
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Send Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-neutral-200 dark:border-neutral-800 flex gap-2">
            <input
              type="text"
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              placeholder="Type message to parent..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-305 dark:border-neutral-700 bg-transparent text-xs text-neutral-850 dark:text-white placeholder-neutral-450 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition-colors flex items-center justify-center shrink-0"
              title="Send Message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
