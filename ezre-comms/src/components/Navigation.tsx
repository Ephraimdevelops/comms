'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import { Sparkles, Menu, X } from 'lucide-react'
import { useState } from 'react'

export function Navigation() {
  const { user } = useUser()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Don't show nav on homepage
  if (pathname === '/') return null

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/briefs', label: 'Briefs' },
    { href: '/uploads', label: 'Knowledge' },
    { href: '/analytics', label: 'Analytics' },
  ]

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/')

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/dashboard" 
            className="flex items-center space-x-2 group transition-transform hover:scale-105"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-accent to-blue-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-foreground">Ezre Comms</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  isActive(item.href)
                    ? 'text-accent bg-accent/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          {user && (
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-3 px-4 py-2 rounded-full bg-muted/50">
                <div className="w-8 h-8 bg-gradient-to-br from-accent to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.firstName?.[0] || user.email?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium text-foreground">
                  {user.firstName || user.email}
                </span>
              </div>
              <Link
                href="/api/auth/signout"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign Out
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t animate-fade-in">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'text-accent bg-accent/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {user && (
                <div className="pt-4 border-t">
                  <div className="px-4 py-2 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                      {user.firstName?.[0] || user.email?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {user.firstName || user.email}
                      </div>
                      <Link
                        href="/api/auth/signout"
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Sign Out
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
