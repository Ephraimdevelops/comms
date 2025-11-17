'use client'

import { TrendingUp, Eye, Heart, MousePointerClick, Crown } from 'lucide-react'

interface DashboardStatsProps {
  organization: {
    plan: string
    name: string
  }
  analytics: Array<{
    impressions: number
    engagement: number
    clicks: number
    shares?: number
    saves?: number
  }>
}

export function DashboardStats({ organization, analytics }: DashboardStatsProps) {
  const totalImpressions = analytics.reduce((sum, a) => sum + (a.impressions || 0), 0)
  const totalEngagement = analytics.reduce((sum, a) => sum + (a.engagement || 0), 0)
  const totalClicks = analytics.reduce((sum, a) => sum + (a.clicks || 0), 0)
  const totalShares = analytics.reduce((sum, a) => sum + (a.shares || 0), 0)

  const stats = [
    {
      label: 'Impressions',
      value: totalImpressions.toLocaleString(),
      icon: Eye,
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Engagement',
      value: totalEngagement.toLocaleString(),
      icon: Heart,
      gradient: 'from-pink-500 to-pink-600',
      bg: 'bg-pink-50',
    },
    {
      label: 'Clicks',
      value: totalClicks.toLocaleString(),
      icon: MousePointerClick,
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Shares',
      value: totalShares.toLocaleString(),
      icon: TrendingUp,
      gradient: 'from-green-500 to-green-600',
      bg: 'bg-green-50',
    },
  ]

  return (
    <div className="card-elevated">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-title">Overview</h2>
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-full border border-amber-200">
          <Crown className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-900">{organization.plan}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className={`${stat.bg} rounded-xl p-5 border border-white/50 transition-all duration-300 hover:scale-105 hover:shadow-lg`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${stat.gradient} rounded-lg flex items-center justify-center shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
