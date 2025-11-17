import OpenAI from 'openai'
import { ConvexHttpClient } from "convex/browser";
import { api } from '../../convex/_generated/api'
import { APP_CONFIG } from '@/lib/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface ProcessFileParams {
  fileId: string
  buffer: Buffer
  filename: string
  fileType: string
  organizationId: string
}

export async function processFileForRAG({
  fileId,
  buffer,
  filename,
  fileType,
  organizationId
}: ProcessFileParams) {
  
  let text = ''
  
  try {
    // Extract text based on file type
    switch (fileType) {
      case 'application/pdf':
        text = await extractPDFText(buffer)
        break
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        text = await extractDocxText(buffer)
        break
      case 'text/plain':
        text = buffer.toString('utf-8')
        break
      case 'video/mp4':
      case 'audio/mpeg':
        text = await transcribeMedia(buffer, fileType)
        break
      default:
        console.warn(`Unsupported file type: ${fileType}`)
        return
    }

    if (!text.trim()) {
      console.warn(`No text extracted from ${filename}`)
      return
    }

    // Chunk the text
    const chunks = chunkText(text, APP_CONFIG.chunkSize, APP_CONFIG.chunkOverlap)
    
    // Generate embeddings and store chunks using Convex
    await Promise.all(
      chunks.map(async (chunk, index) => {
        try {
          const embedding = await generateEmbedding(chunk.text)
          
          await convex.mutation(api.files.createKnowledgeChunk, {
            fileId: fileId as any,
            chunkText: chunk.text,
            embedding: embedding, // Store as array, not JSON string
            startOffset: chunk.startOffset,
            endOffset: chunk.endOffset,
            tokenCount: estimateTokenCount(chunk.text)
          })
        } catch (error) {
          console.error(`Error processing chunk ${index}:`, error)
        }
      })
    )

    console.log(`Successfully processed ${filename}: ${chunks.length} chunks created`)

  } catch (error) {
    console.error(`Error processing file ${filename}:`, error)
    throw error
  }
}

async function extractPDFText(buffer: Buffer): Promise<string> {
  // For MVP, we'll use a simple approach
  // In production, use pdf-parse or similar library
  try {
    const pdfParse = require('pdf-parse')
    const data = await pdfParse(buffer)
    return data.text
  } catch (error) {
    console.error('PDF extraction error:', error)
    return ''
  }
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  // For MVP, we'll use a simple approach
  // In production, use mammoth or similar library
  try {
    const mammoth = require('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  } catch (error) {
    console.error('DOCX extraction error:', error)
    return ''
  }
}

async function transcribeMedia(buffer: Buffer, fileType: string): Promise<string> {
  try {
    // Use OpenAI Whisper for transcription
    const transcription = await openai.audio.transcriptions.create({
      file: new File([buffer], 'audio.mp3', { type: fileType }),
      model: 'whisper-1'
    })
    return transcription.text
  } catch (error) {
    console.error('Transcription error:', error)
    return ''
  }
}

function chunkText(text: string, chunkSize: number, overlap: number): Array<{
  text: string
  startOffset: number
  endOffset: number
}> {
  const chunks = []
  let start = 0
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    const chunkText = text.substring(start, end)
    
    chunks.push({
      text: chunkText,
      startOffset: start,
      endOffset: end
    })
    
    start = end - overlap
    if (start >= text.length) break
  }
  
  return chunks
}

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text
    })
    return response.data[0].embedding
  } catch (error) {
    console.error('Embedding generation error:', error)
    throw error
  }
}

function estimateTokenCount(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4)
}
