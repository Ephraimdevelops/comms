import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ===== QUERIES =====

export const getById = query({
  args: { briefId: v.id("briefs") },
  handler: async (ctx, args) => {
    const brief = await ctx.db.get(args.briefId);
    if (!brief) return null;

    const user = await ctx.db.get(brief.userId);
    const contentRequests = await ctx.db
      .query("contentRequests")
      .withIndex("by_brief", (q) => q.eq("briefId", args.briefId))
      .collect();

    return {
      ...brief,
      user: user
        ? {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          }
        : null,
      contentRequests,
    };
  },
});

export const getRecent = query({
  args: {
    organizationId: v.id("organizations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const briefs = await ctx.db
      .query("briefs")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .order("desc")
      .take(args.limit || 10);

    return await Promise.all(
      briefs.map(async (brief) => {
        const user = await ctx.db.get(brief.userId);
        const contentRequests = await ctx.db
          .query("contentRequests")
          .withIndex("by_brief", (q) => q.eq("briefId", brief._id))
          .collect();

        const contentVersions = await Promise.all(
          contentRequests.map(async (cr) => {
            const versions = await ctx.db
              .query("contentVersions")
              .withIndex("by_content_request", (q) =>
                q.eq("contentRequestId", cr._id)
              )
              .order("desc")
              .first();
            return versions;
          })
        );

        return {
          ...brief,
          user: user
            ? {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
              }
            : null,
          contentRequests: contentRequests.map((cr) => ({
            ...cr,
            contentVersions: contentVersions.filter((cv) => cv !== null),
          })),
        };
      })
    );
  },
});

// ===== MUTATIONS =====

export const create = mutation({
  args: {
    inputText: v.optional(v.string()),
    inputAudioPath: v.optional(v.string()),
    language: v.optional(v.string()),
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    channels: v.array(
      v.union(
        v.literal("INSTAGRAM"),
        v.literal("FACEBOOK"),
        v.literal("TWITTER"),
        v.literal("LINKEDIN"),
        v.literal("BLOG"),
        v.literal("EMAIL"),
        v.literal("WHATSAPP")
      )
    ),
    tone: v.optional(v.string()),
    variantsRequested: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const briefId = await ctx.db.insert("briefs", {
      inputText: args.inputText,
      inputAudioPath: args.inputAudioPath,
      language: args.language || "en",
      organizationId: args.organizationId,
      userId: args.userId,
      createdAt: now,
    });

    // Create content requests for each channel
    const contentRequestIds = await Promise.all(
      args.channels.map((channel) =>
        ctx.db.insert("contentRequests", {
          briefId,
          organizationId: args.organizationId,
          channel,
          tone: args.tone,
          variantsRequested: args.variantsRequested || 3,
          status: "DRAFTED",
          createdAt: now,
          updatedAt: now,
        })
      )
    );

    return {
      briefId,
      contentRequestIds,
    };
  },
});

export const update = mutation({
  args: {
    briefId: v.id("briefs"),
    inputText: v.optional(v.string()),
    inputAudioPath: v.optional(v.string()),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { briefId, ...updates } = args;
    await ctx.db.patch(briefId, updates);
  },
});

export const deleteBrief = mutation({
  args: { briefId: v.id("briefs") },
  handler: async (ctx, args) => {
    // Delete related content requests and their versions
    const contentRequests = await ctx.db
      .query("contentRequests")
      .withIndex("by_brief", (q) => q.eq("briefId", args.briefId))
      .collect();

    for (const cr of contentRequests) {
      const versions = await ctx.db
        .query("contentVersions")
        .withIndex("by_content_request", (q) => q.eq("contentRequestId", cr._id))
        .collect();

      for (const version of versions) {
        // Delete related data
        const comments = await ctx.db
          .query("contentComments")
          .withIndex("by_content_version", (q) => q.eq("contentVersionId", version._id))
          .collect();
        await Promise.all(comments.map((c) => ctx.db.delete(c._id)));

        const media = await ctx.db
          .query("mediaAttachments")
          .withIndex("by_content_version", (q) => q.eq("contentVersionId", version._id))
          .collect();
        await Promise.all(media.map((m) => ctx.db.delete(m._id)));

        const editHistory = await ctx.db
          .query("contentEditHistory")
          .withIndex("by_content_version", (q) => q.eq("contentVersionId", version._id))
          .collect();
        await Promise.all(editHistory.map((e) => ctx.db.delete(e._id)));

        await ctx.db.delete(version._id);
      }

      await ctx.db.delete(cr._id);
    }

    // Delete brief
    await ctx.db.delete(args.briefId);
  },
});
