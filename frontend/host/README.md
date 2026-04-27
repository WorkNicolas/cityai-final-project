/** frontend/host/README.md
 * @file README.md
 * @description Shell application for the CityAI project.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-25 - Updated project description.
 * @version 0.1.0
 */

# CityAI — Host Shell

The host application is the central orchestrator that lazy-loads microfrontends using Module Federation and provides shared infrastructure like the Apollo Client, Theme Provider, and global routing.

## Responsibilities
- **MFE Orchestration:** Lazy-loading remotes via Module Federation.
- **API Proxying:** Routing `/api/*` requests to the correct backend microservices.
- **State Management:** Providing the global `ApolloProvider` and `ThemeProvider`.
- **Global UI:** Rendering the header, footer, and navigation.

## Tech Stack
- React 19 + Vite
- @module-federation/vite
- Tailwind CSS
- Apollo Client
