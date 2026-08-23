# Testing Standards

## Philosophy
- Test behavior, not implementation details
- Every bug fix includes a regression test
- Tests are documentation — name them descriptively

## Coverage Targets
| Layer | Target | Tool |
|---|---|---|
| Shared package validators | 95% | Vitest |
| API route handlers | 90% | Vitest + Hono test client |
| API services (business logic) | 85% | Vitest |
| Web components | 80% | Vitest + React Testing Library |
| Web hooks | 80% | Vitest + React Testing Library |
| Mobile components | 75% | Jest + React Native Testing Library |
| E2E (critical paths) | All critical user flows | Playwright (web), Maestro (mobile) |

## Tools by Platform

### Web (`apps/web`)
- **Unit/Component**: Vitest + React Testing Library
- **E2E**: Playwright
- **Config**: `vitest.config.ts` at app root

### API (`apps/api`)
- **Unit/Integration**: Vitest + Hono's `app.request()` test helper
- **Config**: `vitest.config.ts` at app root

### Mobile (`apps/mobile`)
- **Unit/Component**: Jest + React Native Testing Library
- **E2E**: Maestro (YAML-based flow definitions)
- **Config**: `jest.config.js` at app root

### Shared (`packages/shared`)
- **Unit**: Vitest
- **Config**: `vitest.config.ts` at package root

## Test File Location
- Co-located with source: `DealCard.tsx` → `DealCard.test.tsx`
- Integration tests: `__tests__/` directory per feature module
- E2E tests: `e2e/` directory at app root
- Test fixtures/mocks: `__mocks__/` directory per feature

## Test Naming Convention
```typescript
describe('DealCard', () => {
  it('renders the deal title and value', () => { ... });
  it('shows high priority badge when priority is high', () => { ... });
  it('calls onAdvanceStage when advance button is clicked', () => { ... });
});

describe('POST /api/v1/deals', () => {
  it('creates a deal and returns 201', () => { ... });
  it('returns 400 when title is missing', () => { ... });
  it('returns 401 when no auth token is provided', () => { ... });
  it('prevents cross-tenant access', () => { ... });
});
```

## Mocking Guidelines
- Mock external services (Telnyx, Stripe, OpenAI) at the service boundary
- Never mock database in integration tests — use test database
- Use MSW (Mock Service Worker) for web API mocking in component tests
- Factory functions for test data: `createMockDeal()`, `createMockContact()`

## CI Integration
- All tests run on every PR via `lint-test.yml` workflow
- Tests must pass before merge is allowed
- Coverage reports uploaded as PR comments (optional)

## Critical E2E Flows (must always pass)
1. User signup → tenant creation → onboarding wizard completion
2. Inbound call → ghost lead capture → SMS follow-up → mobile notification
3. AI chat → lead qualification → contact + deal creation
4. Deal creation → stage advancement → invoice → payment
5. Mobile: login → inbox feed → deal detail → call back action
