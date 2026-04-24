/** backend/analytics-service/src/services/trendService.ts
 * @file trendService.ts
 * @description Detects clusters of similar municipal issues over a rolling time window
 * and generates AI-powered trend summaries using Gemini.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - Interfaces
 *   - TrendInsight
 * - Constants
 *   - TREND_WINDOW_DAYS
 *   - TREND_THRESHOLD
 * - Functions
 *   - detectTrends
 * - Exports
 */

import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '');

/**
 * TrendInsight
 * @description Represents a detected trend cluster returned by detectTrends.
 */
export interface TrendInsight {
  /**
   * category
   * @description The issue category this trend relates to.
   */
  category: string;

  /**
   * count
   * @description Number of issues in this category over the detection window.
   */
  count: number;

  /**
   * summary
   * @description AI-generated plain-language description of the trend.
   */
  summary: string;

  /**
   * detectedAt
   * @description ISO 8601 timestamp of when this trend was detected.
   */
  detectedAt: string;
}

/**
 * TREND_WINDOW_DAYS
 * @description Number of days to look back when counting issue clusters.
 */
const TREND_WINDOW_DAYS = 7;

/**
 * TREND_THRESHOLD
 * @description Minimum number of issues in a category to qualify as a trend.
 */
const TREND_THRESHOLD = 3;

/**
 * detectTrends
 * @description Queries the issue-service MongoDB collection for category clusters
 * over the past TREND_WINDOW_DAYS days. For each cluster meeting TREND_THRESHOLD,
 * generates a Gemini summary and returns a TrendInsight object.
 *
 * Note: This service queries its own analytics MongoDB connection.
 * It does not directly query the issue-service database — in a production
 * environment you would use an event stream or a read replica.
 * For this project, analytics-service shares the same MongoDB host but reads
 * from a separate collection that is kept in sync via GraphQL mutations.
 *
 * @returns {Promise<TrendInsight[]>} Array of detected trend insights.
 */
export async function detectTrends(): Promise<TrendInsight[]> {
  const since = new Date();
  since.setDate(since.getDate() - TREND_WINDOW_DAYS);

  // Query against a local IssueSnapshot collection maintained by analytics-service.
  const IssueSnapshot = mongoose.connection.collection('issuesnapshots');

  const pipeline = [
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $match: { count: { $gte: TREND_THRESHOLD } } },
    { $sort: { count: -1 } },
  ];

  const clusters = await IssueSnapshot.aggregate(pipeline).toArray();

  if (clusters.length === 0) return [];

  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
  const insights: TrendInsight[] = [];

  for (const cluster of clusters) {
    const prompt = `
You are a municipal analytics assistant. Write one plain-language sentence describing
a trend where ${cluster.count} municipal issues of type "${cluster._id}" have been reported
in the past ${TREND_WINDOW_DAYS} days in a Canadian city. Be factual and actionable.
    `.trim();

    try {
      const result = await model.generateContent(prompt);
      const summary = result.response.text().trim();

      insights.push({
        category:    cluster._id as string,
        count:       cluster.count as number,
        summary,
        detectedAt:  new Date().toISOString(),
      });
    } catch (err) {
      console.error('Trend detection Gemini error:', err);
    }
  }

  return insights;
}

/**
 * GlobalInsights
 */
export interface GlobalInsights {
  resolutionEfficiency: string;
  resolutionDetail:     string;
  publicSentiment:      string;
  sentimentDetail:      string;
}

/**
 * getGlobalInsights
 * @description Calculates live metrics and community sentiment.
 */
export async function getGlobalInsights(): Promise<GlobalInsights> {
  const Snapshot = mongoose.connection.collection('issuesnapshots');

  // 1. Calculate Resolution Efficiency (Avg time to resolve in hours)
  const resolvedIssues = await Snapshot.find({ resolvedAt: { $exists: true } }).toArray();

  let resolutionEfficiency = 'N/A';
  let resolutionDetail     = 'Not enough data available to calculate average resolution time yet.';

  if (resolvedIssues.length > 0) {
    let totalMs = 0;
    resolvedIssues.forEach(i => {
      const created = new Date(i.createdAt).getTime();
      const resolved = new Date(i.resolvedAt).getTime();
      totalMs += (resolved - created);
    });

    const avgHours = totalMs / (1000 * 60 * 60) / resolvedIssues.length;
    
    // For the demo, let's say a 'good' average is 24 hours.
    // Efficiency = max(0, 100 - (avgHours / 0.48)) % (approx 48h = 0%)
    const efficiencyValue = Math.max(50, Math.min(99, 100 - (avgHours / 2)));
    resolutionEfficiency = `${Math.round(efficiencyValue)}%`;
    resolutionDetail = `Average resolution time is ${avgHours.toFixed(1)} hours across ${resolvedIssues.length} issues.`;
  }

  // 2. Perform AI Sentiment Analysis on recent issues
  const allIssues = await Snapshot.find({}).sort({ createdAt: -1 }).limit(15).toArray();
  let publicSentiment = 'N/A';
  let sentimentDetail = 'No community feedback available yet.';

  if (allIssues.length > 0) {
    const recentDescriptions = allIssues
      .map(i => `${i.title}: ${i.description}`)
      .join('\n');

    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
    const prompt = `
      Analyze these municipal issue reports from residents to determine the overall community mood:
      ${recentDescriptions}

      Tasks:
      1. Determine the overall community sentiment (one word, e.g., Positive, Frustrated, Concerned, Hopeful).
      2. Write one short, professional sentence explaining the primary reason for this sentiment.

      Respond ONLY in this EXACT JSON format:
      {"sentiment": "Word", "detail": "Sentence"}
    `.trim();

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{.*\}/s);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        publicSentiment = parsed.sentiment;
        sentimentDetail = parsed.detail;
      }
    } catch (err) {
      console.error('Sentiment Analysis Failed:', err);
      publicSentiment = 'Error';
      sentimentDetail = 'Failed to retrieve sentiment from AI service.';
    }
  }

  return {
    resolutionEfficiency,
    resolutionDetail,
    publicSentiment,
    sentimentDetail,
  };
}