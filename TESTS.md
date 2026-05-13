# Automated Tests

This project uses **Jest** for unit and integration testing. The test suite focuses on the core deterministic logic of the Audit Engine to ensure financial accuracy.

## Test List

| Filename | Coverage | How to Run |
|----------|----------|------------|
| `__tests__/audit-engine.test.ts` | **Core Audit Engine**: Flags overspend, detects cross-tool redundancy, validates zero-savings for optimal setups. | `npm test` |
| `__tests__/pricing-data.test.ts` | **Pricing Integrity**: Ensures every tool has unique plans, valid URLs, and accurate price points matching `PRICING_DATA.md`. | `npm test` |
| `__tests__/utils.test.ts` | **Utility Functions**: Validates currency formatting, percentage calculations, and benchmark mapping logic. | `npm test` |

## How to Run Tests Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the full suite**:
   ```bash
   npm test
   ```

3. **Run in watch mode** (during development):
   ```bash
   npm test -- --watch
   ```

## CI Integration
Tests are automatically executed on every push to the `main` branch via GitHub Actions. See [.github/workflows/ci.yml](.github/workflows/ci.yml) for details.
