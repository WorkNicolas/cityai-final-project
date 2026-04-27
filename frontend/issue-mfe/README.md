/** frontend/issue-mfe/README.md
 * @file README.md
 * @description Issue Reporting & Tracking Microfrontend for CityAI.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-25 - Updated project description.
 * @version 0.1.0
 */

# CityAI — Issue MFE

This microfrontend enables residents to report municipal issues with photos and geotags, and allows them to track the status of their reports in real-time.

## Features
- **Issue Reporting:** Multi-step form with map picker and photo upload.
- **My Reports:** Dashboard for residents to track their submitted issues.
- **Notifications:** Real-time alerts for status changes.
- **Community Engagement:** Upvoting and commenting on local issues.

## Tech Stack
- React 19 + Vite
- Tailwind CSS
- Apollo Client (connecting to `issue-service`)
- Leaflet (for location picking)
