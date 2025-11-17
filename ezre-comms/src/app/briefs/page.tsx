'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { BriefForm } from '@/components/briefs/BriefForm'
import { BriefList } from '@/components/briefs/BriefList'
import { FileText, Sparkles } from 'lucide-react'

export default function BriefsPage() {
  const { user } = useUser()
  
  const userData = useQuery(
    api.users.getByClerkUserId,
    user?.id ? { clerkUserId: user.id } : "skip"
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

  const organizationId = userData.organization?._id

  if (!organizationId) {
    return <div>No organization found</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-muted/30 to-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-accent to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-headline text-foreground">Content Briefs</h1>
              <p className="text-subhead text-muted-foreground mt-1">
                Create and manage your content briefs
              </p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <BriefForm organizationId={organizationId} />
          </div>
          
          <div className="lg:col-span-2">
            <BriefList organizationId={organizationId} />
          </div>
        </div>
      </div>
    </div>
  )
}
