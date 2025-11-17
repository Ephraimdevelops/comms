import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ===== QUERIES =====

export const getByOrganization = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("platformConnections")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();
  },
});

export const getActive = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("platformConnections")
      .withIndex("by_active", (q) => 
        q.eq("organizationId", args.organizationId).eq("isActive", true)
      )
      .collect();
  },
});

export const getByPlatform = query({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("platformConnections")
      .withIndex("by_platform", (q) => 
        q.eq("organizationId", args.organizationId).eq("platform", args.platform)
      )
      .collect();
  },
});

// ===== MUTATIONS =====

export const create = mutation({
  args: {
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
    accountId: v.string(),
    accountName: v.string(),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    tokenExpiresAt: v.optional(v.number()),
    metadata: v.optional(v.any()),
    connectedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("platformConnections", {
      organizationId: args.organizationId,
      platform: args.platform,
      accountId: args.accountId,
      accountName: args.accountName,
      accessToken: args.accessToken,
      refreshToken: args.refreshToken,
      tokenExpiresAt: args.tokenExpiresAt,
      isActive: true,
      metadata: args.metadata,
      connectedBy: args.connectedBy,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("platformConnections"),
    accountName: v.optional(v.string()),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    tokenExpiresAt: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const deactivate = mutation({
  args: { id: v.id("platformConnections") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isActive: false,
      updatedAt: Date.now(),
    });
  },
});

