---
name: stripe-payments
description: Stripe Connect integration patterns for multi-tenant payment processing, invoicing, deposit collection, and webhook handling.
---

# Stripe Payments Integration

## Overview
LeadAnchor uses **Stripe Connect** to process payments on behalf of tenant
businesses. Each tenant connects their own Stripe account, and LeadAnchor
acts as the platform facilitating payments.

## Architecture
```
Customer → LeadAnchor Platform (Stripe Connect) → Tenant's Stripe Account
                        ↓
              Platform fee retained by LeadAnchor
```

## Stripe Connect Account Types
LeadAnchor uses **Standard Connect accounts** — tenants connect their existing
Stripe accounts, giving them full dashboard access while LeadAnchor can
create charges and manage invoices on their behalf.

## Key Flows

### 1. Tenant Stripe Onboarding
```typescript
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Create a Connect account link for onboarding
const account = await stripe.accounts.create({
  type: 'standard',
  metadata: { tenant_id: tenantId },
});

const accountLink = await stripe.accountLinks.create({
  account: account.id,
  refresh_url: `${APP_URL}/settings/billing?retry=true`,
  return_url: `${APP_URL}/settings/billing?success=true`,
  type: 'account_onboarding',
});

// Save account.id to tenant record
await db.update(tenants)
  .set({ stripe_account_id: account.id })
  .where(eq(tenants.id, tenantId));

// Redirect user to accountLink.url
```

### 2. Create Invoice
```typescript
const invoice = await stripe.invoices.create({
  customer: stripeCustomerId,
  auto_advance: true,  // Auto-finalize after 1 hour
  collection_method: 'send_invoice',
  days_until_due: 30,
  metadata: {
    tenant_id: tenantId,
    deal_id: dealId,
  },
}, {
  stripeAccount: tenant.stripe_account_id,  // On behalf of tenant
});

// Add line items
for (const item of lineItems) {
  await stripe.invoiceItems.create({
    customer: stripeCustomerId,
    invoice: invoice.id,
    description: item.description,
    amount: Math.round(item.amount * 100),  // Cents
    currency: 'usd',
  }, {
    stripeAccount: tenant.stripe_account_id,
  });
}

// Send the invoice
await stripe.invoices.sendInvoice(invoice.id, {}, {
  stripeAccount: tenant.stripe_account_id,
});
```

### 3. Collect Deposit (Payment Intent)
```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: depositAmountCents,
  currency: 'usd',
  customer: stripeCustomerId,
  description: `Deposit for ${dealTitle}`,
  metadata: {
    tenant_id: tenantId,
    deal_id: dealId,
    type: 'deposit',
  },
  application_fee_amount: Math.round(depositAmountCents * 0.029),  // Platform fee
}, {
  stripeAccount: tenant.stripe_account_id,
});

// Return client_secret to frontend for Stripe Elements
return { clientSecret: paymentIntent.client_secret };
```

### 4. Payment Link (SMS-friendly)
```typescript
const paymentLink = await stripe.paymentLinks.create({
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: { name: `Quote for ${contactName}` },
        unit_amount: amountCents,
      },
      quantity: 1,
    },
  ],
  metadata: {
    tenant_id: tenantId,
    deal_id: dealId,
  },
  after_completion: {
    type: 'redirect',
    redirect: { url: `${APP_URL}/payment/success?deal=${dealId}` },
  },
}, {
  stripeAccount: tenant.stripe_account_id,
});

// Send paymentLink.url via SMS to customer
```

## Webhook Processing

### Endpoint
`POST /api/v1/webhooks/stripe`

### Signature Verification
```typescript
const sig = request.headers.get('stripe-signature')!;
const body = await request.text();

const event = stripe.webhooks.constructEvent(
  body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET!
);
```

### Key Events
```typescript
switch (event.type) {
  case 'invoice.paid':
    // Update invoice record in DB, advance deal stage
    break;
  case 'invoice.payment_failed':
    // Mark invoice as overdue, notify agent
    break;
  case 'payment_intent.succeeded':
    // Process deposit, advance deal to "Deposit Paid"
    break;
  case 'account.updated':
    // Update tenant's Stripe connection status
    break;
  case 'checkout.session.completed':
    // Handle payment link completion
    break;
}
```

## Database Records

### Invoices Table
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  deal_id UUID REFERENCES deals(id),
  contact_id UUID REFERENCES contacts(id),
  stripe_invoice_id TEXT,          -- inv_xxxxxxxx
  stripe_payment_intent_id TEXT,   -- pi_xxxxxxxx
  amount DECIMAL(12,2),
  status TEXT CHECK (status IN ('draft','sent','paid','overdue','cancelled')),
  due_date DATE,
  paid_at TIMESTAMPTZ,
  line_items JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## Platform Fee Structure
- LeadAnchor charges a 2.9% platform fee on all transactions
- This is configured via `application_fee_amount` on payment intents
- Tenants see their full price; fee is deducted transparently

## File References
| File | Purpose |
|---|---|
| `apps/api/src/services/payment.service.ts` | Stripe business logic |
| `apps/api/src/webhooks/stripe.ts` | Webhook handler |
| `apps/api/src/routes/billing.ts` | Billing API endpoints |
| `apps/web/src/features/billing/` | Invoice UI, payment links |
| `packages/shared/src/types/billing.ts` | Type definitions |

## Environment Variables
```
STRIPE_SECRET_KEY=sk_live_xxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx
```
