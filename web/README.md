# CRM Web Frontend

React + TypeScript + Vite CRM frontend built with an **API-first** and
**feature-based** architecture. The UI is role-aware (Admin / Manager) and
consumes existing REST APIs only—no business logic in pages.

## Architecture

```
src/
  app/
    providers/        # query, router, auth wrappers
    router/           # routes + guards
    layouts/          # main layout, auth layout

  features/
    auth/
      ui/
      model/
      api/
    clients/
    deals/
    orders/
    kanban/

  entities/
    user/
    client/
    deal/
    order/

  shared/
    api/              # HTTP client + endpoint wrappers
    ui/               # reusable UI components
    hooks/            # shared hooks
    lib/              # helpers (env, jwt, clsx)
    types/            # shared types

  pages/              # route composition only
  main.tsx
```

### Rules
- **No API calls outside `shared/api`.**
- **Pages** are just route composition (no business logic).
- **Features** contain UI + model (hooks) + API re-exports.
- **Entities** contain domain types and helpers only.
- **Shared** is reusable and feature-agnostic.

## Auth Flow
1. `/auth/login` returns `accessToken` + `refreshToken`.
2. Tokens stored in Zustand.
3. `shared/api/http.ts` injects `Authorization` header.
4. On `401`, it automatically calls `/auth/refresh` and retries once.

## Environment
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

## Notes
- All data access happens through `shared/api/*`.
- Role-based UI gates routes via `app/router/guards.tsx`.
