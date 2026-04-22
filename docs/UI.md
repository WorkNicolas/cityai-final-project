# UI.md
# CityAI — UI Components Index

> **Security Note:** Do not use the `cors` npm package in any microservice.
> Use `helmet` for HTTP security headers on all Express servers. Cross-origin
> requests are handled by the **Vite proxy** in the host — not by `cors` middleware.

This document maps every implemented UI feature to its file location within the
microfrontend structure. Use this as the reference when locating, modifying, or
adding components.

---

## 1. Host Shell (`frontend/host/`)

The shell application is responsible for loading all microfrontends and providing
shared infrastructure (Apollo Client, ThemeProvider, routing).

| Component / File                              | Path                                              |
|-----------------------------------------------|---------------------------------------------------|
| Shell entry point                             | `frontend/host/src/App.tsx`                       |
| Apollo Client configuration                  | `frontend/host/src/apollo/client.ts`              |
| Theme context + `useTheme` hook               | `frontend/host/src/context/ThemeContext.tsx`      |
| Vite proxy + Module Federation remotes config | `frontend/host/vite.config.ts`                    |
| Root CSS (imports shared design tokens)       | `frontend/host/src/index.css`                     |

---

## 2. Authentication MFE (`frontend/auth-mfe/`)

Handles resident and staff login, registration, and session management.
JWT is set as an HTTP-only cookie by `auth-service` on successful login.

| Component             | Path                                                       |
|-----------------------|------------------------------------------------------------|
| Login form            | `frontend/auth-mfe/src/components/LoginForm.tsx`           |
| Registration form     | `frontend/auth-mfe/src/components/RegisterForm.tsx`        |
| OAuth buttons (Google/GitHub) | `frontend/auth-mfe/src/components/OAuthButtons.tsx` |
| MFE expose config     | `frontend/auth-mfe/vite.config.ts`                         |

---

## 3. Issue Reporting & Tracking MFE (`frontend/issue-mfe/`)

Allows residents to submit municipal issues with geotag and photo,
and track the status of their reports in real time.

| Component              | Path                                                        |
|------------------------|-------------------------------------------------------------|
| Issue submission form  | `frontend/issue-mfe/src/components/IssueForm.tsx`           |
| Issue list (resident)  | `frontend/issue-mfe/src/components/IssueList.tsx`           |
| Single issue detail    | `frontend/issue-mfe/src/components/IssueDetail.tsx`         |
| Issue status badge     | `frontend/issue-mfe/src/components/IssueStatusBadge.tsx`    |
| Map / geotag picker    | `frontend/issue-mfe/src/components/IssueMap.tsx`            |
| Photo upload widget    | `frontend/issue-mfe/src/components/PhotoUpload.tsx`         |
| Notification feed      | `frontend/issue-mfe/src/components/NotificationFeed.tsx`    |
| MFE expose config      | `frontend/issue-mfe/vite.config.ts`                         |

---

## 4. Analytics & Administration MFE (`frontend/analytics-mfe/`)

Provides the municipal staff dashboard, AI chatbot, and trend insights.
This MFE connects to `analytics-service` via the `/api/analytics` proxy path.

| Component                    | Path                                                              |
|------------------------------|-------------------------------------------------------------------|
| Staff issue dashboard        | `frontend/analytics-mfe/src/components/IssueDashboard.tsx`       |
| Heatmap (issue clusters)     | `frontend/analytics-mfe/src/components/Heatmap.tsx`              |
| AI chatbot interface         | `frontend/analytics-mfe/src/components/Chatbot.tsx`              |
| Insights panel               | `frontend/analytics-mfe/src/components/InsightsDashboard.tsx`    |
| Backlog tracker              | `frontend/analytics-mfe/src/components/BacklogTracker.tsx`       |
| Trend detection chart        | `frontend/analytics-mfe/src/components/TrendChart.tsx`           |
| Theme mode toggle            | `frontend/analytics-mfe/src/components/ThemeToggle.tsx`          |
| MFE expose config            | `frontend/analytics-mfe/vite.config.ts`                          |

---

## 5. Shared Resources (`frontend/shared/`)

Shared tokens and types consumed by all MFEs and the host.

| Resource                   | Path                                    |
|----------------------------|-----------------------------------------|
| Design tokens (CSS vars)   | `frontend/shared/design-tokens.css`     |
| Shared TypeScript types    | `frontend/shared/types.ts`              |

---

## 6. Common Component Conventions

All components across all MFEs must follow these conventions:

- **File header:** Every `.tsx` file must open with the JSDoc file header block as defined in `comment_standards.md`.
- **Dark mode:** All color values must use `var(--color-*)` tokens from `frontend/shared/design-tokens.css`. No hardcoded hex values.
- **Tailwind:** Use Tailwind CSS utility classes for layout and spacing. Use `bg-[var(--color-surface)]` syntax for token-driven color utilities.
- **No `localStorage`:** Do not use `localStorage` or `sessionStorage` for any data. Use React state for ephemeral data.
- **No direct service calls:** All GraphQL requests must go through the Apollo Client configured in the host, which routes via the Vite proxy. No MFE may call a backend port directly.

---

## 7. Naming Conventions

| Entity              | Convention         | Example                        |
|---------------------|--------------------|--------------------------------|
| React components    | PascalCase         | `IssueCard`, `ChatbotWindow`   |
| Hooks               | camelCase, `use-`  | `useTheme`, `useIssueStatus`   |
| GraphQL queries     | SCREAMING_SNAKE    | `GET_ISSUES`, `CREATE_ISSUE`   |
| CSS token names     | kebab-case, prefix | `--color-bg`, `--color-primary`|
| File names          | PascalCase (`.tsx`)| `IssueForm.tsx`                |
| Config files        | camelCase          | `vite.config.ts`               |
