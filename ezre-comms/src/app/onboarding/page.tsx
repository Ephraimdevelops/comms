'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Sparkles, ArrowRight, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const { user } = useUser()
  const router = useRouter()
  const createOrg = useMutation(api.organizations.create)
  const createUser = useMutation(api.users.create)
  
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    organizationName: '',
    organizationSlug: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id || !user.email) return

    setIsSubmitting(true)

    try {
      // Create organization
      const orgId = await createOrg({
        name: formData.organizationName,
        slug: formData.organizationSlug || formData.organizationName.toLowerCase().replace(/\s+/g, '-'),
        plan: 'STARTER',
      })

      // Create user
      await createUser({
        clerkUserId: user.id,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        role: 'ADMIN',
        organizationId: orgId,
      })

      router.push('/dashboard')
    } catch (error) {
      console.error('Onboarding error:', error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  step >= s
                    ? 'bg-accent border-accent text-white'
                    : 'bg-white border-border text-muted-foreground'
                }`}
              >
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 2 && (
                <div
                  className={`w-16 h-0.5 transition-all ${
                    step > s ? 'bg-accent' : 'bg-border'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="card-elevated">
          {step === 1 ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-accent to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-headline text-foreground mb-4">
                Welcome to Ezre Comms
              </h1>
              <p className="text-subhead text-muted-foreground mb-8">
                Let's set up your organization to get started
              </p>
              <button onClick={() => setStep(2)} className="btn-primary">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-title mb-2">Create Your Organization</h2>
                <p className="text-body text-muted-foreground mb-6">
                  This will be your workspace for managing content and team members
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={formData.organizationName}
                  onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
                  className="w-full border rounded-xl px-4 py-3 text-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  placeholder="Acme Inc."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  URL Slug (optional)
                </label>
                <input
                  type="text"
                  value={formData.organizationSlug}
                  onChange={(e) => setFormData(prev => ({ ...prev, organizationSlug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                  className="w-full border rounded-xl px-4 py-3 text-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  placeholder="acme-inc"
                />
                <p className="text-caption mt-2">
                  Used in your organization URL. Auto-generated if left empty.
                </p>
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.organizationName}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      Create Organization
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

