# Hardcoded Data Fixes

This document tracks the hardcoded data issues identified during the project audit and details the fixes implemented to resolve them.

## 1. Resolution Efficiency Fallback
- **Hardcoded State:** `trendService.ts` returned a hardcoded baseline of `92%` with a detail message `"AI triage is optimizing response times."` when no resolved issues existed. This is misleading as it invents data.
- **Implemented Fix:** Updated the default state to clearly indicate `"N/A"` for efficiency and `"Not enough data available to calculate average resolution time yet."` for the detail when the database has no resolved issues.

## 2. Public Sentiment Fallback
- **Hardcoded State:** `trendService.ts` returned `"Neutral"` with `"No community feedback available yet."` before analyzing, and if the API failed, it returned `"Varied"` with `"Residents are reporting various infrastructure concerns."`
- **Implemented Fix:** Differentiated the fallback logic. If there are no issues to analyze, it correctly returns `"N/A"` with `"No community feedback available yet."` If the Gemini API fails during analysis, it will now explicitly return `"Error"` with `"Failed to retrieve sentiment from AI service."`

## 3. Map Default Coordinates
- **Hardcoded State:** `IssueMap.tsx` hardcoded the default center to Toronto coordinates `[43.6532, -79.3832]`.
- **Implemented Fix:** Updated the map component to utilize `navigator.geolocation` to attempt to find the user's actual physical location on load, only falling back to Toronto if the user denies location access or if it's unavailable.

## 4. Bulk Seeding Script User ID
- **Hardcoded State:** `scripts/bulk_seed.js` fell back to a hardcoded string `6624a0000000000000000001` if it couldn't find a resident in the database to attribute the issues to.
- **Implemented Fix:** Updated the script to dynamically create and insert a mock resident user into the `cityai-auth` users collection if none is found, ensuring data integrity.

## 5. Chatbot Initial Greeting
- **Hardcoded State:** The chatbot starts with a static welcome message.
- **Implemented Fix:** Maintained as-is (Determined to be an acceptable and standard practice).
