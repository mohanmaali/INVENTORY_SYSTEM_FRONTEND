# Frontend Architecture

## High-Level Structure

```text
src/
  components/
    common/       # Layout, header, sidebar, shared app sections
    ui/           # Reusable UI primitives
  constants/      # Static constants
  hooks/          # Reusable hooks
  lib/            # Small utility integrations
  pages/          # Route-level pages
  router/         # Route definitions and guards
  services/       # API layer
  store/          # Redux store and slices
  styles/         # Global styles
  utils/          # Pure helper functions
```

## State Management

### Redux

Redux Toolkit is the primary global state solution in this project.

Current Redux usage:

- auth state
- auth initialization
- login/register/logout flow

Files:

- `src/store/store.js`
- `src/store/authSlice.js`
- `src/hooks/useAuth.js`

### Local State

Component-level UI state still uses React local state where global storage is not needed.

Examples:

- form input state
- modal open/close state
- page-specific loading states
- selected row/item state

## Routing

Routing uses React Router.

Files:

- `src/router/routes.jsx`
- `src/router/PrivateRoute.jsx`

Pattern:

- each page is mapped in `routes.jsx`
- protected routes use `PrivateRoute`
- layout wrapping happens in route definitions

## API Layer

All backend communication is handled through service files.

Examples:

- `src/services/api.js`
- `src/services/auth.js`
- `src/services/roles.js`
- `src/services/users.js`

Rules:

- components should not call axios directly
- page logic should use service functions
- shared request config lives in `api.js`

## Hooks

Custom hooks are used for reusable logic.

Current hooks:

- `useAuth`
- `usePermissions`
- `useDebounce`
- `useFetch`
- `useLocalStorage`

### useAuth

Handles Redux-based auth access and auth initialization.

### usePermissions

Checks current user permissions by module and action.

Example:

```js
const permissions = usePermissions('users');

if (!permissions.canRead) {
  return <div>No access</div>;
}
```

## UI Component Strategy

### `components/ui`

Reusable primitive components.

Examples:

- Button
- Input
- Card
- Modal
- Pagination
- ConfirmationModal

These should stay generic and reusable.

### `components/common`

Application-specific reusable components.

Examples:

- Header
- Sidebar
- Layout

## Pages

Each feature is split into route pages.

Examples:

- `pages/Auth`
- `pages/Permission`
- `pages/Users`

Current pattern:

- list page
- add page
- edit/update page

## Permissions Design

Roles store permissions in this shape:

```js
{
  module: 'users',
  actions: ['create', 'read', 'update', 'delete']
}
```

Frontend permission checks normalize `get` to `read` when needed.

## Reusable Patterns

### Pagination

Shared pagination UI:

- `src/components/ui/Pagination.jsx`

### Delete Confirmation

Shared delete confirmation modal:

- `src/components/ui/ConfirmationModal.jsx`

## Recommended Team Rules

- Put API logic in `services`, not inside components.
- Put reusable logic in hooks.
- Use Redux only for truly shared state.
- Use local component state for page-only UI state.
- Keep shared UI generic.
- Keep pages focused on orchestration, not low-level UI details.
