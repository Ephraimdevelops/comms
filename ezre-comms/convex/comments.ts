import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ===== QUERIES =====

export const getByContentVersion = query({
  args: { contentVersionId: v.id("contentVersions") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("contentComments")
      .withIndex("by_content_version", (q) => q.eq("contentVersionId", args.contentVersionId))
      .order("desc")
      .collect();

    // Fetch user details for each comment
    return await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        return {
          ...comment,
          user: user
            ? {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
              }
            : null,
        };
      })
    );
  },
});

// ===== MUTATIONS =====

export const create = mutation({
  args: {
    contentVersionId: v.id("contentVersions"),
    userId: v.id("users"),
    comment: v.string(),
    parentCommentId: v.optional(v.id("contentComments")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("contentComments", {
      contentVersionId: args.contentVersionId,
      userId: args.userId,
      comment: args.comment,
      parentCommentId: args.parentCommentId,
      isResolved: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("contentComments"),
    comment: v.optional(v.string()),
    isResolved: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const resolve = mutation({
  args: { id: v.id("contentComments") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isResolved: true,
      updatedAt: Date.now(),
    });
  },
});

export const deleteComment = mutation({
  args: { id: v.id("contentComments") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

