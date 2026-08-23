# LeadAnchor Feature Specifications Index

This directory contains detailed feature specifications for LeadAnchor.
Each spec is a self-contained document with user stories, acceptance criteria,
and implementation references that can be used directly with AI code generation tools.

## Specifications

| ID | Feature | Priority | Platforms |
|---|---|---|---|
| [SPEC-001](./SPEC-001-auth.md) | Multi-Tenant Authentication & Authorization | P0 | Web, Mobile, API |
| [SPEC-002](./SPEC-002-onboarding.md) | Tenant Onboarding Wizard | P0 | Web |
| [SPEC-003](./SPEC-003-pipeline.md) | CRM Pipeline & Deal Management | P0 | Web, Mobile |
| [SPEC-004](./SPEC-004-contacts.md) | Contact Management | P0 | Web, Mobile |
| [SPEC-005](./SPEC-005-telephony.md) | Telnyx Telephony Integration | P0 | API, Web, Mobile |
| [SPEC-006](./SPEC-006-ghost-leads.md) | Ghost Lead Engine | P0 | API, Web, Mobile |
| [SPEC-007](./SPEC-007-ai-chat.md) | AI Chat Assistant | P1 | Web, API |
| [SPEC-008](./SPEC-008-booking.md) | Booking & Calendar | P1 | Web, Mobile |
| [SPEC-009](./SPEC-009-payments.md) | Invoicing & Payments (Stripe Connect) | P1 | Web, API |
| [SPEC-010](./SPEC-010-website.md) | Generated Website & Theme Engine | P1 | Web |
| [SPEC-011](./SPEC-011-messaging.md) | SMS & WhatsApp Messaging | P1 | Web, Mobile, API |
| [SPEC-012](./SPEC-012-analytics.md) | Reporting & Analytics Dashboard | P2 | Web |

## How to Use These Specs

1. Each spec is designed to be self-contained — an AI agent can implement
   the feature using only the spec + the relevant skill file.
2. Always read the corresponding skill (`.agents/skills/<name>/SKILL.md`)
   before starting implementation.
3. Check `packages/shared/src/types/` for relevant type definitions.
4. Check `packages/shared/src/validators/` for Zod validation schemas.
5. Follow the conventions in `.agents/rules/` for coding style, API format,
   and database patterns.
