---
name: ghost-lead-engine
description: The Ghost Lead Engine automatically captures abandoned callers and converts them into pipeline opportunities with instant SMS follow-up and push notifications.
---

# Ghost Lead Engine

## What is a Ghost Lead?
A **Ghost Lead** is a caller who hangs up before reaching a live agent.
These callers represent **high-intent leads** — they picked up the phone and
dialed, which means they have an immediate need. Most competitors lose these
leads entirely. LeadAnchor captures them automatically.

This is one of LeadAnchor's key competitive advantages over GoHighLevel,
which requires manual workflow setup to achieve similar functionality.

## Trigger Events
The Ghost Lead Engine is triggered by Telnyx `call.hangup` webhook events
where `hangup_cause` matches any of:

| hangup_cause | Description |
|---|---|
| `abandoned` | Caller hung up while ringing (no one answered) |
| `no_answer` | Ring timeout expired before agent answered |
| `busy` | All lines busy, caller disconnected |
| `originator_cancel` | Caller cancelled the call |

## Automated Workflow (End-to-End)

```
Telnyx webhook (call.hangup, cause=abandoned)
  │
  ├─ 1. Identify tenant by tracking number (phone_numbers table)
  │
  ├─ 2. Deduplicate: lookup contact by caller phone number
  │     ├─ Exists → link new deal to existing contact
  │     └─ New → create Contact (source: 'ghost_lead')
  │
  ├─ 3. Create Deal
  │     ├─ Stage: "New Opportunity"
  │     ├─ Priority: "High"
  │     ├─ Title: "Ghost Lead - {phone}"
  │     └─ Value: null (pending quote)
  │
  ├─ 4. Log Interaction
  │     ├─ Type: 'ghost_lead'
  │     ├─ Direction: 'inbound'
  │     └─ Metadata: { call_session_id, duration, hangup_cause }
  │
  ├─ 5. Send SMS Follow-up (within 30 seconds)
  │     └─ Template: configurable per tenant
  │
  ├─ 6. Push Notification → Mobile app (all online agents)
  │
  └─ 7. WebSocket Event → Web dashboard (ghost lead toast)
```

## Implementation

### Service: `ghost-lead.service.ts`
```typescript
export class GhostLeadService {
  constructor(
    private contactService: ContactService,
    private dealService: DealService,
    private interactionService: InteractionService,
    private smsService: SmsService,
    private notificationService: NotificationService,
  ) {}

  async processAbandonedCall(payload: TelnyxCallHangupPayload): Promise<void> {
    // 1. Identify tenant by tracking number
    const phoneNumber = await this.phoneNumberRepo.findByNumber(payload.to);
    if (!phoneNumber) {
      console.warn(`Ghost lead: no tenant found for number ${payload.to}`);
      return;
    }
    const tenantId = phoneNumber.tenant_id;

    // 2. Find or create contact
    let contact = await this.contactService.findByPhone(tenantId, payload.from);
    if (!contact) {
      contact = await this.contactService.create({
        tenant_id: tenantId,
        phone: payload.from,
        first_name: 'Unknown',
        last_name: 'Caller',
        source: 'ghost_lead',
      });
    }

    // 3. Create deal
    const defaultStage = await this.dealService.getFirstStage(tenantId);
    const deal = await this.dealService.create({
      tenant_id: tenantId,
      contact_id: contact.id,
      stage_id: defaultStage.id,
      title: `Ghost Lead - ${payload.from}`,
      priority: 'high',
      source: 'ghost_lead',
    });

    // 4. Log interaction
    await this.interactionService.create({
      tenant_id: tenantId,
      contact_id: contact.id,
      deal_id: deal.id,
      type: 'ghost_lead',
      direction: 'inbound',
      title: '📞 Ghost Lead (Abandoned Call)',
      body: `Missed call from ${payload.from}. Hangup cause: ${payload.hangup_cause}`,
      metadata: {
        call_session_id: payload.call_session_id,
        call_leg_id: payload.call_leg_id,
        hangup_cause: payload.hangup_cause,
        hangup_source: payload.hangup_source,
      },
    });

    // 5. Send SMS follow-up
    const tenant = await this.tenantRepo.findById(tenantId);
    const smsTemplate = tenant?.ghost_lead_sms_template ||
      `Hi! We noticed you called ${tenant?.name}. Can we help? ` +
      `Reply YES for a callback or visit ${this.getIntakeUrl(tenant)} ` +
      `to describe your issue.`;

    await this.smsService.send({
      tenant_id: tenantId,
      to: payload.from,
      from: payload.to,  // Reply from same tracking number
      body: smsTemplate,
    });

    // 6. Push notification
    await this.notificationService.sendToTenantAgents(tenantId, {
      title: '🚨 Ghost Lead Captured!',
      body: `Missed call from ${payload.from}`,
      data: { type: 'ghost_lead', deal_id: deal.id },
    });

    // 7. WebSocket broadcast
    await this.notificationService.broadcastToTenant(tenantId, {
      event: 'ghost_lead_captured',
      payload: {
        deal_id: deal.id,
        contact_id: contact.id,
        phone: payload.from,
        message: `🚨 Ghost Lead Captured from ${payload.from}`,
      },
    });
  }
}
```

## SMS Follow-up Templates

### Default Template
```
Hi! We noticed you called {business_name}. Can we help?
Reply YES for a callback or visit {intake_url} to describe your issue.
```

### Trades Track Template
```
{business_name} here! We saw your call. Need emergency service?
Reply YES and we'll call you right back, or tap here to describe
your issue: {intake_url}
```

### Predictable Services Track Template
```
Thanks for calling {business_name}! We'd love to help.
Reply with a good time to call you back, or book online: {booking_url}
```

## Configuration (Per Tenant)
Stored in `tenants.integrations` JSONB:
```json
{
  "ghost_lead": {
    "enabled": true,
    "sms_template": "Custom template here with {business_name} and {intake_url}",
    "sms_delay_seconds": 30,
    "auto_assign_to": null,
    "notify_all_agents": true
  }
}
```

## Analytics

### Metrics to Track
| Metric | Query |
|---|---|
| Ghost leads captured (period) | Count interactions where type='ghost_lead' |
| SMS response rate | Count SMS replies from ghost lead contacts |
| Conversion rate | Count ghost lead deals that reached 'Completed' |
| Avg. response time | Time between ghost lead creation and first agent action |
| Revenue from ghost leads | Sum of deal values for converted ghost leads |

## Testing

### Unit Test Scenarios
1. Abandoned call creates new contact + deal + interaction
2. Abandoned call for existing contact links to existing contact
3. SMS is sent within expected timeframe
4. Push notification sent to all tenant agents
5. WebSocket event broadcast to connected clients
6. Disabled ghost lead engine does not process events
7. Unknown tracking number is silently ignored

### E2E Test Flow
1. Simulate Telnyx `call.hangup` webhook with `cause=abandoned`
2. Verify contact created in database
3. Verify deal created in "New Opportunity" stage
4. Verify interaction logged with ghost_lead type
5. Verify SMS sent via Telnyx (mock)
6. Verify push notification dispatched (mock)

## File References
| File | Purpose |
|---|---|
| `apps/api/src/services/ghost-lead.service.ts` | Core ghost lead processing |
| `apps/api/src/webhooks/telnyx.ts` | Hangup event routing |
| `apps/web/src/features/pipeline/components/GhostLeadToast.tsx` | Toast notification |
| `apps/mobile/components/GhostLeadAlert.tsx` | Mobile alert banner |
| `packages/shared/src/types/ghost-lead.ts` | Type definitions |
| `packages/shared/src/constants/sms-templates.ts` | Default templates |
