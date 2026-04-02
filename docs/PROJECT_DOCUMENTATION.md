# Inventory Management Frontend Documentation

## 1. Project Overview

This project is a React frontend for an inventory management system. It is built with Vite and Tailwind CSS, uses Redux Toolkit for shared auth state, Axios for API communication, and React Router for navigation.

The current implementation includes:

- Authentication
- Dashboard
- Inventory
- Sales
- Purchase
- Reports
- Role and permission management
- User management

This documentation is intended for team onboarding and day-to-day development.

## 2. Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Redux Toolkit
- React Redux
- React Query
- React Hot Toast
- React Icons

## 3. Project Setup

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm run dev
```

### Production build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## 4. Environment Configuration

Create or update environment variables as needed:

```env
VITE_API_URL=http://localhost:5000/api
```

## 5. Current Project Structure

```text
Frontend/
|-- docs/
|   |-- README.md
|   |-- FRONTEND_ARCHITECTURE.md
|   |-- PROJECT_DOCUMENTATION.md
|
|-- src/
|   |-- App.jsx
|   |-- main.jsx
|   |
|   |-- components/
|   |   |-- common/
|   |   |   |-- Footer.jsx
|   |   |   |-- Header.jsx
|   |   |   |-- Layout.jsx
|   |   |   |-- Sidebar.jsx
|   |   |   `-- SidebarGroup.jsx
|   |   |
|   |   `-- ui/
|   |       |-- Button.jsx
|   |       |-- Card.jsx
|   |       |-- ConfirmationModal.jsx
|   |       |-- Form.jsx
|   |       |-- Input.jsx
|   |       |-- Modal.jsx
|   |       |-- Pagination.jsx
|   |       |-- Table.jsx
|   |       `-- index.js
|   |
|   |-- constants/
|   |   |-- config.js
|   |   `-- routes.js
|   |
|   |-- hooks/
|   |   |-- useAuth.js
|   |   |-- useDebounce.js
|   |   |-- useFetch.js
|   |   |-- useLocalStorage.js
|   |   `-- usePermissions.js
|   |
|   |-- lib/
|   |   `-- utils.js
|   |
|   |-- pages/
|   |   |-- Auth/
|   |   |   |-- Login.jsx
|   |   |   `-- Register.jsx
|   |   |
|   |   |-- Dashboard/
|   |   |   `-- Dashboard.jsx
|   |   |
|   |   |-- Home/
|   |   |   `-- Home.jsx
|   |   |
|   |   |-- Inventory/
|   |   |   `-- Inventory.jsx
|   |   |
|   |   |-- NotFound/
|   |   |   `-- NotFound.jsx
|   |   |
|   |   |-- Permission/
|   |   |   |-- AddRole.jsx
|   |   |   |-- EditRole.jsx
|   |   |   |-- ListRoles.jsx
|   |   |   |-- roleConfig.js
|   |   |   `-- components/
|   |   |       `-- RoleForm.jsx
|   |   |
|   |   |-- Purchase/
|   |   |   `-- Purchase.jsx
|   |   |
|   |   |-- Reports/
|   |   |   `-- Reports.jsx
|   |   |
|   |   |-- Sales/
|   |   |   `-- Sales.jsx
|   |   |
|   |   `-- Users/
|   |       |-- AddUser.jsx
|   |       |-- EditUser.jsx
|   |       `-- ListUsers.jsx
|   |
|   |-- router/
|   |   |-- PrivateRoute.jsx
|   |   `-- routes.jsx
|   |
|   |-- services/
|   |   |-- api.js
|   |   |-- auth.js
|   |   |-- roles.js
|   |   `-- users.js
|   |
|   |-- store/
|   |   |-- authSlice.js
|   |   |-- index.js
|   |   `-- store.js
|   |
|   |-- styles/
|   |   `-- globals.css
|   |
|   `-- utils/
|       `-- formatDate.js
|
|-- .env.example
|-- index.html
|-- package.json
|-- package-lock.json
|-- postcss.config.js
|-- tailwind.config.js
`-- vite.config.js
```

## 6. Architecture Summary

The application follows a simple layered frontend structure:

1. `pages`
   Route-level UI and page orchestration.

2. `components`
   Shared UI building blocks and layout components.

3. `hooks`
   Reusable logic for auth, permissions, local storage, debounce, and fetch helpers.

4. `services`
   Backend API communication layer.

5. `store`
   Redux Toolkit store and auth slice.

## 7. Application Data Flow

```text
User Action
  ->
Page Component
  ->
Hook / Event Handler
  ->
Service Layer
  ->
Backend API
  ->
Redux / Local State Update
  ->
UI Re-render
```

## 8. Routing Structure

Routing is configured in `src/router/routes.jsx`.

Current important routes:

- `/`
- `/login`
- `/register`
- `/inventory`
- `/sales`
- `/purchase`
- `/reports`
- `/roles`
- `/roles/add`
- `/roles/:id/edit`
- `/users`
- `/users/add`
- `/users/:id/edit`

Protected routes use `PrivateRoute.jsx`.

## 9. State Management

### Global state

Global auth state is managed with Redux Toolkit.

Files:

- `src/store/store.js`
- `src/store/authSlice.js`
- `src/hooks/useAuth.js`

Auth state includes:

- authenticated user
- auth token
- auth loading state

### Local state

Page-level and component-level UI state is still handled with React local state:

- form inputs
- modal state
- loading indicators
- selected items
- delete confirmation state

## 10. Authentication Flow

Auth is Redux-based.

### Files involved

- `src/store/authSlice.js`
- `src/hooks/useAuth.js`
- `src/services/auth.js`
- `src/services/api.js`
- `src/router/PrivateRoute.jsx`

### Flow

1. App starts
2. `useInitializeAuth()` runs in `App.jsx`
3. Redux checks for token in local storage
4. If token exists, frontend calls `/auth/profile`
5. Auth state is restored in Redux
6. Protected routes check Redux token state

### Login/Register

- Login page calls `useAuth().login()`
- Register page calls `useAuth().register()`
- On success, token is stored and profile is loaded

## 11. API Layer

All API calls are centralized in services.

### Core API file

- `src/services/api.js`

Responsibilities:

- axios instance creation
- base URL setup
- auth header injection
- 401 handling

### Feature service files

- `src/services/auth.js`
- `src/services/roles.js`
- `src/services/users.js`

Rule:

- components and pages should not call axios directly
- they should call service functions

## 12. Hooks

### `useAuth`

Redux-based auth access hook.

Returns:

- `user`
- `loading`
- `login`
- `register`
- `logout`
- `setUser`

### `usePermissions`

Permission helper hook for module-level permission checks.

Example:

```js
const permissions = usePermissions('roles');

if (!permissions.canRead) {
  return <div>No access</div>;
}
```

### `useDebounce`

Reusable debounce logic.

### `useFetch`

Generic fetch helper hook.

### `useLocalStorage`

State persistence helper for local storage values.

## 13. UI Components

### `components/ui`

Reusable and generic UI primitives:

- Button
- Input
- Card
- Form
- Modal
- ConfirmationModal
- Pagination
- Table

### `components/common`

Application-level shared layout components:

- Header
- Sidebar
- SidebarGroup
- Layout
- Footer

## 14. Roles and Permissions Module

Location:

- `src/pages/Permission`

Pages:

- `ListRoles.jsx`
- `AddRole.jsx`
- `EditRole.jsx`

Shared role form:

- `components/RoleForm.jsx`

Role permissions structure:

```js
{
  module: 'users',
  actions: ['create', 'read', 'update', 'delete']
}
```

Frontend also normalizes `get` to `read` where needed.

Current role list UI includes:

- table layout
- permission summary
- permission details modal
- delete confirmation modal

## 15. Users Module

Location:

- `src/pages/Users`

Pages:

- `ListUsers.jsx`
- `AddUser.jsx`
- `EditUser.jsx`

Current user list supports:

- table layout
- live search
- pagination
- refresh-safe pagination through query params
- edit action
- delete confirmation modal

## 16. Shared Reusable Patterns

### Pagination

Reusable component:

- `src/components/ui/Pagination.jsx`

Used for:

- users list

Can be reused for:

- roles
- inventory
- sales
- purchase
- reports

### Confirmation Modal

Reusable component:

- `src/components/ui/ConfirmationModal.jsx`

Used for delete confirmation flows.

### Base Modal

Reusable portal-based modal:

- `src/components/ui/Modal.jsx`

## 17. Styling

Styling uses Tailwind CSS.

Global styles:

- `src/styles/globals.css`

Current approach:

- utility classes in JSX
- shared reusable UI components
- neutral admin-style layout

## 18. Team Development Rules

- Keep API logic inside `services`
- Keep reusable logic inside `hooks`
- Keep shared state in Redux only when truly global
- Keep temporary UI state local to the page/component
- Keep shared UI components generic
- Do not mix business logic inside `components/ui`
- Use route pages only for screen-level orchestration

## 19. Recommended Development Flow

When adding a new module:

1. Add service functions in `src/services`
2. Add route pages in `src/pages/<Module>`
3. Add route entries in `src/router/routes.jsx`
4. Add sidebar navigation if needed
5. Reuse shared `Pagination`, `Modal`, and `ConfirmationModal` where possible
6. Add permission checks through `usePermissions(moduleName)` when needed

## 20. Current Improvement Opportunities

These are good future improvements:

- move more shared backend data into Redux slices if needed
- add a create-user API integration for `AddUser.jsx`
- add feature-specific loading skeletons
- add unit tests and integration tests
- improve route-level permission guarding
- add root `README.md` for faster onboarding

## 21. Important Notes

- Auth is Redux-based
- Context-based auth has been removed
- Zustand has been removed
- Existing docs in `docs/` should be treated as the project source of documentation truth
