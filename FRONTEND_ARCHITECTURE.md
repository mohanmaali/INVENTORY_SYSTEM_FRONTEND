# Vite + Tailwind CSS Frontend Project Structure

## Part 1 — Folder Structure

```text
├── public/                              # Static assets served as-is (favicon, robots.txt)
│   └── favicon.ico                      # App favicon
│
├── src/
│   ├── assets/                          # Bundled assets (images, fonts, icons)
│   │   ├── images/                      # Static images (logos, placeholders)
│   │   └── fonts/                       # Custom font files
│   │
│   ├── components/
│   │   ├── ui/                          # Base UI primitives (buttons, inputs, cards)
│   │   │   ├── Button.jsx               # Reusable button component
│   │   │   ├── Input.jsx                # Form input component
│   │   │   ├── Card.jsx                 # Container card component
│   │   │   ├── Modal.jsx                # Dialog/overlay component
│   │   │   └── [ui-element].jsx         # Other atomic UI components
│   │   │
│   │   └── common/                      # Composite components for the app
│   │       ├── Header.jsx               # App header/navigation
│   │       ├── Footer.jsx               # App footer
│   │       ├── Sidebar.jsx              # Navigation sidebar
│   │       ├── DataTable.jsx            # Table with sorting/pagination
│   │       ├── FormBuilder.jsx          # Dynamic form generator
│   │       └── [common-component].jsx   # Shared feature components
│   │
│   ├── pages/                           # Route components (page-level views)
│   │   ├── Home.jsx                     # Home/main landing page
│   │   ├── NotFound.jsx                 # 404 error page
│   │   └── [Feature]/                   # Feature-specific pages
│   │       ├── [Feature]List.jsx        # List view for feature
│   │       ├── [Feature]Detail.jsx     # Detail view for feature
│   │       └── [Feature]Form.jsx       # Create/edit form for feature
│   │
│   ├── hooks/                           # Custom React hooks
│   │   ├── useFetch.js                  # Data fetching hook
│   │   ├── useLocalStorage.js           # Local storage persistence
│   │   ├── useDebounce.js               # Debounce utility hook
│   │   ├── useAuth.js                   # Authentication state hook
│   │   └── use[Resource].js             # Resource-specific hooks
│   │
│   ├── context/                         # React Context providers
│   │   ├── AuthContext.jsx              # Authentication state provider
│   │   ├── ThemeContext.jsx             # Theme (light/dark) provider
│   │   └── [Feature]Context.jsx         # Feature-specific context
│   │
│   ├── services/                        # API communication layer
│   │   ├── api.js                       # Axios/fetch instance with interceptors
│   │   ├── authService.js               # Authentication API calls
│   │   ├── [resource]Service.js         # Resource CRUD operations
│   │   └── httpStatus.js                # HTTP status code utilities
│   │
│   ├── store/                           # Global state management (Zustand/Jotai)
│   │   ├── index.js                     # Store configuration
│   │   ├── authStore.js                 # Auth-related state
│   │   └── [feature]Store.js            # Feature-specific state
│   │
│   ├── utils/                           # Pure utility functions
│   │   ├── formatDate.js                # Date formatting helpers
│   │   ├── validateEmail.js             # Validation helpers
│   │   ├── deepClone.js                 # Object deep copy utility
│   │   └── [utility].js                 # Other helper functions
│   │
│   ├── constants/                       # App-wide constants
│   │   ├── config.js                    # App configuration values
│   │   ├── routes.js                    # Route path definitions
│   │   ├── statusCodes.js               # HTTP status code constants
│   │   └── [constant].js                # Other constant values
│   │
│   ├── lib/                             # Third-party library setups
│   │   ├── axios.js                     # Axios instance configuration
│   │   ├── queryClient.js               # TanStack Query client setup
│   │   └── [lib].js                     # Other library configurations
│   │
│   ├── router/                          # Routing configuration
│   │   ├── index.jsx                    # Main router setup with routes
│   │   ├── PrivateRoute.jsx             # Protected route wrapper
│   │   └── routes.js                    # Route definitions array
│   │
│   ├── styles/                          # Global styles
│   │   └── globals.css                  # Tailwind directives + global styles
│   │
│   ├── App.jsx                          # Root component with providers
│   │
│   └── main.jsx                        # Entry point (ReactDOM.render)
│
├── index.html                          # HTML entry template
├── vite.config.js                     # Vite bundler configuration
├── tailwind.config.js                # Tailwind CSS configuration
├── postcss.config.js                 # PostCSS configuration
├── .env.example                      # Environment variables template
├── .gitignore                        # Git ignore rules
└── package.json                      # Project dependencies and scripts
```

---

## Part 2 — Documentation

### 1. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER ACTION                                     │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 PAGE                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  pages/[Feature].jsx                                                │    │
│  │  - Dispatches user action to hook or store                          │    │
│  │  - Renders UI components with data from state                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                HOOK                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  hooks/use[Resource].js                                             │    │
│  │  - Manages local component state                                    │    │
│  │  - Calls service layer for data operations                          │    │
│  │  - Updates store/context with results                               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                               SERVICE                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  services/[resource]Service.js                                       │    │
│  │  - Makes HTTP requests to API                                        │    │
│  │  - Handles request/response transformation                           │    │
│  │  - Returns promise to hook                                          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                API SERVER                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  External REST API                                                   │    │
│  │  - Returns JSON data                                                 │    │
│  │  - HTTP status codes                                                │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          STATE FLOW BACK                                     │
│                                                                              │
│  API RESPONSE ──► SERVICE ──► HOOK ──► STORE/CONTEXT ──► COMPONENT ──► UI │
│       │                                                            │        │
│       └──────────── (Updates global state) ──────────────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 2. Layer-by-Layer Breakdown

#### public/

| File | Purpose |
|------|---------|
| `favicon.ico` | App icon shown in browser tab |
| `robots.txt` | SEO rules for search engines |
| `sitemap.xml` | XML sitemap for crawlers |

**Hard Rules:**
- MUST only contain static assets that don't require processing
- MUST NOT contain dynamic or bundled files
- MUST NOT have any imports from src/

---

#### src/assets/

| File | Purpose |
|------|---------|
| `images/` | Static image assets (PNG, JPG, SVG, WebP) |
| `fonts/` | Custom font files (WOFF2, TTF) |
| `icons/` | Icon sprites or SVG icon collections |

**Hard Rules:**
- MUST only contain assets that need bundling/optimization
- MUST NOT contain runtime-generated content
- SHOULD use Vite's `?url` import for raw assets

---

#### src/components/ui/

| File | Purpose |
|------|---------|
| `Button.jsx` | Reusable button with variants (primary, secondary, ghost) |
| `Input.jsx` | Form input with label, error states, validation |
| `Card.jsx` | Content container with padding, shadow, border |
| `Modal.jsx` | Overlay dialog with portal rendering |
| `Select.jsx` | Dropdown selection component |
| `Checkbox.jsx` | Boolean input component |
| `Spinner.jsx` | Loading indicator |

**Hard Rules:**
- MUST be framework-agnostic (no business logic)
- MUST accept data via props only
- MUST NOT call APIs or access context directly
- MUST be composable (accept children or slots)

---

#### src/components/common/

| File | Purpose |
|------|---------|
| `Header.jsx` | App header with logo, nav links, user menu |
| `Footer.jsx` | App footer with copyright, links |
| `Sidebar.jsx` | Navigation sidebar with collapsible menu |
| `DataTable.jsx` | Table with sorting, filtering, pagination |
| `FormBuilder.jsx` | Dynamic form generator from schema |
| `Pagination.jsx` | Page navigation controls |
| `SearchBar.jsx` | Search input with debounce |

**Hard Rules:**
- MAY access context for auth/theme
- MAY use hooks for local state
- MUST NOT contain page-specific routing logic
- SHOULD be reusable across multiple pages

---

#### src/pages/

| File | Purpose |
|------|---------|
| `Home.jsx` | Landing/home page route |
| `NotFound.jsx` | 404 error page |
| `[Feature]/List.jsx` | List view with data table |
| `[Feature]/Detail.jsx` | Single resource detail view |
| `[Feature]/Form.jsx` | Create/edit form page |

**Hard Rules:**
- MUST be route components (rendered by router)
- MAY access store/context for data
- MAY use hooks for fetching logic
- MUST NOT be reusable outside routing
- SHOULD contain minimal UI code (delegate to components)

---

#### src/hooks/

| File | Purpose |
|------|---------|
| `useFetch.js` | Generic data fetching using **Axios** with loading/error states |
| `useLocalStorage.js` | Sync state with browser localStorage |
| `useDebounce.js` | Delay value updates for search inputs |
| `useAuth.js` | Auth state and methods from context |
| `use[Resource].js` | Resource-specific CRUD operations |

**Hard Rules:**
- MUST use **Axios** for HTTP requests (not fetch API)
- MUST be pure functions (no side effects except React state)
- MUST NOT return JSX (only hooks)
- SHOULD return primitives or objects (not render functions)
- MUST NOT access DOM directly (use refs instead)

---

#### src/context/

| File | Purpose |
|------|---------|
| `AuthContext.jsx` | Authentication state (user, token, login/logout) |
| `ThemeContext.jsx` | Theme state (light/dark mode) |
| `[Feature]Context.jsx` | Feature-specific global state |

**Hard Rules:**
- MUST use React Context API
- SHOULD use useReducer for complex state
- MUST NOT make direct API calls
- MUST provide value object (not methods directly)

---

#### src/services/

| File | Purpose |
|------|---------|
| `api.js` | **Axios** instance with interceptors, base URL, auth headers |
| `authService.js` | Login, logout, register API calls |
| `[resource]Service.js` | CRUD operations for resources |
| `httpStatus.js` | HTTP status code constants |

**Hard Rules:**
- MUST use **Axios** for HTTP requests (not fetch API)
- MUST be framework-agnostic (no React imports)
- MUST return Promises
- MUST NOT access store/context
- SHOULD handle error responses consistently

---

#### src/store/

| File | Purpose |
|------|---------|
| `index.js` | Store configuration and exports |
| `authStore.js` | Auth-related state (user, permissions) |
| `[feature]Store.js` | Feature-specific state slices |

**Hard Rules:**
- MUST use Zustand/Jotai (not Redux for new projects)
- MUST be serializable (no functions in state)
- SHOULD use slices for modularity
- MUST NOT call APIs directly (use services)

---

#### src/utils/

| File | Purpose |
|------|---------|
| `formatDate.js` | Date formatting utilities |
| `validateEmail.js` | Email/validation helpers |
| `deepClone.js` | Object deep copy |
| `[utility].js` | Helper functions |

**Hard Rules:**
- MUST be pure functions (no side effects)
- MUST NOT import React or hooks
- MUST NOT access DOM or window
- SHOULD be tree-shakeable

---

#### src/constants/

| File | Purpose |
|------|---------|
| `config.js` | App-wide configuration (API URLs, timeouts) |
| `routes.js` | Route path constants |
| `statusCodes.js` | HTTP status code constants |
| `[constant].js` | Other constant values |

**Hard Rules:**
- MUST be static values only
- MUST NOT contain functions
- SHOULD be named in UPPER_SNAKE_CASE
- MUST NOT change at runtime

---

#### src/services/ with Axios

```javascript
// services/api.js - Axios instance with interceptors
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - adds auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handles 401 redirects
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

#### src/lib/

| File | Purpose |
|------|---------|
| `utils.js` | **cn()** helper combining clsx + tailwind-merge |
| `[lib].js` | Other library configurations |

**Hard Rules:**
- MUST export configured instances
- MUST NOT contain React components
- SHOULD be singleton patterns

**Why Use Axios Over Fetch:**
- Automatic JSON transformation
- Request/response interceptors built-in
- Timeout support
- Automatic CSRF protection
- Better error handling
- Works identically in browser and Node.js

---

#### src/router/

| File | Purpose |
|------|---------|
| `index.jsx` | Main router with all route definitions |
| `PrivateRoute.jsx` | Route wrapper for protected routes |
| `routes.js` | Route configuration array |

**Hard Rules:**
- MUST use React Router v6+
- MUST define routes as components
- SHOULD use lazy loading for code splitting
- MUST handle 404 catch-all route

---

#### src/styles/

| File | Purpose |
|------|---------|
| `globals.css` | Tailwind directives + global CSS |

**Hard Rules:**
- MUST include `@tailwind` directives
- SHOULD use @layer for custom styles
- MUST NOT contain component styles (use Tailwind)

---

#### src/App.jsx

**Purpose:** Root component that wraps the application with providers (Router, Context, QueryClient)

| Responsibility |
|----------------|
| Mount all context providers |
| Configure query client provider |
| Render router |
| Handle global error boundaries |

**Hard Rules:**
- MUST be the single root component
- MUST render Router component
- MUST NOT contain business logic

---

#### src/main.jsx

**Purpose:** Entry point that mounts React app to DOM

| Responsibility |
|----------------|
| Import global styles |
| Create root element reference |
| Render App component |

**Hard Rules:**
- MUST be the only file with ReactDOM.render/createRoot
- MUST import globals.css
- MUST NOT contain any other code

---

#### index.html

**Purpose:** HTML template that loads the Vite app

| Content |
|---------|
| `<div id="root">` container |
| Meta tags |
| Title |
| Favicon link |

**Hard Rules:**
- MUST have root div with id="root"
- MUST load main.jsx as module
- SHOULD NOT contain any CSS (use styles/)

---

#### vite.config.js

**Purpose:** Vite bundler configuration

| Key Options |
|-------------|
| `resolve.alias` - Path aliases |
| `server` - Dev server config |
| `build` - Production build options |
| `plugins` - Vite plugins |

**Hard Rules:**
- MUST configure path aliases
- MUST set correct base path

---

#### tailwind.config.js

**Purpose:** Tailwind CSS configuration

| Key Options |
|-------------|
| `content` - File paths to scan |
| `theme` - Custom colors, fonts |
| `plugins` - Tailwind plugins |
| `darkMode` - Dark mode strategy |

**Hard Rules:**
- MUST include all src files in content array
- SHOULD extend theme, not overwrite
- SHOULD enable darkMode class strategy

---

#### Color Palette

This project uses a custom color palette based on `#016B61` (teal green):

| Color Name | Hex Code | Usage |
|------------|----------|--------|
| Primary | `#016B61` | Main brand color, buttons, links |
| Primary Light | `#016B61` at 10% opacity | Hover states, backgrounds |
| White | `#FFFFFF` | Card backgrounds, text on dark |
| Gray 50 | `#F9FAFB` | Page background |
| Gray 100 | `#F3F4F6` | Secondary backgrounds |
| Gray 300 | `#D1D5DB` | Borders, dividers |
| Gray 600 | `#4B5563` | Secondary text |
| Gray 900 | `#111827` | Primary text |

**Tailwind Configuration:**
```javascript
// tailwind.config.js
colors: {
  primary: {
    DEFAULT: '#016B61',
    50: '#E6F3F2',
    100: '#CCE7E3',
    200: '#99CFC7',
    300: '#66B7AB',
    400: '#339F8F',
    500: '#016B61',
    600: '#015449',
    700: '#013D31',
    800: '#01261A',
    900: '#010F02',
  },
}
```

---

#### postcss.config.js

**Purpose:** PostCSS configuration for Tailwind

**Hard Rules:**
- MUST include tailwindcss plugin
- MUST include autoprefixer plugin

---

#### src/lib/

| File | Purpose |
|------|---------|
| `utils.js` | **cn()** helper combining clsx + tailwind-merge |
| `[lib].js` | Other library configurations |

**Hard Rules:**
- MUST export configured instances
- MUST NOT contain React components
- SHOULD be singleton patterns

---

#### .env.example

**Purpose:** Template for environment variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | API base URL |
| `VITE_APP_TITLE` | App display title |

**Hard Rules:**
- MUST prefix variables with VITE_
- MUST NOT include actual values
- SHOULD document all variables

---

#### package.json (Key Scripts)

| Script | Command |
|--------|---------|
| `dev` | `vite` - Start dev server |
| `build` | `vite build` - Production build |
| `preview` | `vite preview` - Preview build |
| `lint` | `eslint .` - Run linter |

---

### 3. Tailwind Usage Rules

#### Where Utility Classes Go (JSX Only)

```jsx
// ✅ CORRECT: Tailwind classes directly in JSX
function Button({ children, variant = 'primary' }) {
  return (
    <button className={cn(
      "px-4 py-2 rounded-md font-medium transition-colors",
      variant === "primary" && "bg-blue-600 text-white hover:bg-blue-700",
      variant === "secondary" && "bg-gray-200 text-gray-900 hover:bg-gray-300"
    )}>
      {children}
    </button>
  );
}
```

**Hard Rules:**
- ALWAYS use utility classes in JSX props
- NEVER create separate CSS files for components
- ALWAYS use `@apply` only in `@layer components`

#### When to Use @layer components vs Inline Classes

```css
/* globals.css */

@layer components {
  /* Use for reusable component styles */
  .btn {
    @apply px-4 py-2 rounded-md font-medium transition-colors;
  }
  
  .btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700;
  }
}
```

```jsx
/* Use @layer for complex, reusable patterns */
<div className="btn btn-primary">Click me</div>

/* Use inline classes for one-off styles */
<div className="mt-4 p-6 bg-white shadow-lg">Content</div>
```

**Decision Guide:**
- Use `@layer components` when the same style appears in 3+ places
- Use inline classes for page-specific layouts
- Use `@layer utilities` for custom utility classes

#### Configure Content Array Correctly

```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // ...
}
```

**Critical:** Missing files from content array = Tailwind classes won't work

#### The cn() Pattern (clsx + tailwind-merge)

```javascript
// lib/utils.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

**Why It Matters:**
- `clsx`: Conditionally joins class names
- `twMerge`: Merges conflicting Tailwind classes (last wins)
- Prevents class override issues:

```jsx
// Without twMerge: both bg classes applied (broken)
// With twMerge: last bg class wins (correct)
<button className={cn("bg-blue-500", variant === 'danger' && "bg-red-500")}>
```

---

### 4. Core Design Principles

1. **Pages Fetch, Components Display**
   - Pages contain data fetching logic (useEffect, hooks)
   - Components only receive data via props and render it
   - Never mix fetching logic in reusable components

2. **Services Are Framework-Agnostic**
   - Service functions don't import React
   - Return plain Promimes, not async iterables
   - Can be tested and used outside React context

3. **One Route = One Page File**
   - Each route in router maps to exactly one file in pages/
   - Page files are route components, not shared components
   - Reusable UI goes in components/, not pages/

4. **Context Is for Auth/Theme Only**
   - Use Zustand/Jotai for feature state
   - Context is for truly global state (user, theme)
   - Avoid prop drilling with context (use store instead)

5. **Hooks Are Composition Units**
   - Extract reusable logic into custom hooks
   - Hooks should be pure (no JSX, no DOM access)
   - One hook = one concern (fetching, storage, etc.)

6. **UI Components Are Atoms**
   - No business logic in ui/ components
   - Accept all data via props
   - No API calls, no context access

7. **Utils Must Be Pure**
   - No side effects (no fetch, no localStorage directly)
   - No DOM access (use refs in components)
   - Tree-shakeable exports only

8. **Constants Are Static**
   - No runtime changes to constants
   - All caps naming convention
   - Centralized in constants/ folder

9. **Tailwind In JSX, Not CSS Files**
   - All styles via utility classes
   - @layer components only for complex reuse
   - No custom CSS files for components

10. **Environment Variables Must Prefix VITE_**
    - Only VITE_* variables exposed to client
    - Never use NODE_ENV in client code
    - Keep secrets in .env (not committed)
