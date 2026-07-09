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
export const getDb = createServerFn({ method: 'GET' }).handler(async () => {
  return readDbRaw()
})

// Unified login function
export const loginUser = createServerFn({ method: 'POST' })
  .validator((data: any) => data as { username: string; role: string })
  .handler(async ({ data: { username, role } }) => {
    const db = readDbRaw()
    const user = db.users?.find(
      (u: any) =>
        u.username.toLowerCase() === username.toLowerCase() && u.role === role
    )
    if (user) {
      return { success: true, user }
    }
    return { success: false, error: 'User not found for this role.' }
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
