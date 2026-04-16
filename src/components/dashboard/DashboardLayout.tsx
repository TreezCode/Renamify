'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronsLeft,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const SIDEBAR_EXPANDED = 256
const SIDEBAR_COLLAPSED = 64
const EASE = [0.4, 0, 0.2, 1] as const

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/projects', label: 'Projects', icon: FolderOpen },
  { href: '/dashboard/templates', label: 'Templates', icon: FileText },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

interface DashboardLayoutProps {
  children: ReactNode
  user: {
    email: string
    full_name?: string
  }
}

function NavTooltip({ label, show }: { label: string; show: boolean }) {
  if (!show) return null
  return (
    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 pointer-events-none z-50
      opacity-0 group-hover:opacity-100 transition-opacity duration-150">
      <div className="bg-cosmic-gray border border-white/15 text-white text-sm font-medium
        rounded-lg px-3 py-1.5 whitespace-nowrap shadow-xl shadow-black/40">
        {label}
      </div>
      <div className="absolute right-full top-1/2 -translate-y-1/2
        border-4 border-transparent border-r-white/15" />
    </div>
  )
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('sidebar-collapsed') === 'true'
  })
  function toggleSidebar() {
    const next = !isCollapsed
    setIsCollapsed(next)
    localStorage.setItem('sidebar-collapsed', String(next))
  }

  const sidebarWidth = isCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED

  return (
    <div className="min-h-screen bg-deep-space text-white overflow-x-hidden">
      <div className="flex">

        {/* ── Desktop Sidebar ── */}
        <motion.aside
          animate={{ width: sidebarWidth }}
          transition={{ duration: 0.3, ease: EASE }}
          className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 z-30
            bg-white/3 backdrop-blur-xl border-r border-white/10 overflow-hidden"
        >
          <div className="flex flex-col flex-1 py-6 overflow-hidden">

            {/* Logo */}
            <Link
              href="/"
              className={`mb-8 flex items-center group shrink-0 transition-all duration-300
                ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-6'}`}
            >
              <motion.img
                src={isCollapsed ? '/brand/logo-icon.webp' : '/brand/logo-full.webp'}
                alt="Renamerly"
                animate={{ height: isCollapsed ? 32 : 48 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="w-auto shrink-0"
              />
            </Link>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <div key={item.href} className="relative group">
                    <Link
                      href={item.href}
                      className={`flex items-center py-3 rounded-xl transition-all duration-200
                        ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'}
                        ${isActive
                          ? 'bg-linear-to-r from-treez-purple/20 to-treez-cyan/20 border border-treez-purple/30 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <AnimatePresence initial={false}>
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2, ease: EASE }}
                            className="font-medium whitespace-nowrap overflow-hidden"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                    <NavTooltip label={item.label} show={isCollapsed} />
                  </div>
                )
              })}
            </nav>

            {/* User Info & Sign Out */}
            <div className="mt-6 pt-6 border-t border-white/10 px-3 shrink-0">
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: EASE }}
                    className="mb-3 overflow-hidden"
                  >
                    <p className="text-xs text-gray-500 mb-0.5 px-3">Signed in as</p>
                    <p className="text-sm text-white font-medium truncate px-3">
                      {user.full_name || user.email}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sign Out */}
              <div className="relative group">
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className={`flex items-center py-3 w-full rounded-xl text-gray-400
                      hover:text-white hover:bg-white/5 transition-all duration-200
                      ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'}`}
                  >
                    <LogOut className="w-5 h-5 shrink-0" />
                    <AnimatePresence initial={false}>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2, ease: EASE }}
                          className="font-medium whitespace-nowrap overflow-hidden"
                        >
                          Sign Out
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </form>
                <NavTooltip label="Sign Out" show={isCollapsed} />
              </div>

              {/* Collapse toggle */}
              <button
                onClick={toggleSidebar}
                className={`flex items-center py-2.5 mt-1 w-full rounded-xl text-gray-600
                  hover:text-gray-300 hover:bg-white/5 transition-all duration-200
                  ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'}`}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <motion.div
                  animate={{ rotate: isCollapsed ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <ChevronsLeft className="w-4 h-4 shrink-0" />
                </motion.div>
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2, ease: EASE }}
                      className="text-xs whitespace-nowrap overflow-hidden"
                    >
                      Collapse
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </motion.aside>

        {/* ── Main Content ── */}
        <motion.div
          animate={{ paddingLeft: sidebarWidth }}
          transition={{ duration: 0.3, ease: EASE }}
          className="flex-1 min-w-0 w-full hidden lg:block"
        >
          <main className="min-h-screen">{children}</main>
        </motion.div>

        {/* ── Mobile (no collapse, full-width) ── */}
        <div className="flex-1 min-w-0 w-full lg:hidden">
          {/* Mobile Header */}
          <header className="sticky top-0 z-40 bg-deep-space/95 backdrop-blur-xl border-b border-white/10">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6">
              <Link href="/" className="flex items-center gap-2 cursor-pointer">
                <img
                  src="/brand/logo-full.webp"
                  alt="Renamerly"
                  height="48"
                  className="h-[48px] w-auto"
                />
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg border border-white/10 hover:border-treez-purple transition-colors"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-white" />
                ) : (
                  <Menu className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </header>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white/5 backdrop-blur-xl border-b border-white/10 overflow-hidden"
              >
                <nav className="px-4 py-4 space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                          isActive
                            ? 'bg-linear-to-r from-treez-purple/20 to-treez-cyan/20 border border-treez-purple/30 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    )
                  })}
                  <div className="pt-4 mt-4 border-t border-white/10">
                    <form action="/auth/signout" method="post">
                      <button
                        type="submit"
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </form>
                  </div>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>

          <main className="min-h-screen">{children}</main>
        </div>

      </div>
    </div>
  )
}
