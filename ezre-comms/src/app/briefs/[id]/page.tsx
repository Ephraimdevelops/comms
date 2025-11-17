'use client'

import { useParams } from 'next/navigation'
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { FileText, Sparkles, CheckCircle2, XCircle, MessageSquare, Edit, Calendar, Hash } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

export default function BriefDetailPage() {
  const params = useParams()
  const briefId = params.id as string

  const brief = useQuery(
    api.briefs.getById,
    briefId ? { briefId: briefId as any } : "skip"
  )

  const approveRequest = useMutation(api.content.approveContentRequest)
  const rejectRequest = useMutation(api.content.rejectContentRequest)

  if (!brief) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-body text-muted-foreground">Loading brief...</p>
        </div>
      </div>
    )
  }

  const handleApprove = async (contentRequestId: string) => {
    // This would need the userId - simplified for now
    // await approveRequest({ contentRequestId, approvedBy: userId })
  }

  const handleReject = async (contentRequestId: string) => {
    // await rejectRequest({ contentRequestId, rejectedBy: userId })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-muted/30 to-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/briefs"
            className="text-caption text-muted-foreground hover:text-accent transition-colors mb-4 inline-block"
          >
            ← Back to Briefs
          </Link>
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-accent to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-headline text-foreground">Brief Details</h1>
              <p className="text-subhead text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(brief.createdAt))} ago
              </p>
            </div>
          </div>
        </div>

        {/* Brief Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Brief Text */}
            <div className="card-elevated">
              <h2 className="text-title mb-4">Brief Description</h2>
              <p className="text-body text-foreground whitespace-pre-wrap">
                {brief.inputText || 'No description provided'}
              </p>
            </div>

            {/* Content Requests */}
            <div className="card-elevated">
              <h2 className="text-title mb-6">Generated Content</h2>
              {brief.contentRequests && brief.contentRequests.length > 0 ? (
                <div className="space-y-4">
                  {brief.contentRequests.map((cr: any) => (
                    <div
                      key={cr._id}
                      className="p-5 rounded-xl border bg-white hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-accent/10 to-blue-100 rounded-xl flex items-center justify-center">
                            <Hash className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                            <p className="text-body font-semibold text-foreground">{cr.channel}</p>
                            <p className="text-caption text-muted-foreground">
                              {cr.status} • {cr.variantsRequested} variants
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {cr.status === 'DRAFTED' && (
                            <>
                              <button
                                onClick={() => handleApprove(cr._id)}
                                className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(cr._id)}
                                className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      {cr.contentVersions && cr.contentVersions.length > 0 && (
                        <div className="space-y-3 mt-4">
                          {cr.contentVersions.map((version: any) => (
                            <div
                              key={version._id}
                              className="p-4 rounded-lg bg-muted/30 border"
                            >
                              <p className="text-body text-foreground mb-2">
                                {version.contentText}
                              </p>
                              <div className="flex items-center space-x-4 text-caption text-muted-foreground">
                                <span>Model: {version.aiModelUsed}</span>
                                <span>•</span>
                                <span>{formatDistanceToNow(new Date(version.createdAt))} ago</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-body text-muted-foreground">
                    No content generated yet. Generate content for this brief.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Brief Info */}
            <div className="card">
              <h3 className="text-title mb-4">Brief Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-caption text-muted-foreground mb-1">Language</p>
                  <p className="text-body font-medium">{brief.language || 'en'}</p>
                </div>
                <div>
                  <p className="text-caption text-muted-foreground mb-1">Created</p>
                  <p className="text-body font-medium">
                    {formatDistanceToNow(new Date(brief.createdAt))} ago
                  </p>
                </div>
                {brief.user && (
                  <div>
                    <p className="text-caption text-muted-foreground mb-1">Created by</p>
                    <p className="text-body font-medium">
                      {brief.user.firstName} {brief.user.lastName}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="card">
              <h3 className="text-title mb-4">Actions</h3>
              <div className="space-y-2">
                <Link href={`/briefs/${briefId}/generate`} className="btn-primary w-full justify-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Content
                </Link>
                <Link href={`/briefs/${briefId}/schedule`} className="btn-secondary w-full justify-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Posts
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

