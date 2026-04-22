import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

vi.mock('../models/User', () => ({
  User: {
    findOne: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
  },
}));

function mockRes() {
  return {
    cookie: vi.fn(),
    clearCookie: vi.fn(),
  };
}

describe('auth-service graphql resolvers', () => {
  let resolvers: typeof import('./resolvers').resolvers;
  let signToken: typeof import('./resolvers').signToken;
  let User: typeof import('../models/User').User;

  beforeAll(async () => {
    vi.stubEnv('JWT_SECRET', 'unit-test-jwt-secret');
    const mod = await import('./resolvers');
    resolvers = mod.resolvers;
    signToken = mod.signToken;
    User = (await import('../models/User')).User;
  });

  beforeEach(() => {
    vi.mocked(User.findOne).mockReset();
    vi.mocked(User.findById).mockReset();
    vi.mocked(User.create).mockReset();
  });

  it('signToken returns a verifiable JWT-shaped string', () => {
    const token = signToken('user-id-1', 'resident');
    expect(token.split('.')).toHaveLength(3);
  });

  it('me returns null when unauthenticated', async () => {
    const out = await resolvers.Query.me({}, {}, { user: null });
    expect(out).toBeNull();
  });

  it('me returns user when context has sub', async () => {
    const leanUser = { _id: 'abc', email: 'a@b.ca', name: 'A', role: 'resident' };
    vi.mocked(User.findById).mockReturnValue({
      lean: () => Promise.resolve(leanUser),
    } as never);

    const out = await resolvers.Query.me({}, {}, { user: { sub: 'abc', role: 'resident' } });
    expect(out).toEqual(leanUser);
    expect(User.findById).toHaveBeenCalledWith('abc');
  });

  it('register rejects duplicate email', async () => {
    vi.mocked(User.findOne).mockResolvedValue({ _id: 'x' } as never);
    const ctx = { res: mockRes() };

    await expect(
      resolvers.Mutation.register({}, { email: 'x@y.ca', password: 'p', name: 'N' }, ctx)
    ).rejects.toMatchObject({ extensions: { code: 'EMAIL_TAKEN' } });
    expect(ctx.res.cookie).not.toHaveBeenCalled();
  });

  it('register creates user and sets cookie', async () => {
    vi.mocked(User.findOne).mockResolvedValue(null);
    const created = {
      _id: 'newid',
      email: 'x@y.ca',
      name: 'N',
      role: 'resident',
    };
    vi.mocked(User.create).mockResolvedValue(created as never);
    const ctx = { res: mockRes() };

    const out = await resolvers.Mutation.register(
      {},
      { email: 'x@y.ca', password: 'secret', name: 'N' },
      ctx
    );

    expect(out).toEqual({ user: created });
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'x@y.ca',
        name: 'N',
        passwordHash: 'secret',
        role: 'resident',
      })
    );
    expect(ctx.res.cookie).toHaveBeenCalledWith(
      'token',
      expect.any(String),
      expect.objectContaining({ httpOnly: true })
    );
  });

  it('login rejects invalid credentials', async () => {
    vi.mocked(User.findOne).mockResolvedValue(null);
    await expect(
      resolvers.Mutation.login({}, { email: 'nope@x.ca', password: 'bad' }, { res: mockRes() })
    ).rejects.toMatchObject({ extensions: { code: 'INVALID_CREDENTIALS' } });
  });

  it('login sets cookie on success', async () => {
    const comparePassword = vi.fn().mockResolvedValue(true);
    vi.mocked(User.findOne).mockResolvedValue({
      _id: 'u1',
      email: 'e@e.ca',
      role: 'staff',
      comparePassword,
    } as never);
    const ctx = { res: mockRes() };

    await resolvers.Mutation.login({}, { email: 'e@e.ca', password: 'ok' }, ctx);

    expect(comparePassword).toHaveBeenCalledWith('ok');
    expect(ctx.res.cookie).toHaveBeenCalled();
  });

  it('logout clears cookie', () => {
    const ctx = { res: mockRes() };
    const ok = resolvers.Mutation.logout({}, {}, ctx);
    expect(ok).toBe(true);
    expect(ctx.res.clearCookie).toHaveBeenCalledWith('token', expect.any(Object));
  });
});
