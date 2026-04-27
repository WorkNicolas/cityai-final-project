/** GEMINI.md
 * @file GEMINI.md
 * @description Foundational context and development mandates for CityAI.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-25 - Verified architectural mandates.
 * @version 0.1.1
 */

# CityAI — Project Context & Instructions

This document provides foundational context and development mandates for the CityAI project, an AI-powered local issue tracker designed for Canadian municipalities.

---

## Project Architecture

CityAI is a monorepo managed with **pnpm workspaces**, utilizing a **Microservices** backend and a **Micro Frontends (MFE)** frontend.

### Backend (Microservices)
Located in `backend/`, these services use Node.js, Express, Apollo Server (GraphQL), and MongoDB (Mongoose).
- **auth-service**: Handles user registration, login, and JWT issuance via HTTP-only cookies.
- **issue-service**: Manages reporting, tracking, and status updates for municipal issues.
- **analytics-service**: Powers the AI features, including the LangGraph agent and trend detection.

### Frontend (Micro Frontends)
Located in `frontend/`, these applications use React (Vite) and Tailwind CSS.
- **host**: The shell application that orchestrates and lazy-loads MFEs.
- **auth-mfe**: User authentication and profile management UI.
- **issue-mfe**: Issue reporting, listing, and tracking UI.
- **analytics-mfe**: Dashboards, heatmaps, and the AI chatbot interface.

---

## Technology Stack

- **Core**: TypeScript, Node.js (>=20.0.0), pnpm (>=9.0.0)
- **Database**: MongoDB (Mongoose)
- **API**: GraphQL (Apollo Server)
- **AI**: LangGraph, Gemini 3 Flash Preview (`@langchain/google-genai`)
- **Frontend**: React, Vite, Tailwind CSS
- **Security**: JWT (HTTP-only cookies), `helmet` (No direct `cors` usage), Vite Proxy for API routing.

---

## Key Commands

Execute these from the project root:

- `pnpm dev`: Starts all backend services and frontend MFEs concurrently.
- `pnpm build`: Builds all packages in the workspace.
- `pnpm lint`: Runs linting across all packages.
- `pnpm --filter <service-name> dev`: Starts a specific service (e.g., `pnpm --filter auth-service dev`).

---

## Development Conventions

### Documentation Standards
Strict adherence to `docs/comment_standards.md` is required. Every file MUST include:
1. **File Header**: JSDoc block with `@file`, `@description`, `@author`, `@since`, `@updated`, and `@version`. The first line must be the full monorepo-relative path.
2. **Table of Contents**: A list of imports, classes, resolvers, or components within the file.
3. **JSDoc for Exports**: All exported classes, functions, and interfaces must have descriptive JSDoc.

**Example Header:**
```typescript
/** backend/analytics-service/src/agents/cityAiChatAgent.ts
 * @file cityAiChatAgent.ts
 * @description LangGraph agentic chatbot for CityAI.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */
```
### Database & Seeding
- **Seed Scripts**: You must update all seed files (`scripts/seed.ts`, `scripts/seed_lots.ts`, etc.) if the database features have been changed.

### Security Mandates
- **CORS**: Do not use the `cors` npm package. Use `helmet` and rely on the Vite proxy in the `host` MFE for routing.
- **Auth**: Authentication is handled via JWTs stored in `token` HTTP-only cookies. Resolvers should access user context via the `AuthContext` object.

### AI Integration
- The `analytics-service` uses **LangGraph** to manage agentic state and flow.
- Use **Gemini 3 Flash Preview** for classification, summarization, and chat responses.
- Database context must be used to ground LLM responses (RAG pattern).

---

## Directory Structure

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