const { formatPhoneNumber, initPhoneFormatting } = require('./phoneFormat');

describe('formatPhoneNumber', () => {
  test('returns empty string for empty or invalid input', () => {
    expect(formatPhoneNumber('')).toBe('');
    expect(formatPhoneNumber(null)).toBe('');
    expect(formatPhoneNumber(undefined)).toBe('');
  });

  test('formats Ukrainian numbers', () => {
    expect(formatPhoneNumber('+380501234567')).toBe('+380 50 123 4567');
    expect(formatPhoneNumber('+380671234567')).toBe('+380 67 123 4567');
  });

  test('formats Polish numbers', () => {
    expect(formatPhoneNumber('+48501234567')).toBe('+48 50 123 4567');
    expect(formatPhoneNumber('+48601234567')).toBe('+48 60 123 4567');
  });

  test('formats UK numbers', () => {
    expect(formatPhoneNumber('+447911123456')).toBe('+44 7911 123456');
    expect(formatPhoneNumber('+441234567890')).toBe('+44 1234 567890');
  });

  test('formats German numbers', () => {
    expect(formatPhoneNumber('+4915123456789')).toBe('+49 1512 345 6789');
    expect(formatPhoneNumber('+4930123456789')).toBe('+49 3012 345 6789');
  });

  test('formats French numbers', () => {
    expect(formatPhoneNumber('+33123456789')).toBe('+33 1 23 45 67 89');
    expect(formatPhoneNumber('+33612345678')).toBe('+33 6 12 34 56 78');
  });

  test('formats Italian numbers', () => {
    expect(formatPhoneNumber('+393451234567')).toBe('+39 345 1234567');
    expect(formatPhoneNumber('+393211234567')).toBe('+39 321 1234567');
  });

  test('formats US/Canada numbers', () => {
    expect(formatPhoneNumber('+12125551234')).toBe('+1 212 555 1234');
    expect(formatPhoneNumber('+14165551234')).toBe('+1 416 555 1234');
  });

  test('formats national 10-digit number', () => {
    expect(formatPhoneNumber('2125551234')).toBe('212 555 1234');
  });

  test('formats 11-digit number', () => {
    expect(formatPhoneNumber('12345678901')).toBe('123 4567 8901');
  });

  test('formats 9-digit number', () => {
    expect(formatPhoneNumber('123456789')).toBe('123 456 789');
  });

  test('formats Ukrainian national number', () => {
    expect(formatPhoneNumber('0501234567')).toBe('050 123 4567');
  });

  test('formats 8-digit number', () => {
    expect(formatPhoneNumber('12345678')).toBe('1234 5678');
  });

  test('formats 7-digit number', () => {
    expect(formatPhoneNumber('1234567')).toBe('123 4567');
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
