# ADR-001: Enforcing decimal.js for Mathematical and Financial Precision

## Status
Approved

## Context
In sports betting analytics, margins are narrow (often < 1% expected edge). Over hundreds of trades or simulated portfolios, minor errors can accumulate significantly. 

JavaScript and TypeScript native `number` types use standard IEEE 754 double-precision binary floating-point representation. This format is incapable of representing certain base-10 fractional values accurately (e.g. `0.1 + 0.2 === 0.30000000000000004`). In Kelly criterion calculations, implied overround devigging, and expected value formulas, these rounding errors can distort stake sizing recommendations, causing sub-optimal risk management or calculation feedback issues.

## Decision
We enforce the following guidelines for mathematical logic:
1. The native Javascript `number` type is banned for any calculations, odds conversions, bankroll sizing, or Brier score metrics inside `@velora/calculations`.
2. All calculations must use [decimal.js](https://github.com/MikeMcl/decimal.js) to guarantee arbitrary-precision arithmetic.
3. Database schemas (via Prisma) must store odds, probability figures, and transaction amounts using the PostgreSQL `Decimal` data type rather than `Float` or `Double`.
4. Domain models and API representations should expose numerical figures as standard TypeScript `number` primitives only at boundary points (e.g., in JSON outputs or frontend displays) where absolute precision is no longer structurally critical.

## Consequences
- **Pros**:
  - Eliminates IEEE 754 floating-point rounding artifacts.
  - Consistent and predictable rounding behavior (using `Decimal.ROUND_HALF_UP` as standard).
  - Increased developer confidence in critical sports betting calculations.
- **Cons**:
  - Minor runtime overhead compared to native CPU float calculations (negligible for our traffic and math density).
  - Developers must adapt to using methods like `.plus()`, `.minus()`, `.mul()`, and `.div()` instead of basic algebraic operators.
