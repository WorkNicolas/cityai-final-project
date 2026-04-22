/**
 * @file issueWriteback.ts
 * @description Calls issue-service GraphQL setAiFields using a shared internal token.
 */

/** Maps Gemini / Mongoose hyphen categories to GraphQL IssueCategory enum names. */
export function categoryHyphenToGraphqlEnum(category: string): string {
  return category.trim().toLowerCase().replace(/-/g, '_');
}

const ISSUE_SERVICE_GRAPHQL_URL =
  process.env.ISSUE_SERVICE_GRAPHQL_URL ?? 'http://localhost:4002/graphql';

function internalToken(): string {
  return process.env.INTERNAL_SERVICE_TOKEN && process.env.INTERNAL_SERVICE_TOKEN.length > 0
    ? process.env.INTERNAL_SERVICE_TOKEN
    : 'dev-internal-service-token';
}

/**
 * Pushes AI classification results to the issue-service via GraphQL.
 */
export async function pushAiFieldsToIssueService(params: {
  issueId:     string;
  category:    string;
  aiSummary:   string;
}): Promise<void> {
  const enumValue = categoryHyphenToGraphqlEnum(params.category);
  const query = `
    mutation SetAiFields($id: ID!, $category: IssueCategory!, $aiSummary: String!) {
      setAiFields(id: $id, category: $category, aiSummary: $aiSummary) {
        id
      }
    }
  `;

  const res = await fetch(ISSUE_SERVICE_GRAPHQL_URL, {
    method:  'POST',
    headers: {
      'Content-Type':    'application/json',
      'x-service-token': internalToken(),
    },
    body: JSON.stringify({
      query,
      variables: {
        id:        params.issueId,
        category:  enumValue,
        aiSummary: params.aiSummary,
      },
    }),
  });

  const body = (await res.json()) as { errors?: { message: string }[]; data?: unknown };
  if (!res.ok || body.errors?.length) {
    const msg = body.errors?.map((e) => e.message).join('; ') || res.statusText;
    throw new Error(`issue write-back failed: ${msg}`);
  }
}
