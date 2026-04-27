/** docs/trends.md
 * @file trends.md
 * @description Explaination of trend detection and metric calculation.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-25 - Updated metric fallback documentation.
 * @version 0.1.1
 */

# CityAI Trend & Metric Analytics

This document explains how CityAI gathers, calculates, and generates insights for the analytics dashboards, specifically focusing on the metrics seen in the Staff and Advocate views.

## 1. Urgent Backlog

**How it's acquired:**
The Urgent Backlog represents critical safety hazards that require immediate staff attention. It is acquired by querying the `issue-service` directly for all issues that match two conditions:
- `status` is exactly `open`.
- `category` is exactly `safety_hazard`.

The dashboard displays the total count of these issues, alerting staff to critical pending tasks.

## 2. Resolution Efficiency

**How it's acquired:**
Resolution Efficiency tracks the system-wide average time to resolve issues. It relies on the local `issuesnapshots` collection maintained by the `analytics-service`.

1. The service queries all issues that have a `resolvedAt` timestamp.
2. For each resolved issue, it calculates the time difference in milliseconds between `createdAt` and `resolvedAt`.
3. It averages this total time across all resolved issues and converts it to hours.
4. An "efficiency score" (0-100%) is then calculated using the formula: `Math.max(50, Math.min(99, 100 - (avgHours / 2)))`, assuming ~48 hours represents a 0% efficiency score in this demo context.

*(Note: If there are no resolved issues with a valid `resolvedAt` timestamp, this metric will display "N/A".)*

## 3. Public Sentiment

**How it's acquired:**
Public Sentiment is an AI-generated reading of the overall community mood. 

1. The `analytics-service` fetches the 15 most recently created issue snapshots from the database.
2. It concatenates the `title` and `description` of these issues into a single text block.
3. This text block is sent to the Gemini 3 Flash Preview model with a specific prompt asking it to determine the overall community sentiment (e.g., "Frustrated", "Concerned", "Positive") and a one-sentence explanation.
4. The JSON response from Gemini is parsed and displayed directly on the dashboard.

## 4. General Trend Detection

**How it's acquired:**
The system proactively detects clusters of similar issues to identify emerging trends (e.g., a sudden spike in potholes).

1. The `analytics-service` queries the `issuesnapshots` collection for issues created within a rolling 7-day window.
2. It groups these issues by their `category` and counts them.
3. Any category that has a count of 3 or more (the `TREND_THRESHOLD`) is flagged as a potential trend.
4. For each flagged cluster, the system prompts Gemini to write a one-sentence, actionable description of the trend (e.g., "There has been a spike in 5 pothole reports over the past 7 days, indicating a need for urgent road repair.").
5. These insights are returned as `TrendInsight` objects to the frontend.
