# velora

Production-ready Turborepo + pnpm skeleton for Velora.

## Workspace layout

- `apps/web`: Next.js 15 App Router + Tailwind + shadcn/ui-ready + backend route handlers
- `apps/mobile`: Expo React Native app with TypeScript
- `packages/calculations`: probability, EV, Kelly, devigging, odds, bankroll utilities
- `packages/shared-types`: shared TypeScript contracts
- `packages/ui`: shared reusable UI primitives

## Tooling included

- Turborepo + pnpm workspace
- ESLint + Prettier
- Husky + lint-staged
- Vitest
- Conventional commits (commitlint)
- GitHub Actions CI

## Getting started

```bash
pnpm install
pnpm dev
```

Copy `apps/web/.env.example` to `apps/web/.env.local` before running the web app.
