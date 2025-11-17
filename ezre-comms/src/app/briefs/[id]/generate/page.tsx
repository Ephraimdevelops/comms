'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import { useUser } from '@clerk/nextjs'
import { Sparkles, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

export default function GenerateContentPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const briefId = params.id as string

  const brief = useQuery(
    api.briefs.getById,
    briefId ? { briefId: briefId as any } : "skip"
  )

  const userData = useQuery(
    api.users.getByClerkUserId,
    user?.id ? { clerkUserId: user.id } : "skip"
  )

  const generateContent = useMutation(api.content.generateContent)
  const [generating, setGenerating] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [tone, setTone] = useState('')

  const handleGenerate = async (channel: string) => {
    if (!userData?._id || !userData.organization?._id) return

    setGenerating(true)
    setSelectedChannel(channel)

    try {
      // This would call the AI generation API
      // For now, we'll show the flow
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // After generation, redirect back to brief
      router.push(`/briefs/${briefId}`)
    } catch (error) {
      console.error('Generation error:', error)
      setGenerating(false)
    }
  }

  const channels = [
    { value: 'INSTAGRAM', label: 'Instagram', icon: '📷' },
    { value: 'FACEBOOK', label: 'Facebook', icon: '👥' },
    { value: 'TWITTER', label: 'Twitter', icon: '🐦' },
    { value: 'LINKEDIN', label: 'LinkedIn', icon: '💼' },
    { value: 'BLOG', label: 'Blog', icon: '📝' },
    { value: 'EMAIL', label: 'Email', icon: '✉️' },
    { value: 'WHATSAPP', label: 'WhatsApp', icon: '💬' },
  ]

  if (!brief || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-body text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-muted/30 to-white">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <Link
          href={`/briefs/${briefId}`}
          className="text-caption text-muted-foreground hover:text-accent transition-colors mb-8 inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Brief
        </Link>

        <div className="card-elevated">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-accent to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-headline text-foreground mb-4">Generate Content</h1>
            <p className="text-subhead text-muted-foreground">
              Select a channel to generate AI-powered content for your brief
            </p>
          </div>

          {/* Brief Preview */}
          <div className="mb-8 p-6 rounded-xl bg-muted/30 border">
            <p className="text-caption text-muted-foreground mb-2">Brief</p>
            <p className="text-body text-foreground">
              {brief.inputText || 'No description'}
            </p>
          </div>

          {/* Tone Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-foreground mb-3">
              Tone (Optional)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {['Professional', 'Casual', 'Friendly', 'Authoritative', 'Inspiring', 'Conversational'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t.toLowerCase())}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    tone === t.toLowerCase()
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <span className="text-sm font-medium text-foreground">{t}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Channel Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-foreground mb-3">
              Select Channel
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {channels.map((channel) => (
                <button
                  key={channel.value}
                  onClick={() => handleGenerate(channel.value)}
                  disabled={generating}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    generating && selectedChannel === channel.value
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-accent/50 hover:shadow-md'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {generating && selectedChannel === channel.value ? (
                    <div className="flex flex-col items-center space-y-3">
                      <Loader2 className="w-6 h-6 text-accent animate-spin" />
                      <span className="text-sm font-medium text-foreground">Generating...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2">
                      <span className="text-3xl">{channel.icon}</span>
                      <span className="text-sm font-medium text-foreground">{channel.label}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {generating && (
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">Generating content...</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Using AI to create {selectedChannel} content based on your brief
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

