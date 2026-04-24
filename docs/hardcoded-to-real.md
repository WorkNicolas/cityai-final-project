# Hardcoded to Real — Transition Tracker

This document tracks the features in CityAI that have been migrated from static UI placeholders to live, data-driven components powered by microservices and AI.

---

## 🗺️ Analytics: Incident Heatmap
- **Previous State:** Abstract CSS circles positioned with hardcoded percentages (`top: 30%, left: 40%`).
- **Real Implementation:** 
  - Integrated `react-leaflet` and `leaflet.heat`.
  - Fetches live `coordinates` for all reports via the `issues` GraphQL query.
  - Renders dynamic density clustering based on actual MongoDB data.
- **Status:** ✅ **REAL**

---

## 📈 Dashboard: Urgent Backlog
- **Previous State:** Static text showing "8 Issues".
- **Real Implementation:** 
  - Uses Apollo `useQuery` to hit the `issue-service`.
  - Specifically filters for issues with `status: open` and `category: safety_hazard`.
  - Displays the live count from the `total` field in the paginated response.
- **Status:** ✅ **REAL**

---

## ⏱️ Dashboard: Resolution Efficiency
- **Previous State:** Static "+14%" value.
- **Status:** 🚧 *Migration in Progress* (Implementing backend aggregation)

---

## 🎭 Dashboard: Public Sentiment
- **Previous State:** Static "Positive" value.
- **Status:** 🚧 *Migration in Progress* (Integrating Gemini sentiment analysis)
