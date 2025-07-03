const fetch = require('node-fetch'); 

module.exports = {
  extend: '@apostrophecms/form',
  handlers(self) {
    return {
      async submit(req) {
        const global = await req.apos.global.get(req);
        const recaptchaToken = req.body['g-recaptcha-response'];

        const enableRecaptcha = global.useRecaptcha && global.recaptchaSecret;

        if (enableRecaptcha) {
          if (!recaptchaToken) {
            return req.res.status(400).json({ error: 'Missing reCAPTCHA token.' });
          }

          try {
            const params = new URLSearchParams();
            params.append('secret', global.recaptchaSecret);
            params.append('response', recaptchaToken);
            params.append('remoteip', req.ip);

            const response = await fetch(
              'https://www.google.com/recaptcha/api/siteverify',
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params
              }
            );

            const data = await response.json();

            if (!data.success) {
              return req.res.status(400).json({ error: 'reCAPTCHA verification failed.' });
            }
          } catch (err) {
            return req.res.status(500).json({ error: 'Error verifying reCAPTCHA.' });
          }
        }

        // Pass control to the original Apostrophe form submit handler
        return self.super.handlers.submit(req);
      }
    };
  }
};
