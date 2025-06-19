const { parseFormData } = require('./index');

describe('parseFormData', () => {
  test('returns null when req is undefined', () => {
    const result = parseFormData(undefined);
    expect(result).toBeNull();
  });

  test('returns null when req.body is undefined', () => {
    const req = {};
    const result = parseFormData(req);
    expect(result).toBeNull();
  });

  test('returns null when req.body.data is undefined', () => {
    const req = { body: {} };
    const result = parseFormData(req);
    expect(result).toBeNull();
  });

  test('returns null when req.body.data is null', () => {
    const req = { body: { data: null } };
    const result = parseFormData(req);
    expect(result).toBeNull();
  });

  test('returns object data as-is', () => {
    const formData = { name: 'John', email: 'john@example.com' };
    const req = { body: { data: formData } };
    const result = parseFormData(req);
    expect(result).toBe(formData);
  });

  test('returns array data as-is', () => {
    const formData = ['field1', 'field2'];
    const req = { body: { data: formData } };
    const result = parseFormData(req);
    expect(result).toBe(formData);
  });

  test('returns string data as-is', () => {
    const req = { body: { data: 'some string' } };
    const result = parseFormData(req);
    expect(result).toBe('some string');
  });

  test('returns primitive values as-is', () => {
    const req = { body: { data: 42 } };
    const result = parseFormData(req);
    expect(result).toBe(42);
  });

  test('returns empty string as-is', () => {
    const req = { body: { data: '' } };
    const result = parseFormData(req);
    expect(result).toBe('');
  });

  test('returns false as-is', () => {
    const req = { body: { data: false } };
    const result = parseFormData(req);
    expect(result).toBe(false);
  });
});
