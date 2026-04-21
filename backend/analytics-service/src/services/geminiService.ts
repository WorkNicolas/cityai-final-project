/** backend/analytics-service/src/services/geminiService.ts
 * @file geminiService.ts
 * @description Wrapper around the Google Gemini API for issue classification
 * and summarization tasks. All AI calls are centralized here.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - Constants
 *   - VALID_CATEGORIES
 * - Functions
 *   - classifyIssue
 *   - summarizeIssue
 * - Exports
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '');

/**
 * VALID_CATEGORIES
 * @description The set of category strings the classifier is allowed to return.
 * Must match the IssueCategory enum in the shared types and Issue Mongoose schema.
 */
const VALID_CATEGORIES = [
  'pothole',
  'streetlight',
  'flooding',
  'safety-hazard',
  'graffiti',
  'other',
] as const;

type IssueCategory = (typeof VALID_CATEGORIES)[number];

/**
 * classifyIssue
 * @description Sends the issue title and description to Gemini and returns
 * the most appropriate category label from the predefined set.
 * Falls back to 'other' if the model returns an unrecognised value.
 * @param {string} title       - The issue title provided by the resident.
 * @param {string} description - The full issue description.
 * @returns {Promise<IssueCategory>} One of the valid category strings.
 */
export async function classifyIssue(
  title: string,
  description: string
): Promise<IssueCategory> {
  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

  const prompt = `
You are a civic issue classification assistant for a Canadian municipality.
Classify the following issue report into exactly one of these categories:
pothole, streetlight, flooding, safety-hazard, graffiti, other

Respond with only the category label — no punctuation, no explanation.

Title: ${title}
Description: ${description}
  `.trim();

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim().toLowerCase();

  // Guard against unexpected model output.
  if ((VALID_CATEGORIES as readonly string[]).includes(raw)) {
    return raw as IssueCategory;
  }

  return 'other';
}

/**
 * summarizeIssue
 * @description Generates a concise plain-language summary of a civic issue report.
 * The summary is stored on the Issue document as aiSummary.
 * @param {string} title       - The issue title.
 * @param {string} description - The full issue description.
 * @param {string} location    - The reported location of the issue.
 * @returns {Promise<string>} A 1–2 sentence summary suitable for the staff dashboard.
 */
export async function summarizeIssue(
  title: string,
  description: string,
  location: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

  const prompt = `
You are a municipal issue tracking assistant. Write a concise 1–2 sentence summary
of the following civic issue for a staff dashboard. Be factual and neutral in tone.

Title: ${title}
Location: ${location}
Description: ${description}
  `.trim();

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}