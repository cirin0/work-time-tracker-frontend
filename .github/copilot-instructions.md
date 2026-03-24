# Work Time Tracker Frontend - AI Agent Instructions

> **⚠️ Active Development Notice**  
> This project is under active development. The structure, patterns, and conventions described here may change as the project evolves. Always verify current implementation by examining the actual codebase before making changes.

## Architecture Overview

**Stack**: Vue 3 (Composition API) + TypeScript + Vite + Pinia + Vue Router + VueUse  
**Backend**: Laravel API at `http://localhost:8000/api` with Laravel Echo (Reverb) WebSockets

### Core Structure

- **State Management**: Pinia stores in `src/stores/` (auth, profile, chat, ui)
  - `auth.store` — authentication, token management, currentUser
  - `profile.store` — extended user profile with cache (5 min), `displayProfile` getter
  - `chat.store` — unread counters and last activity metadata (persisted in localStorage)
  - `ui.store` — global UI state, loading indicators, lock mechanisms for deduplication
- **API Layer**: Centralized in `src/core/api/` with Axios interceptors for auto-token refresh
- **WebSocket**: Laravel Echo client in `src/core/websocket/` for real-time chat
- **Routing**: Vue Router with role-based guards in `src/router/`
- **Type System**: All domain models extend `BaseModel` interface (id, created_at, updated_at)
- **Utility Helpers**: `src/core/utils/date.ts` — date formatting; `src/core/utils/url.ts` — avatar/logo URL resolution
- **VueUse**: `@vueuse/core` composables used throughout (e.g. `useLocalStorage` in auth store)

## Critical Patterns

### 1. API Communication

- **Always** import from `@/core/api` (exports both `apiClient` and `API_ROUTES`)
- API routes defined in `src/core/config/api.config.ts` - use helper functions for dynamic routes:
  ```typescript
  apiClient.get(API_ROUTES.users.show(userId))
  apiClient.post(API_ROUTES.messages.index(receiverId), payload)
  ```
- Interceptors handle auth token injection and automatic refresh on 401 errors
- Token stored in localStorage as `token-store` key

### 2. Authentication Flow

- Auth logic in `src/stores/auth.store.ts` using Pinia's `defineStore` with setup syntax
- Token persisted via `useLocalStorage` from `@vueuse/core`
- Login response includes both `access_token` and `user` object
- **Router guard** is the single source for loading `currentUser` - components should NOT call `getCurrentUser()` directly
- **Profile Store** has `displayProfile` computed getter that falls back to `authStore.currentUser`
- **Lock mechanism** in `ui.store.lockMeEndpoint()` ensures only one `/api/me` request happens at a time
- Components should use `profileStore.displayProfile` instead of direct `profileStore.profile` to guarantee data availability
- Use `authStore.logout()` for sign-out flow so backend token invalidation is always executed before local cleanup

### 3. Form Validation

- Use **vee-validate** (`useForm`, `useFieldArray`) with **Yup** object schemas
- Schema and `VALIDATION_MESSAGES` constants are defined at the top of the composable file (not in the component)
- Ukrainian error messages — all validation text must be in Ukrainian
- `useForm({ validationSchema })` returns `handleSubmit`, `setErrors`, `resetForm`
- Frontend validation runs before API calls; show the first error in a `generalError` ref
- Backend 422 errors are mapped to field-specific errors via `setErrors()`
- See `src/composables/useAuthForm.ts` and `src/composables/useWorkScheduleForm.ts` for real examples

### 4. Role-Based Access Control

- Roles defined in `src/types/enums/enums.types.ts`: `UserRole.ADMIN`, `UserRole.MANAGER`, `UserRole.EMPLOYEE`
- Route meta includes `roles` array for required roles (see `src/router/index.ts`)
- Use `RoleGuard.vue` component for conditional UI rendering
- Router guard checks roles before navigation and redirects to `main` if unauthorized

### 5. WebSocket Integration (Chat)

- Echo client initialized in `src/core/websocket/client.ts` with custom authorizer
- Private channels: `chat.${userId}` for user-specific messages
- Listen for `.new-message` event (note the leading dot)
- **Always** cleanup channels in `onUnmounted` hook: `echoClient.leave(channelName)`
- `useChatWebSocket.ts` tracks the currently subscribed channel and leaves it before re-subscribing to avoid duplicate listeners
- `useChatLogic.ts` auto-loads additional user pages on chat entry to surface users with unread messages at the top without manual scroll
- `chat.store.ts` persists unread counters (`chat-unread-messages`) and last activity (`chat-last-activity`) via VueUse `useLocalStorage`
- Example in `src/composables/useChatWebSocket.ts`

### 6. Layout System

- Routes specify layout via `meta.layout: 'main'`
- `MainLayout.vue` wraps authenticated views
- Auth routes have no layout (handled in view directly)
- **Home Page Philosophy**: All users in the system are employees. The main route (`/`) displays `EmployeeView.vue` for everyone, regardless of role
- **Navigation**: `AppHeader.vue` contains core navigation links accessible to all users:
  - **Home** (`/`) — employee dashboard (visible to all)
  - **Chat** (`/chat`) — messaging system (visible to all)
  - **Admin Panel** (`/admin`) — visible only to users with `ADMIN` role
  - **Manager Panel** (`/manager`) — visible only to users with `MANAGER` role (hidden for admins who have their own panel)
- **Management Panels**: Admins and managers access their management functionality through dedicated panel routes, not through the home page
- **View Structure**: All views (except AuthView) must be styled to work within `MainLayout.vue` wrapper. Use consistent padding and max-width patterns across views.

## Development Workflow

### Commands

```bash
npm run dev         # Start dev server (Vite)
npm run build       # Type-check + production build
npm run type-check  # Run Vue TSC without build
npm run lint        # ESLint with auto-fix
npm run format      # Prettier formatting
```

### Adding New Features

1. **API endpoint**: Add to `API_ROUTES` in `src/core/config/api.config.ts`
2. **Types**: Create interface in `src/types/interfaces/`, extend `BaseModel` if entity
3. **Store** (if stateful): Create Pinia store with setup syntax in `src/stores/`
4. **Composable** (if reusable logic): Place in `src/composables/`
5. **Component**: Organize by feature (`auth/`, `chat/`, `profile/`) or type (`ui/`, `layout/`)
6. **Navigation**: Add feature access via quick actions or buttons in role-specific dashboard views, NOT in the header
7. **View Design**: Follow existing view patterns - max-width container, consistent padding, card-based layouts

### Utility Helpers

#### `src/core/utils/date.ts`

All date formatting goes through these helpers — do **not** call `toLocaleDateString` directly in components:

| Function               | Description                                                              |
| ---------------------- | ------------------------------------------------------------------------ |
| `parseDate(str)`       | Parses ISO string → `Date` (falls back to `new Date()` on invalid input) |
| `formatDate(date)`     | `DD.MM.YYYY` Ukrainian locale string                                     |
| `formatDateTime(date)` | `DD.MM.YYYY HH:MM` Ukrainian locale string                               |
| `formatTime(date)`     | `HH:MM` Ukrainian locale string                                          |
| `todayAsInputDate()`   | `YYYY-MM-DD` string for HTML `<input type="date" min="...">`             |

```typescript
import { formatDate, formatDateTime, formatTime, todayAsInputDate } from '@/core/utils/date'
```

#### `src/core/utils/url.ts`

Use for resolving avatar and logo URLs — handles both relative paths (prefixes with `API_BASE_URL`) and absolute URLs transparently:

```typescript
import { getAvatarUrl } from '@/core/utils/url'

// Returns null if path is empty, full URL otherwise
const src = getAvatarUrl(user.avatar) // static
const src = getAvatarUrl(user.avatar, Date.now()) // with cache-bust timestamp
```

### VueUse (`@vueuse/core`)

Prefer VueUse composables over hand-rolling common reactive utilities:

- `useLocalStorage` — reactive localStorage (used in auth store for token persistence)
- Other VueUse composables can be introduced as needed; import from `@vueuse/core`

### UI/UX Guidelines

- **Header Navigation**: Contains links to:
  - Home (visible to all) - employee dashboard showing work time tracking
  - Chat (visible to all) - real-time messaging
  - Admin Panel (visible only to admins) - user management, company management, system settings
  - Manager Panel (visible only to managers, hidden for admins) - team management, leave requests, schedules
- **Dashboard Pattern**: `EmployeeView.vue` is the universal home page for all users, containing:
  - Welcome card with user name
  - Statistics cards for key metrics (hours worked, etc.)
  - Quick actions section with feature navigation (start work, take break, add entry, leave requests)
  - Work time tracking interface
- **Role-Specific Management**: Admins and managers navigate to separate panel views (`/admin`, `/manager`) to access management features
- **Styling Consistency**: Use the current **Arctic Orange** theme tokens from `src/assets/theme.css` (e.g. `--accent-2: #ff9b51`, `--accent-1: #25343f`, `--bg: #eaefef`) and rely on CSS variables instead of hardcoded colors

### Composables Catalogue

All composables live in `src/composables/`. Each composable owns its own state — do not duplicate logic in stores or components.

| File                     | Purpose                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| `useAuthForm.ts`         | Login/register form state, Yup schema validation, submit handling, backend error mapping         |
| `useWorkScheduleForm.ts` | Work schedule create/edit form with `useFieldArray` for dynamic daily entries                    |
| `useChatLogic.ts`        | Paginated user list loading, unread-aware auto-preload, message fetching, send-message action    |
| `useChatWebSocket.ts`    | Laravel Echo private channel subscription, incoming message handling, cleanup                    |
| `useRoleGuard.ts`        | Computed role booleans (`isAdmin`, `isManager`, `isEmployee`) and `hasRole`/`hasAnyRole` helpers |

**Pattern rules for new composables:**

- Name with `use` prefix, camelCase: `useFeatureName.ts`
- Define Yup schemas and `VALIDATION_MESSAGES` constants at module level (outside the function)
- Return only what the caller needs — keep internal refs private
- Clean up side-effects (event listeners, Echo channels) in `onUnmounted`
- **Performance**: Use `computed` instead of `watch` where possible
- **Performance**: Debounce expensive operations (search, filtering)

### Type Conventions

- **Interfaces** for domain models: `src/types/interfaces/`
- **Request DTOs**: `src/types/requests/`
- **Response DTOs**: `src/types/responses/`
- **Enums**: `src/types/enums/enums.types.ts`
- Request/response types named with suffix: `LoginRequest`, `ApiResponse<T>`

### Vue Component Structure

- **Always** follow this order in `.vue` files:
  1. `<script setup lang="ts">` - first
  2. `<template>` - second
  3. `<style scoped>` - third
- Never place `<template>` before `<script setup>`
- This convention ensures consistency across the entire codebase

## Known Patterns & Quirks

- **@ alias** resolves to `src/` (configured in vite.config.ts)
- **BaseModel** snake_case from backend is NOT transformed - components receive `created_at`, `updated_at` as strings
- **Auth guard** redirects authenticated users away from `/auth` route automatically
- **Token refresh** happens silently via interceptor - queues failed requests during refresh
- **Pusher setup**: Required global `window.Pusher` assignment for Echo (see websocket/client.ts)
- **Ukrainian locale**: All user-facing validation messages and errors in Ukrainian
- **Layout Wrapping**: All views must work within `MainLayout.vue` (header + main content area). Only `AuthView.vue` has no layout wrapper
- **Unified Employee Identity**: Every user is considered an employee first. The home page (`IndexView.vue`) renders `EmployeeView.vue` for all roles. Management capabilities are separate concerns accessed through dedicated panels
- **Role-Based Panel Access**: Admins and managers see additional navigation links in the header to access their management panels. These panels are separate routes, not embedded in the home page.
- **Chat Unread Persistence**: Unread badge state is intentionally persisted in localStorage and reset on logout via `chatStore.resetAll()`.

## Performance & Optimization Guidelines

> **Priority**: Always write optimized code by default. Performance is not an afterthought.

### Data Loading & API Calls

#### ❌ Anti-Pattern: Duplicate Data Fetching

```typescript
// DON'T: Fetch profile in every component
onMounted(() => {
  profileStore.fetchProfile()
})
```

#### ✅ Correct Pattern: Use Computed Getter with Fallback

```typescript
// profileStore has displayProfile getter that falls back to authStore.currentUser
const currentProfile = computed(() => profileStore.displayProfile)
// Router guard already loads user once - components just use it
```

**Rules**:

- **Avoid** calling `fetchProfile()` in components unless there is no hydrated profile data; if used for fallback load, handle rejection explicitly and rely on store error state
- **Router guard** is the single source of truth for initial user data loading
- **Use `displayProfile` getter** in all components instead of direct `profile` access
- **Lock mechanism** in `ui.store.lockMeEndpoint()` prevents duplicate `/api/me` requests

#### Cache Strategy

- `profileStore` has 5-minute cache (`CACHE_DURATION`)
- `fetchProfile()` checks `isCacheValid()` before making API calls
- Use `forceRefresh: true` parameter only when user explicitly updates data
- Consider adding similar caching to other stores (admin, manager, chat user lists)

### Reactive Data Optimization

#### ❌ Anti-Pattern: Watch for Computed URLs

```typescript
const avatarUrl = ref<string | null>(null)
watch(
  () => [store.profile?.avatar, store.avatarTimestamp],
  () => {
    avatarUrl.value = getAvatarUrl(store.profile?.avatar, store.avatarTimestamp)
  },
  { immediate: true },
)
```

#### ✅ Correct Pattern: Use Computed Properties

```typescript
const avatarUrl = computed(() => getAvatarUrl(store.displayProfile?.avatar, store.avatarTimestamp))
```

**Benefits**:

- No extra reactivity overhead from watch
- Automatically updates when dependencies change
- Cleaner code, fewer refs to manage

### Component Design

#### Lazy Loading

- **All routes** must use dynamic imports: `component: () => import('./views/SomeView.vue')`
- Already implemented but verify when adding new routes

#### Avoid Over-Rendering

- Use `v-if` for conditional heavy components, not `v-show`
- Add `:key` attributes on `v-for` lists with unique IDs
- Consider `v-memo` for large lists that rarely change
- Consider `v-once` for static content that never updates

#### Component Splitting

- Break large files (>400 lines) into smaller components or composables
- Move complex logic to composables, keep components focused on UI
- Example: `ProfileView.vue` password/PIN modals could be separate components

### State Management Patterns

#### Single Source of Truth

- `auth.store` holds `currentUser` (from router guard)
- `profile.store` extends it with full profile data (manager, company, work_schedule)
- Use `displayProfile` getter to automatically fallback to `currentUser`
- **DON'T** duplicate user data across multiple stores

#### Lock Mechanism for Concurrent Requests

```typescript
// ui.store.ts provides lockMeEndpoint for /api/me deduplication
await uiStore.lockMeEndpoint(async () => {
  if (user.value) return user.value // double-check after acquiring lock
  // make API call only if still needed
})
```

Use this pattern for any frequently-called endpoint that might race.

### Search & Filtering

#### Debounce User Input

```typescript
import { useDebounceFn } from '@vueuse/core'

const debouncedSearch = useDebounceFn((query: string) => {
  // perform search
}, 300)
```

Apply to all text input filters (user search, chat search, admin filters).

### Code Organization

- **Prefer computed over methods** when deriving display values
- **Prefer composables over mixins** for reusable logic
- **Minimize `watch` usage** - most cases can use `computed` or `watchEffect`
- **Clean up side-effects** in `onUnmounted` (event listeners, intervals, WebSocket channels)

### Quick Wins Checklist

When reviewing or writing code, verify:

- [ ] No redundant API calls (check network tab)
- [ ] No `watch` that could be `computed`
- [ ] No redundant `onMounted` `fetchProfile()` calls (allow only guarded fallback when `displayProfile` is empty)
- [ ] Using `displayProfile` instead of `profile` in components
- [ ] Large lists have proper `:key` attributes
- [ ] Debounced search/filter inputs
- [ ] Routes use lazy loading
- [ ] Cleanup in `onUnmounted` for side-effects

## Integration Points

- **Backend API**: Laravel Sanctum tokens, expects `withCredentials: true` for cookies
- **WebSocket**: Laravel Reverb on `ws://localhost:8080` (config in `src/core/config/websocket.config.ts`)
- **Broadcasting**: Private channel authorization via `/broadcasting/auth` endpoint (handled by Echo authorizer)

## When Modifying Core Systems

- **API client changes**: Update `src/core/api/client.ts` and ensure interceptors still apply
- **Auth changes**: Modify both `auth.store.ts` AND router guard in `src/router/index.ts`
- **WebSocket**: Changes to channel structure require backend + `useChatWebSocket.ts` updates
- **Role system**: Update both enum and router meta types when adding new roles
