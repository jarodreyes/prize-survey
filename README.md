# Prize Survey

A real-time survey platform for events with live results and prize unlocks.

🚀 **Live on Vercel**: https://prize-survey-6ltgsgrhs-jarodreyes-projects.vercel.app

## Features

- **Real-time Surveys**: Create sessions with 6-character codes for easy joining
- **GitHub Authentication**: Secure authentication with GitHub OAuth
- **Live Results**: Real-time charts and activity feeds using Vercel Realtime (with polling fallback)
- **Prize Gamification**: Unlock rewards at 25, 50, and 125 response milestones
- **Lead Generation**: Collect job titles, tech preferences, location, and job hunting status
- **Developer-Focused Design**: Clean, minimalist UI with a dev-nerdy color palette

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Vercel Postgres + Drizzle ORM
- **Authentication**: NextAuth.js with GitHub provider
- **Realtime**: Vercel Realtime (with polling fallback)
- **Charts**: Recharts
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- GitHub OAuth App ([create one here](https://github.com/settings/developers))
- Vercel Postgres database (or any PostgreSQL database)

### 1. Clone and Install

```bash
git clone <your-repo>
cd signalfire-survey
pnpm install
```

### 2. Environment Setup

Copy `env.example` to `.env.local` and fill in your values:

```bash
cp env.example .env.local
```

Required environment variables:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-here

# GitHub OAuth (from your GitHub OAuth App)
GITHUB_ID=your-github-oauth-app-id
GITHUB_SECRET=your-github-oauth-app-secret

# Database
POSTGRES_URL=postgresql://username:password@localhost:5432/signalfire_survey

# Optional: Vercel Realtime (app works with polling fallback)
VERCEL_REALTIME_URL=
VERCEL_REALTIME_TOKEN=
```

### 3. Database Setup

Push the schema to your database:

```bash
pnpm db:push
```

### 4. Seed Development Data (Optional)

Create test data for development:

```bash
pnpm seed
```

This creates a test session with code `TEST01` and sample responses.

### 5. Run Development Server

```bash
pnpm dev
```

Visit http://localhost:3000 to see the app!

## Usage

### Creating a Session (Host Flow)

1. Go to `/host`
2. Click "Create Session"
3. Share the 6-character code or QR code with attendees
4. Monitor live responses and view results

### Joining a Session (Attendee Flow)

1. Go to `/join` or visit the join URL
2. Enter the 6-character session code
3. Sign in with GitHub
4. Complete the survey form (lead-gen + fun questions)
5. View live results

### Viewing Results

- Public results page: `/results/[sessionId]`
- Real-time charts, activity feed, and prize progress
- Works great for displaying on screens during events

## Development

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm typecheck    # Run TypeScript compiler check
pnpm db:push      # Push schema changes to database
pnpm db:generate  # Generate Drizzle migrations
pnpm seed         # Seed development data
```

### Project Structure

```
app/
├── api/           # API routes
│   ├── auth/      # NextAuth endpoints
│   ├── session/   # Session management
│   ├── response/  # Response submission
│   └── activity/  # Activity feed
├── host/          # Host dashboard
├── join/          # Join session page
├── results/       # Results display
└── layout.tsx     # Root layout

components/
├── ui/            # shadcn/ui components
├── BrandShell.tsx # Layout wrapper
├── PrizeSidebar.tsx
├── ActivityFeed.tsx
├── LiveCounter.tsx
├── QuestionCard.tsx
├── LeadGenForm.tsx
└── QR.tsx         # QR code generator

lib/
├── schema.ts      # Drizzle database schema
├── db.ts          # Database client
├── auth.ts        # NextAuth configuration
├── validations.ts # Zod schemas
├── constants.ts   # App constants
├── utils.ts       # Utility functions
├── realtime.ts    # Realtime client
└── seed.ts        # Development seed data
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

The app is optimized for Vercel with:
- Vercel Postgres integration
- Vercel Realtime support (optional)
- Automatic Edge Functions for API routes

### Environment Variables for Production

Make sure to set these in your deployment platform:

- `NEXTAUTH_URL` - Your production domain
- `NEXTAUTH_SECRET` - A secure random string
- `GITHUB_ID` & `GITHUB_SECRET` - GitHub OAuth app credentials
- `POSTGRES_URL` - Production database connection string
- `VERCEL_REALTIME_URL` & `VERCEL_REALTIME_TOKEN` - Optional for realtime features

## Customization

### Survey Questions

Edit `lib/constants.ts` to modify:
- Fun questions and options
- LLM and framework choices
- Prize tiers and thresholds

### Styling

The app uses a custom dev-nerdy color palette defined in `styles/palette.css`:
- Background: `#0B0E14`
- Panel: `#111826`
- Text: `#E5E7EB`
- Accent: `#60A5FA` (blue)
- Accent 2: `#22D3EE` (cyan)

### Realtime Features

The app works with or without Vercel Realtime:
- **With Realtime**: Instant updates for all users
- **Without Realtime**: Automatic polling fallback every 3 seconds

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

Built with ❤️ for the developer community by SignalFire and DevAir.
