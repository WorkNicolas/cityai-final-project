/** backend/issue-service/src/services/analyticsSync.ts
 * @file analyticsSync.ts
 * @description Syncs issue status updates to the analytics-service.
 * @author Carl Nicolas Mendoza
 * @since 2026-04-23
 * @version 0.1.0
 */

const ANALYTICS_SERVICE_GRAPHQL_URL =
  process.env.ANALYTICS_SERVICE_GRAPHQL_URL && process.env.ANALYTICS_SERVICE_GRAPHQL_URL.length > 0
    ? process.env.ANALYTICS_SERVICE_GRAPHQL_URL
    : 'http://localhost:4003/graphql';

function internalToken(): string {
  return process.env.INTERNAL_SERVICE_TOKEN && process.env.INTERNAL_SERVICE_TOKEN.length > 0
    ? process.env.INTERNAL_SERVICE_TOKEN
    : 'dev-internal-service-token';
}

/**
 * pushStatusUpdateToAnalytics
 * @description Sends a mutation to analytics-service to update its local snapshot of an issue.
 * @param issueId The ID of the issue being updated.
 * @param status The new status of the issue.
 */
export async function pushStatusUpdateToAnalytics(issueId: string, status: string): Promise<void> {
  const query = `
    mutation UpdateSnapshotStatus($issueId: ID!, $status: String!) {
      updateSnapshotStatus(issueId: $issueId, status: $status)
    }
  `;

  try {
    const res = await fetch(ANALYTICS_SERVICE_GRAPHQL_URL, {
      method:  'POST',
      headers: {
        'Content-Type':    'application/json',
        'x-service-token': internalToken(),
      },
      body: JSON.stringify({
        query,
        variables: {
          issueId,
          status,
        },
      }),
    });

    const body = (await res.json()) as { errors?: { message: string }[]; data?: unknown };
    if (!res.ok || body.errors?.length) {
      const msg = body.errors?.map((e) => e.message).join('; ') || res.statusText;
      console.error(`analytics sync failed: ${msg}`);
    }
  } catch (err) {
    console.error('analytics sync network error:', err);
  }
}
