import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { ConvexHttpClient } from "convex/browser";
import { api } from '../../../../convex/_generated/api'
import { CreateBriefSchema } from '@/lib/types'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const briefData = CreateBriefSchema.parse(body)

    // Get user and organization
    const user = await convex.query(api.users.getByClerkUserId, { 
      clerkUserId: userId 
    })

    if (!user?.organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Create brief using Convex mutation
    const result = await convex.mutation(api.briefs.create, {
      inputText: briefData.inputText,
      inputAudioPath: briefData.inputAudioPath,
      language: briefData.language,
      organizationId: user.organization._id,
      userId: user._id,
      channels: briefData.channels,
      tone: briefData.tone,
      variantsRequested: briefData.variantsRequested,
    })

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Brief creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create brief' },
      { status: 500 }
    )
  }
}
