'use client'

import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { ArrowRight, Sparkles, Zap, Globe } from 'lucide-react'

export default function HomePage() {
  const { isSignedIn, user } = useUser()

  if (isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-muted">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-display text-foreground mb-6">
              Welcome back, {user.firstName || 'there'}
            </h1>
            <p className="text-subhead text-muted-foreground mb-12">
              Continue creating amazing content for your organization
            </p>
            <Link href="/dashboard" className="btn-primary group">
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo/Brand */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent to-blue-600 rounded-2xl mb-6 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-display text-foreground mb-6 animate-fade-in">
              Transform briefs into
              <br />
              <span className="text-gradient">polished communications</span>
            </h1>

            {/* Subheadline */}
            <p className="text-subhead text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in delay-100">
              AI-powered content generation across all channels. 
              Create, approve, and schedule with ease.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in delay-200">
              <SignUpButton>
                <button className="btn-primary group">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
              </SignUpButton>
              
              <SignInButton>
                <button className="btn-secondary">
                  Sign In
                </button>
              </SignInButton>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 animate-fade-in delay-300">
              <div className="card group">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-title mb-2">AI-Powered</h3>
                <p className="text-body text-muted-foreground">
                  Generate content instantly with GPT-4o and RAG technology
                </p>
              </div>

              <div className="card group">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-title mb-2">Multi-Channel</h3>
                <p className="text-body text-muted-foreground">
                  Create content for Instagram, Facebook, Twitter, LinkedIn, and more
                </p>
              </div>

              <div className="card group">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-title mb-2">Team Collaboration</h3>
                <p className="text-body text-muted-foreground">
                  Review, approve, and collaborate with your team seamlessly
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-muted-foreground/50 rounded-full" />
          </div>
        </div>
      </section>
    </div>
  )
}
