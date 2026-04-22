/** backend/analytics-service/src/agents/cityAiChatAgent.ts
 * @file cityAiChatAgent.ts
 * @description LangGraph agentic chatbot for CityAI. Supports natural language
 * queries about open issues, resolved issues, trends, safety alerts, and
 * general municipal Q&A. Built with LangGraph StateGraph and Gemini as the LLM.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-20
 * @updated 2026-04-20 - Initial implementation.
 * @version 0.1.0
 */

/**
 * Table of Contents
 * - Imports
 * - Interfaces
 *   - AgentState
 * - Graph Nodes
 *   - classifyIntent
 *   - fetchIssueContext
 *   - generateResponse
 * - Graph Definition
 *   - cityAiChatGraph
 * - Exported Functions
 *   - runCityAiChat
 * - Exports
 */

import { StateGraph, END, START } from '@langchain/langgraph';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import mongoose from 'mongoose';

const llm = new ChatGoogleGenerativeAI({
  model:       'gemini-3-flash-preview',
  apiKey:      process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
  temperature: 0.3,
});

/**
 * AgentState
 * @description The shared state object passed between LangGraph nodes.
 */
interface AgentState {
  /**
   * userMessage
   * @description The raw message text sent by the user.
   */
  userMessage: string;

  /**
   * intent
   * @description The classified intent of the user's message.
   * One of: 'open_issues', 'resolved_issues', 'trends', 'safety_alert', 'general'.
   */
  intent: string;

  /**
   * context
   * @description Data fetched from the database to ground the agent's response.
   */
  context: string;

  /**
   * response
   * @description The final text response to return to the user.
   */
  response: string;
}

/**
 * classifyIntent
 * @description LangGraph node that uses Gemini to classify the user's message
 * into one of the supported intents.
 * @param {AgentState} state - Current agent state.
 * @returns {Promise<Partial<AgentState>>} State patch with the classified intent.
 */
async function classifyIntent(state: AgentState): Promise<Partial<AgentState>> {
  const prompt = `
Classify this municipal issue query into exactly one intent:
open_issues, resolved_issues, trends, safety_alert, general

Query: "${state.userMessage}"
Respond with only the intent label.
  `.trim();

  const result = await llm.invoke([new HumanMessage(prompt)]);
  const intent = (result.content as string).trim().toLowerCase();

  const validIntents = ['open_issues', 'resolved_issues', 'trends', 'safety_alert', 'general'];
  return { intent: validIntents.includes(intent) ? intent : 'general' };
}

/**
 * fetchIssueContext
 * @description LangGraph node that queries MongoDB to fetch relevant issue data
 * based on the classified intent. Provides grounding context for the LLM response.
 * @param {AgentState} state - Current agent state with intent populated.
 * @returns {Promise<Partial<AgentState>>} State patch with the fetched context string.
 */
async function fetchIssueContext(state: AgentState): Promise<Partial<AgentState>> {
  const collection = mongoose.connection.collection('issuesnapshots');
  let context = '';

  if (state.intent === 'open_issues') {
    const issues = await collection
      .find({ status: 'open' })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    context = issues.length > 0
      ? issues
        .map((i) => {
          const title = (i as { title?: string }).title ?? (i as { location?: string }).location ?? 'Issue';
          return `• ${title} (${(i as { category?: string }).category ?? 'other'}) — ${(i as { location?: string }).location ?? ''}`;
        })
        .join('\n')
      : 'No open issues found.';

  } else if (state.intent === 'resolved_issues') {
    const issues = await collection
      .find({ status: 'resolved' })
      .sort({ updatedAt: -1 })
      .limit(5)
      .toArray();

    context = issues.length > 0
      ? issues
        .map((i) => {
          const title = (i as { title?: string }).title ?? (i as { location?: string }).location ?? 'Issue';
          return `• ${title} (${(i as { category?: string }).category ?? 'other'}) — resolved`;
        })
        .join('\n')
      : 'No recently resolved issues found.';

  } else if (state.intent === 'trends' || state.intent === 'safety_alert') {
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const clusters = await collection.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]).toArray();

    context = clusters.length > 0
      ? clusters.map((c) => `• ${c._id}: ${c.count} reports in the past 7 days`).join('\n')
      : 'No significant trends detected this week.';

  } else {
    context = 'No specific database context needed for this query.';
  }

  return { context };
}

/**
 * generateResponse
 * @description LangGraph node that calls Gemini with the user message and
 * the fetched database context to produce a grounded, helpful response.
 * @param {AgentState} state - Current agent state with intent and context populated.
 * @returns {Promise<Partial<AgentState>>} State patch with the final response string.
 */
async function generateResponse(state: AgentState): Promise<Partial<AgentState>> {
  const systemPrompt = `
You are the CityAI assistant for the CityAI municipal issue tracking system
serving a Canadian city. You help residents and staff understand reported issues,
trends, and safety concerns. Be concise, factual, and friendly.
  `.trim();

  const userPrompt = `
User question: ${state.userMessage}

Relevant data from the system:
${state.context}

Provide a helpful, concise response based on this data.
  `.trim();

  const result = await llm.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(userPrompt),
  ]);

  return { response: (result.content as string).trim() };
}

/**
 * cityAiChatGraph
 * @description The compiled LangGraph StateGraph for the CityAI chatbot.
 * Flow: classifyIntent → fetchIssueContext → generateResponse → END
 */
const cityAiChatGraph = new StateGraph<AgentState>({
  channels: {
    userMessage: { value: (a: string, b: string) => b ?? a, default: () => '' },
    intent:      { value: (a: string, b: string) => b ?? a, default: () => '' },
    context:     { value: (a: string, b: string) => b ?? a, default: () => '' },
    response:    { value: (a: string, b: string) => b ?? a, default: () => '' },
  },
})
  .addNode('classifyIntent',    classifyIntent)
  .addNode('fetchIssueContext', fetchIssueContext)
  .addNode('generateResponse',  generateResponse)
  .addEdge(START,                'classifyIntent')
  .addEdge('classifyIntent',    'fetchIssueContext')
  .addEdge('fetchIssueContext', 'generateResponse')
  .addEdge('generateResponse',  END)
  .compile();

/**
 * runCityAiChat
 * @description Public entry point for the chatbot. Invokes the LangGraph agent
 * with the user's message and returns the final response string.
 * @param {string} userMessage - The message sent by the resident or staff member.
 * @returns {Promise<string>} The agent's response text.
 */
export async function runCityAiChat(userMessage: string): Promise<string> {
  const result = await cityAiChatGraph.invoke({ userMessage });
  return result.response;
}
