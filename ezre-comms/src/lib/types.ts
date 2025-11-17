import { z } from 'zod'

// Database enums (matching Prisma schema)
export enum Plan {
  STARTER = 'STARTER',
  PRO = 'PRO',
  AGENCY = 'AGENCY',
  ENTERPRISE = 'ENTERPRISE'
}

export enum Role {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  REVIEWER = 'REVIEWER'
}

export enum Channel {
  INSTAGRAM = 'INSTAGRAM',
  FACEBOOK = 'FACEBOOK',
  TWITTER = 'TWITTER',
  LINKEDIN = 'LINKEDIN',
  BLOG = 'BLOG',
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP'
}

export enum ContentStatus {
  DRAFTED = 'DRAFTED',
  APPROVED = 'APPROVED',
  SCHEDULED = 'SCHEDULED',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED'
}

export enum ScheduleStatus {
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

// Validation schemas
export const CreateBriefSchema = z.object({
  inputText: z.string().min(1, 'Brief text is required'),
  inputAudioPath: z.string().optional(),
  language: z.string().default('en'),
  channels: z.array(z.nativeEnum(Channel)).min(1, 'At least one channel is required'),
  tone: z.string().optional(),
  variantsRequested: z.number().min(1).max(5).default(3)
})

export const GenerateContentSchema = z.object({
  briefId: z.string(),
  channel: z.nativeEnum(Channel),
  tone: z.string().optional(),
  useRAG: z.boolean().default(true)
})

export const ScheduleContentSchema = z.object({
  contentVersionId: z.string(),
  scheduledAt: z.string().datetime(),
  channelMeta: z.record(z.any()).optional()
})

export const UploadFileSchema = z.object({
  filename: z.string(),
  fileType: z.string(),
  sizeBytes: z.number().positive(),
  language: z.string().default('en')
})

// Type exports
export type CreateBriefInput = z.infer<typeof CreateBriefSchema>
export type GenerateContentInput = z.infer<typeof GenerateContentSchema>
export type ScheduleContentInput = z.infer<typeof ScheduleContentSchema>
export type UploadFileInput = z.infer<typeof UploadFileSchema>

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ContentVariant {
  text: string
  suggestedHashtags: string[]
  suggestedImagePrompt?: string
  sources?: string[]
}

export interface RAGSource {
  fileId: string
  chunkId: string
  filename: string
  snippet: string
  relevance: number
}

// Configuration
export const APP_CONFIG = {
  name: 'Ezre Comms',
  description: 'AI-powered communications assistant for organizations',
  version: '1.0.0',
  maxFileSize: 50 * 1024 * 1024, // 50MB
  supportedFileTypes: ['pdf', 'docx', 'pptx', 'txt', 'mp4', 'mp3'],
  chunkSize: 500,
  chunkOverlap: 100,
  ragTopK: 4
} as const

// Pricing tiers
export const PRICING_TIERS = {
  STARTER: {
    name: 'Starter',
    price: 0,
    generations: 10,
    scheduledPosts: 2,
    users: 1,
    orgKnowledgeFiles: 0,
    features: ['Basic templates', 'Single user']
  },
  PRO: {
    name: 'Pro',
    price: 20,
    generations: 500,
    scheduledPosts: 50,
    users: 3,
    orgKnowledgeFiles: 10,
    features: ['Team collaboration', 'Org knowledge', 'Basic analytics', '1 brand profile']
  },
  AGENCY: {
    name: 'Agency',
    price: 150,
    generations: 5000,
    scheduledPosts: -1, // unlimited
    users: 10,
    orgKnowledgeFiles: 100,
    features: ['Advanced analytics', 'Internal comms mode', 'Priority support', 'Multi-brand profiles']
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: -1, // custom
    generations: -1, // unlimited
    scheduledPosts: -1, // unlimited
    users: -1, // unlimited
    orgKnowledgeFiles: -1, // unlimited
    features: ['SSO', 'White-label', 'Dedicated support', 'Custom integrations', 'SLA']
  }
} as const
