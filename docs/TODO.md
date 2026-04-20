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
- [ ] `backend/analytics-service/src/graphql/resolvers.ts`
- [ ] `backend/analytics-service/src/middleware/authContext.ts`
- [ ] `backend/analytics-service/src/index.ts`

---

## Phase 5 — Frontend: Host Shell (Port 3000)

- [ ] `frontend/host/src/apollo/client.ts` — Apollo Client config
- [ ] `frontend/host/src/context/ThemeContext.tsx` — Theme provider
- [ ] `frontend/host/src/App.tsx` — Shell with lazy-loaded MFEs
- [ ] `frontend/host/src/index.css` — Imports design-tokens.css
- [ ] `frontend/host/vite.config.ts` — Proxy + Module Federation remotes

---

## Phase 6 — Frontend: Auth MFE (Port 3001)

- [ ] `frontend/auth-mfe/src/components/LoginForm.tsx`
- [ ] `frontend/auth-mfe/src/components/RegisterForm.tsx`
- [ ] `frontend/auth-mfe/src/components/OAuthButtons.tsx`
- [ ] `frontend/auth-mfe/vite.config.ts` — Expose LoginForm, RegisterForm

---

## Phase 7 — Frontend: Issue MFE (Port 3002)

- [ ] `frontend/issue-mfe/src/components/IssueForm.tsx`
- [ ] `frontend/issue-mfe/src/components/IssueList.tsx`
- [ ] `frontend/issue-mfe/src/components/IssueDetail.tsx`
- [ ] `frontend/issue-mfe/src/components/IssueStatusBadge.tsx`
- [ ] `frontend/issue-mfe/src/components/IssueMap.tsx`
- [ ] `frontend/issue-mfe/src/components/PhotoUpload.tsx`
- [ ] `frontend/issue-mfe/src/components/NotificationFeed.tsx`
- [ ] `frontend/issue-mfe/vite.config.ts` — Expose components

---

## Phase 8 — Frontend: Analytics MFE (Port 3003)

- [ ] `frontend/analytics-mfe/src/components/IssueDashboard.tsx`
- [ ] `frontend/analytics-mfe/src/components/Heatmap.tsx`
- [ ] `frontend/analytics-mfe/src/components/Chatbot.tsx`
- [ ] `frontend/analytics-mfe/src/components/InsightsDashboard.tsx`
- [ ] `frontend/analytics-mfe/src/components/BacklogTracker.tsx`
- [ ] `frontend/analytics-mfe/src/components/TrendChart.tsx`
- [ ] `frontend/analytics-mfe/src/components/ThemeToggle.tsx`
- [ ] `frontend/analytics-mfe/vite.config.ts` — Expose components

---

## Phase 9 — Presentation Checklist

- [ ] User registration / login demo
- [ ] Issue submission with photo and geotag
- [ ] AI category shown on submitted issue
- [ ] Staff dashboard — assign and update issue status
- [ ] Resident notification on status change
- [ ] Chatbot Q&A demo (open issues, trends, safety alerts)
- [ ] Analytics heatmap visible
- [ ] Dark mode toggle working
- [ ] Responsive layout verified on mobile viewport
- [ ] All source files follow comment standards (`comment_standards.md`)