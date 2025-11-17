import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ===== QUERIES =====

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const getById = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.organizationId);
  },
});

export const getWithUsage = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const org = await ctx.db.get(args.organizationId);
    if (!org) return null;

    // Get current period usage
    const now = Date.now();
    const currentPeriod = await ctx.db
      .query("usageTracking")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => 
        q.and(
          q.lte(q.field("periodStart"), now),
          q.gte(q.field("periodEnd"), now)
        )
      )
      .first();

    return {
      ...org,
      currentUsage: currentPeriod || {
        generationsCount: 0,
        scheduledPostsCount: 0,
        filesUploadedCount: 0,
      },
    };
  },
});

// ===== MUTATIONS =====

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    plan: v.optional(
      v.union(
        v.literal("STARTER"),
        v.literal("PRO"),
        v.literal("AGENCY"),
        v.literal("ENTERPRISE")
      )
    ),
    stripeCustomerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const orgId = await ctx.db.insert("organizations", {
      name: args.name,
      slug: args.slug,
      plan: args.plan || "STARTER",
      stripeCustomerId: args.stripeCustomerId,
      createdAt: now,
      updatedAt: now,
    });

    // Initialize usage tracking for first period
    const periodStart = now;
    const periodEnd = now + 30 * 24 * 60 * 60 * 1000; // 30 days
    await ctx.db.insert("usageTracking", {
      organizationId: orgId,
      periodStart,
      periodEnd,
      generationsCount: 0,
      scheduledPostsCount: 0,
      filesUploadedCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return orgId;
  },
});

export const update = mutation({
  args: {
    id: v.id("organizations"),
    name: v.optional(v.string()),
    plan: v.optional(
      v.union(
        v.literal("STARTER"),
        v.literal("PRO"),
        v.literal("AGENCY"),
        v.literal("ENTERPRISE")
      )
    ),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    stripeSubscriptionStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const updateUsage = mutation({
  args: {
    organizationId: v.id("organizations"),
    generationsCount: v.optional(v.number()),
    scheduledPostsCount: v.optional(v.number()),
    filesUploadedCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { organizationId, ...increments } = args;
    
    // Get or create current period
    const now = Date.now();
    let usage = await ctx.db
      .query("usageTracking")
      .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
      .filter((q) => 
        q.and(
          q.lte(q.field("periodStart"), now),
          q.gte(q.field("periodEnd"), now)
        )
      )
      .first();

    if (!usage) {
      // Create new period
      const periodStart = now;
      const periodEnd = now + 30 * 24 * 60 * 60 * 1000;
      const usageId = await ctx.db.insert("usageTracking", {
        organizationId,
        periodStart,
        periodEnd,
        generationsCount: increments.generationsCount || 0,
        scheduledPostsCount: increments.scheduledPostsCount || 0,
        filesUploadedCount: increments.filesUploadedCount || 0,
        createdAt: now,
        updatedAt: now,
      });
      usage = await ctx.db.get(usageId);
    }

    if (usage) {
      await ctx.db.patch(usage._id, {
        generationsCount: usage.generationsCount + (increments.generationsCount || 0),
        scheduledPostsCount: usage.scheduledPostsCount + (increments.scheduledPostsCount || 0),
        filesUploadedCount: usage.filesUploadedCount + (increments.filesUploadedCount || 0),
        updatedAt: Date.now(),
      });
    }
  },
});
