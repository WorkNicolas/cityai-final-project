import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { GraphQLError } from 'graphql';

vi.mock('../models/Issue', () => ({
  Issue: {
    findById: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

const residentCtx = { user: { sub: 'r1', role: 'resident' } };
const staffCtx = { user: { sub: 's1', role: 'staff' } };
const anonCtx = { user: null };

describe('issue-service graphql resolvers', () => {
  let resolvers: typeof import('./resolvers').resolvers;
  let Issue: typeof import('../models/Issue').Issue;

  beforeAll(async () => {
    const mod = await import('./resolvers');
    resolvers = mod.resolvers;
    Issue = (await import('../models/Issue')).Issue;
  });

  beforeEach(() => {
    vi.mocked(Issue.findById).mockReset();
    vi.mocked(Issue.find).mockReset();
    vi.mocked(Issue.create).mockReset();
    vi.mocked(Issue.findByIdAndUpdate).mockReset();
    vi.mocked(Issue.countDocuments).mockReset();
  });

  it('issue requires authentication', async () => {
    await expect(resolvers.Query.issue({}, { id: 'x' }, anonCtx)).rejects.toMatchObject({
      extensions: { code: 'UNAUTHENTICATED' },
    });
  });

  it('issues requires staff', async () => {
    await expect(resolvers.Query.issues({}, {}, residentCtx)).rejects.toMatchObject({
      extensions: { code: 'FORBIDDEN' },
    });
  });

  it('issues returns paginated result for staff', async () => {
    const items = [{ _id: '1', title: 'T' }];
    vi.mocked(Issue.find).mockReturnValue({
      sort: () => ({
        skip: () => ({
          limit: () => ({ lean: () => Promise.resolve(items) }),
        }),
      }),
    } as never);
    vi.mocked(Issue.countDocuments).mockResolvedValue(1);

    const out = await resolvers.Query.issues({}, { limit: 20, offset: 0 }, staffCtx);
    expect(out).toEqual({ items, total: 1, hasMore: false });
  });

  it('createIssue sets reportedBy from JWT sub', async () => {
    const created = { _id: 'i1', title: 'Hole' };
    vi.mocked(Issue.create).mockResolvedValue(created as never);

    const out = await resolvers.Mutation.createIssue(
      {},
      { title: 'Hole', description: 'Big', location: 'Main St' },
      residentCtx
    );

    expect(out).toEqual(created);
    expect(Issue.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Hole',
        reportedBy: 'r1',
        status: 'open',
        category: 'other',
        upvotes: 0,
      })
    );
  });

  it('updateIssueStatus forbids residents', async () => {
    await expect(
      resolvers.Mutation.updateIssueStatus({}, { id: '1', status: 'resolved' }, residentCtx)
    ).rejects.toMatchObject({ extensions: { code: 'FORBIDDEN' } });
  });

  it('upvoteIssue requires auth', async () => {
    await expect(resolvers.Mutation.upvoteIssue({}, { id: '1' }, anonCtx)).rejects.toMatchObject({
      extensions: { code: 'UNAUTHENTICATED' },
    });
  });

  it('setAiFields forbids resident without internal token', async () => {
    await expect(
      resolvers.Mutation.setAiFields(
        {},
        { id: '1', category: 'pothole', aiSummary: 'S' },
        residentCtx
      )
    ).rejects.toMatchObject({ extensions: { code: 'FORBIDDEN' } });
  });

  it('setAiFields allows internal service context without user', async () => {
    const updated = { _id: '1', category: 'pothole', aiSummary: 'S' };
    vi.mocked(Issue.findByIdAndUpdate).mockReturnValue({
      lean: () => Promise.resolve(updated),
    } as never);

    const internalCtx = { user: null, internal: true };
    const out = await resolvers.Mutation.setAiFields(
      {},
      { id: '1', category: 'pothole', aiSummary: 'S' },
      internalCtx
    );

    expect(out).toEqual(updated);
  });
});
