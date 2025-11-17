import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ===== ENGAGEMENT EVENTS =====

export const createEngagementEvent = mutation({
  args: {
    organizationId: v.id("organizations"),
    contentVersionId: v.optional(v.id("contentVersions")),
    publishedPostId: v.optional(v.id("publishedPosts")),
    eventType: v.string(), // like, comment, impression, click, share, save
    value: v.optional(v.number()),
    rawPayload: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("engagementEvents", {
      organizationId: args.organizationId,
      contentVersionId: args.contentVersionId,
      publishedPostId: args.publishedPostId,
      eventType: args.eventType,
      value: args.value,
      rawPayload: args.rawPayload,
      timestamp: Date.now(),
    });
  },
});

export const getEngagementEvents = query({
  args: {
    organizationId: v.id("organizations"),
    contentVersionId: v.optional(v.id("contentVersions")),
    publishedPostId: v.optional(v.id("publishedPosts")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("engagementEvents")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId));

    if (args.contentVersionId) {
      query = query.filter((q) => q.eq(q.field("contentVersionId"), args.contentVersionId));
    }

    if (args.publishedPostId) {
      query = query.filter((q) => q.eq(q.field("publishedPostId"), args.publishedPostId));
    }

    if (args.startDate || args.endDate) {
      query = query.filter((q) => {
        if (args.startDate && args.endDate) {
          return q.and(
            q.gte(q.field("timestamp"), args.startDate),
            q.lte(q.field("timestamp"), args.endDate)
          );
        }
        if (args.startDate) {
          return q.gte(q.field("timestamp"), args.startDate);
        }
        if (args.endDate) {
          return q.lte(q.field("timestamp"), args.endDate);
        }
        return true;
      });
    }

    return await query.order("desc").collect();
  },
});

// ===== ANALYTICS AGGREGATES =====

export const getAnalyticsAggregates = query({
  args: {
    organizationId: v.id("organizations"),
    period: v.optional(v.string()), // daily, weekly, monthly
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("analyticsAggregates")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId));

    if (args.period) {
      query = query.filter((q) => q.eq(q.field("period"), args.period));
    }

    if (args.startDate) {
      query = query.filter((q) => q.gte(q.field("periodStart"), args.startDate));
    }

    if (args.endDate) {
      query = query.filter((q) => q.lte(q.field("periodEnd"), args.endDate));
    }

    return await query.order("desc").collect();
  },
});

export const createOrUpdateAggregate = mutation({
  args: {
    organizationId: v.id("organizations"),
    period: v.string(), // daily, weekly, monthly
    periodStart: v.number(),
    periodEnd: v.number(),
    impressions: v.optional(v.number()),
    engagement: v.optional(v.number()),
    clicks: v.optional(v.number()),
    shares: v.optional(v.number()),
    saves: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if aggregate exists
    const existing = await ctx.db
      .query("analyticsAggregates")
      .withIndex("by_period", (q) =>
        q.eq("organizationId", args.organizationId).eq("periodStart", args.periodStart)
      )
      .first();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        impressions: (existing.impressions || 0) + (args.impressions || 0),
        engagement: (existing.engagement || 0) + (args.engagement || 0),
        clicks: (existing.clicks || 0) + (args.clicks || 0),
        shares: (existing.shares || 0) + (args.shares || 0),
        saves: (existing.saves || 0) + (args.saves || 0),
      });
      return existing._id;
    } else {
      // Create new
      return await ctx.db.insert("analyticsAggregates", {
        organizationId: args.organizationId,
        period: args.period,
        periodStart: args.periodStart,
        periodEnd: args.periodEnd,
        impressions: args.impressions || 0,
        engagement: args.engagement || 0,
        clicks: args.clicks || 0,
        shares: args.shares || 0,
        saves: args.saves || 0,
        createdAt: Date.now(),
      });
    }
  },
});

