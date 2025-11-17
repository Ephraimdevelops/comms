# 🚀 Quick Start - Run Convex Setup

## Step 1: Login and Initialize Convex

Open your terminal in the project directory and run:

```bash
cd "/Users/ednangowi/Desktop/COmms App/ezre-comms"
npx convex dev
```

This will:
1. Prompt you to login to Convex (or create an account)
2. Connect to your project: `ephraimdevelops/comms`
3. Push your schema to Convex
4. Generate TypeScript types
5. Give you your deployment URL

**When prompted:**
- Login with your Convex account
- Device name: Press Enter for default or type a name
- The command will then push your schema and generate types

## Step 2: Get Your Convex URL

After the command completes, you'll see output like:

```
Your deployment URL: https://your-project-name.convex.cloud
```

Copy this URL!

## Step 3: Add URL to Environment

Create or update `.env.local` in the project root:

```bash
# Create .env.local if it doesn't exist
touch .env.local
```

Add this line (replace with your actual URL):

```env
NEXT_PUBLIC_CONVEX_URL=https://your-project-name.convex.cloud
```

## Step 4: Start Development

Now you can start both Convex and Next.js:

**Option 1: Combined (Recommended)**
```bash
npm run dev
```

**Option 2: Separate Terminals**
```bash
# Terminal 1
npm run convex:dev

# Terminal 2
npm run dev
```

## What Happens Next?

1. ✅ Convex will watch for changes in `convex/` directory
2. ✅ Next.js will start on `http://localhost:3000`
3. ✅ Your schema is automatically synced to Convex
4. ✅ Types are auto-generated in `convex/_generated/`

## Troubleshooting

### "Cannot find module 'convex/_generated/api'"
- Make sure you've run `npx convex dev` at least once
- Check that `convex/_generated/` directory exists

### "NEXT_PUBLIC_CONVEX_URL is not defined"
- Make sure `.env.local` exists with the URL
- Restart your Next.js dev server after adding the URL

### "Authentication failed"
- Run `npx convex login` to re-authenticate
- Check that your team/project in `convex.json` is correct

## Ready! 🎉

Once you've completed these steps, your Convex backend is fully set up and ready to use!

