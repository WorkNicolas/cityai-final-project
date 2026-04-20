# docs/TODO.md
# CityAI — Task Tracker

This is the single source of truth for project completion status.
Update this file as work progresses. Format: `- [x]` done, `- [ ]` pending.

---

## Phase 1 — Scaffold & Config

- [x] `pnpm-workspace.yaml` — monorepo workspace
- [x] Root `package.json` — workspace scripts
- [x] `backend/auth-service/package.json`
- [x] `backend/issue-service/package.json`
- [x] `backend/analytics-service/package.json`
- [x] `backend/*/tsconfig.json` — TypeScript config (all three services)
- [x] `backend/auth-service/.env.example`
- [x] `backend/issue-service/.env.example`
- [x] `backend/analytics-service/.env.example`
- [x] `frontend/host/package.json`
- [x] `frontend/auth-mfe/package.json`
- [x] `frontend/issue-mfe/package.json`
- [x] `frontend/analytics-mfe/package.json`
- [x] `frontend/shared/design-tokens.css`
- [x] `frontend/shared/types.ts`
- [x] `frontend/*/tsconfig.json` — TypeScript config (all four frontends)
- [x] `frontend/*/tailwind.config.js` — Tailwind config (all four frontends)

---

## Phase 2 — Backend: Auth Service (Port 4001)

- [x] `backend/auth-service/src/models/User.ts` — Mongoose schema
- [x] `backend/auth-service/src/graphql/typeDefs.ts` — GraphQL schema
- [x] `backend/auth-service/src/graphql/resolvers.ts` — login, register, me
- [x] `backend/auth-service/src/middleware/authContext.ts` — JWT cookie verify
- [x] `backend/auth-service/src/index.ts` — Apollo + Express entry point

---

## Phase 3 — Backend: Issue Service (Port 4002)

- [x] `backend/issue-service/src/models/Issue.ts` — Mongoose schema
- [x] `backend/issue-service/src/graphql/typeDefs.ts`
- [x] `backend/issue-service/src/graphql/resolvers.ts` — CRUD + status update
- [x] `backend/issue-service/src/middleware/authContext.ts`
- [x] `backend/issue-service/src/index.ts`

---

## Phase 4 — Backend: Analytics Service (Port 4003)

- [x] `backend/analytics-service/src/services/geminiService.ts` — Gemini API
- [x] `backend/analytics-service/src/services/trendService.ts` — Trend detection
- [x] `backend/analytics-service/src/agents/civicChatAgent.ts` — LangGraph agent
- [x] `backend/analytics-service/src/graphql/typeDefs.ts`
- [x] `backend/analytics-service/src/graphql/resolvers.ts`
- [x] `backend/analytics-service/src/middleware/authContext.ts`
- [x] `backend/analytics-service/src/index.ts`

---

## Phase 5 — Frontend: Host Shell (Port 3000)

- [x] `frontend/host/src/apollo/client.ts` — Apollo Client config
- [x] `frontend/host/src/context/ThemeContext.tsx` — Theme provider
- [x] `frontend/host/src/App.tsx` — Shell with lazy-loaded MFEs
- [x] `frontend/host/src/index.css` — Imports design-tokens.css
- [x] `frontend/host/vite.config.ts` — Proxy + Module Federation remotes

---

## Phase 6 — Frontend: Auth MFE (Port 3001)

- [x] `frontend/auth-mfe/src/components/LoginForm.tsx`
- [x] `frontend/auth-mfe/src/components/RegisterForm.tsx`
- [x] `frontend/auth-mfe/src/components/OAuthButtons.tsx`
- [x] `frontend/auth-mfe/vite.config.ts` — Expose LoginForm, RegisterForm

---

## Phase 7 — Frontend: Issue MFE (Port 3002)

- [x] `frontend/issue-mfe/src/components/IssueForm.tsx`
- [x] `frontend/issue-mfe/src/components/IssueList.tsx`
- [x] `frontend/issue-mfe/src/components/IssueDetail.tsx`
- [x] `frontend/issue-mfe/src/components/IssueStatusBadge.tsx`
- [x] `frontend/issue-mfe/src/components/IssueMap.tsx`
- [x] `frontend/issue-mfe/src/components/PhotoUpload.tsx`
- [x] `frontend/issue-mfe/src/components/NotificationFeed.tsx`
- [x] `frontend/issue-mfe/vite.config.ts` — Expose components

---

## Phase 8 — Frontend: Analytics MFE (Port 3003)

- [x] `frontend/analytics-mfe/src/components/IssueDashboard.tsx`
- [x] `frontend/analytics-mfe/src/components/Heatmap.tsx`
- [x] `frontend/analytics-mfe/src/components/Chatbot.tsx`
- [x] `frontend/analytics-mfe/src/components/InsightsDashboard.tsx`
- [x] `frontend/analytics-mfe/src/components/BacklogTracker.tsx`
- [x] `frontend/analytics-mfe/src/components/TrendChart.tsx`
- [x] `frontend/analytics-mfe/src/components/ThemeToggle.tsx`
- [x] `frontend/analytics-mfe/vite.config.ts` — Expose components

---

## Phase 9 — Presentation Checklist

- [x] User registration / login demo
- [x] Issue submission with photo and geotag
- [x] AI category shown on submitted issue
- [x] Staff dashboard — assign and update issue status
- [x] Resident notification on status change
- [x] Chatbot Q&A demo (open issues, trends, safety alerts)
- [x] Analytics heatmap visible
- [x] Dark mode toggle working
- [x] Responsive layout verified on mobile viewport
- [x] All source files follow comment standards (`comment_standards.md`)