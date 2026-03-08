# AGENTS.md

## Purpose
This repo is a front-end demo/prototype for screening workflows.
The priority is:
1. fast iteration
2. clear code structure
3. coherent UI behavior
4. only enough verification for the scope of the change

## Performance Rules For The Agent

Do not run `npm run build` systematically.

Use proportional verification:
- Small copy, layout, spacing, icon, or static mock-data changes:
  do not run a full build by default.
- Single-component UI changes:
  prefer targeted inspection and lightweight checks.
- Cross-file refactors, shared component changes, routing changes, or state-shape changes:
  run `npm run build`.
- If the user explicitly asks for validation, release-readiness, or a commit/push after significant changes:
  run `npm run build`.
- If there is a fast targeted test available for the changed area, prefer that before a full build.

Before running expensive commands, ask:
- Did I change runtime behavior or only presentation?
- Did I change shared types, shared UI primitives, routing, or app state?
- Is a full production build the cheapest meaningful check?

Default rule:
- No full build for minor visual edits.
- Full build for structural changes.

## Editing Rules

Prefer minimal diffs.

Do not rewrite large files unless the existing structure is blocking the task.

Keep local mock data coherent with the UI that consumes it.

When adding new fake data:
- keep naming realistic
- keep values internally consistent
- avoid random fields that are not rendered

## Code Design Clarity

Optimize for readability over cleverness.

Prefer:
- small focused helpers
- local data-driven configuration
- explicit naming
- shallow component trees when possible

Avoid:
- giant inline objects inside JSX unless truly local
- repeated conditional branches across the same file
- mixing data definition, business rules, and view rendering in the same block when it can be separated cheaply
- broad renames or formatting churn unrelated to the task

## React Guidelines

Use function components and keep state as local as possible.

When a modal, tab set, or card family has repeated structure:
- extract configuration objects first
- extract helper components second
- only extract hooks if logic is reused or hard to read inline

Do not introduce memoization by default.
Use `useMemo` only when it improves clarity or prevents obviously repeated expensive work.

## UI Guidelines

This project is a product demo, so visuals matter.

Prefer:
- strong information hierarchy
- cards and sections with clear purpose
- icons only when they add meaning
- layouts that remain readable at medium widths

Avoid:
- cramped multi-column layouts
- badges or pills that steal width from main content
- oversized modal internals without a clear content reason
- decorative visuals that reduce scanability

For forms:
- each step should show fields specific to that step
- labels must be explicit
- fake values should still look believable

For reports:
- comparisons must make the default benchmark obvious
- charts should answer one question each

## Validation Output

When reporting completion:
- say what changed
- say what was verified
- if no build was run, say so explicitly when relevant

## Safety

Do not stage or commit unrelated files unless the user explicitly asks for all local changes.

Ignore local logs and incidental workspace files unless the task is about them.
