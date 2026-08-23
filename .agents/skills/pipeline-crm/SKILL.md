---
name: pipeline-crm
description: CRM pipeline business logic, deal management, contact lifecycle, and interaction tracking patterns for LeadAnchor.
---

# CRM Pipeline

## Overview
The CRM pipeline is the core of LeadAnchor — it tracks every lead from first
contact to job completion and payment. The pipeline is inspired by GoHighLevel's
visual pipeline but adds automated ghost lead capture and trade-specific workflows.

## Default Pipeline Stages

| Position | Stage Name | Color | Auto-actions |
|---|---|---|---|
| 1 | New Opportunity | `#3B82F6` (blue) | Assign to agent, send welcome SMS |
| 2 | Quote Sent | `#F59E0B` (amber) | Track quote open rate |
| 3 | Deposit Paid | `#10B981` (green) | Send booking confirmation |
| 4 | Completed | `#6366F1` (indigo) | Request Google review, send invoice |

Tenants can customize stage names, colors, and positions via the admin settings.

## Deal Lifecycle

```
Lead Source → Contact Created → Deal Created (New Opportunity)
  → Quote Generated & Sent (Quote Sent)
    → Payment Received (Deposit Paid)
      → Service Completed (Completed) → Invoice Sent → Review Requested
```

### Lead Sources
| Source | How it enters pipeline | Priority |
|---|---|---|
| Ghost Lead (abandoned call) | Automatic via Ghost Lead Engine | High |
| AI Chat Widget | After lead qualification | Medium |
| Website Form | Direct form submission | Medium |
| Inbound Call (answered) | Agent creates deal during/after call | Varies |
| SMS Intake | After SMS form submission | Medium |
| Manual Entry | Agent creates deal in CRM | Varies |
| Referral | Agent creates deal with referral tag | Medium |

## Business Rules

### Stale Deal Re-engagement
- Deals in "New Opportunity" for >48 hours → system sends re-engagement SMS
- Deals in "Quote Sent" for >72 hours → system notifies assigned agent
- Configurable per tenant via automation settings

### Stage Transition Rules
| From | To | Conditions |
|---|---|---|
| New Opportunity | Quote Sent | Quote document attached or sent |
| Quote Sent | Deposit Paid | Payment received (Stripe webhook) |
| Deposit Paid | Completed | Agent marks as complete |
| Any stage | Any stage | Manual override by admin/agent |

### Auto-Actions on Stage Change
```typescript
async function onDealStageChange(deal: Deal, fromStage: string, toStage: string) {
  switch (toStage) {
    case 'Quote Sent':
      await smsService.send(deal.contact.phone, quoteTemplate(deal));
      await interactionService.log(deal, 'system', 'Quote sent via SMS');
      break;
    case 'Deposit Paid':
      await smsService.send(deal.contact.phone, depositConfirmationTemplate(deal));
      await bookingService.promptScheduling(deal);
      break;
    case 'Completed':
      await invoiceService.generateFinal(deal);
      await reviewService.requestGoogleReview(deal.contact);
      break;
  }
}
```

## Deal Data Model
```typescript
interface Deal {
  id: string;
  tenant_id: string;
  contact_id: string;
  stage_id: string;
  title: string;
  value: number | null;        // Dollar amount
  priority: 'high' | 'medium' | 'low';
  assigned_to: string | null;  // User ID
  source: string;              // Lead source
  notes: string;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  // Computed/joined
  contact?: Contact;
  stage?: PipelineStage;
  interactions?: Interaction[];
}
```

## Contact Management

### Contact Profile
```typescript
interface Contact {
  id: string;
  tenant_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  address: string | null;
  source: string;
  tags: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
```

### Duplicate Detection
- Before creating a new contact, check for existing contact with same phone number
- If duplicate found:
  - For ghost leads: link new deal to existing contact
  - For chat/form leads: prompt agent to merge or create new

### Contact Merge
- Merge two contacts into one
- Keep the contact with more complete data as primary
- Transfer all deals and interactions to primary contact
- Soft-delete the secondary contact

## Interaction Tracking

### Interaction Types
| Type | Description | Auto-logged? |
|---|---|---|
| `call` | Voice call (inbound/outbound) | Yes (Telnyx webhook) |
| `sms` | SMS message (sent/received) | Yes (Telnyx webhook) |
| `chat` | AI chat session | Yes (on qualification) |
| `email` | Email (sent/received) | Yes (on send) |
| `booking` | Booking created/updated | Yes (on booking) |
| `note` | Manual note by agent | No (manual) |
| `ghost_lead` | Abandoned call captured | Yes (Ghost Lead Engine) |
| `stage_change` | Deal moved between stages | Yes (automatic) |

### Activity Timeline
The contact profile and deal detail pages show a unified activity timeline
combining all interaction types, sorted by `created_at` descending.

```typescript
// API endpoint: GET /api/v1/contacts/:id/interactions
// Returns all interactions for a contact, with optional type filter
const interactions = await db
  .select()
  .from(interactions)
  .where(and(
    eq(interactions.contact_id, contactId),
    eq(interactions.tenant_id, tenantId),
  ))
  .orderBy(desc(interactions.created_at))
  .limit(50);
```

## Kanban Board (UI)

### Web Implementation
- Drag-and-drop between columns using `@dnd-kit/core`
- Each column = one pipeline stage
- Deal cards show: contact name, value, priority badge, age, source icon
- Filter bar: priority, assignee, date range, search

### Mobile Implementation
- Horizontal scroll between stage columns (snap scroll)
- Tap deal card to view detail sheet
- "Advance Stage" button for quick progression
- Pull-to-refresh for latest data

## File References
| File | Purpose |
|---|---|
| `apps/api/src/services/crm.service.ts` | Deal CRUD + stage transitions |
| `apps/api/src/services/contact.service.ts` | Contact CRUD + merge + dedup |
| `apps/api/src/routes/deals.ts` | Deal API endpoints |
| `apps/api/src/routes/contacts.ts` | Contact API endpoints |
| `apps/web/src/features/pipeline/` | Kanban board, deal cards |
| `apps/web/src/features/contacts/` | Contact list, profile |
| `apps/mobile/app/(tabs)/pipeline.tsx` | Mobile kanban |
| `apps/mobile/app/(tabs)/inbox.tsx` | Mobile interaction feed |
| `packages/shared/src/types/crm.ts` | Type definitions |
| `packages/shared/src/validators/deal.ts` | Zod schemas |
