/// <reference types="vite/client" />
import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
  useNavigate,
  useLocation
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import * as React from 'react'
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import { NotFound } from '~/components/NotFound'
import appCss from '~/styles/app.css?url'
import { seo } from '~/utils/seo'
import { getDb } from '~/utils/db'
import { NotificationBell } from '~/components/notification-bell'
import { SearchDialog } from '~/components/search-dialog'
import { 
  LogOut, 
  Search, 
  Menu, 
  X, 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  BookOpen, 
  LineChart, 
  Clock, 
  Settings, 
  MessageSquare, 
  UserPlus, 
  Sun, 
  Moon, 
  Bell,
  Cpu,
  BrainCircuit
} from 'lucide-react'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ...seo({
        title: 'FacultyFlow | Modern Academic Automation Platform',
        description: 'Automate student progress, parent updates, and faculty workload in one fast dashboard.',
      }),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap' }
    ]
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
})

// Authentication Context
export const AuthContext = React.createContext<{
  user: any
  login: (user: any) => void
  logout: () => void
  refreshDb: () => Promise<void>
  db: any
} | null>(null)

function RootDocument({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<any>(null)
  const [db, setDb] = React.useState<any>(null)
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light')
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  
  const navigate = useNavigate()
  const location = useLocation()

  // Fetch db and authenticate from localStorage
  const loadData = async () => {
    try {
      const tokenStr = localStorage.getItem('ff_tokens')
      const token = tokenStr ? JSON.parse(tokenStr).access : undefined
      const data = await getDb({ data: { token } })
      setDb(data)
      
      const authStr = localStorage.getItem('ff_auth')
      if (authStr) {
        const storedUser = JSON.parse(authStr)
        // Sync user state from fresh database
        const freshUser = data?.users?.find((u: any) => u.id === storedUser.id)
        if (freshUser) {
          setUser(freshUser)
        } else {
          setUser(storedUser)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  React.useEffect(() => {
    loadData()
    
    // Theme setup
    const savedTheme = localStorage.getItem('ff_theme') as 'light' | 'dark'
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const currentTheme = savedTheme || systemTheme
    setTheme(currentTheme)
    
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Global Cmd+K / Ctrl+K listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const login = (newUser: any) => {
    localStorage.setItem('ff_auth', JSON.stringify(newUser))
    setUser(newUser)
    if (newUser.role === 'student') navigate({ to: '/student/dashboard' })
    else if (newUser.role === 'parent') navigate({ to: '/parent/dashboard' })
    else if (newUser.role === 'faculty') navigate({ to: '/faculty/dashboard' })
  }

  const logout = () => {
    localStorage.removeItem('ff_auth')
    setUser(null)
    navigate({ to: '/' })
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('ff_theme', newTheme)
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Get notifications for logged in user
  const userNotifications = React.useMemo(() => {
    if (!db || !user) return []
    return db.notifications
      ?.filter((n: any) => n.userId === user.id)
      ?.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) || []
  }, [db, user])

  // Sidebar Links Configuration based on User Role
  const getSidebarLinks = () => {
    if (!user) return []
    if (user.role === 'student') {
      return [
        { label: 'Dashboard', to: '/student/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
        { label: 'My Attendance', to: '/student/attendance', icon: <Calendar className="h-5 w-5" /> },
        { label: 'Assignments', to: '/student/assignments', icon: <FileText className="h-5 w-5" /> },
        { label: 'Study Materials', to: '/student/materials', icon: <BookOpen className="h-5 w-5" /> },
        { label: 'My Performance', to: '/student/performance', icon: <LineChart className="h-5 w-5" /> },
        { label: 'Timetable', to: '/student/timetable', icon: <Clock className="h-5 w-5" /> },
      ]
    }
    if (user.role === 'parent') {
      return [
        { label: 'Overview Dashboard', to: '/parent/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
        { label: 'Faculty Messages', to: '/parent/messages', icon: <MessageSquare className="h-5 w-5" /> },
      ]
    }
    if (user.role === 'faculty') {
      return [
        { label: 'Overview', to: '/faculty/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
        { label: 'Attendance', to: '/faculty/attendance', icon: <Calendar className="h-5 w-5" /> },
        { label: 'Assignments', to: '/faculty/assignments', icon: <FileText className="h-5 w-5" /> },
        { label: 'AI Generator', to: '/faculty/generator', icon: <BrainCircuit className="h-5 w-5" /> },
        { label: 'Messages', to: '/faculty/messages', icon: <MessageSquare className="h-5 w-5" /> },
      ]
    }
    return []
  }

  const isAuthRoute = location.pathname === '/'

  return (
    <html lang="en">
      <head>
        <HeadContent />
        <style>{`
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
          }
        `}</style>
      </head>
      <body className="bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 min-h-screen antialiased flex flex-col">
        <AuthContext.Provider value={{ user, login, logout, refreshDb: loadData, db }}>
          {isAuthRoute || !user ? (
            // Full screen layout for login/welcome pages
            <div className="flex-1 flex flex-col justify-center items-center">
              {children}
            </div>
          ) : (
            // Dashboard Layout with Sidebar & Header
            <div className="flex-1 flex flex-col md:flex-row relative">
              
              {/* SIDEBAR FOR DESKTOP */}
              <aside className="hidden md:flex md:w-64 flex-col bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 shrink-0 select-none">
                <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
                      FF
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-neutral-100 dark:to-neutral-300 bg-clip-text text-transparent">
                      FacultyFlow
                    </span>
                  </div>
                </div>
                
                <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
                  {getSidebarLinks().map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-neutral-100 transition-all font-medium text-sm"
                      activeProps={{
                        className: 'bg-indigo-50/60 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-semibold border-l-2 border-indigo-600 dark:border-indigo-400 rounded-l-none pl-3'
                      }}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  ))}
                  
                  {user.role === 'parent' && db?.users?.filter((u: any) => u.role === 'student' && user.linkedChildren?.includes(u.id)).map((s: any) => (
                    <Link
                      key={s.id}
                      to="/parent/child/$childId"
                      params={{ childId: s.id }}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-neutral-100 transition-all font-medium text-sm pl-8"
                      activeProps={{
                        className: 'bg-indigo-50/60 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-semibold border-l-2 border-indigo-600 dark:border-indigo-400 rounded-l-none pl-7'
                      }}
                    >
                      <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                      {s.name.split(' ')[0]}'s Progress
                    </Link>
                  ))}
                </nav>

                <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all select-none"
                  >
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={user.name}
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-500/20"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">{user.name}</div>
                      <div className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase font-bold tracking-wide">{user.role}</div>
                    </div>
                  </Link>
                </div>
              </aside>

              {/* MOBILE SIDEBAR MODAL */}
              {isSidebarOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden bg-neutral-950/60 backdrop-blur-sm">
                  <div className="w-64 bg-white dark:bg-neutral-900 flex flex-col h-full animate-in slide-in-from-left duration-200">
                    <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-200 dark:border-neutral-800">
                      <span className="text-lg font-bold text-neutral-850 dark:text-neutral-100">FacultyFlow</span>
                      <button onClick={() => setIsSidebarOpen(false)}>
                        <X className="h-5 w-5 text-neutral-500" />
                      </button>
                    </div>
                    
                    <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto" onClick={() => setIsSidebarOpen(false)}>
                      {getSidebarLinks().map((link) => (
                        <Link
                          key={link.to}
                          to={link.to}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-neutral-100 font-medium text-sm"
                          activeProps={{
                            className: 'bg-indigo-50/60 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-semibold'
                          }}
                        >
                          {link.icon}
                          {link.label}
                        </Link>
                      ))}
                      
                      {user.role === 'parent' && db?.users?.filter((u: any) => u.role === 'student' && user.linkedChildren?.includes(u.id)).map((s: any) => (
                        <Link
                          key={s.id}
                          to="/parent/child/$childId"
                          params={{ childId: s.id }}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-neutral-100 font-medium text-sm pl-8"
                          activeProps={{
                            className: 'bg-indigo-50/60 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-semibold'
                          }}
                        >
                          <span className="h-2 w-2 rounded-full bg-indigo-500" />
                          {s.name.split(' ')[0]}'s Progress
                        </Link>
                      ))}
                    </nav>

                    <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
                      <Link
                        to="/profile"
                        onClick={() => setIsSidebarOpen(false)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <img
                          src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt={user.name}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">{user.name}</div>
                          <div className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase font-bold tracking-wide">{user.role}</div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* MAIN CONTENT WORKSPACE */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* HEADER HEADERBAR */}
                <header className="h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 flex items-center justify-between select-none">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsSidebarOpen(true)}
                      className="p-2 md:hidden rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <Menu className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
                    </button>
                    
                    {/* Search Trigger Button */}
                    <button
                      onClick={() => setIsSearchOpen(true)}
                      className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-xs text-neutral-400 dark:text-neutral-500 w-48 font-medium focus:outline-none"
                    >
                      <Search className="h-3.5 w-3.5" />
                      <span>Search...</span>
                      <kbd className="ml-auto text-[9px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 px-1 py-0.5 rounded font-mono shadow-sm">
                        ⌘K
                      </kbd>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Dark Mode Switcher */}
                    <button
                      onClick={toggleTheme}
                      className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-300 focus:outline-none"
                      aria-label="Toggle theme"
                    >
                      {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    </button>

                    {/* Notifications bell */}
                    <NotificationBell
                      userId={user.id}
                      notifications={userNotifications}
                      onRefresh={loadData}
                    />

                    <div className="h-8 w-px bg-neutral-200 dark:bg-neutral-800 mx-1" />

                    {/* Logout Button */}
                    <button
                      onClick={logout}
                      className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 text-neutral-600 hover:text-red-600 dark:text-neutral-300 dark:hover:text-red-400 transition-colors focus:outline-none"
                      title="Log Out"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                  {children}
                </main>
              </div>

              {/* GLOBAL SEARCH DIALOG OVERLAY */}
              <SearchDialog
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                role={user.role}
                db={db}
              />
            </div>
          )}
          <Scripts />
        </AuthContext.Provider>
      </body>
    </html>
  )
}
