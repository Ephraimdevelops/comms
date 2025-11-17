'use client'

import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-gradient-to-br from-accent/10 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Icon className="w-10 h-10 text-accent" />
      </div>
      <h3 className="text-title mb-2">{title}</h3>
      <p className="text-body text-muted-foreground mb-6 max-w-md mx-auto">
        {description}
      </p>
      {action && (
        <button onClick={action.onClick} className="btn-primary">
          {action.label}
        </button>
      )}
    </div>
  )
}

