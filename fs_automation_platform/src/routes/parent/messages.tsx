import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AuthContext } from '../__root'
import { respondMeeting } from '~/utils/db'
import { MessageSquare, Calendar, Clock, Video, CheckCircle2, XCircle, Send, Check } from 'lucide-react'

export const Route = createFileRoute('/parent/messages')({
  component: ParentMessages,
})

function ParentMessages() {
  const auth = React.useContext(AuthContext)
  const navigate = useNavigate()
  
  const [typedMessage, setTypedMessage] = React.useState('')
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null)
  
  const chatEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!auth?.user || auth.user.role !== 'parent') {
      navigate({ to: '/' })
    }
  }, [auth, navigate])

  // Scroll chat to bottom
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [auth?.db?.messages])

  if (!auth || !auth.user || !auth.db) return null
  const { user, db, refreshDb } = auth

  // Filter messages for current parent (conversations with teacher1)
  const conversation = db.messages?.filter(
    (m: any) =>
      (m.senderId === user.id && m.receiverId === 'teacher1') ||
      (m.senderId === 'teacher1' && m.receiverId === user.id)
  )?.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) || []

  // Filter meetings
  const meetings = db.meetings?.filter((m: any) => m.parentId === user.id) || []

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!typedMessage.trim()) return

    const newMessage = {
      id: 'msg_' + Date.now(),
      senderId: user.id,
      receiverId: 'teacher1',
      content: typedMessage.trim(),
      timestamp: new Date().toISOString()
    }

    try {
      // Direct push to database
      if (!db.messages) db.messages = []
      db.messages.push(newMessage)

      // Notify teacher
      db.notifications.push({
        id: 'n_' + Date.now(),
        userId: 'teacher1',
        title: 'New Message from Parent',
        content: `${user.name} sent a message: "${typedMessage.trim().slice(0, 30)}..."`,
        unread: true,
        timestamp: new Date().toISOString()
      })

      // Write changes
      auth.refreshDb()
      setTypedMessage('')
    } catch (err) {
      console.error(err)
    }
  }

  const handleRsvp = async (meetingId: string, status: 'accepted' | 'declined') => {
    setActionLoadingId(meetingId + '_' + status)
    try {
      const res = await respondMeeting({ data: { meetingId, status } })
      if (res.success) {
        await refreshDb()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="select-none">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-indigo-500" />
          Messages & Meetings
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Chat with faculty members and respond to virtual or physical meeting requests.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Meetings Requests RSVP */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider select-none">
            Meeting Requests ({meetings.length})
          </h3>

          {meetings.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 text-center text-xs text-neutral-500 dark:text-neutral-400 select-none">
              No meetings scheduled.
            </div>
          ) : (
            meetings.map((m: any) => (
              <div
                key={m.id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4 text-left"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide select-none">PTM REQUEST</span>
                  <h4 className="text-xs font-bold text-neutral-850 dark:text-white">{m.title}</h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal">
                    {m.notes}
                  </p>
                </div>

                <hr className="border-neutral-100 dark:border-neutral-800" />

                <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400 select-none">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-neutral-400" />
                    <span>Date: <strong className="font-semibold text-neutral-800 dark:text-neutral-200">{m.date}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-neutral-400" />
                    <span>Time: <strong className="font-semibold text-neutral-800 dark:text-neutral-200">{m.time}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-neutral-400" />
                    <span>Venue: <strong className="font-semibold text-neutral-800 dark:text-neutral-200">{m.room}</strong></span>
                  </div>
                </div>

                <div className="pt-2 select-none">
                  {m.status === 'pending' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRsvp(m.id, 'accepted')}
                        disabled={actionLoadingId !== null}
                        className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-xs font-bold text-white rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        {actionLoadingId === m.id + '_accepted' ? (
                          <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" /> Accept
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleRsvp(m.id, 'declined')}
                        disabled={actionLoadingId !== null}
                        className="flex-1 py-2 bg-neutral-100 hover:bg-neutral-250 dark:bg-neutral-800 dark:hover:bg-neutral-750 disabled:opacity-50 text-xs font-bold text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        {actionLoadingId === m.id + '_declined' ? (
                          <span className="h-3 w-3 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5" /> Decline
                          </>
                        )}
                      </button>
                    </div>
                  ) : m.status === 'accepted' ? (
                    <div className="w-full text-center py-2 bg-emerald-50 dark:bg-emerald-950/20 text-xs font-bold text-emerald-600 rounded-xl border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="h-4.5 w-4.5" /> Accepted RSVP
                    </div>
                  ) : (
                    <div className="w-full text-center py-2 bg-red-50 dark:bg-red-950/20 text-xs font-bold text-red-650 rounded-xl border border-red-100 dark:border-red-900/40 flex items-center justify-center gap-1.5">
                      <XCircle className="h-4.5 w-4.5" /> Declined RSVP
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* RIGHT COLUMN: Interactive Chat Room */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm flex flex-col h-[500px]">
          {/* Teacher Info Header */}
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3 select-none">
            <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white shadow-sm">
              S
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-neutral-850 dark:text-white">Dr. Sarah Jenkins</h4>
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase font-bold tracking-wide">Web Development Tutor</span>
            </div>
            <span className="ml-auto h-2 w-2 rounded-full bg-emerald-500" title="Online" />
          </div>

          {/* Messages Logs Area */}
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
              placeholder="Type message to Dr. Jenkins..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs text-neutral-850 dark:text-white placeholder-neutral-450 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
