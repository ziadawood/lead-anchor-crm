---
name: telnyx-telephony
description: Patterns for integrating Telnyx Voice, SMS, and Number Provisioning APIs into LeadAnchor's telephony service layer. Covers call flow state machine, webhook processing, IVR configuration, number provisioning, and SMS dispatch.
---

# Telnyx Telephony Integration

## Overview
LeadAnchor uses **Telnyx** as its telephony backbone. This is a key competitive
advantage over GoHighLevel (which uses Twilio-based LC Phone) — Telnyx offers
lower per-minute costs and more granular call control APIs.

The telephony system handles:
- Inbound/outbound voice calls with call tracking
- IVR (Interactive Voice Response) menus
- SMS/MMS messaging
- Phone number provisioning per tenant
- Call recording and transcription
- Ghost Lead capture on abandoned calls

## Dependencies
- `telnyx` npm package (Node.js SDK)
- Telnyx account with API key and messaging profile
- Webhook URL configured in Telnyx Mission Control portal

## Call Flow State Machine

```
IDLE → RINGING → IVR_ACTIVE → IN_PROGRESS → COMPLETED
         │           │                          ↑
         │           └── DTMF received ─────────┘
         │
         └── Caller hangs up → ABANDONED → GHOST_LEAD_CREATED
```

### States
| State | Description | Trigger |
|---|---|---|
| `IDLE` | No active call on this number | Initial / after call ends |
| `RINGING` | Inbound call received, not yet answered | `call.initiated` webhook |
| `IVR_ACTIVE` | Call answered by system, playing IVR prompt | `call.answered` (auto-answer) |
| `IN_PROGRESS` | Call connected to live agent or action taken | Agent answers or DTMF processed |
| `COMPLETED` | Call ended normally | `call.hangup` (normal_clearing) |
| `ABANDONED` | Caller hung up before reaching agent | `call.hangup` (abandoned/no_answer) |

## Webhook Processing

### Endpoint
`POST /api/v1/webhooks/telnyx`

### Signature Verification
```typescript
import Telnyx from 'telnyx';

const telnyx = new Telnyx(process.env.TELNYX_API_KEY);

// In webhook handler middleware
const signature = request.headers.get('telnyx-signature-ed25519');
const timestamp = request.headers.get('telnyx-timestamp');
const body = await request.text();

const isValid = telnyx.webhooks.constructEvent(
  body,
  signature,
  timestamp,
  process.env.TELNYX_PUBLIC_KEY
);
```

### Event Routing
```typescript
switch (event.data.event_type) {
  case 'call.initiated':
    return handleCallInitiated(event.data.payload);
  case 'call.answered':
    return handleCallAnswered(event.data.payload);
  case 'call.hangup':
    return handleCallHangup(event.data.payload);
  case 'call.dtmf.received':
    return handleDtmfReceived(event.data.payload);
  case 'call.recording.saved':
    return handleRecordingSaved(event.data.payload);
  case 'message.received':
    return handleSmsReceived(event.data.payload);
  case 'message.sent':
    return handleSmsSent(event.data.payload);
}
```

### Key Webhook Payload Fields
```typescript
interface TelnyxCallPayload {
  call_control_id: string;   // Used to control the call
  connection_id: string;     // Maps to tenant's Telnyx connection
  call_leg_id: string;
  call_session_id: string;
  from: string;              // Caller's phone number
  to: string;                // Tenant's tracking number
  direction: 'incoming' | 'outgoing';
  state: string;
  hangup_cause?: string;     // 'normal_clearing', 'abandoned', etc.
  hangup_source?: string;    // 'caller', 'system'
  client_state?: string;     // Custom state passed between webhook calls
}
```

## Ghost Lead Capture
When `call.hangup` event has `hangup_cause` in `['abandoned', 'no_answer', 'busy']`:

1. Look up tenant by the `to` phone number (tracking number)
2. Check if contact already exists by `from` phone number
3. If new: create Contact with `source: 'ghost_lead'`
4. Create Deal in stage "New Opportunity" with `priority: 'high'`
5. Log Interaction of type `ghost_lead`
6. Send SMS follow-up within 30 seconds (see Ghost Lead Engine skill)
7. Push notification to connected agents via WebSocket

**See `ghost-lead-engine` skill for full workflow details.**

## Number Provisioning

### Search Available Numbers
```typescript
const availableNumbers = await telnyx.availablePhoneNumbers.list({
  filter: {
    country_code: 'US',
    national_destination_code: areaCode, // e.g., '214'
    features: ['voice', 'sms'],
    limit: 10,
  },
});
```

### Order a Number
```typescript
const order = await telnyx.numberOrders.create({
  phone_numbers: [
    { phone_number: selectedNumber }
  ],
  connection_id: tenant.telnyx_connection_id,
  messaging_profile_id: tenant.telnyx_messaging_profile_id,
});
```

### Configure Webhook URL for Number
```typescript
await telnyx.phoneNumbers.update(numberId, {
  connection_id: tenant.telnyx_connection_id,
  // Webhook URL is set at the connection level, not per-number
});
```

## IVR Configuration

### After-Hours IVR Flow
```typescript
// When call.initiated received outside business hours:
await telnyx.calls.answer(callControlId);
await telnyx.calls.speak(callControlId, {
  payload: `Thank you for calling ${tenant.name}. Our office is currently
  closed. Press 1 to receive a text with a link to submit your request,
  or press 2 to leave a voicemail.`,
  voice: 'female',
  language: 'en-US',
});
await telnyx.calls.gatherDtmf(callControlId, {
  minimum_digits: 1,
  maximum_digits: 1,
  timeout_millis: 10000,
});
```

## SMS Dispatch
```typescript
await telnyx.messages.create({
  from: tenantTrackingNumber,
  to: recipientPhone,
  text: messageBody,
  messaging_profile_id: tenant.telnyx_messaging_profile_id,
});
```

## File References
| File | Purpose |
|---|---|
| `apps/api/src/webhooks/telnyx.ts` | Webhook handler + signature verification |
| `apps/api/src/services/telephony.service.ts` | Call control business logic |
| `apps/api/src/services/sms.service.ts` | SMS send/receive logic |
| `apps/api/src/services/number-provisioning.service.ts` | Number search/order |
| `packages/shared/src/types/telephony.ts` | Type definitions |
| `packages/shared/src/constants/call-states.ts` | Call state enum |

## Environment Variables
```
TELNYX_API_KEY=KEY_xxxxxxxxxxxxxxxx
TELNYX_PUBLIC_KEY=xxxxxxxx
TELNYX_CONNECTION_ID=<default connection id>
TELNYX_MESSAGING_PROFILE_ID=<default messaging profile id>
```
