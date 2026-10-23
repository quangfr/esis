---
name: playwright-testing
description: Guidelines and procedures for authoring, running, and debugging Playwright end-to-end tests or utilizing browser automation tools. Use this skill when writing tests with @playwright/test or performing automated UI verifications.
---

# Playwright Testing Skill

This skill outlines guidelines for running and authoring Playwright E2E tests in this repository.

## Commands

Run tests headlessly:
```bash
npm run test:e2e
```

Run a specific test suite (e.g. demo parcours):
```bash
npm run test:e2e:demo
```

Run with UI mode / debug mode:
```bash
npx playwright test --ui
npx playwright test --debug
```

## Best Practices

1. **Locators**: Prefer user-facing locators (`getByRole`, `getByLabel`, `getByText`) over CSS selectors.
2. **Waiting**: Avoid hardcoded sleep timers; rely on Playwright's automatic assertions (`await expect(locator).toBeVisible()`).
3. **Flakiness**: Ensure tests start from a clean state or use the fake Firestore reset utilities where appropriate.
