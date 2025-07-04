const fetch = require('node-fetch');

const verifyRecaptcha = async function ({ secret, token, remoteip }) {
  if (!token || token.trim() === '') {
    return { success: false, error: 'Missing reCAPTCHA token.' };
  }
  const params = new URLSearchParams();
  params.append('secret', secret);
  params.append('response', token);
  params.append('remoteip', remoteip);

  const response = await fetch(
    'https://www.google.com/recaptcha/api/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
      timeout: 5000,
    },
  );

  if (!response.ok) {
    return { success: false, error: `HTTP error! status: ${response.status}` };
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
};

module.exports = { verifyRecaptcha };
