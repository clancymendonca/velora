# Contributing to Velora

Thank you for your interest in contributing to Velora! We aim to build a clean, mathematically precise, and scale-ready platform for sports betting analytics.

To maintain a high standard of quality, please follow the guidelines outlined below.

---

## Monorepo Layout

This repository is structured as a pnpm workspace monorepo:
- `apps/web`: Next.js 15 App Router web client and API route handlers.
- `apps/mobile`: Expo mobile application.
- `packages/calculations`: Pure, platform-agnostic sports betting mathematical calculations (EV, Kelly, conversions, devigging). Exclusively uses `decimal.js`.
- `packages/shared-types`: Core domain types.
- `packages/validators`: Zod validation schemas.
- `packages/database`: Prisma client, schema, and repositories.
- `packages/api`: Service coordination and abstract controller layers.
- `packages/ui`: Shared React primitives.

---

## Code Quality Rules

1. **Zero Floats in Math**:
   - Never use native floating-point arithmetic for core logic inside `packages/calculations`. Enforce arbitrary precision using `Decimal` from `@velora/calculations`.
2. **Pure Functional Programming**:
   - All functions in `@velora/calculations` must be strictly pure, stateless, and free of side-effects.
3. **Database Separation**:
   - Never perform direct Prisma database calls inside controllers or services. Database access must go through the Repository classes defined in `@velora/database`.
4. **Validation Integrity**:
   - Standardize all REST API inputs and outputs using Zod schemas inside `@velora/validators`.

---

## Commit Guidelines

We enforce the **Conventional Commits** standard. Commit messages must be structured as:
```text
<type>(<scope>): <description>

[optional body]
```
Common types:
- `feat`: A new user-facing feature.
- `fix`: A bug fix.
- `docs`: Documentation updates.
- `style`: Changes that do not affect code logic (formatting, spaces).
- `refactor`: Code changes that neither fix a bug nor add a feature.
- `test`: Adding or correcting tests.

---

## PR Workflows & Releases

We use **Changesets** to manage package versioning and publish logs. 
When making a change that affects the version of any workspace package, run:
```bash
npx changeset
```
Follow the interactive prompt to document whether the change is a major, minor, or patch release, and write a summary. Submit the generated changeset file alongside your PR.
