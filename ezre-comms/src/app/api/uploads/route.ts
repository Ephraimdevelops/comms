import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { ConvexHttpClient } from "convex/browser";
import { api } from '../../../../convex/_generated/api'
import { UploadFileSchema } from '@/lib/types'
import { processFileForRAG } from '@/lib/rag'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const language = formData.get('language') as string || 'en'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Get user and organization
    const user = await convex.query(api.users.getByClerkUserId, { 
      clerkUserId: userId 
    })

    if (!user?.organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Validate file
    const uploadData = UploadFileSchema.parse({
      filename: file.name,
      fileType: file.type,
      sizeBytes: file.size,
      language
    })

    // Check file size limit
    if (file.size > 50 * 1024 * 1024) { // 50MB
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Save file record using Convex
    const fileId = await convex.mutation(api.files.create, {
      filename: uploadData.filename,
      fileType: uploadData.fileType,
      storagePath: `uploads/${user.organization._id}/${Date.now()}-${uploadData.filename}`,
      sizeBytes: uploadData.sizeBytes,
      language: uploadData.language,
      organizationId: user.organization._id,
      uploadedBy: user._id
    })

    // Process file for RAG (chunking, embedding, storage)
    // Note: processFileForRAG needs to be updated to use Convex
    try {
      await processFileForRAG({
        fileId: fileId,
        buffer,
        filename: uploadData.filename,
        fileType: uploadData.fileType,
        organizationId: user.organization._id
      })
    } catch (processingError) {
      console.error('RAG processing error:', processingError)
      // Don't fail the upload if RAG processing fails
    }

    return NextResponse.json({
      success: true,
      data: {
        fileId: fileId,
        filename: uploadData.filename,
        sizeBytes: uploadData.sizeBytes,
        status: 'uploaded'
      }
    })

  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
