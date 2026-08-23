---
name: mobile-app
description: React Native + Expo patterns for the LeadAnchor mobile CRM app targeting iOS and Android. Covers project structure, navigation, push notifications, offline support, and EAS build/deploy.
---

# Mobile App (React Native + Expo)

## Overview
The LeadAnchor mobile app is a native iOS and Android CRM companion built with
React Native and Expo. It replaces the current web-based phone mockup with a
real native experience featuring push notifications, background call handling,
and offline support.

## Technology Stack
| Tool | Purpose |
|---|---|
| **Expo SDK 52+** | Managed workflow, OTA updates |
| **Expo Router** | File-based routing (like Next.js) |
| **React Native Paper** | Material Design 3 component library |
| **TanStack Query** | Server state management + caching |
| **Zustand** | Local client state |
| **Expo Notifications** | Push notifications |
| **Expo SecureStore** | Secure token storage |
| **EAS Build** | Cloud-based native builds |
| **EAS Submit** | App Store / Play Store submission |
| **EAS Update** | Over-the-air JavaScript updates |

## Project Structure
```
apps/mobile/
├── app/                        # Expo Router pages (file-based routing)
│   ├── _layout.tsx            # Root layout (auth check, providers)
│   ├── (auth)/                # Auth screens (unauthenticated)
│   │   ├── _layout.tsx        # Auth stack layout
│   │   ├── login.tsx          # Email/password login
│   │   ├── signup.tsx         # Registration
│   │   └── forgot-password.tsx
│   ├── (tabs)/                # Main tab navigator (authenticated)
│   │   ├── _layout.tsx        # Tab bar layout
│   │   ├── inbox.tsx          # Interaction feed
│   │   ├── pipeline.tsx       # Kanban pipeline board
│   │   ├── contacts.tsx       # Contact list
│   │   └── settings.tsx       # App settings
│   ├── deal/
│   │   └── [id].tsx           # Deal detail screen
│   ├── contact/
│   │   └── [id].tsx           # Contact detail screen
│   └── call/
│       └── incoming.tsx       # Full-screen incoming call UI
├── components/                # Shared components
│   ├── DealCard.tsx
│   ├── ContactRow.tsx
│   ├── InteractionItem.tsx
│   ├── GhostLeadAlert.tsx
│   ├── PriorityBadge.tsx
│   └── EmptyState.tsx
├── features/                  # Feature modules
│   ├── auth/
│   │   ├── use-auth.ts
│   │   └── auth-provider.tsx
│   ├── pipeline/
│   │   ├── use-deals.ts
│   │   └── pipeline-store.ts
│   └── notifications/
│       ├── use-notifications.ts
│       └── notification-handler.ts
├── hooks/                     # Global hooks
│   ├── use-api.ts            # Authenticated API client
│   └── use-realtime.ts       # WebSocket connection
├── lib/
│   ├── supabase.ts           # Supabase client (SecureStore backend)
│   ├── api.ts                # API client with auth headers
│   └── theme.ts              # React Native Paper theme config
├── app.json                   # Expo app configuration
├── eas.json                   # EAS Build profiles
├── metro.config.js            # Metro bundler config
└── package.json
```

## Navigation Flow
```
App Launch
  │
  ├─ Token exists? ──No──→ (auth)/login.tsx
  │       │
  │      Yes
  │       │
  └──→ (tabs)/_layout.tsx
           ├── Inbox Feed (default tab)
           ├── Pipeline Board
           ├── Contacts
           └── Settings
```

## Key Screens

### Inbox Feed (`inbox.tsx`)
- Reverse-chronological list of all interactions
- Search bar with full-text search
- Filter by type: calls, SMS, chat, bookings, ghost leads
- Pull-to-refresh
- Real-time updates via WebSocket
- Tap interaction → bottom sheet with actions (call back, send quote)

### Pipeline Board (`pipeline.tsx`)
- Horizontal scrollable kanban columns (snap scroll)
- Each column = one pipeline stage
- Deal cards: contact name, value, priority badge, age indicator
- Tap card → navigate to deal detail screen
- "Advance Stage" button on each card
- FAB: Create new deal

### Incoming Call (`call/incoming.tsx`)
- Full-screen overlay (similar to native phone call)
- Shows caller ID (matched to contact if known)
- Accept / Decline buttons
- "Mark as Ghost Lead" if declined
- Call timer when in progress

### Deal Detail (`deal/[id].tsx`)
- Contact info header
- Deal value, stage, priority
- Activity timeline (interactions)
- Action buttons: Send Quote, Call Back, Add Note, Advance Stage
- Edit deal button (modal)

## Push Notifications

### Registration
```typescript
import * as Notifications from 'expo-notifications';

async function registerForPushNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: EAS_PROJECT_ID,
  });

  // Register token with API
  await api.post('/api/v1/notifications/register', {
    push_token: token.data,
    platform: Platform.OS,
  });
}
```

### Notification Types
| Type | Title | When |
|---|---|---|
| `ghost_lead` | 🚨 Ghost Lead Captured! | Abandoned call detected |
| `new_booking` | 📅 New Booking Request | Customer books via website |
| `chat_lead` | 💬 New Chat Lead | AI qualifies a website visitor |
| `deal_stage` | 📊 Deal Advanced | Deal moves to new stage |
| `payment` | 💰 Payment Received | Stripe payment completed |
| `sms_received` | 📱 New SMS | Inbound SMS from contact |

### Handling (Foreground & Background)
```typescript
Notifications.addNotificationReceivedListener((notification) => {
  const { type, deal_id } = notification.request.content.data;
  if (type === 'ghost_lead') {
    // Show in-app ghost lead alert
    ghostLeadStore.setAlert(notification.request.content.body);
  }
});

Notifications.addNotificationResponseReceivedListener((response) => {
  const { type, deal_id } = response.notification.request.content.data;
  // Navigate to relevant screen
  router.push(`/deal/${deal_id}`);
});
```

## Offline Support

### Read Cache
- TanStack Query with `persistQueryClient`
- Cache stored in AsyncStorage
- Stale data displayed with "offline" indicator
- Auto-refresh when connectivity restored

### Write Queue
```typescript
// Mutations queued when offline
const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onMutate: async (variables) => {
        // Optimistic update
      },
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    },
  },
});
```

## EAS Build Configuration

### `eas.json`
```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": false },
      "android": { "buildType": "apk" }
    },
    "production": {
      "autoIncrement": true,
      "ios": { "image": "latest" },
      "android": { "image": "latest" }
    }
  },
  "submit": {
    "production": {
      "ios": { "appleId": "your@email.com", "ascAppId": "123456789" },
      "android": { "serviceAccountKeyPath": "./play-store-key.json" }
    }
  }
}
```

### Build Commands
```bash
# Development build (with dev client)
eas build --platform all --profile development

# Preview build (internal distribution for testing)
eas build --platform all --profile preview

# Production build
eas build --platform all --profile production

# Submit to stores
eas submit --platform all --profile production

# OTA update (JS-only changes)
eas update --branch production --message "Bug fix: ..."
```

## File References
| File | Purpose |
|---|---|
| `apps/mobile/app/` | All screens and layouts |
| `apps/mobile/components/` | Shared UI components |
| `apps/mobile/lib/supabase.ts` | Supabase client with SecureStore |
| `apps/mobile/lib/api.ts` | Authenticated API client |
| `apps/mobile/eas.json` | EAS build profiles |
| `apps/mobile/app.json` | Expo configuration |
