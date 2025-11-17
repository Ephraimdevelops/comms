import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ===== QUERIES =====

export const getByOrganization = query({
  args: {
    organizationId: v.id("organizations"),
    status: v.optional(
      v.union(
        v.literal("PENDING"),
        v.literal("PUBLISHED"),
        v.literal("FAILED"),
        v.literal("CANCELLED")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("schedules")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId));

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const schedules = await query.order("desc").take(args.limit || 50);

    return await Promise.all(
      schedules.map(async (schedule) => {
        const contentVersion = await ctx.db.get(schedule.contentVersionId);
        const platformConnection = schedule.platformConnectionId
          ? await ctx.db.get(schedule.platformConnectionId)
          : null;
        const publishedPost = await ctx.db
          .query("publishedPosts")
          .withIndex("by_schedule", (q) => q.eq("scheduleId", schedule._id))
          .first();

        return {
          ...schedule,
          contentVersion,
          platformConnection,
          publishedPost,
        };
      })
    );
  },
});

export const getUpcoming = query({
  args: {
    organizationId: v.id("organizations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db
      .query("schedules")
      .withIndex("by_scheduled_at", (q) => q.eq("scheduledAt", now))
      .filter((q) =>
        q.and(
          q.eq(q.field("organizationId"), args.organizationId),
          q.eq(q.field("status"), "PENDING"),
          q.gte(q.field("scheduledAt"), now)
        )
      )
      .order("asc")
      .take(args.limit || 20);
  },
});

export const getRecurring = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("schedules")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("isRecurring"), true))
      .collect();
  },
});

// ===== MUTATIONS =====

export const create = mutation({
  args: {
    contentVersionId: v.id("contentVersions"),
    organizationId: v.id("organizations"),
    platformConnectionId: v.optional(v.id("platformConnections")),
    scheduledAt: v.number(),
    timezone: v.string(),
    channelMeta: v.optional(v.any()),
    isRecurring: v.optional(v.boolean()),
    recurrencePattern: v.optional(v.string()),
    recurrenceEndDate: v.optional(v.number()),
    maxRetries: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const scheduleId = await ctx.db.insert("schedules", {
      contentVersionId: args.contentVersionId,
      organizationId: args.organizationId,
      platformConnectionId: args.platformConnectionId,
      scheduledAt: args.scheduledAt,
      timezone: args.timezone,
      channelMeta: args.channelMeta,
      status: "PENDING",
      isRecurring: args.isRecurring || false,
      recurrencePattern: args.recurrencePattern,
      recurrenceEndDate: args.recurrenceEndDate,
      retryCount: 0,
      maxRetries: args.maxRetries || 3,
      createdAt: now,
      updatedAt: now,
    });

    // Update content request status
    const contentVersion = await ctx.db.get(args.contentVersionId);
    if (contentVersion) {
      const contentRequest = await ctx.db.get(contentVersion.contentRequestId);
      if (contentRequest) {
        await ctx.db.patch(contentRequest._id, {
          status: "SCHEDULED",
          updatedAt: now,
        });
      }
    }

    // Update usage tracking
    await ctx.db
      .query("usageTracking")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .first()
      .then(async (usage) => {
        if (usage) {
          await ctx.db.patch(usage._id, {
            scheduledPostsCount: usage.scheduledPostsCount + 1,
            updatedAt: Date.now(),
          });
        }
      });

    return scheduleId;
  },
});

export const update = mutation({
  args: {
    id: v.id("schedules"),
    scheduledAt: v.optional(v.number()),
    timezone: v.optional(v.string()),
    channelMeta: v.optional(v.any()),
    status: v.optional(
      v.union(
        v.literal("PENDING"),
        v.literal("PUBLISHED"),
        v.literal("FAILED"),
        v.literal("CANCELLED")
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const markAsPublished = mutation({
  args: {
    scheduleId: v.id("schedules"),
    publishedPostId: v.string(),
    publishedPostUrl: v.string(),
    platformConnectionId: v.id("platformConnections"),
  },
  handler: async (ctx, args) => {
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) throw new Error("Schedule not found");

    const now = Date.now();

    // Update schedule
    await ctx.db.patch(args.scheduleId, {
      status: "PUBLISHED",
      publishedAt: now,
      publishedPostId: args.publishedPostId,
      publishedPostUrl: args.publishedPostUrl,
      updatedAt: now,
    });

    // Create published post record
    await ctx.db.insert("publishedPosts", {
      scheduleId: args.scheduleId,
      contentVersionId: schedule.contentVersionId,
      organizationId: schedule.organizationId,
      platformConnectionId: args.platformConnectionId,
      platformPostId: args.publishedPostId,
      platformPostUrl: args.publishedPostUrl,
      publishedAt: now,
      createdAt: now,
    });

    // Update content request status
    const contentVersion = await ctx.db.get(schedule.contentVersionId);
    if (contentVersion) {
      const contentRequest = await ctx.db.get(contentVersion.contentRequestId);
      if (contentRequest) {
        await ctx.db.patch(contentRequest._id, {
          status: "PUBLISHED",
          updatedAt: now,
        });
      }
    }
  },
});

export const markAsFailed = mutation({
  args: {
    scheduleId: v.id("schedules"),
    errorMessage: v.string(),
    shouldRetry: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) throw new Error("Schedule not found");

    const retryCount = schedule.retryCount + 1;
    const shouldRetry = args.shouldRetry && retryCount < schedule.maxRetries;

    await ctx.db.patch(args.scheduleId, {
      status: shouldRetry ? "PENDING" : "FAILED",
      errorMessage: args.errorMessage,
      retryCount,
      updatedAt: Date.now(),
    });
  },
});

export const cancel = mutation({
  args: { scheduleId: v.id("schedules") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.scheduleId, {
      status: "CANCELLED",
      updatedAt: Date.now(),
    });
  },
});

