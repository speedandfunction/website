const fetch = require('node-fetch');
const AbortController = require('abort-controller');

const validateRecaptchaParams = function ({ secret, token, remoteip }) {
  if (!secret || secret.trim() === '') {
    return { success: false, error: 'Missing reCAPTCHA secret.' };
  }
  if (!token || token.trim() === '') {
    return { success: false, error: 'Missing reCAPTCHA token.' };
  }
  if (!remoteip || remoteip.trim() === '') {
    return { success: false, error: 'Missing remote IP address.' };
  }
  return null;
};

const sendRecaptchaRequest = async function ({ secret, token, remoteip }) {
  const params = new URLSearchParams();
  params.append('secret', secret);
  params.append('response', token);
  params.append('remoteip', remoteip);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
        signal: controller.signal,
      },
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP error! status: ${response.status}`,
      };
    }
    const data = await response.json();
    if (!data.success) {
      return {
        success: false,
        error: 'reCAPTCHA verification failed.',
        details: data,
      };
    }
    return { success: true, details: data };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      return { success: false, error: 'reCAPTCHA verification timed out.' };
    }
    return { success: false, error: `Network error: ${error.message}` };
  }
};

const verifyRecaptcha = function ({ secret, token, remoteip }) {
  const validationError = validateRecaptchaParams({ secret, token, remoteip });
  if (validationError) {
    return validationError;
  }
  return sendRecaptchaRequest({ secret, token, remoteip });
};

module.exports = { verifyRecaptcha };
