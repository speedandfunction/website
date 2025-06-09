const { formatPhoneNumber, initPhoneFormatting } = require('./phoneFormat');

describe('formatPhoneNumber', () => {
  test('returns empty string for empty or invalid input', () => {
    expect(formatPhoneNumber('')).toBe('');
    expect(formatPhoneNumber(null)).toBe('');
    expect(formatPhoneNumber(undefined)).toBe('');
  });

  test.each([
    ['Ukrainian', '+380501234567', '+380 50 123 4567'],
    ['Ukrainian', '+380671234567', '+380 67 123 4567'],
    ['Polish', '+48501234567', '+48 50 123 4567'],
    ['Polish', '+48601234567', '+48 60 123 4567'],
    ['UK', '+447911123456', '+44 7911 123456'],
    ['UK', '+441234567890', '+44 1234 567890'],
    ['German', '+4915123456789', '+49 1512 345 6789'],
    ['German', '+4930123456789', '+49 3012 345 6789'],
    ['French', '+33123456789', '+33 1 23 45 67 89'],
    ['French', '+33612345678', '+33 6 12 34 56 78'],
    ['Italian', '+393451234567', '+39 345 1234567'],
    ['Italian', '+393211234567', '+39 321 1234567'],
    ['US/Canada', '+12125551234', '+1 212 555 1234'],
    ['US/Canada', '+14165551234', '+1 416 555 1234'],
  ])('formats %s numbers correctly: %s -> %s', (country, input, expected) => {
    expect(formatPhoneNumber(input)).toBe(expected);
  });

  test.each([
    ['10-digit', '2125551234', '212 555 1234'],
    ['11-digit', '12345678901', '123 4567 8901'],
    ['9-digit', '123456789', '123 456 789'],
    ['Ukrainian national', '0501234567', '050 123 4567'],
    ['8-digit', '12345678', '1234 5678'],
    ['7-digit', '1234567', '123 4567'],
  ])('formats %s number: %s -> %s', (type, input, expected) => {
    expect(formatPhoneNumber(input)).toBe(expected);
  });

  test('removes non-digit characters except leading +', () => {
    expect(formatPhoneNumber('+1 (212) 555-1234')).toBe('+1 212 555 1234');
    expect(formatPhoneNumber('(212) 555-1234')).toBe('212 555 1234');
    expect(formatPhoneNumber('212.555.1234')).toBe('212 555 1234');
  });
});

describe('initPhoneFormatting', () => {
  let input = '';

  beforeEach(() => {
    document.body.innerHTML = '<input name="phone-number" type="text" />';
    input = document.querySelector('input[name="phone-number"]');
    initPhoneFormatting();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('formats number on input', () => {
    input.value = '+12125551234';
    input.dispatchEvent(new Event('input'));
    expect(input.value).toBe('+1 212 555 1234');
  });

  test('formats number on blur', () => {
    input.value = '2125551234';
    input.dispatchEvent(new Event('blur'));
    expect(input.value).toBe('212 555 1234');
  });

  test('maintains cursor position after formatting', () => {
    input.value = '+12125551234';
    input.selectionStart = 5;
    input.selectionEnd = 5;
    input.dispatchEvent(new Event('input'));
    expect(input.selectionStart).toBe(8);
    expect(input.selectionEnd).toBe(8);
  });
});
