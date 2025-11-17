'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Plus, Filter } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import Link from 'next/link'

export default function SchedulesPage() {
  const { user } = useUser()
  
  const userData = useQuery(
    api.users.getByClerkUserId,
    user?.id ? { clerkUserId: user.id } : "skip"
  )

  const schedules = useQuery(
    api.schedules.getByOrganization,
    userData?.organization?._id ? { organizationId: userData.organization._id, limit: 50 } : "skip"
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

  const pendingSchedules = schedules?.filter(s => s.status === 'PENDING') || []
  const publishedSchedules = schedules?.filter(s => s.status === 'PUBLISHED') || []
  const failedSchedules = schedules?.filter(s => s.status === 'FAILED') || []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Pending', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' }
      case 'PUBLISHED':
        return { label: 'Published', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' }
      case 'FAILED':
        return { label: 'Failed', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
      case 'CANCELLED':
        return { label: 'Cancelled', icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' }
      default:
        return { label: status, icon: Clock, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-muted/30 to-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-headline text-foreground">Scheduled Posts</h1>
                <p className="text-subhead text-muted-foreground mt-1">
                  Manage and track your scheduled content
                </p>
              </div>
            </div>
            <Link href="/briefs" className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Schedule New Post
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-muted-foreground mb-1">Pending</p>
                <p className="text-3xl font-semibold text-foreground">{pendingSchedules.length}</p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-muted-foreground mb-1">Published</p>
                <p className="text-3xl font-semibold text-foreground">{publishedSchedules.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-muted-foreground mb-1">Failed</p>
                <p className="text-3xl font-semibold text-foreground">{failedSchedules.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Schedules List */}
        <div className="card-elevated">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-title">All Schedules</h2>
            <button className="flex items-center space-x-2 px-4 py-2 rounded-full border hover:bg-muted transition-colors">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter</span>
            </button>
          </div>

          {!schedules || schedules.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-accent/10 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-title mb-2">No scheduled posts</h3>
              <p className="text-body text-muted-foreground mb-6">
                Create a brief and schedule your first post
              </p>
              <Link href="/briefs" className="btn-primary">
                Create Brief
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule) => {
                const statusBadge = getStatusBadge(schedule.status)
                const StatusIcon = statusBadge.icon
                const scheduledDate = new Date(schedule.scheduledAt)
                const isPast = scheduledDate < new Date()

                return (
                  <div
                    key={schedule._id}
                    className="group p-6 rounded-xl border bg-white hover:border-accent/50 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start space-x-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500/10 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-6 h-6 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                            <p className="text-body font-semibold text-foreground">
                              {schedule.contentVersion?.contentText?.substring(0, 60) || 'Scheduled Content'}
                              {(schedule.contentVersion as any)?.contentText && (schedule.contentVersion as any).contentText.length > 60 && '...'}
                            </p>
                              <div className={`px-3 py-1 ${statusBadge.bg} ${statusBadge.border} border rounded-full flex items-center space-x-1.5`}>
                                <StatusIcon className={`w-3.5 h-3.5 ${statusBadge.color}`} />
                                <span className={`text-xs font-medium ${statusBadge.color}`}>
                                  {statusBadge.label}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-caption">
                              <div className="flex items-center space-x-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{format(scheduledDate, 'MMM d, yyyy • h:mm a')}</span>
                                {isPast && schedule.status === 'PENDING' && (
                                  <span className="text-amber-600 font-medium">(Overdue)</span>
                                )}
                              </div>
                              {schedule.platformConnection && (
                                <span>• {(schedule.platformConnection as any)?.platform || 'Unknown'}</span>
                              )}
                              {schedule.isRecurring && (
                                <span className="px-2 py-0.5 bg-accent/10 text-accent rounded-full text-xs font-medium">
                                  Recurring
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {schedule.publishedPost && (
                        <a
                          href={schedule.publishedPost.platformPostUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-ghost text-sm"
                        >
                          View Post
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

