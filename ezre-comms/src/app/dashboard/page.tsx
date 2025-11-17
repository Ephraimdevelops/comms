'use client'

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser } from '@clerk/nextjs'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { RecentBriefs } from '@/components/dashboard/RecentBriefs'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { Sparkles, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useUser()
  
  // Get user with organization
  const userData = useQuery(
    api.users.getByClerkUserId,
    user?.id ? { clerkUserId: user.id } : "skip"
  )

  // Get recent briefs
  const briefs = useQuery(
    api.briefs.getRecent,
    userData?.organization?._id ? { organizationId: userData.organization._id, limit: 5 } : "skip"
  )

  // Get analytics
  const analytics = useQuery(
    api.content.getAnalytics,
    userData?.organization?._id ? { organizationId: userData.organization._id, days: 7 } : "skip"
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

  const organization = userData.organization
  const firstName = userData.firstName || user.firstName || 'there'

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-muted/30 to-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Welcome Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-accent to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-headline text-foreground">
                Welcome back, {firstName}
              </h1>
              <p className="text-subhead text-muted-foreground mt-1">
                {organization?.name || 'Your organization'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats and Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-8">
            <DashboardStats 
              organization={organization || { plan: 'STARTER', name: '' }}
              analytics={analytics || []}
            />
            <RecentBriefs briefs={briefs || []} />
          </div>
          
          <div className="space-y-8">
            <QuickActions organizationId={organization?._id || ''} />
            
            {/* Usage Card */}
            {userData.organization && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-title">Usage</h3>
                  <TrendingUp className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-body text-muted-foreground">Plan</span>
                    <span className="text-body font-semibold text-foreground">
                      {organization.plan}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-accent to-blue-600 rounded-full transition-all duration-500"
                      style={{ width: '45%' }}
                    />
                  </div>
                  <p className="text-caption">45% of monthly limit used</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
