---
name: supabase-auth
description: Authentication and authorization patterns using Supabase Auth with Row Level Security for multi-tenant isolation. Covers signup, login, OAuth, JWT handling, RBAC, and RLS policies.
---

# Supabase Auth Integration

## Overview
LeadAnchor uses **Supabase Auth** for all authentication and authorization.
Supabase provides:
- Email/password authentication
- OAuth providers (Google, Apple)
- JWT tokens with custom claims
- Row Level Security (RLS) for tenant isolation at the database level

## Auth Flow

### Signup (New Tenant)
```
1. User submits email + password + company name
2. Supabase creates `auth.users` record
3. API creates `tenants` record
4. API creates `public.users` record linking auth.user ↔ tenant
5. API sets custom JWT claims: { tenant_id, role: 'admin' }
6. Default pipeline stages created for new tenant
7. User redirected to onboarding wizard
```

### Login
```
1. User submits email + password (or OAuth)
2. Supabase validates credentials, returns JWT
3. Client stores JWT (web: httpOnly cookie or localStorage, mobile: expo-secure-store)
4. All subsequent API calls include Authorization: Bearer <jwt>
5. API middleware extracts tenant_id + role from JWT claims
```

### OAuth (Google)
```
1. Client redirects to Supabase OAuth URL
2. User authenticates with Google
3. Supabase creates/links auth.users record
4. Callback: if new user → create tenant + public.users record
5. If existing user → login normally
```

## Roles & Permissions

| Role | Scope | Permissions |
|---|---|---|
| `super_admin` | Platform-wide | All tenants, billing, system config |
| `admin` | Single tenant | Full CRUD, team management, settings |
| `agent` | Single tenant | CRUD on contacts, deals, interactions |
| `viewer` | Single tenant | Read-only access |

### Permission Matrix
| Resource | super_admin | admin | agent | viewer |
|---|---|---|---|---|
| Tenants (all) | CRUD | — | — | — |
| Own Tenant Settings | CRUD | CRUD | R | R |
| Users (team) | CRUD | CRUD | R | R |
| Contacts | CRUD | CRUD | CRUD | R |
| Deals | CRUD | CRUD | CRUD | R |
| Interactions | CRUD | CRUD | CRUD | R |
| Phone Numbers | CRUD | CRUD | R | R |
| Invoices | CRUD | CRUD | CRU | R |
| Bookings | CRUD | CRUD | CRUD | R |
| Analytics | R | R | R | R |

## JWT Custom Claims

### Setting Claims (API-side, on signup/role change)
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Set custom claims in auth.users.raw_app_meta_data
await supabaseAdmin.auth.admin.updateUserById(userId, {
  app_metadata: {
    tenant_id: tenantId,
    role: 'admin',
  },
});
```

### Reading Claims (API middleware)
```typescript
import { createMiddleware } from 'hono/factory';

export const authMiddleware = createMiddleware(async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return c.json({ error: { code: 'UNAUTHORIZED', message: 'Missing token' } }, 401);

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return c.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid token' } }, 401);

  c.set('userId', user.id);
  c.set('tenantId', user.app_metadata.tenant_id);
  c.set('role', user.app_metadata.role);

  await next();
});
```

## Row Level Security (RLS) Policies

### Pattern: Tenant Isolation
```sql
-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their tenant's data
CREATE POLICY "tenant_isolation_select" ON contacts
  FOR SELECT
  USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

CREATE POLICY "tenant_isolation_insert" ON contacts
  FOR INSERT
  WITH CHECK (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

CREATE POLICY "tenant_isolation_update" ON contacts
  FOR UPDATE
  USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

CREATE POLICY "tenant_isolation_delete" ON contacts
  FOR DELETE
  USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);
```

### Pattern: Role-Based Access
```sql
-- Viewers cannot modify data
CREATE POLICY "viewer_read_only" ON contacts
  FOR SELECT
  USING (
    tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
  );

-- Only admin+ can delete
CREATE POLICY "admin_delete" ON contacts
  FOR DELETE
  USING (
    tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('super_admin', 'admin')
  );
```

### Pattern: Super Admin Bypass
```sql
CREATE POLICY "super_admin_all" ON tenants
  FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin');
```

## Client Usage

### Web (React)
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Sign up
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { display_name: name } }
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email, password
});

// OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: `${window.location.origin}/auth/callback` }
});

// Get session
const { data: { session } } = await supabase.auth.getSession();

// Sign out
await supabase.auth.signOut();
```

### Mobile (React Native / Expo)
```typescript
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: {
      getItem: (key) => SecureStore.getItemAsync(key),
      setItem: (key, value) => SecureStore.setItemAsync(key, value),
      removeItem: (key) => SecureStore.deleteItemAsync(key),
    },
  },
});
```

## Password Reset Flow
```
1. User clicks "Forgot Password"
2. Client calls supabase.auth.resetPasswordForEmail(email)
3. Supabase sends reset email with magic link
4. User clicks link → redirected to /auth/reset?token=...
5. Client calls supabase.auth.updateUser({ password: newPassword })
```

## Session Management
- Web: Supabase auto-refreshes tokens via `onAuthStateChange` listener
- Mobile: Same, stored in SecureStore
- Token expiry: 1 hour (configurable in Supabase dashboard)
- Refresh token expiry: 7 days

## File References
| File | Purpose |
|---|---|
| `apps/api/src/middleware/auth.ts` | JWT verification + tenant extraction |
| `apps/api/src/middleware/rbac.ts` | Role-based access control middleware |
| `apps/web/src/features/auth/` | Login, signup, reset password pages |
| `apps/web/src/lib/supabase.ts` | Supabase client initialization |
| `apps/mobile/lib/supabase.ts` | Mobile Supabase client (SecureStore) |
| `supabase/migrations/` | RLS policies |

## Environment Variables
```
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  (server-side only, NEVER expose)
```
