'use client'

import { useState } from 'react'
import { Channel, CreateBriefInput } from '@/lib/types'
import { Plus, Sparkles, Check } from 'lucide-react'
import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { useUser } from '@clerk/nextjs'
import { useQuery } from "convex/react"

interface BriefFormProps {
  organizationId: string
}

const channelIcons: Record<Channel, string> = {
  INSTAGRAM: '📷',
  FACEBOOK: '👥',
  TWITTER: '🐦',
  LINKEDIN: '💼',
  BLOG: '📝',
  EMAIL: '✉️',
  WHATSAPP: '💬',
}

const tones = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'inspiring', label: 'Inspiring' },
  { value: 'conversational', label: 'Conversational' },
]

export function BriefForm({ organizationId }: BriefFormProps) {
  const { user } = useUser()
  const userData = useQuery(
    api.users.getByClerkUserId,
    user?.id ? { clerkUserId: user.id } : "skip"
  )

  const createBrief = useMutation(api.briefs.create)
  const [formData, setFormData] = useState<CreateBriefInput>({
    inputText: '',
    language: 'en',
    channels: [],
    tone: '',
    variantsRequested: 3
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userData?._id || formData.channels.length === 0) return

    setIsSubmitting(true)
    setSuccess(false)

    try {
      await createBrief({
        inputText: formData.inputText,
        language: formData.language,
        organizationId: organizationId as any,
        userId: userData._id,
        channels: formData.channels,
        tone: formData.tone || undefined,
        variantsRequested: formData.variantsRequested,
      })

      setSuccess(true)
      setFormData({
        inputText: '',
        language: 'en',
        channels: [],
        tone: '',
        variantsRequested: 3
      })

      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Error creating brief:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleChannel = (channel: Channel) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }))
  }

  return (
    <div className="card-elevated sticky top-24">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-accent to-blue-600 rounded-xl flex items-center justify-center">
          <Plus className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-title">Create Brief</h2>
      </div>
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-2">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-900">Brief created successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Brief Description
          </label>
          <textarea
            value={formData.inputText}
            onChange={(e) => setFormData(prev => ({ ...prev, inputText: e.target.value }))}
            className="w-full border rounded-xl px-4 py-3 text-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all resize-none"
            rows={5}
            placeholder="Describe what you want to communicate... Be specific about your message, audience, and goals."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-3">
            Select Channels
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(Channel).map((channel) => {
              const isSelected = formData.channels.includes(channel)
              return (
                <button
                  key={channel}
                  type="button"
                  onClick={() => toggleChannel(channel)}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                    isSelected
                      ? 'border-accent bg-accent/10 shadow-sm'
                      : 'border-border bg-white hover:border-accent/50 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{channelIcons[channel]}</span>
                    <span className="text-sm font-medium text-foreground">{channel}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-accent ml-auto" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Tone
          </label>
          <select
            value={formData.tone}
            onChange={(e) => setFormData(prev => ({ ...prev, tone: e.target.value }))}
            className="w-full border rounded-xl px-4 py-3 text-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all bg-white"
          >
            <option value="">Select tone (optional)</option>
            {tones.map(tone => (
              <option key={tone.value} value={tone.value}>{tone.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Number of Variants
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={formData.variantsRequested}
            onChange={(e) => setFormData(prev => ({ ...prev, variantsRequested: parseInt(e.target.value) }))}
            className="w-full border rounded-xl px-4 py-3 text-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || formData.channels.length === 0 || !userData}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Creating...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <Sparkles className="w-4 h-4 mr-2" />
              Create Brief
            </span>
          )}
        </button>
      </form>
    </div>
  )
}
