import { describe, it, expect } from 'vitest';
import { categoryHyphenToGraphqlEnum } from './issueWriteback';

describe('issueWriteback', () => {
  it('maps hyphenated categories to GraphQL enum names', () => {
    expect(categoryHyphenToGraphqlEnum('safety-hazard')).toBe('safety_hazard');
    expect(categoryHyphenToGraphqlEnum('pothole')).toBe('pothole');
  });
});
