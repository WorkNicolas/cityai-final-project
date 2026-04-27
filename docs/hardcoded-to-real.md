/** docs/hardcoded-to-real.md
 * @file hardcoded-to-real.md
 * @description Transition tracker for features migrating from hardcoded placeholders to live data.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-24
 * @updated 2026-04-25 - Verified Resolution Efficiency and Public Sentiment as REAL.
 * @version 0.1.1
 */

# Hardcoded to Real — Transition Tracker

This document tracks the features in CityAI that have been migrated from static UI placeholders to live, data-driven components powered by microservices and AI.

---

## Analytics: Incident Heatmap
- **Previous State:** Abstract CSS circles positioned with hardcoded percentages (`top: 30%, left: 40%`).
- **Real Implementation:** 
  - Integrated `react-leaflet` and `leaflet.heat`.
  - Fetches live `coordinates` for all reports via the `issues` GraphQL query.
  - Renders dynamic density clustering based on actual MongoDB data.
- **Status:** REAL

---

## Dashboard: Urgent Backlog
- **Previous State:** Static text showing "8 Issues".
- **Real Implementation:** 
  - Uses Apollo `useQuery` to hit the `issue-service`.
  - Specifically filters for issues with `status: open` and `category: safety_hazard`.
  - Displays the live count from the `total` field in the paginated response.
- **Status:** REAL

---

## Dashboard: Resolution Efficiency
- **Previous State:** Static "+14%" value.
- **Real Implementation:** 
  - Calculated in `analytics-service` based on `createdAt` and `resolvedAt` timestamps in `issuesnapshots`.
  - Uses a heuristic formula to derive a percentage score.
- **Status:** REAL

---

## Dashboard: Public Sentiment
- **Previous State:** Static "Positive" value.
- **Real Implementation:** 
  - Gemini 3 Flash Preview analyzes the last 15 issue descriptions.
  - Returns a sentiment label and a detailed explanation.
- **Status:** REAL
