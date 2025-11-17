# Convex Migration Guide

## What Changed

This project has been migrated from Prisma/PostgreSQL to Convex backend.

### Removed
- ✅ Prisma schema and client
- ✅ PostgreSQL database connection
- ✅ Prisma-related scripts and dependencies
- ✅ `lib/db.ts` Prisma functions

### Added
- ✅ Convex schema (`convex/schema.ts`)
- ✅ Convex queries and mutations (`convex/*.ts`)
- ✅ ConvexProvider in root layout
- ✅ Convex configuration

## Next Steps

### 1. Initialize Convex Project

Run this command to set up your Convex project:

```bash
npx convex dev
```

This will:
- Create a Convex account (if needed)
- Set up your project
- Generate the deployment URL
- Add `NEXT_PUBLIC_CONVEX_URL` to your `.env.local`

### 2. Update Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

### 3. Update API Routes

The current API routes (`/api/briefs`, `/api/content/generate`, `/api/uploads`) need to be updated to either:

**Option A: Use Convex HTTP Client (for API routes)**
```typescript
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
await client.mutation(api.briefs.create, { ... });
```

**Option B: Call Convex directly from components (Recommended)**
Remove API routes and call Convex mutations directly from components using hooks:
```typescript
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const createBrief = useMutation(api.briefs.create);
await createBrief({ ... });
```

### 4. Update Components

Replace Prisma database calls with Convex hooks:

**Before (Prisma):**
```typescript
const user = await getUserWithOrganization(userId);
```

**After (Convex):**
```typescript
'use client'
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const user = useQuery(api.users.getByClerkUserId, { clerkUserId: userId });
```

### 5. Update Pages

Server components that use Prisma need to be converted to client components using Convex hooks, or use Convex HTTP client in server actions.

## File Structure

```
convex/
├── schema.ts              # Database schema
├── organizations.ts       # Organization queries/mutations
├── users.ts              # User queries/mutations
├── briefs.ts             # Brief queries/mutations
├── files.ts              # File queries/mutations
├── content.ts            # Content queries/mutations
└── _generated/           # Auto-generated types (don't edit)
```

## Key Differences

### Database Queries

**Prisma:**
```typescript
const users = await prisma.user.findMany({
  where: { organizationId },
  include: { organization: true }
});
```

**Convex:**
```typescript
const users = await ctx.db
  .query("users")
  .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
  .collect();
```

### Real-time Updates

Convex provides real-time subscriptions automatically:
```typescript
const briefs = useQuery(api.briefs.getRecent, { organizationId });
// Automatically updates when data changes!
```

### Vector Embeddings

Convex stores vectors as arrays of numbers:
```typescript
embedding: v.optional(v.array(v.number()))
```

## Migration Checklist

- [x] Install Convex
- [x] Create Convex schema
- [x] Create Convex queries/mutations
- [x] Update layout with ConvexProvider
- [x] Remove Prisma files
- [x] Update package.json
- [ ] Initialize Convex project (`npx convex dev`)
- [ ] Update API routes to use Convex
- [ ] Update components to use Convex hooks
- [ ] Update pages to use Convex
- [ ] Test all functionality
- [ ] Remove unused Prisma dependencies

## Notes

- Convex handles real-time updates automatically
- No need for database migrations - schema changes are applied automatically
- Convex provides built-in file storage
- Vector search can be implemented using Convex vector search (coming soon) or external services

