'use client'

import { formatDistanceToNow } from 'date-fns'
import { FileText, Hash, Clock, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"

interface BriefListProps {
  organizationId: string
}

export function BriefList({ organizationId }: BriefListProps) {
  const briefs = useQuery(
    api.briefs.getRecent,
    organizationId ? { organizationId: organizationId as any, limit: 20 } : "skip"
  )

  if (!briefs) {
    return (
      <div className="card-elevated">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="card-elevated">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-title">All Briefs</h2>
        <div className="text-caption">
          {briefs.length} {briefs.length === 1 ? 'brief' : 'briefs'}
        </div>
      </div>
      
      {briefs.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-accent/10 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-accent" />
          </div>
          <h3 className="text-title mb-2">No briefs yet</h3>
          <p className="text-body text-muted-foreground mb-6">
            Create your first brief to start generating content
          </p>
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
                className="group block p-6 rounded-xl border bg-white hover:border-accent/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-accent/10 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-body text-foreground mb-3 line-clamp-2 group-hover:text-accent transition-colors">
                          {brief.inputText?.substring(0, 150) || 'No description'}
                          {brief.inputText && brief.inputText.length > 150 && '...'}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-caption">
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
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <div className="px-4 py-2 bg-gradient-to-br from-accent/10 to-blue-100 rounded-full border border-accent/20">
                      <div className="text-base font-semibold text-accent">
                        {versionCount}
                      </div>
                      <div className="text-xs text-muted-foreground">versions</div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
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

