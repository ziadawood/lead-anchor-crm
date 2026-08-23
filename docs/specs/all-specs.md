# SPEC-002: Tenant Onboarding Wizard

| Field | Value |
|---|---|
| **Priority** | P0 |
| **Platforms** | Web |
| **Dependencies** | SPEC-001 (Auth), Telnyx API |
| **Skill Reference** | `.agents/skills/telnyx-telephony/SKILL.md` |
| **Existing Code** | `leadanchor-ux-sim/src/views/SuperAdminPortal.tsx` (UI reference) |

## User Stories

### US-002.1: Business Profile Setup
**As a** new tenant admin, **I want to** enter my company name and select my business track, **so that** the system configures itself for my industry.

### US-002.2: Location & Hours
**As a** new tenant admin, **I want to** enter my address and operating hours, **so that** my website and booking system are configured correctly.

### US-002.3: Phone Number Provisioning
**As a** new tenant admin, **I want to** search and provision a local tracking number, **so that** I can start receiving tracked calls.

### US-002.4: Integration Setup
**As a** new tenant admin, **I want to** enable Telnyx, Stripe, and Google integrations, **so that** the full platform features are activated.

## Acceptance Criteria

- [ ] 3-step wizard with progress indicator (existing UI pattern preserved)
- [ ] Step 1: Company name (required) + business track selection (Trades/Predictable)
- [ ] Step 2: Business address + city + state + zip + operating hours dropdown
- [ ] Step 3: Telnyx number provisioning + integration toggles
- [ ] Area code search returns real available numbers from Telnyx API
- [ ] Selected number is ordered and linked to tenant's Telnyx connection
- [ ] Webhook URL auto-configured for provisioned number
- [ ] All data persisted to `tenants` table on completion
- [ ] Phone number stored in `phone_numbers` table
- [ ] Generated website immediately accessible at `/{tenant.slug}`
- [ ] Back/forward navigation between steps preserves form data
- [ ] Form validation with inline error messages
- [ ] Loading state during number provisioning (1-3 second API call)

## Implementation Files

| File | Action | Description |
|---|---|---|
| `apps/web/src/features/onboarding/OnboardingWizard.tsx` | NEW | Main wizard component |
| `apps/web/src/features/onboarding/steps/ProfileStep.tsx` | NEW | Step 1 |
| `apps/web/src/features/onboarding/steps/LocationStep.tsx` | NEW | Step 2 |
| `apps/web/src/features/onboarding/steps/IntegrationStep.tsx` | NEW | Step 3 |
| `apps/api/src/routes/onboarding.ts` | NEW | Onboarding API |
| `apps/api/src/services/number-provisioning.service.ts` | NEW | Telnyx number API |

---

# SPEC-003: CRM Pipeline & Deal Management

| Field | Value |
|---|---|
| **Priority** | P0 |
| **Platforms** | Web, Mobile |
| **Dependencies** | SPEC-001 |
| **Skill Reference** | `.agents/skills/pipeline-crm/SKILL.md` |
| **Type References** | `packages/shared/src/types/deal.ts` |
| **Validator References** | `packages/shared/src/validators/deal.ts` |

## User Stories

### US-003.1: Kanban Board View
**As an** agent, **I want to** view my pipeline as a drag-and-drop kanban board, **so that** I can see all deals organized by stage.

### US-003.2: Deal Detail
**As an** agent, **I want to** click a deal to view its full details and interaction history, **so that** I can understand the context before taking action.

### US-003.3: Stage Advancement
**As an** agent, **I want to** drag a deal between stages (web) or tap "Advance" (mobile), **so that** I can track deal progress.

### US-003.4: Deal Filtering
**As an** agent, **I want to** filter deals by priority, assignee, and date range, **so that** I can focus on what matters most.

### US-003.5: Custom Stages
**As an** admin, **I want to** customize pipeline stage names and colors, **so that** the pipeline reflects my business workflow.

## Acceptance Criteria

- [ ] Kanban board with drag-and-drop between columns (web: `@dnd-kit/core`)
- [ ] Mobile: horizontal scroll kanban with snap points
- [ ] Deal card shows: contact name, value ($), priority badge, age (e.g., "2d ago"), source icon
- [ ] Deal detail page: contact info header, deal metadata, interaction timeline, action buttons
- [ ] Actions on deal: Send Quote, Call Back, Add Note, Advance Stage, Edit, Delete
- [ ] Filter bar with: priority dropdown, assignee dropdown, date range picker, search text
- [ ] Stage customization in settings (admin only): rename, recolor, reorder, add/remove
- [ ] Real-time updates: new deals appear without page refresh (Supabase Realtime)
- [ ] Create deal form with validation (title required, optional value/priority/assignee)
- [ ] Soft-delete deals (set `deleted_at`, hidden from UI)

---

# SPEC-004: Contact Management

| Field | Value |
|---|---|
| **Priority** | P0 |
| **Platforms** | Web, Mobile |
| **Dependencies** | SPEC-001 |
| **Type References** | `packages/shared/src/types/contact.ts` |
| **Validator References** | `packages/shared/src/validators/contact.ts` |

## User Stories

### US-004.1: Contact List
**As an** agent, **I want to** view all contacts in a searchable list, **so that** I can quickly find a specific customer.

### US-004.2: Contact Profile
**As an** agent, **I want to** view a contact's full profile with activity timeline, **so that** I have full context for any interaction.

### US-004.3: Contact CRUD
**As an** agent, **I want to** create, edit, and delete contacts, **so that** I can keep my customer database accurate.

### US-004.4: Tag Management
**As an** agent, **I want to** add tags to contacts and filter by tags, **so that** I can segment my customers.

### US-004.5: Duplicate Detection
**As the** system, **I want to** detect duplicate contacts by phone number, **so that** data stays clean.

### US-004.6: Contact Merge
**As an** admin, **I want to** merge two duplicate contacts, **so that** all history is consolidated.

## Acceptance Criteria

- [ ] Contact list with search (name, phone, email), sort, and pagination (25 per page)
- [ ] Contact profile page: avatar, name, phone, email, address, source badge, tags
- [ ] Activity timeline on profile: all interactions sorted by date descending
- [ ] Linked deals visible on contact profile
- [ ] Create contact form with Zod validation
- [ ] Edit contact inline or via modal
- [ ] Soft-delete contacts (admin/agent)
- [ ] Tag input with autocomplete from existing tags
- [ ] Filter contacts by tag(s)
- [ ] Duplicate detection: when creating a new contact, if phone matches existing, show warning
- [ ] Merge contacts: select primary, transfer all deals + interactions, soft-delete secondary

---

# SPEC-005: Telnyx Telephony Integration

| Field | Value |
|---|---|
| **Priority** | P0 |
| **Platforms** | API, Web (admin), Mobile |
| **Dependencies** | SPEC-001, SPEC-002 |
| **Skill Reference** | `.agents/skills/telnyx-telephony/SKILL.md` |
| **Type References** | `packages/shared/src/types/telephony.ts` |

## Acceptance Criteria

- [ ] Webhook endpoint `POST /api/v1/webhooks/telnyx` processes all call lifecycle events
- [ ] Webhook signature verification on every request (reject invalid signatures with 403)
- [ ] `call.initiated` → create interaction record, broadcast to connected clients
- [ ] `call.answered` → update interaction metadata
- [ ] `call.hangup` → finalize interaction, check for ghost lead trigger
- [ ] `call.dtmf.received` → process IVR input
- [ ] `message.received` → create SMS interaction, notify agents
- [ ] Call records stored in `interactions` table with full metadata
- [ ] Real-time call state pushed to web and mobile via WebSocket
- [ ] IVR flow configurable per tenant: greeting message, DTMF routing
- [ ] Call recording stored in Cloudflare R2 with signed access URLs
- [ ] Call log page in web admin: date, caller, duration, recording playback, status
- [ ] Mobile: incoming call overlay with caller info, accept/decline buttons

---

# SPEC-006: Ghost Lead Engine

| Field | Value |
|---|---|
| **Priority** | P0 |
| **Platforms** | API, Web, Mobile |
| **Dependencies** | SPEC-005 |
| **Skill Reference** | `.agents/skills/ghost-lead-engine/SKILL.md` |
| **Type References** | `packages/shared/src/types/ghost-lead.ts` |

## Acceptance Criteria

- [ ] Abandoned call (`hangup_cause` in abandoned/no_answer/busy) auto-creates ghost lead
- [ ] Ghost lead = Contact (source: ghost_lead) + Deal (stage: New Opportunity, priority: High)
- [ ] Interaction logged with type `ghost_lead` and full call metadata
- [ ] SMS follow-up sent within 30 seconds via Telnyx
- [ ] SMS template customizable per tenant
- [ ] Push notification sent to all online agents
- [ ] Web admin: ghost lead toast notification (slide-in from top, 5s auto-dismiss)
- [ ] Mobile: ghost lead alert banner with "View Deal" action
- [ ] Existing contact: links new deal to existing contact (no duplicate)
- [ ] Ghost lead config toggle in tenant settings (enable/disable)
- [ ] Analytics: ghost leads captured, SMS response rate, conversion rate

---

# SPEC-007: AI Chat Assistant

| Field | Value |
|---|---|
| **Priority** | P1 |
| **Platforms** | Web (widget), API |
| **Dependencies** | SPEC-001, SPEC-004 |
| **Skill Reference** | `.agents/skills/ai-chat-assistant/SKILL.md` |
| **Type References** | `packages/shared/src/types/chat.ts` |

## Acceptance Criteria

- [ ] Chat widget renders on generated tenant websites (floating button, bottom-right)
- [ ] Click opens chat window with AI greeting
- [ ] Streaming responses from LLM (Server-Sent Events)
- [ ] System prompt injected with tenant's business profile data
- [ ] AI collects name + phone + service need through natural conversation
- [ ] Lead qualification triggers: Contact created + Deal created + Agent notified
- [ ] Chat transcript saved to `chat_sessions` table
- [ ] Typing indicator during LLM response generation
- [ ] Agent takeover: admin can view and take over active chats
- [ ] Chat session status: active → resolved or escalated
- [ ] Rate limit: 20 messages per session, 5 sessions per IP per hour

---

# SPEC-008: Booking & Calendar

| Field | Value |
|---|---|
| **Priority** | P1 |
| **Platforms** | Web, Mobile |
| **Dependencies** | SPEC-001, SPEC-004 |
| **Type References** | `packages/shared/src/types/booking.ts` |
| **Validator References** | `packages/shared/src/validators/booking.ts` |

## Acceptance Criteria

- [ ] Calendar view with daily/weekly toggle
- [ ] Bookings shown as colored time blocks
- [ ] Create booking: select contact, date/time, duration, service type
- [ ] Availability rules: business hours from tenant profile, block-out dates
- [ ] Online booking widget embeddable on generated websites
- [ ] Customer selects available slot from public booking page
- [ ] SMS confirmation sent on booking creation (Telnyx)
- [ ] SMS reminder 24h before appointment
- [ ] Booking linked to contact and optionally to deal
- [ ] Status management: pending → confirmed → completed / cancelled / no_show
- [ ] Mobile: view today's bookings on main dashboard

---

# SPEC-009: Invoicing & Payments

| Field | Value |
|---|---|
| **Priority** | P1 |
| **Platforms** | Web, API |
| **Dependencies** | SPEC-001, SPEC-003 |
| **Skill Reference** | `.agents/skills/stripe-payments/SKILL.md` |
| **Type References** | `packages/shared/src/types/billing.ts` |
| **Validator References** | `packages/shared/src/validators/invoice.ts` |

## Acceptance Criteria

- [ ] Stripe Connect onboarding flow for tenants (Standard accounts)
- [ ] Invoice creation with line items, due date, and amount
- [ ] Send invoice via SMS payment link or email
- [ ] Customer pays via hosted Stripe checkout
- [ ] Webhook handles `invoice.paid` → updates deal stage to "Deposit Paid"
- [ ] Payment receipt auto-sent to customer
- [ ] Revenue dashboard: total revenue, paid/overdue/outstanding
- [ ] 2.9% platform fee on transactions (via `application_fee_amount`)
- [ ] Invoice history with status badges (draft, sent, paid, overdue)

---

# SPEC-010: Generated Website & Theme Engine

| Field | Value |
|---|---|
| **Priority** | P1 |
| **Platforms** | Web |
| **Dependencies** | SPEC-001, SPEC-002 |
| **Skill Reference** | `.agents/skills/website-generator/SKILL.md` |
| **Type References** | `packages/shared/src/types/website.ts` |

## Acceptance Criteria

- [ ] Website auto-generated from tenant profile at `/{slug}` or custom domain
- [ ] At least 3 theme templates: professional-dark, clean-light, modern-gradient
- [ ] Dynamic content: company name, services (by track), location, hours, phone
- [ ] Click-to-call button uses tracking number for call attribution
- [ ] AI chat widget embedded and configured with tenant data
- [ ] SEO: auto-generated title, meta description, OG tags, JSON-LD structured data
- [ ] Mobile-responsive layout
- [ ] Theme customization in admin: template, primary/accent colors, font
- [ ] Custom domain support via Cloudflare CNAME

---

# SPEC-011: SMS & WhatsApp Messaging

| Field | Value |
|---|---|
| **Priority** | P1 |
| **Platforms** | Web, Mobile, API |
| **Dependencies** | SPEC-005 |

## Acceptance Criteria

- [ ] Two-way SMS via Telnyx from tenant's tracking number
- [ ] Unified conversation thread view per contact
- [ ] Send SMS from deal detail or contact profile
- [ ] Template-based automated messages (ghost lead, booking, quote, review)
- [ ] Inbound SMS creates interaction + notifies agents
- [ ] Message delivery status: sent, delivered, failed
- [ ] SMS character counter with segment calculator (160 chars per segment)
- [ ] WhatsApp Business API integration (future — architecture ready)

---

# SPEC-012: Reporting & Analytics Dashboard

| Field | Value |
|---|---|
| **Priority** | P2 |
| **Platforms** | Web |
| **Dependencies** | SPEC-003, SPEC-005, SPEC-006 |

## Acceptance Criteria

- [ ] Dashboard with KPI cards: total leads, conversion rate, revenue, ghost leads
- [ ] Line chart: lead volume over time (7d, 30d, 90d)
- [ ] Funnel chart: pipeline stage progression
- [ ] Bar chart: revenue trend by month
- [ ] Lead source breakdown (pie/donut chart)
- [ ] Date range filter (custom range, presets: today, 7d, 30d, 90d, YTD)
- [ ] CSV export for all reports
- [ ] Ghost lead metrics: captured, contacted, converted, revenue
