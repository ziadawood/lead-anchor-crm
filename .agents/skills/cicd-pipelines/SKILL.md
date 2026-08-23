---
name: cicd-pipelines
description: Reference for all CI/CD pipelines covering web, API, mobile, and database deployments with GitHub Actions and EAS Build.
---

# CI/CD Pipelines

## Overview
LeadAnchor uses a multi-pipeline CI/CD architecture:
- **GitHub Actions** for web, API, and database deployments
- **EAS Build + EAS Submit** for iOS and Android native builds
- **EAS Update** for over-the-air JavaScript patches

## Pipeline Summary

| Pipeline | File | Trigger | Target |
|---|---|---|---|
| Quality Gate | `lint-test.yml` | Pull Request | Lint + Type-check + Tests |
| Web Deploy | `web-deploy.yml` | Push to `main` | Cloudflare Pages |
| API Deploy | `api-deploy.yml` | Push to `main` (api paths) | Cloudflare Workers |
| Mobile Preview | `mobile-preview.yml` | PR (mobile paths) | EAS Internal Distribution |
| Mobile Release | `mobile-release.yml` | Git tag `mobile-v*` | App Store + Play Store |
| DB Migration | `db-migrate.yml` | Push to `main` (supabase paths) | Supabase PostgreSQL |

## Required GitHub Secrets

| Secret | Service | How to Get |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare | Dashboard → API Tokens → Edit Workers |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare | Dashboard → Workers & Pages → right sidebar |
| `EXPO_TOKEN` | Expo EAS | `npx eas-cli login` → expo.dev → Access Tokens |
| `SUPABASE_ACCESS_TOKEN` | Supabase | Dashboard → Account → Access Tokens |
| `SUPABASE_PROJECT_REF` | Supabase | Dashboard → Project Settings → General |
| `SUPABASE_DB_PASSWORD` | Supabase | Dashboard → Project Settings → Database |

## Environments

| Environment | Branch | URL Pattern | Purpose |
|---|---|---|---|
| Preview | PR branch | `<hash>.leadanchor.pages.dev` | PR preview |
| Staging | `staging` | `staging.leadanchor.com` | Pre-production testing |
| Production | `main` | `leadanchor.com` | Live production |

## Pipeline Details

### 1. Quality Gate (`lint-test.yml`)
Runs on every pull request. All checks must pass before merge.

```yaml
name: Quality Gate
on: [pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - name: Lint
        run: npx turbo lint
      - name: Type Check
        run: npx turbo type-check
      - name: Unit Tests
        run: npx turbo test -- --coverage
      - name: Upload Coverage
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: '**/coverage/'
```

### 2. Web Deploy (`web-deploy.yml`)
Deploys web frontend to Cloudflare Pages.

```yaml
name: Web Deploy
on:
  push:
    branches: [main]
    paths: ['apps/web/**', 'packages/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx turbo build --filter=web
      - uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: 'leadanchor'
          directory: 'apps/web/dist'
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

### 3. API Deploy (`api-deploy.yml`)
Deploys API to Cloudflare Workers.

```yaml
name: API Deploy
on:
  push:
    branches: [main]
    paths: ['apps/api/**', 'packages/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx turbo build --filter=api
      - name: Deploy to Workers
        run: npx wrangler deploy
        working-directory: apps/api
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

### 4. Mobile Preview (`mobile-preview.yml`)
Builds preview APK/IPA for internal testing on PRs.

```yaml
name: Mobile Preview
on:
  pull_request:
    paths: ['apps/mobile/**', 'packages/**']

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: npm ci
      - name: Build Preview
        run: eas build --platform all --profile preview --non-interactive
        working-directory: apps/mobile
      - name: Comment PR with build links
        uses: expo/expo-github-action/preview@v8
        with:
          command: eas update --auto --non-interactive
```

### 5. Mobile Release (`mobile-release.yml`)
Production build and submission to App Store + Play Store.

```yaml
name: Mobile Release
on:
  push:
    tags: ['mobile-v*']

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: npm ci
      - name: Build Production
        run: eas build --platform all --profile production --non-interactive
        working-directory: apps/mobile
      - name: Submit to Stores
        run: eas submit --platform all --non-interactive
        working-directory: apps/mobile
```

### 6. DB Migration (`db-migrate.yml`)
Applies database migrations to Supabase.

```yaml
name: DB Migration
on:
  push:
    branches: [main]
    paths: ['supabase/migrations/**']

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - name: Link Project
        run: supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      - name: Apply Migrations
        run: supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
```

## Release Process

### Web + API (Continuous)
1. Create feature branch
2. Develop and test locally
3. Open PR → Quality Gate runs automatically
4. Get PR review and approval
5. Merge to `main` → Auto-deploys to production

### Mobile (Tagged Releases)
1. Update version in `app.json`
2. Create and push git tag: `git tag mobile-v1.2.0 && git push --tags`
3. Mobile Release pipeline builds and submits automatically
4. Monitor App Store Connect / Google Play Console for review
5. For hotfixes (JS-only): `eas update --branch production --message "..."`

## Turborepo Configuration

### `turbo.json`
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"]
    },
    "lint": {},
    "type-check": {},
    "test": {
      "dependsOn": ["^build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

## Monitoring Post-Deploy
- **Cloudflare Analytics**: Web traffic, edge performance
- **Sentry**: Error tracking for web, API, and mobile
- **EAS Insights**: Mobile crash reports and OTA update adoption
- **Supabase Dashboard**: Database performance, auth metrics

## File References
| File | Purpose |
|---|---|
| `.github/workflows/lint-test.yml` | PR quality gate |
| `.github/workflows/web-deploy.yml` | Web deployment |
| `.github/workflows/api-deploy.yml` | API deployment |
| `.github/workflows/mobile-preview.yml` | Mobile preview builds |
| `.github/workflows/mobile-release.yml` | Mobile store submission |
| `.github/workflows/db-migrate.yml` | Database migrations |
| `turbo.json` | Turborepo pipeline config |
