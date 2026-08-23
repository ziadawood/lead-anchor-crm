# Coding Standards

## TypeScript
- Target: ES2022+
- Strict mode: always enabled in `tsconfig.json`
- No `any` — use `unknown` and narrow with type guards
- Prefer `const` over `let`; never use `var`
- Use barrel exports (`index.ts`) per feature module
- Prefer named exports over default exports (except React components)
- Use `satisfies` operator for type-safe object literals

## React (Web & Mobile)
- Functional components only — no class components
- Use custom hooks for logic extraction (when logic exceeds ~10 lines)
- State management:
  - **Client state**: Zustand stores (per-feature)
  - **Server state**: React Query (TanStack Query)
  - **Form state**: React Hook Form + Zod resolvers
- No prop drilling beyond 2 levels — use context or Zustand
- Memoize expensive computations with `useMemo`
- Memoize callbacks passed to child components with `useCallback`

## Styling (Web)
- TailwindCSS 4 utility classes exclusively
- Component variants via `clsx` + `tailwind-merge` (`cn()` utility)
- Design tokens defined in `tailwind.config.ts` (colors, spacing, typography)
- No inline `style` props unless absolutely necessary for dynamic values
- Dark mode: use `dark:` variant classes

## Styling (Mobile)
- StyleSheet.create for all styles
- Use UI library theme tokens (Tamagui or RN Paper)
- Responsive: use `useWindowDimensions` for adaptive layouts

## Error Handling
- API: Always return typed error responses, never throw unhandled exceptions
- Client: Error boundaries at route level (`ErrorBoundary` component)
- Async: Always handle promise rejections; use `.catch()` or try/catch
- Never silently swallow errors — always log or display

## Imports
- Absolute imports via `@/` path alias (configured in tsconfig paths)
- Import order (enforced by ESLint):
  1. React/framework imports
  2. Third-party library imports
  3. Internal module imports (`@/features/`, `@/lib/`)
  4. Type-only imports (`import type { ... }`)
- Use `import type` for type-only imports to enable tree-shaking

## File Organization
```
src/features/<feature-name>/
├── components/          # Feature-specific React components
│   ├── DealCard.tsx
│   └── DealCard.test.tsx
├── hooks/               # Feature-specific hooks
│   └── use-deals.ts
├── api/                 # API client functions for this feature
│   └── deals-api.ts
├── types.ts             # Feature-specific types
├── store.ts             # Zustand store (if needed)
└── index.ts             # Barrel export
```

## Git Conventions
- Commits: Conventional Commits format (`feat:`, `fix:`, `chore:`, `docs:`)
- Branches: `feature/<name>`, `fix/<name>`, `chore/<name>`
- PRs: Must pass lint + type-check + tests before merge
