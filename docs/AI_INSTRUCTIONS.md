# AI Instructions And Project Rules

## Purpose

This document defines the rules an AI assistant should follow while working on this frontend project.

The goal is to keep the codebase:

- simple
- consistent
- team-friendly
- maintainable

## Core Principles

- Prefer simple solutions over clever solutions.
- Follow the existing project structure.
- Do not introduce unnecessary abstractions.
- Keep the project easy for the team to understand.
- Reuse existing shared components and hooks before creating new ones.
- Do not change unrelated functionality while working on a task.

## Architecture Rules

### State Management

- Use Redux Toolkit for shared application state.
- Keep local UI-only state inside components with `useState`.
- Only move state to Redux when it is truly shared across pages or modules.

### API Layer

- All backend calls must go through `src/services`.
- Do not call axios directly from page or UI components.
- Reuse the shared axios instance from `src/services/api.js`.

### Hooks

- Put reusable logic in `src/hooks`.
- Hooks must not return JSX.
- Hooks should stay focused on one concern.
- Avoid overengineering hooks.

### Components

- `src/components/ui` should contain generic reusable UI primitives only.
- `src/components/common` should contain shared app-level layout components.
- Do not place business logic in UI primitives.
- Prefer composition over duplication.

### Pages

- Pages should orchestrate data and UI.
- Route-level pages belong in `src/pages`.
- Keep page code readable and not overly abstract.

## Coding Style Rules

- Keep code readable for a team, not just for the machine.
- Prefer explicit names over short confusing names.
- Use small reusable helpers only when they actually reduce repetition.
- Avoid deeply nested logic when possible.
- Keep components focused and not too large.
- Add comments only when they provide real value.
- Do not leave debug logs in the code.

## UI Rules

- Match the existing admin-style UI.
- Prefer structured layouts over scattered card stacks when listing data.
- Use reusable components like:
  - `Pagination`
  - `Modal`
  - `ConfirmationModal`
  - `Button`
  - `Card`
  - `Input`
- Keep tables readable and practical.
- Avoid flashy or overdesigned UI changes unless requested.

## Permissions Rules

- Use `usePermissions(moduleName)` for permission checks.
- Do not hardcode role-based visibility if permission-based checks already exist.
- Normalize permission handling consistently with backend expectations.

## Delete Action Rules

- Any destructive delete action should use `ConfirmationModal`.
- Do not delete records directly from a click without confirmation.
- Keep delete buttons visually clear and safe.

## Documentation Rules

- Keep docs inside the `docs` folder.
- Update documentation when architecture or major flows change.
- Prefer practical documentation over generic theory.
- Documentation should reflect the actual current codebase.

## File And Folder Rules

- Use the existing folder structure.
- Do not create new folders unless there is a clear reason.
- Put new feature pages inside their feature folder.
- Put reusable project-wide utilities in the correct shared folder.

## What To Avoid

- Do not add unused dependencies.
- Do not keep dead code after refactors.
- Do not duplicate state management patterns.
- Do not mix Redux, Context, and other global state tools for the same concern.
- Do not add placeholder architecture that the team will not use.
- Do not break existing flows while adding new features.

## Preferred Development Flow

When implementing a feature:

1. Understand the current structure first.
2. Reuse existing patterns.
3. Add service functions.
4. Build or update page UI.
5. Reuse shared components where possible.
6. Add permission checks if needed.
7. Keep code simple and readable.
8. Update docs if the project structure or workflow changes.

## Final Rule

If there are two possible approaches, prefer the one that is:

- easier to understand
- easier to maintain
- more consistent with the current project
- safer for team collaboration
