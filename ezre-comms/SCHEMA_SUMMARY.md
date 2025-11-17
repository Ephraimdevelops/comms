# Enhanced Schema Summary

## Overview

The Convex schema has been enhanced with all necessary tables and fields to support the full functionality of Ezre Comms, including:
- Social media platform integrations
- Publishing and post tracking
- Content approval workflows
- Usage tracking and limits
- Media attachments
- Recurring schedules
- Content editing history
- Team collaboration features

## New Tables Added

### 1. **usageTracking**
Tracks usage against plan limits per organization.

**Fields:**
- `organizationId` - Which organization
- `periodStart/periodEnd` - Billing/usage period
- `generationsCount` - AI content generations used
- `scheduledPostsCount` - Scheduled posts used
- `filesUploadedCount` - Files uploaded

**Use Cases:**
- Enforce plan limits (e.g., Starter: 10 generations/month)
- Track usage for billing
- Show usage dashboard to users

### 2. **platformConnections**
Stores OAuth connections to social media platforms.

**Fields:**
- `organizationId` - Which organization owns the connection
- `platform` - INSTAGRAM, FACEBOOK, TWITTER, LINKEDIN, etc.
- `accountId` - External platform account ID
- `accountName` - Display name
- `accessToken` - OAuth access token (encrypted)
- `refreshToken` - For token refresh
- `tokenExpiresAt` - Token expiration
- `isActive` - Whether connection is active
- `metadata` - Platform-specific settings

**Use Cases:**
- Connect Instagram/Facebook/Twitter accounts
- Store OAuth tokens securely
- Manage multiple accounts per organization
- Handle token refresh

### 3. **contentEditHistory**
Tracks all edits made to content versions.

**Fields:**
- `contentVersionId` - Which content was edited
- `previousText` - Previous version
- `newText` - New version
- `editedBy` - Who made the edit
- `editReason` - Optional reason for edit
- `createdAt` - When edited

**Use Cases:**
- Show edit history
- Revert to previous versions
- Audit trail for content changes

### 4. **contentComments**
Team collaboration through comments on content.

**Fields:**
- `contentVersionId` - Which content
- `userId` - Who commented
- `comment` - Comment text
- `parentCommentId` - For threaded/reply comments
- `isResolved` - Whether comment is resolved
- `createdAt/updatedAt` - Timestamps

**Use Cases:**
- Team feedback on content
- Approval/rejection with comments
- Threaded discussions
- Mark comments as resolved

### 5. **mediaAttachments**
Stores images, videos, and other media for posts.

**Fields:**
- `contentVersionId` - Which content
- `filename` - Original filename
- `fileType` - MIME type
- `storagePath` - Convex file ID or external URL
- `storageType` - convex, s3, external, or generated
- `sizeBytes` - File size
- `width/height` - For images
- `altText` - Accessibility
- `metadata` - Additional metadata
- `uploadedBy` - Who uploaded

**Use Cases:**
- Attach images to Instagram posts
- Store AI-generated images
- Support video content
- Track media assets

### 6. **publishedPosts**
Tracks successfully published posts across platforms.

**Fields:**
- `scheduleId` - Related schedule
- `contentVersionId` - Which content was published
- `organizationId` - Organization
- `platformConnectionId` - Which account posted
- `platformPostId` - External platform post ID
- `platformPostUrl` - URL to published post
- `publishedAt` - When published
- `metadata` - Platform-specific data

**Use Cases:**
- Track published posts
- Link back to original content
- Store post URLs for analytics
- Handle post updates/deletions

## Enhanced Existing Tables

### **organizations**
**Added:**
- `stripeSubscriptionId` - Stripe subscription ID
- `stripeSubscriptionStatus` - active, canceled, past_due

### **files**
**Added:**
- `storageType` - convex, s3, or external
- `processingStatus` - pending, processing, completed, failed

### **contentRequests**
**Added:**
- `approvedBy` - Who approved
- `approvedAt` - When approved
- `rejectedBy` - Who rejected
- `rejectedAt` - When rejected
- `rejectionReason` - Why rejected
- `updatedAt` - Last update timestamp

**New Index:**
- `by_status` - Query by status

### **contentVersions**
**Added:**
- `suggestedHashtags` - AI-suggested hashtags
- `suggestedImagePrompt` - AI image generation prompt
- `isSelected` - Is this the selected version
- `updatedAt` - Last update timestamp

**New Index:**
- `by_selected` - Find selected version

### **schedules**
**Added:**
- `platformConnectionId` - Which account to post to
- `timezone` - Timezone for scheduling
- `publishedPostId` - External platform post ID
- `publishedPostUrl` - URL to published post
- `errorMessage` - Publishing error details
- `retryCount` - Retry attempts
- `maxRetries` - Max retry limit
- `isRecurring` - Is this a recurring post
- `recurrencePattern` - daily, weekly, monthly, cron
- `recurrenceEndDate` - When to stop recurring
- `parentScheduleId` - For recurring schedules
- `updatedAt` - Last update timestamp

**New Indexes:**
- `by_status` - Query by status
- `by_platform` - Query by platform connection
- `by_recurring` - Query recurring schedules

### **engagementEvents**
**Added:**
- `publishedPostId` - Link to published post
- `eventType` - Expanded: like, comment, impression, click, share, save

**New Index:**
- `by_published_post` - Query events by post
- `by_timestamp` - Time-based queries

### **analyticsAggregates**
**Added:**
- `shares` - Share count
- `saves` - Save count

## Indexes Summary

All tables now have proper indexes for:
- Organization-scoped queries
- Status-based filtering
- Time-based queries
- Relationship lookups
- Performance optimization

## Key Features Enabled

### ✅ Social Media Integration
- Connect multiple accounts per platform
- Store OAuth tokens securely
- Track which account posted what

### ✅ Publishing & Tracking
- Track published posts with URLs
- Store platform post IDs
- Handle publishing errors and retries

### ✅ Content Approval Workflow
- Track who approved/rejected
- Store rejection reasons
- Comments for collaboration

### ✅ Usage Tracking
- Track generations, posts, files
- Enforce plan limits
- Billing period tracking

### ✅ Media Management
- Store images/videos
- Support AI-generated media
- Track media assets

### ✅ Recurring Schedules
- Daily, weekly, monthly posts
- Custom cron patterns
- End date support

### ✅ Content History
- Full edit history
- Version comparison
- Audit trail

### ✅ Team Collaboration
- Comments on content
- Threaded discussions
- Resolution tracking

## Next Steps

1. **Push schema to Convex**: Run `npx convex dev` to push this schema
2. **Create queries/mutations**: Add Convex functions for new tables
3. **Update API routes**: Use new schema fields
4. **Build UI components**: For approvals, comments, media, etc.

## Schema is Ready! 🚀

The schema now supports all planned features. You can push it to Convex and start building!

