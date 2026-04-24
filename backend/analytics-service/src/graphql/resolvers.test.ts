import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';

vi.mock('../agents/cityAiChatAgent', () => ({
  runCityAiChat: vi.fn(),
}));

vi.mock('../services/trendService', () => ({
  detectTrends: vi.fn(),
}));

vi.mock('../services/geminiService', () => ({
  classifyIssue: vi.fn(),
  summarizeIssue: vi.fn(),
}));

describe('analytics-service graphql resolvers', () => {
  let resolvers: typeof import('./resolvers').resolvers;
  let runCityAiChat: ReturnType<typeof vi.fn>;
  let detectTrends: ReturnType<typeof vi.fn>;
  let classifyIssue: ReturnType<typeof vi.fn>;
  let summarizeIssue: ReturnType<typeof vi.fn>;

  beforeAll(async () => {
    const mod = await import('./resolvers');
    resolvers = mod.resolvers;
    const agent = await import('../agents/cityAiChatAgent');
    const trend = await import('../services/trendService');
    const gem = await import('../services/geminiService');
    runCityAiChat = vi.mocked(agent.runCityAiChat);
    detectTrends = vi.mocked(trend.detectTrends);
    classifyIssue = vi.mocked(gem.classifyIssue);
    summarizeIssue = vi.mocked(gem.summarizeIssue);
  });

  beforeEach(() => {
    runCityAiChat.mockReset();
    detectTrends.mockReset();
    classifyIssue.mockReset();
    summarizeIssue.mockReset();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { setAiFields: { id: '1' } } }),
      })
    );
  });

  const staff = { user: { sub: 's', role: 'staff' } };
  const advocate = { user: { sub: 'a', role: 'advocate' } };
  const resident = { user: { sub: 'r', role: 'resident' } };
  const anon = { user: null };

  it('trends forbids resident', async () => {
    await expect(resolvers.Query.trends({}, {}, resident)).rejects.toMatchObject({
      extensions: { code: 'FORBIDDEN' },
    });
  });

  it('trends allows staff', async () => {
    detectTrends.mockResolvedValue([]);
    const out = await resolvers.Query.trends({}, {}, staff);
    expect(out).toEqual([]);
    expect(detectTrends).toHaveBeenCalled();
  });

  it('trends allows advocate', async () => {
    detectTrends.mockResolvedValue([{ category: 'x', count: 1, summary: 's', detectedAt: 't' }]);
    const out = await resolvers.Query.trends({}, {}, advocate);
    expect(out).toHaveLength(1);
  });

  it('chat requires auth', async () => {
    await expect(resolvers.Mutation.chat({}, { message: 'hi' }, anon)).rejects.toMatchObject({
      extensions: { code: 'UNAUTHENTICATED' },
    });
  });

  it('chat invokes agent', async () => {
    runCityAiChat.mockResolvedValue('reply');
    const out = await resolvers.Mutation.chat({}, { message: 'hello' }, staff);
    expect(out).toBe('reply');
    expect(runCityAiChat).toHaveBeenCalledWith('hello');
  });

  it('classifyAndSummarize requires auth', async () => {
    await expect(
      resolvers.Mutation.classifyAndSummarize(
        {},
        { issueId: '1', title: 't', description: 'd', location: 'l' },
        anon
      )
    ).rejects.toMatchObject({ extensions: { code: 'UNAUTHENTICATED' } });
  });

  it('classifyAndSummarize returns AI fields', async () => {
    classifyIssue.mockResolvedValue('pothole');
    summarizeIssue.mockResolvedValue('summary text');

    const out = await resolvers.Mutation.classifyAndSummarize(
      {},
      { issueId: '507f1f77bcf86cd799439011', title: 't', description: 'd', location: 'l' },
      resident
    );

    expect(out).toEqual({ category: 'pothole', aiSummary: 'summary text' });
    expect(classifyIssue).toHaveBeenCalledWith('t', 'd');
    expect(summarizeIssue).toHaveBeenCalledWith('t', 'd', 'l');
    expect(globalThis.fetch).toHaveBeenCalled();
  });

  it('updateSnapshotStatus allows internal token', async () => {
    // Mock mongoose connection and collection
    const mockUpdateOne = vi.fn().mockResolvedValue({ modifiedCount: 1 });
    const mockCollection = vi.fn().mockReturnValue({ updateOne: mockUpdateOne });
    
    // Use vi.spyOn to mock mongoose.connection.collection
    vi.spyOn(mongoose, 'connection', 'get').mockReturnValue({
      readyState: 1,
      collection: mockCollection,
    } as any);

    const out = await resolvers.Mutation.updateSnapshotStatus(
      {},
      { issueId: '507f1f77bcf86cd799439011', status: 'resolved' },
      { internal: true }
    );

    expect(out).toBe(true);
    expect(mockCollection).toHaveBeenCalledWith('issuesnapshots');
  });
});
