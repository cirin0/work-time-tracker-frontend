# Work Time Tracker Frontend - AI Agent Instructions

> **⚠️ Active Development Notice**  
> This project is under active development. The structure, patterns, and conventions described here may change as the project evolves. Always verify current implementation by examining the actual codebase before making changes.

## Architecture Overview

**Stack**: Vue 3 (Composition API) + TypeScript + Vite + Pinia + Vue Router  
**Backend**: Laravel API at `http://localhost:8000/api` with Laravel Echo (Reverb) WebSockets

### Core Structure

- **State Management**: Pinia stores in `src/stores/` (auth, chat, profile)
- **API Layer**: Centralized in `src/core/api/` with Axios interceptors for auto-token refresh
- **WebSocket**: Laravel Echo client in `src/core/websocket/` for real-time chat
- **Routing**: Vue Router with role-based guards in `src/router/`
- **Type System**: All domain models extend `BaseModel` interface (id, createdAt, updatedAt)

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
- Router guard fetches `currentUser` if missing before protected route access

### 3. Form Validation

- Use **vee-validate** with **Yup** schemas (see `src/composables/useAuthForm.ts`)
- Ukrainian error messages defined in `VALIDATION_MESSAGES` constants
- Frontend validation runs before API calls - display first error in `generalError`
- Backend 422 errors mapped to field-specific errors via `setErrors()`

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
- Example in `src/composables/useChatWebSocket.ts`

### 6. Layout System

- Routes specify layout via `meta.layout: 'main'`
- `MainLayout.vue` wraps authenticated views
- Auth routes have no layout (handled in view directly)
- **Navigation**: Do NOT add new links to `AppHeader.vue` navigation. Instead, add navigation buttons/links within role-specific views:
  - `EmployeeView.vue` - for employee-specific features
  - `ManagerView.vue` - for manager-specific features
  - `AdminView.vue` - for admin-specific features
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

### UI/UX Guidelines

- **Header Navigation**: Keep minimal - only core features (Home, Chat). Role-specific features go in dashboard views.
- **Dashboard Pattern**: Each role has a dedicated dashboard view with:
  - Welcome card with user name
  - Statistics cards for key metrics
  - Quick actions section with feature navigation
  - Role-specific content sections
- **Styling Consistency**: Use existing color palette (gradient: #2563eb → #9333ea), spacing scale, and shadow patterns

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
- **Layout Wrapping**: All views must work within `MainLayout.vue` (header + main content area). Only `AuthView.vue` has no layout wrapper.
- **Feature Navigation**: New features are accessed through dashboard quick actions, not header links. This keeps navigation clean and role-appropriate.

## Integration Points

- **Backend API**: Laravel Sanctum tokens, expects `withCredentials: true` for cookies
- **WebSocket**: Laravel Reverb on `ws://localhost:8080` (config in `src/core/config/websocket.config.ts`)
- **Broadcasting**: Private channel authorization via `/broadcasting/auth` endpoint (handled by Echo authorizer)

## When Modifying Core Systems

- **API client changes**: Update `src/core/api/client.ts` and ensure interceptors still apply
- **Auth changes**: Modify both `auth.store.ts` AND router guard in `src/router/index.ts`
- **WebSocket**: Changes to channel structure require backend + `useChatWebSocket.ts` updates
- **Role system**: Update both enum and router meta types when adding new roles
