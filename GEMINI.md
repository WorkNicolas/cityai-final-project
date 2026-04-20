# CityAI (CivicCase) — Project Context & Instructions

This document provides foundational context and development mandates for the CityAI project (also referred to as CivicCase), an AI-powered local issue tracker designed for Canadian municipalities.

---

## 🏗️ Project Architecture

CityAI is a monorepo managed with **pnpm workspaces**, utilizing a **Microservices** backend and a **Micro Frontends (MFE)** frontend.

### Backend (Microservices)
Located in `backend/`, these services use Node.js, Express, Apollo Server (GraphQL), and MongoDB (Mongoose).
- **auth-service**: Handles user registration, login, and JWT issuance via HTTP-only cookies.
- **issue-service**: Manages reporting, tracking, and status updates for civic issues.
- **analytics-service**: Powers the AI features, including the LangGraph agent and trend detection.

### Frontend (Micro Frontends)
Located in `frontend/`, these applications use React (Vite) and Tailwind CSS.
- **host**: The shell application that orchestrates and lazy-loads MFEs.
- **auth-mfe**: User authentication and profile management UI.
- **issue-mfe**: Issue reporting, listing, and tracking UI.
- **analytics-mfe**: Dashboards, heatmaps, and the AI chatbot interface.

---

## 🛠️ Technology Stack

- **Core**: TypeScript, Node.js (>=20.0.0), pnpm (>=9.0.0)
- **Database**: MongoDB (Mongoose)
- **API**: GraphQL (Apollo Server)
- **AI**: LangGraph, Gemini 1.5 Flash (`@langchain/google-genai`)
- **Frontend**: React, Vite, Tailwind CSS
- **Security**: JWT (HTTP-only cookies), `helmet` (No direct `cors` usage), Vite Proxy for API routing.

---

## 🚀 Key Commands

Execute these from the project root:

- `pnpm dev`: Starts all backend services and frontend MFEs concurrently.
- `pnpm build`: Builds all packages in the workspace.
- `pnpm lint`: Runs linting across all packages.
- `pnpm --filter <service-name> dev`: Starts a specific service (e.g., `pnpm --filter auth-service dev`).

---

## 📋 Development Conventions

### Documentation Standards
Strict adherence to `docs/comment_standards.md` is required. Every file MUST include:
1. **File Header**: JSDoc block with `@file`, `@description`, `@author`, `@since`, `@updated`, and `@version`. The first line must be the full monorepo-relative path.
2. **Table of Contents**: A list of imports, classes, resolvers, or components within the file.
3. **JSDoc for Exports**: All exported classes, functions, and interfaces must have descriptive JSDoc.

**Example Header:**
```typescript
/** backend/analytics-service/src/agents/civicChatAgent.ts
 * @file civicChatAgent.ts
 * @description LangGraph agentic chatbot for CivicCase.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */
```

### Security Mandates
- **CORS**: Do not use the `cors` npm package. Use `helmet` and rely on the Vite proxy in the `host` MFE for routing.
- **Auth**: Authentication is handled via JWTs stored in `token` HTTP-only cookies. Resolvers should access user context via the `AuthContext` object.

### AI Integration
- The `analytics-service` uses **LangGraph** to manage agentic state and flow.
- Use **Gemini 1.5 Flash** for classification, summarization, and chat responses.
- Database context must be used to ground LLM responses (RAG pattern).

---

## 📂 Directory Structure

```text
.
├── backend/                # Microservices
│   ├── analytics-service/  # AI, LangGraph, Trends
│   ├── auth-service/       # JWT, User Management
│   └── issue-service/      # CRUD for Issues
├── docs/                   # Standards and Project Specs
├── frontend/               # Micro Frontends
│   ├── host/               # Shell Application
│   ├── auth-mfe/           # Login/Register UI
│   ├── issue-mfe/          # Issue Tracking UI
│   └── analytics-mfe/      # Dashboards & Chat UI
├── package.json            # Root scripts
└── pnpm-workspace.yaml     # Workspace config
```
