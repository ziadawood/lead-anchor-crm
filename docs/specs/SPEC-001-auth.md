# SPEC-001: Multi-Tenant Authentication & Authorization

| Field | Value |
|---|---|
| **Priority** | P0 — Must have for MVP |
| **Platforms** | Web, Mobile, API |
| **Dependencies** | Supabase Auth, Supabase PostgreSQL |
| **Skill Reference** | `.agents/skills/supabase-auth/SKILL.md` |
| **Type References** | `packages/shared/src/types/user.ts`, `packages/shared/src/types/tenant.ts` |

## Overview
Implement complete authentication and authorization system supporting email/password
login, Google OAuth, multi-tenant isolation via JWT claims, and role-based access control.

## User Stories

### US-001.1: Email/Password Signup
**As a** new business owner, **I want to** sign up with my email and password,
**so that** I can create my account and start onboarding my business.

### US-001.2: Email/Password Login
**As a** registered user, **I want to** log in with my email and password,
**so that** I can access my tenant's CRM dashboard.

### US-001.3: Google OAuth
**As a** user, **I want to** sign in with my Google account,
**so that** I can log in quickly without remembering another password.

### US-001.4: Password Reset
**As a** user who forgot my password, **I want to** reset it via email link,
**so that** I can regain access to my account.

### US-001.5: Team Invitations
**As an** admin, **I want to** invite team members with specific roles,
**so that** my agents and viewers can access the system with appropriate permissions.

### US-001.6: Super Admin Access
**As a** platform super admin, **I want to** view and manage all tenants,
**so that** I can administer the platform.

### US-001.7: Session Management
**As a** user, **I want** my session to persist across page refreshes,
**so that** I don't have to log in repeatedly.

## Acceptance Criteria

- [ ] Email/password signup creates `auth.users` + `tenants` + `public.users` records
- [ ] Signup auto-sets JWT custom claims: `{ tenant_id, role: 'admin' }`
- [ ] Google OAuth signup creates same records as email signup
- [ ] Google OAuth login for existing users works without duplicate creation
- [ ] Login returns valid JWT with `tenant_id` and `role` in `app_metadata`
- [ ] Password reset sends email with magic link
- [ ] Password reset link expires after 1 hour
- [ ] Team invite creates `public.users` record with specified role
- [ ] Invited user can set their password via invitation link
- [ ] All API endpoints return 401 for missing/invalid tokens
- [ ] All API endpoints return 403 for insufficient role permissions
- [ ] RLS policies prevent cross-tenant data access (verified with test)
- [ ] Web: login page with email/password form + Google OAuth button
- [ ] Web: redirect to dashboard after successful login
- [ ] Web: redirect to login page if token expired/missing
- [ ] Mobile: tokens stored in `expo-secure-store` (not AsyncStorage)
- [ ] Mobile: biometric unlock option (Face ID / fingerprint)
- [ ] Session auto-refreshes before token expiry

## Implementation Files

| File | Action | Description |
|---|---|---|
| `apps/api/src/middleware/auth.ts` | NEW | JWT verification middleware |
| `apps/api/src/middleware/rbac.ts` | NEW | Role-based access control middleware |
| `apps/api/src/routes/auth.ts` | NEW | Signup, login, invite, reset endpoints |
| `apps/web/src/features/auth/LoginPage.tsx` | NEW | Login page |
| `apps/web/src/features/auth/SignupPage.tsx` | NEW | Registration page |
| `apps/web/src/features/auth/ResetPasswordPage.tsx` | NEW | Password reset page |
| `apps/web/src/features/auth/AuthCallback.tsx` | NEW | OAuth callback handler |
| `apps/web/src/features/auth/use-auth.ts` | NEW | Auth state hook |
| `apps/web/src/lib/supabase.ts` | NEW | Supabase client |
| `apps/mobile/features/auth/` | NEW | Mobile auth screens |
| `apps/mobile/lib/supabase.ts` | NEW | Mobile Supabase client |
| `supabase/migrations/` | MODIFY | RLS policies |

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/signup` | Public | Create user + tenant |
| `POST` | `/api/v1/auth/login` | Public | Login, return JWT |
| `POST` | `/api/v1/auth/reset-password` | Public | Send reset email |
| `POST` | `/api/v1/auth/invite` | Admin | Invite team member |
| `GET` | `/api/v1/auth/me` | User | Get current user profile |
| `PATCH` | `/api/v1/auth/me` | User | Update profile |
