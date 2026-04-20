/** backend/analytics-service/src/services/trendService.ts
 * @file trendService.ts
 * @description Detects clusters of similar civic issues over a rolling time window
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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

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

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const insights: TrendInsight[] = [];

  for (const cluster of clusters) {
    const prompt = `
You are a municipal analytics assistant. Write one plain-language sentence describing
a trend where ${cluster.count} civic issues of type "${cluster._id}" have been reported
in the past ${TREND_WINDOW_DAYS} days in a Canadian city. Be factual and actionable.
    `.trim();

    const result = await model.generateContent(prompt);
    const summary = result.response.text().trim();

    insights.push({
      category:    cluster._id,
      count:       cluster.count,
      summary,
      detectedAt:  new Date().toISOString(),
    });
  }

  return insights;
}