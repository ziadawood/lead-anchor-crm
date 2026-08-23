# LeadAnchor — AI Agent Guidelines

## Project Overview
LeadAnchor is a multi-tenant SaaS CRM for home-service businesses (plumbers,
electricians, cleaners, landscapers). It provides telephony (Telnyx), payments
(Stripe Connect), AI chat, website generation, and a mobile CRM app.

## Architecture
- **Monorepo**: Turborepo with `apps/web`, `apps/mobile`, `apps/api`, `packages/shared`
- **Web**: Vite + React 19 + TailwindCSS 4 + React Router 7
- **Mobile**: React Native + Expo SDK 52+ with Expo Router
- **API**: Hono framework on Cloudflare Workers
- **Database**: Supabase (PostgreSQL) with Drizzle ORM
- **Auth**: Supabase Auth with Row Level Security (RLS)

## Primary Competitor
**GoHighLevel (GHL)** — LeadAnchor differentiates with:
1. Telnyx-native telephony (lower cost, more programmable than GHL's Twilio-based LC Phone)
2. Automatic Ghost Lead Engine (abandoned callers → pipeline + SMS follow-up)
3. Trade-specific business tracks (Trades vs Predictable Services)
4. Aggressive pricing: $49–$149/mo vs GHL's $97–$497/mo

## Key Conventions
1. All TypeScript. Strict mode enabled. No `any` types in production code.
2. All API responses use the shape: `{ data: T } | { error: { code, message } }`
3. All database tables have `tenant_id` for multi-tenant isolation.
4. Feature modules live in `src/features/<feature-name>/` with co-located
   components, hooks, types, and API functions.
5. Tests are co-located: `Component.tsx` → `Component.test.tsx`
6. Use Zod schemas from `packages/shared` for runtime validation on both
   client and server.

## Naming Conventions
- Files: `kebab-case.ts` / `PascalCase.tsx` for components
- Database: `snake_case` tables and columns
- API routes: `kebab-case` paths (e.g., `/api/v1/ghost-leads`)
- Types: `PascalCase` with `I` prefix for interfaces in shared package

## Feature Specifications
All feature specs live in `docs/specs/SPEC-NNN-<name>.md`.
Each spec has user stories, acceptance criteria, and file references.
Always check the relevant spec before implementing a feature.

## Skills Reference
Use the following skills when working on specific domains:
- `telnyx-telephony` — Telnyx Voice/SMS/Number API patterns
- `supabase-auth` — Auth flows, RLS policies, JWT handling
- `stripe-payments` — Stripe Connect multi-tenant payments
- `pipeline-crm` — CRM pipeline business logic and deal lifecycle
- `ghost-lead-engine` — Abandoned call capture and follow-up
- `ai-chat-assistant` — LLM-powered chat widget integration
- `mobile-app` — React Native + Expo patterns
- `website-generator` — Tenant website template engine
- `cicd-pipelines` — CI/CD workflow reference
- `database-schema` — Schema reference and migration guide
