# 🚀 Running the Project

## Quick Start

The development server should be starting! Here's what you need to know:

## Current Status

The project is configured to run with:
- **Next.js** on `http://localhost:3000`
- **Convex** backend (needs initialization)

## First Time Setup

### 1. Initialize Convex (Required)

If you haven't initialized Convex yet, you'll need to run this in a separate terminal:

```bash
cd "/Users/ednangowi/Desktop/COmms App/ezre-comms"
npx convex dev
```

This will:
- Prompt you to login to Convex
- Connect to your project: `ephraimdevelops/comms`
- Push your schema
- Generate types
- Give you your deployment URL

### 2. Add Environment Variables

After Convex initializes, create `.env.local` in the project root:

```env
# Convex (will be added automatically by convex dev)
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Clerk Authentication (you need to add these)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# OpenAI (for AI features)
OPENAI_API_KEY=sk-...

# Optional: Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Start Development Server

**Option A: Combined (Recommended)**
```bash
npm run dev
```
This runs both Convex and Next.js together.

**Option B: Separate Terminals**
```bash
# Terminal 1: Convex
npm run convex:dev

# Terminal 2: Next.js
npm run dev
```

## Access the App

Once running, open:
- **Local**: http://localhost:3000
- **Network**: Check terminal for network URL

## What You'll See

1. **Homepage** - Premium hero section with sign up
2. **Dashboard** - After signing in (if you have an organization)
3. **Onboarding** - If you're a new user
4. **All Pages** - Beautiful, premium UI throughout

## Troubleshooting

### "Convex URL not found"
- Make sure you've run `npx convex dev` at least once
- Check that `.env.local` has `NEXT_PUBLIC_CONVEX_URL`

### "Cannot find module 'convex/_generated/api'"
- Run `npx convex dev` to generate types
- Make sure `convex/_generated/` directory exists

### "Authentication errors"
- Make sure Clerk keys are in `.env.local`
- Check that Clerk is configured in your Clerk dashboard

### Port already in use
- Kill the process using port 3000: `lsof -ti:3000 | xargs kill`
- Or use a different port: `PORT=3001 npm run dev`

## Development Tips

- **Hot Reload**: Changes auto-reload
- **Convex Sync**: Schema changes auto-push
- **Type Safety**: Full TypeScript support
- **Real-time**: Convex provides real-time updates

## Ready to View!

Your premium UI is ready to see! 🎨

