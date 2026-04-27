# base_template.md
/** docs/base_template.md
 * @file base_template.md
 * @description Architectural and stylistic blueprint for the CityAI project.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-25 - Verified directory structure and standards.
 * @version 0.1.1
 */

# CityAI — Project Base Template

> **Security Note:** Do not use the `cors` npm package in any microservice.
> Use `helmet` for HTTP security headers on all Express servers. Cross-origin
> requests are eliminated by design via the **Vite proxy** in the host
> microfrontend, which routes all API traffic through a single origin.
> If any endpoint requires direct external access, restrict allowed origins
> manually in `helmet` configuration — never apply a wildcard `cors()` call.

This document serves as the architectural and stylistic blueprint for the CityAI project.
Use this as a guide to understand how the project is structured, how to add new features,
and how to maintain established coding standards.

---

## 1. Project Philosophy

- **Feature-First:** Code is organized by what it *does* (e.g., `auth-service`, `issue-mfe`), not by layer.
- **Theme-Driven UI:** Zero hardcoded visual values. Every color, spacing, and typography value must come from `frontend/shared/design-tokens.css`.
- **Backend-First Implementation:** GraphQL schemas and Mongoose models are defined and verified before UI is built.
- **AI-Native:** Gemini AI and LangGraph are integrated as core services in the Analytics microservice, not as afterthoughts.
- **Cookie-Based Auth:** JWT tokens are stored in HTTP-only cookies set by `auth-service`. No token is ever stored in `localStorage`.

---

## 2. Directory Structure (Monorepo)

```text
root/
├── backend/                        # Independent Node.js Microservices
│   ├── auth-service/               # User Authentication & Registration (Port 4001)
│   │   ├── src/
│   │   │   ├── graphql/            # Apollo TypeDefs & Resolvers
│   │   │   ├── models/             # Mongoose Schemas (User.ts)
│   │   │   ├── middleware/         # JWT verification, helmet config
│   │   │   └── index.ts            # Apollo Server entry point
│   │   └── package.json
│   ├── issue-service/              # Issue Management & Alerts (Port 4002)
│   │   ├── src/
│   │   │   ├── graphql/            # TypeDefs & Resolvers
│   │   │   ├── models/             # Mongoose Schemas (Issue.ts)
│   │   │   ├── middleware/         # JWT context, helmet config
│   │   │   └── index.ts
│   │   └── package.json
│   └── analytics-service/          # AI, Chatbot & Insights (Port 4003)
│       ├── src/
│       │   ├── graphql/            # TypeDefs & Resolvers
│       │   ├── agents/             # LangGraph agent definitions
│       │   ├── services/           # Gemini API calls, trend detection
│       │   ├── middleware/         # JWT context, helmet config
│       │   └── index.ts
│       └── package.json
├── frontend/                       # Microfrontends (Vite + React)
│   ├── host/                       # Shell Application (Port 3000)
│   │   ├── src/
│   │   │   ├── apollo/             # Global Apollo Client config
│   │   │   └── App.tsx             # Shell that lazy-loads MFEs
│   │   └── vite.config.ts          # Proxy config + Module Federation remotes
│   ├── auth-mfe/                   # Authentication UI Module (Port 3001)
│   │   ├── src/
│   │   │   └── components/         # Login, Register — exposed to host
│   │   └── vite.config.ts
│   ├── issue-mfe/                  # Issue Reporting & Tracking UI (Port 3002)
│   │   ├── src/
│   │   │   └── components/         # IssueForm, IssueList, IssueMap
│   │   └── vite.config.ts
│   ├── analytics-mfe/              # Dashboard & Chatbot UI (Port 3003)
│   │   ├── src/
│   │   │   └── components/         # Heatmap, Chatbot, Insights
│   │   └── vite.config.ts
│   └── shared/                     # Shared tokens and utility types
│       ├── design-tokens.css       # Single source of truth for all design values
│       └── types.ts                # Shared TypeScript interfaces
├── docs/                           # Project documentation & task tracking
│   └── todo.md                     # Single source of truth for task completion
├── package.json                    # pnpm workspace configuration
└── pnpm-workspace.yaml
```

---

## 3. Engineering Standards

### Backend (Microservices)

- **Framework:** `express` + `@apollo/server`.
- **Security:** `helmet` on every Express app for HTTP security headers. No `cors` package.
- **Authentication:** JWT stored in HTTP-only cookies. The `auth-service` sets the cookie on login/register. All other services read and verify the same JWT from `req.cookies.token` in their Apollo context function.
- **Error Handling:** Return descriptive JSON: `{ error: "SHORT_CODE", message: "Human readable description" }`.
- **Database:** MongoDB via Mongoose. Each service manages its own collection. No service queries another service's database directly.
- **AI Integration:** Centralized in `analytics-service/src/services/`. Gemini API calls and LangGraph agent graphs are defined there and exposed via GraphQL resolvers.

### Frontend (Microfrontends)

- **Framework:** React 19 (TypeScript) + Vite.
- **Module Federation:** Uses `@module-federation/vite`.
  - **Remotes** expose components in their `vite.config.ts`.
  - **Host** imports remotes with `lazy(() => import('auth/Login'))` wrapped in `<Suspense>`.
- **API Gateway Pattern:** The host Vite proxy routes all requests to avoid cross-origin issues:
  - `/api/auth` → `http://localhost:4001/graphql`
  - `/api/issues` → `http://localhost:4002/graphql`
  - `/api/analytics` → `http://localhost:4003/graphql`
- **Data Management:** `@apollo/client` hooks (`useQuery`, `useMutation`) inside MFEs. The host provides the top-level `<ApolloProvider>`.
- **Styling:** Tailwind CSS utility classes. All custom values must reference `frontend/shared/design-tokens.css` tokens.
- **State:** React `useState` / `useReducer` for local state. No `localStorage` or `sessionStorage`.

---

## 4. Key Governance Files

- `comment_standards.md`: Mandatory comment and JSDoc format for all files.
- `base_template.md`: This file. Architectural blueprint.
- `base_template_2.md`: MFE/MS migration steps and detailed wiring guide.
- `UI.md`: Component index mapping features to their file locations.
- `DARK_MODE.md`: Token-based dark mode implementation guide.
- `docs/todo.md`: Single source of truth for task completion status.

---

## 5. How to Add a New Feature

1. **Define the schema first:** Add Mongoose model and GraphQL TypeDefs in the appropriate microservice under `backend/<service>/src/`.
2. **Write the resolvers:** Implement Query/Mutation resolvers in `backend/<service>/src/graphql/resolvers.ts`.
3. **Update the proxy:** If a new service is added, register its proxy path in `frontend/host/vite.config.ts`.
4. **Scaffold the MFE component:** Create the component under `frontend/<mfe-name>/src/components/` following the JSDoc comment standards.
5. **Expose and consume:** Export the component in the MFE's `vite.config.ts` and lazy-load it in the host `App.tsx`.
6. **Apply design tokens:** Use only values from `frontend/shared/design-tokens.css` and Tailwind utilities — no hardcoded colors or spacing.
7. **Update `docs/todo.md`:** Mark the feature as in-progress, then complete.
