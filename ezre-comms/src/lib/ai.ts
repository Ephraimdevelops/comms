import OpenAI from 'openai'
import { ConvexHttpClient } from "convex/browser";
import { api } from '../../convex/_generated/api'
import { Channel, ContentVariant, RAGSource } from '@/lib/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface GenerateContentParams {
  brief: string
  channel: Channel
  tone?: string
  organizationId: string
  useRAG: boolean
}

export async function generateContentWithRAG({
  brief,
  channel,
  tone,
  organizationId,
  useRAG
}: GenerateContentParams): Promise<ContentVariant[]> {
  
  let ragSources: RAGSource[] = []
  
  if (useRAG) {
    ragSources = await retrieveRelevantChunks(brief, organizationId)
  }

  const systemPrompt = buildSystemPrompt(channel, tone, ragSources)
  
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Generate 3 variants for this brief: ${brief}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // Parse JSON response
    const parsed = JSON.parse(response)
    return parsed.variants || []

  } catch (error) {
    console.error('OpenAI generation error:', error)
    // Fallback to simple generation
    return generateFallbackContent(brief, channel)
  }
}

async function retrieveRelevantChunks(
  query: string, 
  organizationId: string
): Promise<RAGSource[]> {
  try {
    // Generate embedding for the query
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query
    })

    const queryVector = embedding.data[0].embedding

    // Get all files for organization
    const files = await convex.query(api.files.getByOrganization, { 
      organizationId: organizationId as any 
    })

    // Get all chunks for these files and calculate similarity
    const allChunks: Array<{
      chunk: any;
      file: any;
      similarity: number;
    }> = []

    for (const file of files) {
      // Get chunks for this file (we'll need to add a query for this)
      // For now, we'll do a simple text search
      // TODO: Implement proper vector similarity search in Convex
      // This is a simplified version - you may want to use an external vector DB
      // or implement cosine similarity in a Convex action
    }

    // Sort by similarity and take top 4
    allChunks.sort((a, b) => b.similarity - a.similarity)
    const topChunks = allChunks.slice(0, 4)

    return topChunks.map(({ chunk, file }) => ({
      fileId: file._id,
      chunkId: chunk._id,
      filename: file.filename,
      snippet: chunk.chunkText.substring(0, 200) + '...',
      relevance: 0.8 // Placeholder - implement proper similarity calculation
    }))

  } catch (error) {
    console.error('RAG retrieval error:', error)
    return []
  }
}

function buildSystemPrompt(
  channel: Channel, 
  tone?: string, 
  ragSources: RAGSource[] = []
): string {
  const channelInstructions = {
    INSTAGRAM: 'Write engaging Instagram captions with relevant hashtags. Keep it visual and story-driven.',
    FACEBOOK: 'Write Facebook posts that encourage engagement and sharing. Use a conversational tone.',
    TWITTER: 'Write concise Twitter posts under 280 characters. Use hashtags strategically.',
    LINKEDIN: 'Write professional LinkedIn posts that add value to your network. Use industry insights.',
    BLOG: 'Write comprehensive blog post content with clear structure and actionable insights.',
    EMAIL: 'Write clear, professional email content with compelling subject lines.',
    WHATSAPP: 'Write concise WhatsApp messages that are personal and direct.'
  }

  let prompt = `You are Ezre Comms, an AI content assistant. Generate 3 high-quality content variants for ${channel}.

${channelInstructions[channel]}

${tone ? `Tone: ${tone}` : ''}

Return your response as JSON in this exact format:
{
  "variants": [
    {
      "text": "content here",
      "suggestedHashtags": ["#tag1", "#tag2"],
      "suggestedImagePrompt": "optional image description",
      "sources": ["chunk_id_1", "chunk_id_2"]
    }
  ]
}`

  if (ragSources.length > 0) {
    prompt += `\n\nUse these organization-specific sources to inform your content:\n`
    ragSources.forEach((source, index) => {
      prompt += `${index + 1}) [${source.filename}] "${source.snippet}"\n`
    })
    prompt += `\nReference relevant sources in your content and include their chunk IDs in the sources array.`
  }

  return prompt
}

function generateFallbackContent(brief: string, channel: Channel): ContentVariant[] {
  const baseContent = brief.length > 100 ? brief.substring(0, 100) + '...' : brief
  
  return [
    {
      text: `${baseContent} #content #social`,
      suggestedHashtags: ['#content', '#social'],
      suggestedImagePrompt: 'Professional image related to the content'
    },
    {
      text: `${baseContent} #engagement #community`,
      suggestedHashtags: ['#engagement', '#community'],
      suggestedImagePrompt: 'Engaging visual that tells a story'
    },
    {
      text: `${baseContent} #brand #value`,
      suggestedHashtags: ['#brand', '#value'],
      suggestedImagePrompt: 'Clean, branded image with clear messaging'
    }
  ]
}
