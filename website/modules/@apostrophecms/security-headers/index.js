const isProduction = process.env.NODE_ENV === 'production';

let localhostPart = '';
if (!isProduction) {
  localhostPart = 'localhost ';
}
const connectSrcHosts = `'self' ${localhostPart}d3qlcaacmmrges.cloudfront.net px.ads.linkedin.com`;

/**
 * Extends @apostrophecms/security-headers for reCAPTCHA, GTM, GA, Hotjar,
 * Facebook Pixel, and LinkedIn Insight.
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
        'connect-src': connectSrcHosts,
        'img-src': 'px.ads.linkedin.com',
      },
      googleAnalytics: {
        'connect-src': '*.google-analytics.com *.analytics.google.com',
      },
      hotjar: {
        'script-src': '*.hotjar.com *.hotjar.io',
        'connect-src':
          'https://*.hotjar.com https://*.hotjar.io wss://*.hotjar.com',
        'img-src':
          'https://static.hotjar.com https://script.hotjar.com ' +
          'https://survey-images.hotjar.com',
        'font-src': 'https://script.hotjar.com',
        'style-src': 'https://static.hotjar.com https://script.hotjar.com',
      },
      facebook: {
        'script-src': 'connect.facebook.net',
        'connect-src': 'https://www.facebook.com',
        'img-src': 'https://www.facebook.com',
      },
    },
  },
};
