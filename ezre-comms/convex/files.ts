import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ===== QUERIES =====

export const getByOrganization = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const files = await ctx.db
      .query("files")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .collect();

    return await Promise.all(
      files.map(async (file) => {
        const chunks = await ctx.db
          .query("knowledgeChunks")
          .withIndex("by_file", (q) => q.eq("fileId", file._id))
          .collect();

        return {
          ...file,
          knowledgeChunks: chunks.map((chunk) => ({
            id: chunk._id,
            tokenCount: chunk.tokenCount,
          })),
        };
      })
    );
  },
});

export const getById = query({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.fileId);
  },
});

// ===== MUTATIONS =====

export const create = mutation({
  args: {
    filename: v.string(),
    fileType: v.string(),
    storagePath: v.string(),
    storageType: v.union(
      v.literal("convex"),
      v.literal("s3"),
      v.literal("external")
    ),
    sizeBytes: v.number(),
    language: v.optional(v.string()),
    organizationId: v.id("organizations"),
    uploadedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const fileId = await ctx.db.insert("files", {
      filename: args.filename,
      fileType: args.fileType,
      storagePath: args.storagePath,
      storageType: args.storageType,
      sizeBytes: args.sizeBytes,
      language: args.language || "en",
      organizationId: args.organizationId,
      uploadedBy: args.uploadedBy,
      processingStatus: "pending",
      createdAt: Date.now(),
    });

    // Update usage tracking
    await ctx.db
      .query("usageTracking")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .first()
      .then(async (usage) => {
        if (usage) {
          await ctx.db.patch(usage._id, {
            filesUploadedCount: usage.filesUploadedCount + 1,
            updatedAt: Date.now(),
          });
        }
      });

    return fileId;
  },
});

export const updateProcessingStatus = mutation({
  args: {
    fileId: v.id("files"),
    processingStatus: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.fileId, {
      processingStatus: args.processingStatus,
    });
  },
});

export const createKnowledgeChunk = mutation({
  args: {
    fileId: v.id("files"),
    chunkText: v.string(),
    embedding: v.optional(v.array(v.number())),
    startOffset: v.number(),
    endOffset: v.number(),
    tokenCount: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("knowledgeChunks", {
      fileId: args.fileId,
      chunkText: args.chunkText,
      embedding: args.embedding,
      startOffset: args.startOffset,
      endOffset: args.endOffset,
      tokenCount: args.tokenCount,
      createdAt: Date.now(),
    });
  },
});

export const deleteFile = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    // Delete all knowledge chunks first
    const chunks = await ctx.db
      .query("knowledgeChunks")
      .withIndex("by_file", (q) => q.eq("fileId", args.fileId))
      .collect();

    await Promise.all(chunks.map((chunk) => ctx.db.delete(chunk._id)));

    // Delete file
    await ctx.db.delete(args.fileId);
  },
});
