const { formatHeaderName } = require('./formatHeaderName');

describe('formatHeaderName', () => {
  test('should format hyphenated string correctly', () => {
    expect(formatHeaderName('content-type')).toBe('Content Type');
    expect(formatHeaderName('x-powered-by')).toBe('X Powered By');
  });

  test('should handle empty string', () => {
    expect(formatHeaderName('')).toBe('');
  });

  test('should handle non-string input', () => {
    expect(formatHeaderName(null)).toBe('');
    expect(formatHeaderName(undefined)).toBe('');
    expect(formatHeaderName(123)).toBe('');
    expect(formatHeaderName({})).toBe('');
  });

  test('should handle multiple consecutive hyphens', () => {
    expect(formatHeaderName('content--type')).toBe('Content Type');
    expect(formatHeaderName('x---powered---by')).toBe('X Powered By');
  });

  test('should handle string with leading/trailing hyphens', () => {
    expect(formatHeaderName('-content-type-')).toBe('Content Type');
    expect(formatHeaderName('--x-powered-by--')).toBe('X Powered By');
  });
});
