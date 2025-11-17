'use client'

import { formatDistanceToNow } from 'date-fns'
import { FileText, Hash, Clock } from 'lucide-react'
import Link from 'next/link'

interface Brief {
  _id: string
  inputText?: string | null
  createdAt: number
  user?: {
    firstName?: string | null
    lastName?: string | null
    email: string
  } | null
  contentRequests?: Array<{
    _id: string
    channel: string
    contentVersions?: Array<{ _id: string }>
  }>
}

interface RecentBriefsProps {
  briefs: Brief[]
}

export function RecentBriefs({ briefs }: RecentBriefsProps) {
  return (
    <div className="card-elevated">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-title">Recent Briefs</h2>
        <Link
          href="/briefs"
          className="text-sm font-medium text-accent hover:text-blue-700 transition-colors"
        >
          View all
        </Link>
      </div>
      
      {briefs.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-body text-muted-foreground mb-2">No briefs created yet</p>
          <p className="text-caption">Create your first brief to get started</p>
          <Link href="/briefs" className="btn-primary mt-6 inline-flex">
            Create Brief
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {briefs.map((brief) => {
            const channelCount = brief.contentRequests?.length || 0
            const versionCount = brief.contentRequests?.reduce(
              (sum, cr) => sum + (cr.contentVersions?.length || 0),
              0
            ) || 0
            const userName = brief.user
              ? `${brief.user.firstName || ''} ${brief.user.lastName || ''}`.trim() || brief.user.email
              : 'Unknown'

            return (
              <Link
                key={brief._id}
                href={`/briefs/${brief._id}`}
                className="group block p-5 rounded-xl border bg-white hover:border-accent/50 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-body text-foreground mb-3 line-clamp-2 group-hover:text-accent transition-colors">
                      {brief.inputText?.substring(0, 120) || 'No description'}
                      {brief.inputText && brief.inputText.length > 120 && '...'}
                    </p>
                    <div className="flex items-center space-x-4 text-caption">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDistanceToNow(new Date(brief.createdAt))} ago</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Hash className="w-3.5 h-3.5" />
                        <span>{channelCount} channels</span>
                      </div>
                      <span className="text-muted-foreground">by {userName}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-1">
                    <div className="px-3 py-1.5 bg-accent/10 rounded-full">
                      <div className="text-sm font-semibold text-accent">
                        {versionCount}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">versions</div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
