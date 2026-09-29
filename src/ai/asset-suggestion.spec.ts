import { describe, expect, it } from 'vitest';
import { formatAiResponse } from './asset-suggestion.js';

const valid = {
  tags: ['campaign', 'social', 'product'],
  description: 'Short asset description for internal library search.',
  usage_suggestion: 'Best used for Instagram posts or website banners.',
};

describe('formatAiResponse', () => {
  it('accepts the documented example', () => {
    expect(formatAiResponse(valid)).toEqual(valid);
  });

  it('normalizes tags: trims, lowercases, strips #, removes duplicates', () => {
    expect(formatAiResponse({ ...valid, tags: [' Social ', '#Social', 'Product  Shot'] })?.tags).toEqual([
      'social',
      'product shot',
    ]);
  });

  it.each([
    ['null', null],
    ['a string', 'tags: social'],
    ['an array', [valid]],
    ['missing field', { tags: valid.tags, description: valid.description }],
    ['extra field', { ...valid, confidence: 0.9 }],
    ['tags not an array', { ...valid, tags: 'social, product' }],
    ['non-string tag', { ...valid, tags: ['social', 3] }],
    ['empty description', { ...valid, description: ' ' }],
    ['usage not a string', { ...valid, usage_suggestion: null }],
  ])('rejects %s', (_label, raw) => {
    expect(formatAiResponse(raw)).toBeNull();
  });
});
