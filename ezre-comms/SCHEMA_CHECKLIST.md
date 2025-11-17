# Schema Review Checklist

Before pushing to Convex, verify:

## ✅ Core Tables
- [x] organizations - Multi-tenant support
- [x] users - User management with roles
- [x] files - File storage
- [x] knowledgeChunks - RAG embeddings
- [x] briefs - Content briefs
- [x] contentRequests - Content generation requests
- [x] contentVersions - Generated content variants

## ✅ Publishing & Scheduling
- [x] schedules - Post scheduling
- [x] platformConnections - Social media OAuth
- [x] publishedPosts - Published post tracking
- [x] Recurring schedules support
- [x] Timezone handling
- [x] Retry logic for failed posts

## ✅ Content Management
- [x] contentEditHistory - Edit tracking
- [x] contentComments - Team collaboration
- [x] Approval/rejection workflow
- [x] Media attachments support

## ✅ Analytics & Usage
- [x] engagementEvents - Event tracking
- [x] analyticsAggregates - Aggregated metrics
- [x] usageTracking - Plan limit tracking

## ✅ Indexes
- [x] All tables have proper indexes
- [x] Organization-scoped queries optimized
- [x] Status-based filtering indexed
- [x] Time-based queries indexed

## ✅ Data Types
- [x] All enums properly defined
- [x] Optional fields marked correctly
- [x] Timestamps use numbers (Unix)
- [x] IDs use Convex ID types

## Ready to Push! ✅

Your schema is complete and ready for Convex. Run:
```bash
npx convex dev
```

