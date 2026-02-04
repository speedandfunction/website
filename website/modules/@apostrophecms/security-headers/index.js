/**
 * Extends @apostrophecms/security-headers to allow reCAPTCHA.
 * reCAPTCHA requires script-src and frame-src to include Google domains.
 * Without these, the reCAPTCHA script is blocked by CSP and no token is
 * generated, causing "Missing reCAPTCHA token" on form submission.
 *
 * Also allows data: URIs for font-src so that inline base64 fonts (e.g. from
 * Swiper or other libraries) are not blocked by CSP.
 *
 * Adds script-src hash for inline scripts injected by third-party tools (e.g.
 * GTM) that cannot use the request nonce. Also allows Hotjar, Facebook Pixel,
 * and LinkedIn Insight (script-src, connect-src, img-src).
 */
module.exports = {
  improve: '@apostrophecms/security-headers',
  options: {
    policies: {
      recaptcha: {
        'script-src': '*.google.com *.gstatic.com',
        'frame-src': '*.google.com *.recaptcha.net',
      },
      inlineFonts: {
        'font-src': 'data:',
      },
      inlineScripts: {
        /* eslint-disable no-secrets/no-secrets -- CSP script hashes, not secrets */
        'script-src':
          "'sha256-oTA8qLsJHk9g+M1YNjqx2sHGYh6catTGwk9lmCk8hhs=' " +
          "'sha256-ZC4Ihfl+1sv3E25DQh090ITQKwffxiocyA9C1vaePKU=' " +
          "'sha256-Q/LPXhHka5/egcP/jMtr5hz7Sxemm+1q7K+bOgaJiMo=' " +
          "'sha256-3ZRDhT/4WJSTcMHjSSKp1/doi40daSfiQU6ZD395+DA=' " +
          "'sha256-huW3ylgdSqVTZdqsJoCPMlhbzwwaT0HRomNhtq49Beo=' " +
          "'sha256-zoD9yhjUIP539kmB7swNElD1S9L+cey6RvNjUnEcTU4='",
        /* eslint-enable no-secrets/no-secrets */
      },
      linkedin: {
        'script-src': 'snap.licdn.com',
        'connect-src':
          "'self' localhost d3qlcaacmmrges.cloudfront.net px.ads.linkedin.com",
        'img-src': 'px.ads.linkedin.com',
      },
      googleAnalytics: {
        'connect-src': '*.google-analytics.com *.analytics.google.com',
      },
      hotjar: {
        'script-src': 'static.hotjar.com',
      },
      facebook: {
        'script-src': 'connect.facebook.net',
      },
    },
  },
};
