import { createFileRoute } from '@tanstack/react-router'
import { readDbRaw, writeDbRaw } from '~/utils/db'

export const Route = createFileRoute('/api/public/cron')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const db = readDbRaw()
        const todayStr = new Date().toISOString().split('T')[0]
        const today = new Date(todayStr)
        
        let notificationsSent = 0
        const emailLogs: string[] = []

        if (!db.assignments || !db.users) {
          return Response.json({ success: true, message: 'Database empty' })
        }

        // Check for assignments due in the next 3 days
        db.assignments.forEach((asg: any) => {
          const dueDate = new Date(asg.dueDate)
          const diffMs = dueDate.getTime() - today.getTime()
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

          // If due within 3 days and not overdue
          if (diffDays >= 0 && diffDays <= 3) {
            // Find all students who haven't submitted yet
            const students = db.users.filter((u: any) => u.role === 'student')
            
            students.forEach((student: any) => {
              const hasSubmitted = db.submissions?.some(
                (s: any) => s.assignmentId === asg.id && s.studentId === student.id
              )

              if (!hasSubmitted) {
                // 1. Write In-App Notification
                const notifId = 'notif_cron_' + Date.now() + '_' + student.id
                
                // Avoid duplicates
                const exists = db.notifications?.some(
                  (n: any) => n.userId === student.id && n.content.includes(asg.title) && n.unread
                )

                if (!exists) {
                  db.notifications.push({
                    id: notifId,
                    userId: student.id,
                    title: '⏳ Upcoming Assignment Deadline',
                    content: `Your assignment '${asg.title}' for ${asg.subject} is due in ${diffDays} days (${asg.dueDate}).`,
                    unread: true,
                    timestamp: new Date().toISOString()
                  })
                  notificationsSent++

                  // 2. Format Lovable Email Digest Log
                  const emailLog = `
========================================================================
📬 LOVABLE EMAILS - TRANSACTIONAL DIGEST
========================================================================
TO: ${student.email}
SUBJECT: ⏳ Deadline Warning: ${asg.title}
------------------------------------------------------------------------
Dear ${student.name},

This is an automated reminder from FacultyFlow. Your assignment 
"${asg.title}" for the subject "${asg.subject}" is due in ${diffDays} days.

Due Date: ${asg.dueDate}

Please log into your portal to upload your work:
http://localhost:3000/student/assignments

Regards,
FacultyFlow Academic Office
========================================================================
`
                  console.info(emailLog)
                  emailLogs.push(emailLog)

                  // 3. Notify Linked Parents
                  const parents = db.users.filter(
                    (u: any) => u.role === 'parent' && u.linkedChildren?.includes(student.id)
                  )

                  parents.forEach((parent: any) => {
                    db.notifications.push({
                      id: 'notif_cron_p_' + Date.now() + '_' + parent.id,
                      userId: parent.id,
                      title: '⏳ Child Assignment Deadline Warning',
                      content: `Your child ${student.name} has a pending assignment '${asg.title}' due in ${diffDays} days (${asg.dueDate}).`,
                      unread: true,
                      timestamp: new Date().toISOString()
                    })
                    notificationsSent++

                    const parentEmailLog = `
========================================================================
📬 LOVABLE EMAILS - PARENT DIGEST
========================================================================
TO: ${parent.email}
SUBJECT: ⏳ Academic Alert: ${student.name}'s Pending Assignment
------------------------------------------------------------------------
Dear ${parent.name},

Your child, ${student.name}, has a pending assignment "${asg.title}" 
due in ${diffDays} days (${asg.dueDate}).

Please ensure they submit their work on time to maintain their GPA.

Review child progress:
http://localhost:3000/parent/child/${student.id}

Regards,
FacultyFlow Academic Office
========================================================================
`
                    console.info(parentEmailLog)
                    emailLogs.push(parentEmailLog)
                  })
                }
              }
            })
          }
        })

        if (notificationsSent > 0) {
          writeDbRaw(db)
        }

        return Response.json({
          success: true,
          timestamp: new Date().toISOString(),
          notificationsSent,
          emailLogsCount: emailLogs.length,
          emailLogs: emailLogs
        })
      }
    },
  },
})
