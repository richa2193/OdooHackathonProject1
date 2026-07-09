import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="mb-4 text-4xl font-bold tracking-tight text-primary">
        Welcome to FacultyFlow
      </h1>
      <p className="mb-8 text-lg text-text-muted">
        Lightning-fast Faculty Workload & Academic Automation Platform
      </p>
      <div className="flex gap-4">
        <a
          href="/login"
          className="rounded-card bg-primary px-6 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-primary-hover"
        >
          Sign In
        </a>
        <a
          href="/register"
          className="rounded-card border border-border bg-surface px-6 py-2.5 font-medium shadow-sm transition-colors hover:bg-background"
        >
          Register
        </a>
      </div>
    </div>
  )
}
