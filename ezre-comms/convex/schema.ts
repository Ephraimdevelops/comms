import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ===== ORGANIZATIONS & USERS =====
  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
    plan: v.union(
      v.literal("STARTER"),
      v.literal("PRO"),
      v.literal("AGENCY"),
      v.literal("ENTERPRISE")
    ),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    stripeSubscriptionStatus: v.optional(v.string()), // active, canceled, past_due
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"]),

  users: defineTable({
    clerkUserId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    role: v.union(
      v.literal("ADMIN"),
      v.literal("EDITOR"),
      v.literal("REVIEWER")
    ),
    organizationId: v.id("organizations"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_user_id", ["clerkUserId"])
    .index("by_organization", ["organizationId"]),

  // ===== USAGE TRACKING =====
  usageTracking: defineTable({
    organizationId: v.id("organizations"),
    periodStart: v.number(), // Start of billing/usage period
    periodEnd: v.number(), // End of billing/usage period
    generationsCount: v.number(), // AI content generations
    scheduledPostsCount: v.number(), // Scheduled posts
    filesUploadedCount: v.number(), // Files uploaded
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_period", ["organizationId", "periodStart"]),

  // ===== SOCIAL MEDIA PLATFORM CONNECTIONS =====
  platformConnections: defineTable({
    organizationId: v.id("organizations"),
    platform: v.union(
      v.literal("INSTAGRAM"),
      v.literal("FACEBOOK"),
      v.literal("TWITTER"),
      v.literal("LINKEDIN"),
      v.literal("BLOG"),
      v.literal("EMAIL"),
      v.literal("WHATSAPP")
    ),
    accountId: v.string(), // External platform account ID
    accountName: v.string(), // Display name
    accessToken: v.string(), // Encrypted OAuth token
    refreshToken: v.optional(v.string()), // For token refresh
    tokenExpiresAt: v.optional(v.number()), // Token expiration timestamp
    isActive: v.boolean(),
    metadata: v.optional(v.any()), // Platform-specific settings
    connectedBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_platform", ["organizationId", "platform"])
    .index("by_active", ["organizationId", "isActive"]),

  // ===== FILES & KNOWLEDGE BASE =====
  files: defineTable({
    filename: v.string(),
    fileType: v.string(),
    storagePath: v.string(), // Convex file storage ID or external URL
    storageType: v.union(
      v.literal("convex"), // Stored in Convex
      v.literal("s3"), // Stored in S3
      v.literal("external") // External URL
    ),
    sizeBytes: v.number(),
    language: v.optional(v.string()),
    organizationId: v.id("organizations"),
    uploadedBy: v.id("users"),
    processingStatus: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    createdAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_status", ["organizationId", "processingStatus"]),

  knowledgeChunks: defineTable({
    fileId: v.id("files"),
    chunkText: v.string(),
    embedding: v.optional(v.array(v.number())), // Vector as array of numbers
    startOffset: v.number(),
    endOffset: v.number(),
    tokenCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_file", ["fileId"]),

  // ===== BRIEFS =====
  briefs: defineTable({
    inputText: v.optional(v.string()),
    inputAudioPath: v.optional(v.string()),
    language: v.string(),
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_user", ["userId"]),

  // ===== CONTENT REQUESTS & VERSIONS =====
  contentRequests: defineTable({
    briefId: v.id("briefs"),
    organizationId: v.id("organizations"),
    channel: v.union(
      v.literal("INSTAGRAM"),
      v.literal("FACEBOOK"),
      v.literal("TWITTER"),
      v.literal("LINKEDIN"),
      v.literal("BLOG"),
      v.literal("EMAIL"),
      v.literal("WHATSAPP")
    ),
    tone: v.optional(v.string()),
    variantsRequested: v.number(),
    status: v.union(
      v.literal("DRAFTED"),
      v.literal("APPROVED"),
      v.literal("SCHEDULED"),
      v.literal("PUBLISHED"),
      v.literal("REJECTED")
    ),
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    rejectedBy: v.optional(v.id("users")),
    rejectedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_brief", ["briefId"])
    .index("by_organization", ["organizationId"])
    .index("by_status", ["organizationId", "status"]),

  contentVersions: defineTable({
    contentRequestId: v.id("contentRequests"),
    contentText: v.string(),
    aiModelUsed: v.string(),
    ragSources: v.optional(v.any()), // JSON array of chunk references
    suggestedHashtags: v.optional(v.array(v.string())),
    suggestedImagePrompt: v.optional(v.string()),
    userId: v.id("users"), // Creator/editor
    isSelected: v.boolean(), // Is this the selected version
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_content_request", ["contentRequestId"])
    .index("by_user", ["userId"])
    .index("by_selected", ["contentRequestId", "isSelected"]),

  // ===== CONTENT EDIT HISTORY =====
  contentEditHistory: defineTable({
    contentVersionId: v.id("contentVersions"),
    previousText: v.string(), // Previous version of content
    newText: v.string(), // New version of content
    editedBy: v.id("users"),
    editReason: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_content_version", ["contentVersionId"])
    .index("by_editor", ["editedBy"]),

  // ===== COMMENTS & COLLABORATION =====
  contentComments: defineTable({
    contentVersionId: v.id("contentVersions"),
    userId: v.id("users"),
    comment: v.string(),
    parentCommentId: v.optional(v.id("contentComments")), // For threaded comments
    isResolved: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_content_version", ["contentVersionId"])
    .index("by_user", ["userId"])
    .index("by_parent", ["parentCommentId"]),

  // ===== MEDIA/ATTACHMENTS =====
  mediaAttachments: defineTable({
    contentVersionId: v.id("contentVersions"),
    filename: v.string(),
    fileType: v.string(),
    storagePath: v.string(), // Convex file ID or external URL
    storageType: v.union(
      v.literal("convex"),
      v.literal("s3"),
      v.literal("external"),
      v.literal("generated") // AI-generated image
    ),
    sizeBytes: v.number(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    altText: v.optional(v.string()),
    metadata: v.optional(v.any()),
    uploadedBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_content_version", ["contentVersionId"]),

  // ===== SCHEDULING =====
  schedules: defineTable({
    contentVersionId: v.id("contentVersions"),
    organizationId: v.id("organizations"),
    platformConnectionId: v.optional(v.id("platformConnections")), // Which account to post to
    scheduledAt: v.number(), // Unix timestamp
    timezone: v.string(), // e.g., "America/New_York"
    channelMeta: v.optional(v.any()), // Platform-specific metadata
    status: v.union(
      v.literal("PENDING"),
      v.literal("PUBLISHED"),
      v.literal("FAILED"),
      v.literal("CANCELLED")
    ),
    publishedAt: v.optional(v.number()),
    publishedPostId: v.optional(v.string()), // External platform post ID
    publishedPostUrl: v.optional(v.string()), // URL to published post
    errorMessage: v.optional(v.string()), // If publishing failed
    retryCount: v.number(), // Number of retry attempts
    maxRetries: v.number(), // Maximum retry attempts
    // Recurring schedule fields
    isRecurring: v.boolean(),
    recurrencePattern: v.optional(v.string()), // "daily", "weekly", "monthly", cron expression
    recurrenceEndDate: v.optional(v.number()), // When to stop recurring
    parentScheduleId: v.optional(v.id("schedules")), // For recurring schedules
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_content_version", ["contentVersionId"])
    .index("by_organization", ["organizationId"])
    .index("by_scheduled_at", ["scheduledAt"])
    .index("by_status", ["organizationId", "status"])
    .index("by_platform", ["platformConnectionId"])
    .index("by_recurring", ["parentScheduleId"]),

  // ===== PUBLISHED POSTS TRACKING =====
  publishedPosts: defineTable({
    scheduleId: v.id("schedules"),
    contentVersionId: v.id("contentVersions"),
    organizationId: v.id("organizations"),
    platformConnectionId: v.id("platformConnections"),
    platformPostId: v.string(), // External platform post ID
    platformPostUrl: v.string(), // URL to published post
    publishedAt: v.number(),
    metadata: v.optional(v.any()), // Platform-specific post metadata
    createdAt: v.number(),
  })
    .index("by_schedule", ["scheduleId"])
    .index("by_organization", ["organizationId"])
    .index("by_platform", ["platformConnectionId"])
    .index("by_published_at", ["organizationId", "publishedAt"]),

  // ===== ENGAGEMENT & ANALYTICS =====
  engagementEvents: defineTable({
    organizationId: v.id("organizations"),
    contentVersionId: v.optional(v.id("contentVersions")),
    publishedPostId: v.optional(v.id("publishedPosts")),
    eventType: v.string(), // like, comment, impression, click, share, save
    value: v.optional(v.number()),
    rawPayload: v.optional(v.any()),
    timestamp: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_content_version", ["contentVersionId"])
    .index("by_published_post", ["publishedPostId"])
    .index("by_timestamp", ["organizationId", "timestamp"]),

  analyticsAggregates: defineTable({
    organizationId: v.id("organizations"),
    period: v.string(), // daily, weekly, monthly
    periodStart: v.number(),
    periodEnd: v.number(),
    impressions: v.number(),
    engagement: v.number(),
    clicks: v.number(),
    shares: v.number(),
    saves: v.number(),
    createdAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_period", ["organizationId", "periodStart"]),
});
