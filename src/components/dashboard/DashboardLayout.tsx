'use client'

import { ReactNode } from 'react'
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
  X
} from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-deep-space text-white">
      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white/3 backdrop-blur-xl border-r border-white/10">
          <div className="flex flex-col flex-1 p-6">
            {/* Logo/Brand */}
            <Link href="/" className="mb-8">
              <h2 className="text-2xl font-bold font-display bg-linear-to-r from-treez-purple to-treez-cyan bg-clip-text text-transparent">
                Renamerly
              </h2>
            </Link>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
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
            </nav>

            {/* User Info & Sign Out */}
            <div className="pt-6 mt-6 border-t border-white/10">
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-1">Signed in as</p>
                <p className="text-sm text-white font-medium truncate">
                  {user.full_name || user.email}
                </p>
              </div>
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
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 lg:pl-64">
          {/* Mobile Header */}
          <header className="lg:hidden sticky top-0 z-40 bg-deep-space/95 backdrop-blur-xl border-b border-white/10">
            <div className="flex items-center justify-between px-4 py-4">
              <Link href="/">
                <h2 className="text-xl font-bold font-display bg-linear-to-r from-treez-purple to-treez-cyan bg-clip-text text-transparent">
                  Renamerly
                </h2>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg border border-white/10 hover:border-treez-purple transition-colors"
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
                className="lg:hidden bg-white/5 backdrop-blur-xl border-b border-white/10 overflow-hidden"
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

          {/* Page Content */}
          <main className="min-h-screen">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
