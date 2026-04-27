/** docs/presentation/presentation.md
 * @file presentation.md
 * @description Guided presentation script and demonstration order for CityAI.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-25
 * @version 1.0.0
 */

# CityAI — Final Presentation Guide

This document outlines the optimal demonstration flow for the CityAI project, ensuring all rubric requirements are showcased effectively.

---

## Presentation Order

1. **Introduction & Community Alignment** (The "Why")
2. **Authentication Flow** (Resident & Staff Roles)
3. **Resident Flow: Reporting & AI Categorization** (Core Transaction)
4. **Staff Dashboard: Analytics & Insights** (Management & AI Triage)
5. **Agentic Chatbot: Q&A & Trends** (LangGraph Integration)
6. **Technical Architecture & Code Quality** (Under the Hood)

---

## 1. Introduction & Community Alignment
**Goal:** Explain the civic focus (Canadian Municipalities) and the problem of fragmented community issue tracking.

- **Files to Reference:**
  - `GEMINI.md` (Project Vision)
  - `docs/cityai_db.md` (Architecture overview)

- **Script:**
  > "Welcome to CityAI. We built this platform to bridge the gap between Canadian residents and their municipal governments. Our focus is on providing an AI-native infrastructure for reporting and analyzing community issues like potholes and safety hazards in real-time."

---

## 2. Authentication Flow
**Goal:** Show secure login and role-based access control.

- **Files to Reference:**
  - `frontend/auth-mfe/src/components/LoginForm.tsx` (UI)
  - `backend/auth-service/src/graphql/resolvers.ts` (JWT/Cookie Logic)
  - `docs/password_hashing.md` (Security Standard)

- **Action:** Log in as a **Resident** (`keziah.noreen.mendoza@gmail.com`).
- **Script:**
  > "We use JWT authentication stored in HTTP-only cookies for security. Here we are logging in as a resident. Notice our authentication is handled by a dedicated Microfrontend and Microservice."

---

## 3. Resident Flow: Reporting & AI Categorization
**Goal:** Demonstrate the issue submission pipeline, including map integration and Gemini classification.

- **Files to Reference:**
  - `frontend/issue-mfe/src/components/IssueForm.tsx` (Multi-step form)
  - `frontend/issue-mfe/src/components/IssueMap.tsx` (Geotagging)
  - `backend/analytics-service/src/services/geminiService.ts` (`classifyIssue` & `summarizeIssue`)

- **Action:** Submit a new issue (e.g., "Dangerous Pothole on Main St"). Show the map picker.
- **Script:**
  > "As a resident, I can report an issue with a specific location and photo. Once I hit submit, our Analytics service immediately invokes Gemini 3 Flash to classify the issue into categories like 'safety-hazard' or 'pothole' and generates a concise summary for city staff."

---

## 4. Staff Dashboard: Analytics & Insights
**Goal:** Show the administrative command center, heatmap, and AI-driven metrics.

- **Files to Reference:**
  - `frontend/analytics-mfe/src/components/IssueDashboard.tsx` (Layout)
  - `frontend/analytics-mfe/src/components/Heatmap.tsx` (Leaflet clustering)
  - `backend/analytics-service/src/services/trendService.ts` (`getGlobalInsights`)

- **Action:** Log out and log in as **Staff** (`marissa.mendoza@gmail.com`). Navigate to `/dashboard`.
- **Script:**
  > "Switching to the Staff view, we see our Operations Dashboard. This isn't just a list; it's an analytics engine. We have a real-time heatmap of incidents, and Gemini is performing sentiment analysis on recent reports to gauge the community mood."

---

## 5. Agentic Chatbot: Q&A & Trends
**Goal:** Demonstrate the mandatory LangGraph agent.

- **Files to Reference:**
  - `backend/analytics-service/src/agents/cityAiChatAgent.ts` (LangGraph StateGraph)
  - `frontend/analytics-mfe/src/components/Chatbot.tsx` (UI)

- **Action:** Ask the chatbot: "What are the current trends in our neighborhood?" or "How many open potholes do we have?"
- **Script:**
  > "Finally, we have our AI Assistant. This is a LangGraph-powered agent that understands the state of our database. It can classify user intent, fetch real-time issue data, and provide grounded answers about local trends and safety concerns."

---

## 6. Technical Architecture & Code Quality
**Goal:** Highlight the engineering standards that make the app robust.

- **Files to Reference:**
  - `pnpm-workspace.yaml` (Monorepo structure)
  - `frontend/host/vite.config.ts` (Module Federation & API Proxy)
  - `docs/comment_standards.md` (Documentation adherence)

- **Script:**
  > "Under the hood, CityAI is a monorepo using pnpm workspaces. We've implemented a Micro Frontend architecture via Vite Module Federation and a Microservices backend using GraphQL. Every file follows strict JSDoc standards, ensuring long-term maintainability."

---

## Summary of Demo Accounts
*Password for all:* `Cnnmcn54$`

- **Resident:** `keziah.noreen.mendoza@gmail.com`
- **Staff:** `marissa.mendoza@gmail.com`
- **Advocate:** `kyle.nathaniel.mendoza@gmail.com`
