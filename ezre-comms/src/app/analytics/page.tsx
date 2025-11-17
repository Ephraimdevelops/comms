'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { BarChart3, TrendingUp, Eye, Heart, MousePointerClick, Share2, Save, ArrowUpRight } from 'lucide-react'

export default function AnalyticsPage() {
  const { user } = useUser()
  
  const userData = useQuery(
    api.users.getByClerkUserId,
    user?.id ? { clerkUserId: user.id } : "skip"
  )

  const analytics = useQuery(
    api.content.getAnalytics,
    userData?.organization?._id ? { organizationId: userData.organization._id, days: 30 } : "skip"
  )

  if (!user || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-body text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const totalImpressions = analytics?.reduce((sum, a) => sum + (a.impressions || 0), 0) || 0
  const totalEngagement = analytics?.reduce((sum, a) => sum + (a.engagement || 0), 0) || 0
  const totalClicks = analytics?.reduce((sum, a) => sum + (a.clicks || 0), 0) || 0
  const totalShares = analytics?.reduce((sum, a) => sum + (a.shares || 0), 0) || 0
  const totalSaves = analytics?.reduce((sum, a) => sum + (a.saves || 0), 0) || 0

  const metrics = [
    {
      label: 'Impressions',
      value: totalImpressions.toLocaleString(),
      change: '+12.5%',
      icon: Eye,
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Engagement',
      value: totalEngagement.toLocaleString(),
      change: '+8.2%',
      icon: Heart,
      gradient: 'from-pink-500 to-pink-600',
      bg: 'bg-pink-50',
    },
    {
      label: 'Clicks',
      value: totalClicks.toLocaleString(),
      change: '+15.3%',
      icon: MousePointerClick,
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Shares',
      value: totalShares.toLocaleString(),
      change: '+22.1%',
      icon: Share2,
      gradient: 'from-green-500 to-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Saves',
      value: totalSaves.toLocaleString(),
      change: '+5.7%',
      icon: Save,
      gradient: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-50',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-muted/30 to-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-headline text-foreground">Analytics</h1>
                <p className="text-subhead text-muted-foreground mt-1">
                  Track performance and engagement metrics
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-900">Last 30 days</span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {metrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <div
                key={metric.label}
                className={`${metric.bg} rounded-2xl p-6 border border-white/50 transition-all duration-300 hover:scale-105 hover:shadow-lg`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${metric.gradient} rounded-xl flex items-center justify-center shadow-sm`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1 px-2 py-1 bg-white/60 rounded-full">
                    <ArrowUpRight className="w-3 h-3 text-green-600" />
                    <span className="text-xs font-semibold text-green-700">{metric.change}</span>
                  </div>
                </div>
                <div className="text-3xl font-semibold text-foreground mb-1">
                  {metric.value}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  {metric.label}
                </div>
              </div>
            )
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Engagement Over Time */}
          <div className="card-elevated">
            <h2 className="text-title mb-6">Engagement Over Time</h2>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-xl">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-body text-muted-foreground">Chart visualization coming soon</p>
              </div>
            </div>
          </div>

          {/* Top Performing Content */}
          <div className="card-elevated">
            <h2 className="text-title mb-6">Top Performing Content</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-muted/30 border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-accent to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold">
                        {i}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Content Title {i}</p>
                        <p className="text-xs text-muted-foreground">Instagram • 2 days ago</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">1.2K</p>
                      <p className="text-xs text-muted-foreground">engagement</p>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-blue-600 rounded-full"
                      style={{ width: `${100 - i * 20}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

