# Ezre Comms - AI Communications Assistant

Transform organizational briefs into polished, on-brand communications across all channels with AI-powered content generation and RAG (Retrieval-Augmented Generation).

## Features

- **Multi-channel Content Generation**: Create content for Instagram, Facebook, Twitter, LinkedIn, blogs, emails, and WhatsApp
- **Organization Knowledge Training**: Upload documents, PDFs, videos to train your AI assistant
- **Team Collaboration**: Role-based access with approval workflows
- **Scheduling & Publishing**: Schedule posts across multiple platforms
- **Analytics & Insights**: Track performance and engagement metrics
- **Internal Communications**: Generate internal announcements and team updates

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Authentication**: Clerk (organizations, users, roles)
- **Database**: PostgreSQL with Prisma ORM
- **Vector Store**: pgvector for RAG embeddings
- **AI**: OpenAI GPT-4o + embeddings
- **Payments**: Stripe subscriptions
- **File Storage**: Local storage (extensible to S3/Cloudinary)

## Quick Start

### 1. Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Clerk account
- OpenAI API key
- Stripe account (for payments)

### 2. Installation

```bash
# Clone and install dependencies
cd ezre-comms
npm install

# Copy environment variables
cp env.example .env.local
```

### 3. Environment Setup

Create `.env.local` with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ezre_comms"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI
OPENAI_API_KEY=sk-...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Open Prisma Studio
npm run db:studio
```

### 5. Enable pgvector Extension

In your PostgreSQL database, run:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Required API Keys

### Clerk Authentication
1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Copy the publishable key and secret key
4. Configure sign-in/sign-up URLs in Clerk dashboard

### OpenAI
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Ensure you have credits for GPT-4o and embeddings

### Stripe (for payments)
1. Go to [stripe.com](https://stripe.com) and create an account
2. Get your publishable and secret keys from the dashboard
3. Set up webhook endpoints for subscription events

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   │   ├── content/       # Content generation
│   │   ├── uploads/       # File uploads
│   │   └── webhooks/      # Stripe/Clerk webhooks
│   ├── dashboard/         # Dashboard pages
│   ├── briefs/           # Brief management
│   ├── uploads/          # Knowledge uploads
│   └── analytics/        # Analytics dashboard
├── components/           # React components
│   ├── dashboard/        # Dashboard components
│   ├── briefs/          # Brief components
│   └── uploads/         # Upload components
├── lib/                 # Utilities and configurations
│   ├── db.ts           # Database client
│   ├── ai.ts           # AI/OpenAI integration
│   ├── rag.ts          # RAG processing
│   └── types.ts        # TypeScript types
└── middleware.ts        # Clerk middleware
```

## Key Features Implementation

### RAG (Retrieval-Augmented Generation)
- Upload PDFs, DOCX, videos, and text files
- Automatic text extraction and chunking
- Vector embeddings stored in pgvector
- Context-aware content generation

### Multi-tenant Architecture
- Organization-scoped data isolation
- Role-based access control (Admin, Editor, Reviewer)
- Stripe subscription management per organization

### Content Generation Pipeline
1. User creates brief with channels and tone
2. System retrieves relevant organization knowledge
3. AI generates multiple content variants
4. Team can review, edit, and approve
5. Schedule and publish across platforms

## Development

### Adding New Channels
1. Update `Channel` enum in `src/lib/types.ts`
2. Add channel instructions in `src/lib/ai.ts`
3. Update UI components to include new channel

### Adding New File Types
1. Update `processFileForRAG` in `src/lib/rag.ts`
2. Add extraction logic for new file type
3. Update validation schemas

### Database Migrations
```bash
# Create new migration
npm run db:migrate

# Apply migrations
npm run db:push
```

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Database
- Use Supabase, Railway, or Neon for PostgreSQL with pgvector
- Ensure pgvector extension is enabled

### File Storage
- For production, integrate with S3, Cloudinary, or similar
- Update file upload logic in `src/lib/rag.ts`

## Pricing Tiers

- **Starter**: Free - 10 generations/month, 2 scheduled posts
- **Pro**: $20/month - 500 generations, 50 scheduled posts, team features
- **Agency**: $150/month - 5k generations, unlimited scheduling, advanced features
- **Enterprise**: Custom pricing - unlimited everything, SSO, white-label

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For questions or issues:
- Create an issue on GitHub
- Contact: support@ezrecomms.com

---

Built with ❤️ for communications professionals who want to scale their content creation with AI.