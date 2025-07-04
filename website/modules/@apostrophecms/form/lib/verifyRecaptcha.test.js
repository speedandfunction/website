const { verifyRecaptcha } = require('./verifyRecaptcha');

jest.mock('node-fetch');
const fetch = require('node-fetch');

describe('verifyRecaptcha', () => {
  beforeEach(() => {
    fetch.mockReset();
  });

  it('should fail if token is missing', async () => {
    const result = await verifyRecaptcha({
      secret: 'test',
      token: '',
      remoteip: '127.0.0.1',
    });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Missing reCAPTCHA token.');
  });

  it('should fail if Google returns error', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => ({ success: false }),
    });
    const result = await verifyRecaptcha({
      secret: 'test',
      token: 'sometoken',
      remoteip: '127.0.0.1',
    });
    expect(result.success).toBe(false);
    expect(result.error).toBe('reCAPTCHA verification failed.');
  });

  it('should succeed if Google returns success', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => ({ success: true }),
    });
    const result = await verifyRecaptcha({
      secret: 'test',
      token: 'sometoken',
      remoteip: '127.0.0.1',
    });
    expect(result.success).toBe(true);
  });

  it('should fail if Google returns HTTP error', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => ({}),
    });
    const result = await verifyRecaptcha({
      secret: 'test',
      token: 'sometoken',
      remoteip: '127.0.0.1',
    });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/HTTP error/u);
  });
});
