'use client'

import Link from 'next/link'
import { Plus, Upload, Calendar, BarChart3, ArrowRight } from 'lucide-react'

interface QuickActionsProps {
  organizationId: string
}

const actions = [
  {
    href: '/briefs',
    label: 'Create Brief',
    description: 'Start a new content brief',
    icon: Plus,
    gradient: 'from-blue-500 to-blue-600',
    hoverGradient: 'from-blue-600 to-blue-700',
  },
  {
    href: '/uploads',
    label: 'Upload Knowledge',
    description: 'Add files to your knowledge base',
    icon: Upload,
    gradient: 'from-green-500 to-green-600',
    hoverGradient: 'from-green-600 to-green-700',
  },
  {
    href: '/schedules',
    label: 'View Schedules',
    description: 'Manage scheduled posts',
    icon: Calendar,
    gradient: 'from-purple-500 to-purple-600',
    hoverGradient: 'from-purple-600 to-purple-700',
  },
  {
    href: '/analytics',
    label: 'Analytics',
    description: 'View performance metrics',
    icon: BarChart3,
    gradient: 'from-orange-500 to-orange-600',
    hoverGradient: 'from-orange-600 to-orange-700',
  },
]

export function QuickActions({ organizationId }: QuickActionsProps) {
  return (
    <div className="card-elevated">
      <h2 className="text-title mb-6">Quick Actions</h2>
      
      <div className="space-y-3">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group relative block p-4 rounded-xl border bg-white hover:border-transparent transition-all duration-300 hover:shadow-lg hover:scale-[1.02] overflow-hidden"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="relative flex items-center space-x-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-base font-semibold text-foreground group-hover:text-accent transition-colors">
                        {action.label}
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        {action.description}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
