import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ===== CONTENT REQUESTS =====

export const getContentRequest = query({
  args: { contentRequestId: v.id("contentRequests") },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.contentRequestId);
    if (!request) return null;

    const versions = await ctx.db
      .query("contentVersions")
      .withIndex("by_content_request", (q) => q.eq("contentRequestId", args.contentRequestId))
      .collect();

    return {
      ...request,
      versions,
    };
  },
});

export const getByBrief = query({
  args: { briefId: v.id("briefs") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("contentRequests")
      .withIndex("by_brief", (q) => q.eq("briefId", args.briefId))
      .collect();
  },
});

export const getByStatus = query({
  args: {
    organizationId: v.id("organizations"),
    status: v.union(
      v.literal("DRAFTED"),
      v.literal("APPROVED"),
      v.literal("SCHEDULED"),
      v.literal("PUBLISHED"),
      v.literal("REJECTED")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("contentRequests")
      .withIndex("by_status", (q) => 
        q.eq("organizationId", args.organizationId).eq("status", args.status)
      )
      .collect();
  },
});

export const approveContentRequest = mutation({
  args: {
    contentRequestId: v.id("contentRequests"),
    approvedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.contentRequestId, {
      status: "APPROVED",
      approvedBy: args.approvedBy,
      approvedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const rejectContentRequest = mutation({
  args: {
    contentRequestId: v.id("contentRequests"),
    rejectedBy: v.id("users"),
    rejectionReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.contentRequestId, {
      status: "REJECTED",
      rejectedBy: args.rejectedBy,
      rejectedAt: Date.now(),
      rejectionReason: args.rejectionReason,
      updatedAt: Date.now(),
    });
  },
});

// ===== CONTENT VERSIONS =====

export const generateContent = mutation({
  args: {
    briefId: v.id("briefs"),
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
    useRAG: v.optional(v.boolean()),
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    variants: v.array(
      v.object({
        text: v.string(),
        suggestedHashtags: v.array(v.string()),
        suggestedImagePrompt: v.optional(v.string()),
        sources: v.optional(v.array(v.string())),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Get or create content request
    let contentRequest = await ctx.db
      .query("contentRequests")
      .withIndex("by_brief", (q) => q.eq("briefId", args.briefId))
      .filter((q) => q.eq(q.field("channel"), args.channel))
      .first();

    if (!contentRequest) {
      const now = Date.now();
      const contentRequestId = await ctx.db.insert("contentRequests", {
        briefId: args.briefId,
        organizationId: args.organizationId,
        channel: args.channel,
        tone: args.tone,
        variantsRequested: args.variants.length,
        status: "DRAFTED",
        createdAt: now,
        updatedAt: now,
      });
      contentRequest = await ctx.db.get(contentRequestId);
    }

    if (!contentRequest) {
      throw new Error("Failed to create or find content request");
    }

    // Create content versions
    const now = Date.now();
    const contentVersions = await Promise.all(
      args.variants.map((variant, index) =>
        ctx.db.insert("contentVersions", {
          contentRequestId: contentRequest._id,
          contentText: variant.text,
          aiModelUsed: "gpt-4o",
          ragSources: variant.sources ? JSON.stringify(variant.sources) : null,
          suggestedHashtags: variant.suggestedHashtags,
          suggestedImagePrompt: variant.suggestedImagePrompt,
          userId: args.userId,
          isSelected: index === 0, // First variant is selected by default
          createdAt: now,
          updatedAt: now,
        })
      )
    );

    // Update usage tracking
    await ctx.db
      .query("usageTracking")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .first()
      .then(async (usage) => {
        if (usage) {
          await ctx.db.patch(usage._id, {
            generationsCount: usage.generationsCount + 1,
            updatedAt: Date.now(),
          });
        }
      });

    return {
      contentRequestId: contentRequest._id,
      variants: contentVersions.map((version, index) => ({
        id: version,
        text: args.variants[index].text,
        suggestedHashtags: args.variants[index].suggestedHashtags,
        suggestedImagePrompt: args.variants[index].suggestedImagePrompt,
        sources: args.variants[index].sources,
      })),
    };
  },
});

export const updateContentVersion = mutation({
  args: {
    contentVersionId: v.id("contentVersions"),
    contentText: v.string(),
    editedBy: v.id("users"),
    editReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const version = await ctx.db.get(args.contentVersionId);
    if (!version) throw new Error("Content version not found");

    // Save edit history
    await ctx.db.insert("contentEditHistory", {
      contentVersionId: args.contentVersionId,
      previousText: version.contentText,
      newText: args.contentText,
      editedBy: args.editedBy,
      editReason: args.editReason,
      createdAt: Date.now(),
    });

    // Update version
    await ctx.db.patch(args.contentVersionId, {
      contentText: args.contentText,
      updatedAt: Date.now(),
    });
  },
});

export const selectContentVersion = mutation({
  args: {
    contentVersionId: v.id("contentVersions"),
    contentRequestId: v.id("contentRequests"),
  },
  handler: async (ctx, args) => {
    // Unselect all other versions
    const allVersions = await ctx.db
      .query("contentVersions")
      .withIndex("by_content_request", (q) => q.eq("contentRequestId", args.contentRequestId))
      .collect();

    await Promise.all(
      allVersions.map((v) =>
        ctx.db.patch(v._id, {
          isSelected: v._id === args.contentVersionId,
          updatedAt: Date.now(),
        })
      )
    );
  },
});

export const getContentVersion = query({
  args: { contentVersionId: v.id("contentVersions") },
  handler: async (ctx, args) => {
    const version = await ctx.db.get(args.contentVersionId);
    if (!version) return null;

    const editHistory = await ctx.db
      .query("contentEditHistory")
      .withIndex("by_content_version", (q) => q.eq("contentVersionId", args.contentVersionId))
      .order("desc")
      .collect();

    const comments = await ctx.db
      .query("contentComments")
      .withIndex("by_content_version", (q) => q.eq("contentVersionId", args.contentVersionId))
      .collect();

    const media = await ctx.db
      .query("mediaAttachments")
      .withIndex("by_content_version", (q) => q.eq("contentVersionId", args.contentVersionId))
      .collect();

    return {
      ...version,
      editHistory,
      comments,
      media,
    };
  },
});

export const getAnalytics = query({
  args: {
    organizationId: v.id("organizations"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const cutoffDate = Date.now() - (args.days || 30) * 24 * 60 * 60 * 1000;

    return await ctx.db
      .query("analyticsAggregates")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => q.gte(q.field("periodStart"), cutoffDate))
      .order("desc")
      .collect();
  },
});
