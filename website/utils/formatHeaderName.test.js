const { formatHeaderName } = require('./formatHeaderName');

describe('formatHeaderName', () => {
  test('capitalizes first letter of each word and joins with spaces', () => {
    expect(formatHeaderName('content-type')).toBe('Content Type');
    expect(formatHeaderName('x-forwarded-for')).toBe('X Forwarded For');
  });

  test('works with single word', () => {
    expect(formatHeaderName('authorization')).toBe('Authorization');
  });

  test('handles empty string', () => {
    expect(formatHeaderName('')).toBe('');
  });

  test('preserves existing capitalization', () => {
    expect(formatHeaderName('x-API-key')).toBe('X API Key');
  });
});
