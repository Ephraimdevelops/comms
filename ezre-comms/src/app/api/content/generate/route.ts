import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { ConvexHttpClient } from "convex/browser";
import { api } from '../../../../convex/_generated/api'
import { GenerateContentSchema } from '@/lib/types'
import { generateContentWithRAG } from '@/lib/ai'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { briefId, channel, tone, useRAG } = GenerateContentSchema.parse(body)

    // Get user and organization
    const user = await convex.query(api.users.getByClerkUserId, { 
      clerkUserId: userId 
    })

    if (!user?.organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Get brief
    const brief = await convex.query(api.briefs.getById, { 
      briefId: briefId as any 
    })

    if (!brief) {
      return NextResponse.json({ error: 'Brief not found' }, { status: 404 })
    }

    // Generate content using AI (needs to be updated to use Convex)
    const variants = await generateContentWithRAG({
      brief: brief.inputText || '',
      channel,
      tone,
      organizationId: user.organization._id,
      useRAG: useRAG ?? true
    })

    // Save content versions using Convex
    const result = await convex.mutation(api.content.generate, {
      briefId: brief._id,
      channel,
      tone,
      useRAG: useRAG ?? true,
      organizationId: user.organization._id,
      userId: user._id,
      variants
    })

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Content generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}
