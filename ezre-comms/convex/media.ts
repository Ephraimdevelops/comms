import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ===== QUERIES =====

export const getByContentVersion = query({
  args: { contentVersionId: v.id("contentVersions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mediaAttachments")
      .withIndex("by_content_version", (q) => q.eq("contentVersionId", args.contentVersionId))
      .collect();
  },
});

// ===== MUTATIONS =====

export const create = mutation({
  args: {
    contentVersionId: v.id("contentVersions"),
    filename: v.string(),
    fileType: v.string(),
    storagePath: v.string(),
    storageType: v.union(
      v.literal("convex"),
      v.literal("s3"),
      v.literal("external"),
      v.literal("generated")
    ),
    sizeBytes: v.number(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    altText: v.optional(v.string()),
    metadata: v.optional(v.any()),
    uploadedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("mediaAttachments", {
      contentVersionId: args.contentVersionId,
      filename: args.filename,
      fileType: args.fileType,
      storagePath: args.storagePath,
      storageType: args.storageType,
      sizeBytes: args.sizeBytes,
      width: args.width,
      height: args.height,
      altText: args.altText,
      metadata: args.metadata,
      uploadedBy: args.uploadedBy,
      createdAt: Date.now(),
    });
  },
});

export const deleteMedia = mutation({
  args: { id: v.id("mediaAttachments") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

