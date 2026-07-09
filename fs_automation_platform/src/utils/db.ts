import { createServerFn } from '@tanstack/react-start'
import * as fs from 'fs'
import * as path from 'path'

// Resolve paths relative to working directory of server execution
const DB_PATH = typeof process !== 'undefined' && typeof process.cwd === 'function' ? path.resolve(process.cwd(), 'db.json') : ''

// Synchronous helper to read database file
export function readDbRaw() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return {}
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading database file:', error)
    return {}
  }
}

// Synchronous helper to write database file
export function writeDbRaw(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error writing database file:', error)
  }
}

// SERVER FUNCTIONS
export const getDb = createServerFn({ method: 'GET' })
  .validator((data: any) => data as { token?: string })
  .handler(async ({ data: { token } }) => {
    // 1. Get base mock data
    const mockDb = readDbRaw()
    
    // 2. If no token, just return mock db
    if (!token) {
      return mockDb
    }

    try {
      const headers = { 'Authorization': `Bearer ${token}` }
      
      // Fetch students
      const studentsRes = await fetch('http://127.0.0.1:8000/api/students/', { headers })
      const studentsData = studentsRes.ok ? await studentsRes.json() : { results: [] }
      
      // Fetch faculty
      const facultyRes = await fetch('http://127.0.0.1:8000/api/faculty/', { headers })
      const facultyData = facultyRes.ok ? await facultyRes.json() : { results: [] }

      // Fetch attendance
      const attendanceRes = await fetch('http://127.0.0.1:8000/api/attendance/', { headers })
      const attendanceData = attendanceRes.ok ? await attendanceRes.json() : { results: [] }

      // Map Django Users to Mock DB format
      const liveUsers: any[] = []
      
      studentsData.results?.forEach((s: any) => {
        liveUsers.push({
          id: s.user_details.id,
          username: s.user_details.username,
          name: `${s.user_details.first_name} ${s.user_details.last_name}`.trim(),
          role: 'student',
          email: s.user_details.email,
          studentCode: s.enrollment_number,
          avatar: s.user_details.avatar || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
          gpa: 8.5 // mock
        })
      })

      facultyData.results?.forEach((f: any) => {
        liveUsers.push({
          id: f.user_details.id,
          username: f.user_details.username,
          name: `${f.user_details.first_name} ${f.user_details.last_name}`.trim(),
          role: 'faculty',
          email: f.user_details.email,
          avatar: f.user_details.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
        })
      })

      // We still need the Parent mock user from db.json since we didn't build a Parent API
      const parentUser = mockDb.users?.find((u: any) => u.role === 'parent')
      if (parentUser) liveUsers.push(parentUser)

      // Map Django Attendance to Mock DB format
      const liveAttendanceLogs: any[] = []
      const attendanceMap = new Map() // subject -> { present, total }

      attendanceData.results?.forEach((a: any) => {
        liveAttendanceLogs.push({
          studentId: a.student_details.user_details.id,
          date: a.date,
          subject: a.subject,
          status: a.status.toLowerCase()
        })

        const key = `${a.student_details.user_details.id}_${a.subject}`
        if (!attendanceMap.has(key)) {
           attendanceMap.set(key, { studentId: a.student_details.user_details.id, subject: a.subject, present: 0, total: 0 })
        }
        const stats = attendanceMap.get(key)
        stats.total += 1
        if (a.status.toLowerCase() === 'present') stats.present += 1
      })

      const liveAttendanceStats = Array.from(attendanceMap.values())

      // Merge Live data over Mock data
      return {
        ...mockDb,
        users: liveUsers.length > 0 ? liveUsers : mockDb.users,
        attendanceLogs: liveAttendanceLogs.length > 0 ? liveAttendanceLogs : mockDb.attendanceLogs,
        attendance: liveAttendanceStats.length > 0 ? liveAttendanceStats : mockDb.attendance
      }

    } catch (e) {
      console.error('Error fetching live DB data:', e)
      return mockDb
    }
})

// Unified login function hitting Django backend
export const loginUser = createServerFn({ method: 'POST' })
  .validator((data: any) => data as { username: string; role: string; password?: string })
  .handler(async ({ data: { username, role, password } }) => {
    try {
      // 1. Get JWT Tokens
      const tokenRes = await fetch('http://127.0.0.1:8000/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      if (!tokenRes.ok) {
        return { success: false, error: 'Invalid credentials or user not found' }
      }
      
      const tokens = await tokenRes.json()

      // 2. Fetch User Profile using Access Token
      const profileRes = await fetch('http://127.0.0.1:8000/api/accounts/profile/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokens.access}`
        }
      })

      if (!profileRes.ok) {
        return { success: false, error: 'Failed to fetch user profile' }
      }

      const profile = await profileRes.json()

      // Check if role matches what user selected
      if (profile.role !== role) {
         return { success: false, error: 'User not found for this role.' }
      }

      // Map Django Profile to Frontend User Shape
      const user = {
        id: profile.id,
        username: profile.username,
        name: `${profile.first_name} ${profile.last_name}`.trim(),
        role: profile.role,
        email: profile.email,
        avatar: profile.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
      }

      return { success: true, user, tokens }
    } catch (e) {
      console.error(e)
      return { success: false, error: 'Server connection error.' }
    }
  })

// Link child to parent using student code
export const linkChild = createServerFn({ method: 'POST' })
  .validator((data: any) => data as { parentId: string; studentCode: string })
  .handler(async ({ data: { parentId, studentCode } }) => {
    const db = readDbRaw()
    const student = db.users?.find(
      (u: any) => u.role === 'student' && u.studentCode === studentCode
    )
    if (!student) {
      return { success: false, error: 'Invalid Student Code.' }
    }

    const parent = db.users?.find((u: any) => u.id === parentId)
    if (!parent) {
      return { success: false, error: 'Parent not found.' }
    }

    if (!parent.linkedChildren) {
      parent.linkedChildren = []
    }

    if (parent.linkedChildren.includes(student.id)) {
      return { success: false, error: 'Child is already linked.' }
    }

    parent.linkedChildren.push(student.id)
    writeDbRaw(db)

    // Notify student
    db.notifications.push({
      id: 'n_' + Date.now(),
      userId: student.id,
      title: 'Parent Linked',
      content: `${parent.name} has linked to your account.`,
      unread: true,
      timestamp: new Date().toISOString()
    })
    writeDbRaw(db)

    return { success: true, student }
  })

// Submit assignment with simulated AI feedback
export const submitAssignment = createServerFn({ method: 'POST' })
  .validator(
    (data: any) =>
      data as {
        assignmentId: string
        studentId: string
        content: string
        fileName?: string
        fileData?: string // base64 representation representing Lovable Storage
      }
  )
  .handler(async ({ data: { assignmentId, studentId, content, fileName, fileData } }) => {
    const db = readDbRaw()
    
    // Create new submission ID
    const submissionId = 'sub_' + Date.now()
    const submittedAt = new Date().toISOString().split('T')[0]

    // Simulate AI evaluation immediately
    const subject = db.assignments?.find((a: any) => a.id === assignmentId)?.subject || 'Core'
    const words = content.split(/\s+/).length
    let aiGrade = 'B+'
    let aiFeedback = 'Good explanation. The submission covers the basics. To improve, add more code structure, detailed diagrams, and cross-references.'

    if (words > 80 || fileData) {
      aiGrade = 'A'
      aiFeedback = 'Excellent submission! Detailed analysis with structured format. The explanation is sound, highly optimized, and follows development best practices.'
    } else if (words < 20) {
      aiGrade = 'C'
      aiFeedback = 'Submission is too brief. Please expand your points and cover all key requirements of the assignment.'
    }

    const newSubmission = {
      id: submissionId,
      assignmentId,
      studentId,
      status: 'graded', // Automatically AI graded
      content,
      fileName: fileName || null,
      submittedAt,
      grade: aiGrade,
      feedback: `[AI Evaluation]: ${aiFeedback}`
    }

    if (!db.submissions) {
      db.submissions = []
    }

    // Remove older submission for the same assignment if exists
    db.submissions = db.submissions.filter(
      (s: any) => !(s.assignmentId === assignmentId && s.studentId === studentId)
    )

    db.submissions.push(newSubmission)

    // Create notifications for Student
    db.notifications.push({
      id: 'n_' + Date.now() + '_1',
      userId: studentId,
      title: 'Assignment AI Graded',
      content: `Your submission for '${db.assignments.find((a: any) => a.id === assignmentId)?.title}' was automatically graded as '${aiGrade}'.`,
      unread: true,
      timestamp: new Date().toISOString()
    })

    // Create notifications for Parents linked to this student
    const parents = db.users?.filter(
      (u: any) => u.role === 'parent' && u.linkedChildren?.includes(studentId)
    )
    parents?.forEach((p: any) => {
      db.notifications.push({
        id: 'n_' + Date.now() + '_' + p.id,
        userId: p.id,
        title: 'Child Assignment Graded',
        content: `Your child submitted '${db.assignments.find((a: any) => a.id === assignmentId)?.title}' and received an AI grade of '${aiGrade}'.`,
        unread: true,
        timestamp: new Date().toISOString()
      })
    })

    writeDbRaw(db)
    return { success: true, submission: newSubmission }
  })

// Respond to meeting request
export const respondMeeting = createServerFn({ method: 'POST' })
  .validator((data: any) => data as { meetingId: string; status: 'accepted' | 'declined' })
  .handler(async ({ data: { meetingId, status } }) => {
    const db = readDbRaw()
    const meeting = db.meetings?.find((m: any) => m.id === meetingId)
    if (!meeting) {
      return { success: false, error: 'Meeting not found.' }
    }

    meeting.status = status
    writeDbRaw(db)

    // Notify faculty/teacher
    db.notifications.push({
      id: 'n_' + Date.now(),
      userId: 'teacher1', // Hardcoded teacher for demonstration
      title: `Meeting RSVP: ${status.toUpperCase()}`,
      content: `The parent has ${status} the meeting request for ${meeting.date}.`,
      unread: true,
      timestamp: new Date().toISOString()
    })

    writeDbRaw(db)
    return { success: true }
  })

// Toggle Notification Read
export const markNotificationRead = createServerFn({ method: 'POST' })
  .validator((data: any) => data as { id: string })
  .handler(async ({ data: { id } }) => {
    const db = readDbRaw()
    const notification = db.notifications?.find((n: any) => n.id === id)
    if (notification) {
      notification.unread = false
      writeDbRaw(db)
      return { success: true }
    }
    return { success: false, error: 'Notification not found' }
  })

// Upload Avatar Mock (Base64 saved to user record, representing Lovable Storage)
export const uploadAvatar = createServerFn({ method: 'POST' })
  .validator((data: any) => data as { userId: string; avatarUrl: string })
  .handler(async ({ data: { userId, avatarUrl } }) => {
    const db = readDbRaw()
    const user = db.users?.find((u: any) => u.id === userId)
    if (user) {
      user.avatar = avatarUrl
      writeDbRaw(db)
      return { success: true, avatar: avatarUrl }
    }
    return { success: false, error: 'User not found' }
  })

// Change password
export const changePassword = createServerFn({ method: 'POST' })
  .validator((data: any) => data as { userId: string; newPass: string })
  .handler(async ({ data: { userId, newPass } }) => {
    const db = readDbRaw()
    const user = db.users?.find((u: any) => u.id === userId)
    if (user) {
      user.password = newPass
      writeDbRaw(db)
      return { success: true }
    }
    return { success: false, error: 'User not found' }
  })
