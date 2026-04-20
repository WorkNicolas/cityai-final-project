# base_template_2.md
# CivicCase — Microfrontend & Microservices Wiring Guide

> **Security Note:** Do not use the `cors` npm package in any microservice.
> Use `helmet` for HTTP security headers on all Express servers. Cross-origin
> requests are eliminated by design via the **Vite proxy** in the host
> microfrontend, which routes all `/api/*` traffic to the correct service.
> This means cookies are shared naturally across service calls without
> any cross-origin configuration. If a service must be exposed externally
> (e.g., for cloud deployment), restrict allowed origins manually inside
> `helmet` — never use a wildcard `cors()` call.

This document explains how the CivicCase monorepo is wired together as a
Microfrontend (MFE) and Microservice (MS) architecture using React, Node.js,
GraphQL (Apollo), and Vite Module Federation.

---

## 1. Architectural Overview

| Layer        | Technology                             | Pattern                         |
|--------------|----------------------------------------|---------------------------------|
| Frontend     | React 19 + Vite + TypeScript           | Module Federation (MFE)         |
| API Layer    | Apollo Client (host)                   | Vite Proxy as API Gateway       |
| Backend      | Express + Apollo Server + TypeScript   | Independent Microservices       |
| Database     | MongoDB + Mongoose                     | One collection per service      |
| Auth         | JWT in HTTP-only cookies               | Cookie set by `auth-service`    |
| AI           | Gemini API + LangGraph                 | Centralized in `analytics-service` |

---

## 2. Directory Structure (MFE/MS Monorepo)

```text
root/
├── backend/
│   ├── auth-service/               # Port 4001 — Login, Register, JWT
│   │   ├── src/
│   │   │   ├── graphql/
│   │   │   │   ├── typeDefs.ts
│   │   │   │   └── resolvers.ts
│   │   │   ├── models/
│   │   │   │   └── User.ts
│   │   │   ├── middleware/
│   │   │   │   └── authContext.ts  # Reads JWT cookie, attaches user to context
│   │   │   └── index.ts
│   │   └── package.json
│   ├── issue-service/              # Port 4002 — Issues, Alerts, Status
│   │   ├── src/
│   │   │   ├── graphql/
│   │   │   │   ├── typeDefs.ts
│   │   │   │   └── resolvers.ts
│   │   │   ├── models/
│   │   │   │   └── Issue.ts
│   │   │   ├── middleware/
│   │   │   │   └── authContext.ts
│   │   │   └── index.ts
│   │   └── package.json
│   └── analytics-service/          # Port 4003 — Chatbot, AI, Trends
│       ├── src/
│       │   ├── graphql/
│       │   │   ├── typeDefs.ts
│       │   │   └── resolvers.ts
│       │   ├── agents/
│       │   │   └── civicChatAgent.ts  # LangGraph agent graph
│       │   ├── services/
│       │   │   ├── geminiService.ts   # Gemini API calls
│       │   │   └── trendService.ts    # Trend detection logic
│       │   ├── middleware/
│       │   │   └── authContext.ts
│       │   └── index.ts
│       └── package.json
├── frontend/
│   ├── host/                       # Port 3000 — Shell app
│   │   ├── src/
│   │   │   ├── apollo/
│   │   │   │   └── client.ts       # Apollo Client pointed at Vite proxy
│   │   │   └── App.tsx             # Lazy-loads all MFEs
│   │   └── vite.config.ts          # Proxy + Module Federation remotes
│   ├── auth-mfe/                   # Port 3001
│   │   ├── src/components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   └── vite.config.ts          # Exposes LoginForm, RegisterForm
│   ├── issue-mfe/                  # Port 3002
│   │   ├── src/components/
│   │   │   ├── IssueForm.tsx
│   │   │   ├── IssueList.tsx
│   │   │   └── IssueMap.tsx
│   │   └── vite.config.ts          # Exposes IssueForm, IssueList, IssueMap
│   ├── analytics-mfe/              # Port 3003
│   │   ├── src/components/
│   │   │   ├── Chatbot.tsx
│   │   │   ├── Heatmap.tsx
│   │   │   └── InsightsDashboard.tsx
│   │   └── vite.config.ts          # Exposes Chatbot, Heatmap, InsightsDashboard
│   └── shared/
│       ├── design-tokens.css       # All CSS custom properties (colors, spacing, type)
│       └── types.ts                # Shared TypeScript interfaces (Issue, User, etc.)
├── package.json                    # pnpm workspace root
└── pnpm-workspace.yaml
```

---

## 3. Engineering Standards

### Backend (Microservices)

- **Security:** Apply `helmet()` as the first middleware in every `index.ts` entry point. Do not import or use the `cors` package.
- **JWT Context:** Each service reads `req.cookies.token`, verifies it with `jsonwebtoken`, and attaches `{ user }` to the Apollo context. No service issues tokens — only `auth-service` does.
- **Domain Isolation:** Each service connects to its own Mongoose connection string. `issue-service` never imports from `auth-service` models.
- **Error Shape:** Always return `{ error: "SHORT_CODE", message: "Human readable" }` for failures.

```ts
// backend/auth-service/src/index.ts (setup excerpt)
import helmet from 'helmet';

app.use(helmet()); // Must be first — sets all security headers
app.use(cookieParser());
// Do NOT use: app.use(cors(...))
```

### Frontend (Microfrontends)

- **Module Federation — Expose (MFE):**

```ts
// frontend/auth-mfe/vite.config.ts
federation({
  name: 'auth',
  filename: 'remoteEntry.js',
  exposes: {
    './LoginForm': './src/components/LoginForm.tsx',
    './RegisterForm': './src/components/RegisterForm.tsx',
  },
  shared: ['react', 'react-dom', '@apollo/client'],
})
```

- **Module Federation — Consume (Host):**

```tsx
// frontend/host/src/App.tsx
const LoginForm = lazy(() => import('auth/LoginForm'));

<Suspense fallback={<div>Loading...</div>}>
  <LoginForm />
</Suspense>
```

- **Vite Proxy (API Gateway):**

```ts
// frontend/host/vite.config.ts
server: {
  proxy: {
    '/api/auth':      { target: 'http://localhost:4001', changeOrigin: true },
    '/api/issues':    { target: 'http://localhost:4002', changeOrigin: true },
    '/api/analytics': { target: 'http://localhost:4003', changeOrigin: true },
  }
}
```

- **Apollo Client:** Configured once in the host, pointed at `/api/*` proxy paths.

```ts
// frontend/host/src/apollo/client.ts
const authLink = new ApolloClient({
  uri: '/api/auth',
  credentials: 'include', // Required to send HTTP-only cookies
  cache: new InMemoryCache(),
});
```

---

## 4. Migration / Build Phases

### Phase 1 — Backend Microservices

1. Scaffold `auth-service`, `issue-service`, `analytics-service` under `backend/`.
2. For each service: install `express`, `@apollo/server`, `mongoose`, `helmet`, `cookie-parser`, `jsonwebtoken`.
3. Define Mongoose models and GraphQL TypeDefs.
4. Implement resolvers. Wire `authContext.ts` middleware to Apollo `context` function.
5. Apply `helmet()` as the first middleware. Verify no `cors` import exists.
6. Test each service independently on its assigned port.

### Phase 2 — Microfrontend Scaffolding

1. Create the `host` shell app with Vite + React + TypeScript.
2. Scaffold `auth-mfe`, `issue-mfe`, `analytics-mfe`.
3. Configure `@module-federation/vite` in each MFE's `vite.config.ts`.
4. Import `frontend/shared/design-tokens.css` in the host's root `index.css`.

### Phase 3 — Integration

1. Register all MFE remotes in `host/vite.config.ts`.
2. Configure the Vite proxy for all three service paths.
3. Wrap the host `App.tsx` with `<ApolloProvider>`.
4. Lazy-load MFE components using `React.lazy` + `<Suspense>`.
5. Verify cookie flow: login via `auth-mfe` sets the JWT cookie; `issue-mfe` queries are authenticated via the same cookie through the proxy.

### Phase 4 — AI Integration

1. In `analytics-service`, implement `geminiService.ts` for classification and summarization calls.
2. Define the LangGraph agent graph in `agents/civicChatAgent.ts` with nodes for Q&A, safety alerts, and trend lookup.
3. Expose agent interactions through GraphQL mutations in `analytics-service`.
4. Connect `analytics-mfe` `Chatbot.tsx` to the `analytics` Apollo client endpoint.

---

## 5. Deployment Notes

- Each microservice and each MFE requires its own `Dockerfile`.
- Set a shared `JWT_SECRET` environment variable across all services for unified token verification.
- For cloud deployment (Heroku, Azure, AWS), configure `helmet`'s `contentSecurityPolicy` and `crossOriginResourcePolicy` directives appropriately for your domain.
- Services can be scaled independently based on load (e.g., more `issue-service` instances during a high-report event).
